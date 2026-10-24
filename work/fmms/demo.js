(() => {
    "use strict";

    const canvas = document.querySelector("[data-demo-canvas]");
    const pane = canvas && canvas.closest("[data-demo]");
    const ctx = canvas && canvas.getContext("2d", { alpha: false });
    if (!canvas || !pane || !ctx) return;

    const toggle = pane.querySelector("[data-demo-toggle]");
    const resetButton = pane.querySelector("[data-demo-reset]");
    const timeReadout = pane.querySelector("[data-demo-time]");
    const countReadout = pane.querySelector("[data-demo-count]");
    const stage = canvas.parentElement;

    const N = 160;
    const G = 1;
    const MASS = 1 / N;
    const SOFTENING = 0.04;
    const SOFT2 = SOFTENING * SOFTENING;
    const DT = 0.0015;
    const SIM_SPEED = 0.22;
    const MAX_STEPS = 4;
    const VIEW_RADIUS = 3;
    const CAMERA_ANGLE = 0.4;
    const TILT = 0.5;
    const SIN_TILT = Math.sin(TILT);
    const COS_TILT = Math.cos(TILT);
    const PAPER = cssValue("--paper", "#f7f4ec");
    const INK = hexToRgb(cssValue("--ink", "#1b1915"));
    const SHADES = [0.4, 0.62, 0.88].map((alpha) => `rgba(${INK[0]}, ${INK[1]}, ${INK[2]}, ${alpha})`);

    const x = new Float64Array(N);
    const y = new Float64Array(N);
    const z = new Float64Array(N);
    const vx = new Float64Array(N);
    const vy = new Float64Array(N);
    const vz = new Float64Array(N);
    const ax = new Float64Array(N);
    const ay = new Float64Array(N);
    const az = new Float64Array(N);
    const screenX = new Float32Array(N);
    const screenY = new Float32Array(N);
    const radius = new Float32Array(N);
    const shade = new Uint8Array(N);

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let running = !motionQuery.matches;
    let inView = !("IntersectionObserver" in window);
    let pageVisible = !document.hidden;
    let frameHandle = 0;
    let lastFrame = 0;
    let accumulator = 0;
    let simTime = 0;
    let lastTimeText = -1;
    let width = 0;
    let height = 0;

    if (countReadout) countReadout.textContent = String(N);
    reset();
    resize();
    draw(true);

    if (toggle) {
        toggle.disabled = false;
        toggle.textContent = running ? "Pause" : "Play";
        toggle.setAttribute("aria-label", running ? "Pause the simulation" : "Play the simulation");
        toggle.addEventListener("click", () => setRunning(!running));
    }
    if (resetButton) {
        resetButton.disabled = false;
        resetButton.addEventListener("click", () => {
            reset();
            draw(true);
            sync();
        });
    }

    const onMotionChange = (event) => {
        if (event.matches && running) setRunning(false);
    };
    if (motionQuery.addEventListener) motionQuery.addEventListener("change", onMotionChange);
    else if (motionQuery.addListener) motionQuery.addListener(onMotionChange);

    document.addEventListener("visibilitychange", () => {
        pageVisible = !document.hidden;
        sync();
    });

    if ("IntersectionObserver" in window) {
        new IntersectionObserver((entries) => {
            inView = entries[0].isIntersecting;
            sync();
        }, { rootMargin: "80px" }).observe(stage);
    }

    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(stage);
    window.addEventListener("resize", resize, { passive: true });
    sync();

    function cssValue(name, fallback) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
    }

    function hexToRgb(value) {
        const hex = value.replace("#", "");
        if (hex.length !== 6) return [27, 25, 21];
        return [
            parseInt(hex.slice(0, 2), 16),
            parseInt(hex.slice(2, 4), 16),
            parseInt(hex.slice(4, 6), 16),
        ];
    }

    function mulberry32(seed) {
        let state = seed >>> 0;
        return () => {
            state = (state + 0x6d2b79f5) >>> 0;
            let t = state;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function gaussian(random) {
        const u = Math.max(random(), 1e-12);
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random());
    }

    function reset() {
        const random = mulberry32(0x5eedf00d);
        let meanX = 0;
        let meanY = 0;
        let meanZ = 0;

        for (let i = 0; i < N; i++) {
            let r;
            do {
                const u = random();
                const w = Math.pow(u, 2 / 3);
                r = Math.sqrt(w / (1 - w));
            } while (!Number.isFinite(r) || r > 5);

            const q = 2 * random() - 1;
            const phi = 2 * Math.PI * random();
            const s = Math.sqrt(Math.max(0, 1 - q * q));
            x[i] = r * s * Math.cos(phi);
            y[i] = r * s * Math.sin(phi);
            z[i] = r * q;
            meanX += x[i];
            meanY += y[i];
            meanZ += z[i];
        }

        meanX /= N;
        meanY /= N;
        meanZ /= N;
        for (let i = 0; i < N; i++) {
            x[i] -= meanX;
            y[i] -= meanY;
            z[i] -= meanZ;
            vx[i] = gaussian(random);
            vy[i] = gaussian(random);
            vz[i] = gaussian(random);
        }

        let meanVx = 0;
        let meanVy = 0;
        let meanVz = 0;
        let kinetic = 0;
        for (let i = 0; i < N; i++) {
            meanVx += vx[i];
            meanVy += vy[i];
            meanVz += vz[i];
        }
        meanVx /= N;
        meanVy /= N;
        meanVz /= N;
        for (let i = 0; i < N; i++) {
            vx[i] -= meanVx;
            vy[i] -= meanVy;
            vz[i] -= meanVz;
            kinetic += 0.5 * MASS * (vx[i] * vx[i] + vy[i] * vy[i] + vz[i] * vz[i]);
        }

        const potential = potentialEnergy();
        if (potential < 0 && kinetic > 0) {
            const scale = Math.sqrt(-potential / (2 * kinetic));
            for (let i = 0; i < N; i++) {
                vx[i] *= scale;
                vy[i] *= scale;
                vz[i] *= scale;
            }
        }

        simTime = 0;
        accumulator = 0;
        lastFrame = 0;
        lastTimeText = -1;
        accelerations();
        updateTime(true);
    }

    function potentialEnergy() {
        let sum = 0;
        for (let i = 0; i < N; i++) {
            for (let j = i + 1; j < N; j++) {
                const dx = x[j] - x[i];
                const dy = y[j] - y[i];
                const dz = z[j] - z[i];
                sum -= G * MASS * MASS / Math.sqrt(dx * dx + dy * dy + dz * dz + SOFT2);
            }
        }
        return sum;
    }

    function accelerations() {
        ax.fill(0);
        ay.fill(0);
        az.fill(0);

        for (let i = 0; i < N; i++) {
            const xi = x[i];
            const yi = y[i];
            const zi = z[i];
            let sumX = 0;
            let sumY = 0;
            let sumZ = 0;

            for (let j = i + 1; j < N; j++) {
                const dx = x[j] - xi;
                const dy = y[j] - yi;
                const dz = z[j] - zi;
                const inv = 1 / Math.sqrt(dx * dx + dy * dy + dz * dz + SOFT2);
                const f = G * MASS * inv * inv * inv;
                sumX += dx * f;
                sumY += dy * f;
                sumZ += dz * f;
                ax[j] -= dx * f;
                ay[j] -= dy * f;
                az[j] -= dz * f;
            }

            ax[i] += sumX;
            ay[i] += sumY;
            az[i] += sumZ;
        }
    }

    function step(dt) {
        const half = dt * 0.5;
        for (let i = 0; i < N; i++) {
            vx[i] += ax[i] * half;
            vy[i] += ay[i] * half;
            vz[i] += az[i] * half;
            x[i] += vx[i] * dt;
            y[i] += vy[i] * dt;
            z[i] += vz[i] * dt;
        }
        accelerations();
        for (let i = 0; i < N; i++) {
            vx[i] += ax[i] * half;
            vy[i] += ay[i] * half;
            vz[i] += az[i] * half;
        }
        simTime += dt;
    }

    function draw(fresh) {
        if (!width || !height) return;

        ctx.globalAlpha = fresh ? 1 : 0.4;
        ctx.fillStyle = PAPER;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1;

        const scale = Math.min(width, height) / (2 * VIEW_RADIUS);
        const centerX = width / 2;
        const centerY = height / 2;
        const cosA = Math.cos(CAMERA_ANGLE);
        const sinA = Math.sin(CAMERA_ANGLE);

        for (let i = 0; i < N; i++) {
            const worldX = x[i] * cosA + z[i] * sinA;
            const worldZ = -x[i] * sinA + z[i] * cosA;
            const worldY = y[i] * COS_TILT - worldZ * SIN_TILT;
            const depth = y[i] * SIN_TILT + worldZ * COS_TILT;
            const near = Math.min(1, Math.max(0, 0.5 + depth / (2 * VIEW_RADIUS)));
            screenX[i] = centerX + worldX * scale;
            screenY[i] = centerY + worldY * scale;
            radius[i] = 1.15 + 1.45 * near;
            shade[i] = Math.min(2, Math.floor(near * 3));
        }

        for (let level = 0; level < SHADES.length; level++) {
            ctx.beginPath();
            for (let i = 0; i < N; i++) {
                if (shade[i] !== level) continue;
                const sx = screenX[i];
                const sy = screenY[i];
                if (sx < -4 || sx > width + 4 || sy < -4 || sy > height + 4) continue;
                ctx.moveTo(sx + radius[i], sy);
                ctx.arc(sx, sy, radius[i], 0, Math.PI * 2);
            }
            ctx.fillStyle = SHADES[level];
            ctx.fill();
        }
    }

    function updateTime(force) {
        if (!timeReadout) return;
        if (force || simTime - lastTimeText >= 0.03) {
            timeReadout.textContent = "t " + simTime.toFixed(2);
            lastTimeText = simTime;
        }
    }

    function frame(now) {
        frameHandle = 0;
        if (!running || !inView || !pageVisible) return;
        if (!lastFrame) lastFrame = now;
        let elapsed = (now - lastFrame) / 1000;
        lastFrame = now;
        if (elapsed > 0.1) elapsed = 0.1;

        accumulator += elapsed * SIM_SPEED;
        let steps = 0;
        while (accumulator >= DT && steps < MAX_STEPS) {
            step(DT);
            accumulator -= DT;
            steps++;
        }
        if (steps === MAX_STEPS) accumulator = 0;

        draw(false);
        updateTime(false);
        frameHandle = requestAnimationFrame(frame);
    }

    function wake() {
        if (!frameHandle && running && inView && pageVisible) {
            lastFrame = 0;
            frameHandle = requestAnimationFrame(frame);
        }
    }

    function sleep() {
        if (frameHandle) cancelAnimationFrame(frameHandle);
        frameHandle = 0;
        lastFrame = 0;
    }

    function sync() {
        if (running && inView && pageVisible) wake();
        else sleep();
    }

    function setRunning(next) {
        running = next;
        if (toggle) {
            toggle.textContent = running ? "Pause" : "Play";
            toggle.setAttribute("aria-label", running ? "Pause the simulation" : "Play the simulation");
        }
        sync();
    }

    function resize() {
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        const nextWidth = Math.round(rect.width * ratio);
        const nextHeight = Math.round(rect.height * ratio);
        if (canvas.width === nextWidth && canvas.height === nextHeight) return;
        canvas.width = nextWidth;
        canvas.height = nextHeight;
        width = nextWidth / ratio;
        height = nextHeight / ratio;
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        draw(true);
    }
})();
