/**
 * landing.js
 * Playful drag interactions, gentle floating shapes, and mouse parallax
 * for the homepage decorative elements.
 */
import { initCustomCursor } from './desktop/cursor.js';
import { initPetals } from './desktop/petals.js';
import { initBackgroundParallax } from './desktop/scroll-effects.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize global UX
    initCustomCursor();
    initPetals();
    initBackgroundParallax();

    const main = document.querySelector('main');
    const heroCard = document.querySelector('.hero-card');

    // ========================================
    // 1. GENERATE RANDOM SHAPES WITH ROTATION
    // ========================================
    const shapeStyles = [
        '50%',
        '8px',
        '50% 50% 8px 8px',
        '8px 50% 50% 8px',
        '50% 8px 50% 8px',
        '40% 60% 30% 70%',
        '60% 40% 70% 30%',
    ];

    const colors = window.innerWidth < 768
        ? ['var(--accent-pink)', 'var(--accent-lavender)']
        : ['var(--accent-pink)', 'var(--accent-mint)', 'var(--accent-blue)', 'var(--accent-yellow)', 'var(--accent-lavender)'];

    document.querySelectorAll('.decor').forEach(el => el.remove());

    const draggables = [];
    const numShapes = window.innerWidth < 768 ? 4 : 7;

    /**
     * Shadow compensation: when an element is rotated by θ, its box-shadow
     * rotates with it. To keep the shadow pointing globally bottom-right,
     * we counter-rotate the shadow offset.
     */
    function getCompensatedShadow(angleDeg, baseSx, baseSy) {
        const rad = (angleDeg * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        return {
            x: Math.round((baseSx * cos + baseSy * sin) * 10) / 10,
            y: Math.round((-baseSx * sin + baseSy * cos) * 10) / 10
        };
    }

    // 8 placement zones around the hero card
    const zones = [
        { left: [3, 22], top: [3, 18] },
        { left: [30, 50], top: [2, 12] },
        { left: [70, 92], top: [3, 18] },
        { left: [2, 15], top: [35, 65] },
        { left: [80, 95], top: [35, 65] },
        { left: [3, 22], top: [75, 92] },
        { left: [35, 55], top: [82, 95] },
        { left: [70, 92], top: [75, 92] },
    ];

    for (let i = 0; i < numShapes; i++) {
        const el = document.createElement('div');
        el.classList.add('decor');

        const size = Math.random() * 70 + 35;
        el.style.width = `${size}px`;
        el.style.height = `${Math.random() > 0.4 ? size : size * (0.6 + Math.random() * 0.3)}px`;

        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.borderRadius = shapeStyles[Math.floor(Math.random() * shapeStyles.length)];

        // Random rotation ±35 degrees
        const rotation = (Math.random() - 0.5) * 70;
        el.dataset.rotation = rotation;

        // Compensated shadow for consistent bottom-right direction
        const shadow = getCompensatedShadow(rotation, 4, 4);
        el.style.boxShadow = `${shadow.x}px ${shadow.y}px 0 var(--ink)`;
        el.dataset.shadowNormalX = shadow.x;
        el.dataset.shadowNormalY = shadow.y;

        // Compensated LIFTED shadow for drag
        const liftShadow = getCompensatedShadow(rotation, 8, 8);
        el.dataset.shadowLiftX = liftShadow.x;
        el.dataset.shadowLiftY = liftShadow.y;

        // Place in zone
        const zone = zones[i % zones.length];
        const left = zone.left[0] + Math.random() * (zone.left[1] - zone.left[0]);
        const top = zone.top[0] + Math.random() * (zone.top[1] - zone.top[0]);
        el.style.left = `${left}%`;
        el.style.top = `${top}%`;

        el.dataset.xOffset = 0;
        el.dataset.yOffset = 0;

        // Unique float parameters for organic feel (GENTLE values)
        el.dataset.floatDuration = (3 + Math.random() * 4).toFixed(2);   // 3–7s period
        el.dataset.floatAmp = (3 + Math.random() * 5).toFixed(2);        // 3–8px max
        el.dataset.floatPhase = (Math.random() * Math.PI * 2).toFixed(3);

        // Set initial hidden state (before pop-in)
        el.style.opacity = '0';
        el.style.transform = `scale(0.5) rotate(${rotation}deg)`;

        main.insertBefore(el, heroCard);
        draggables.push(el);

        // Pop-in via Web Animations API — includes correct rotation from frame 1
        const popAnim = el.animate([
            { opacity: 0, transform: `scale(0.5) rotate(${rotation}deg)` },
            { opacity: 1, transform: `scale(1) rotate(${rotation}deg)` }
        ], {
            duration: 600,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            delay: (0.3 + i * 0.12) * 1000,
            fill: 'forwards'
        });

        // After pop-in finishes, cancel the WAAPI animation and lock final
        // state inline. This is critical — fill:'forwards' overrides inline
        // transforms, which breaks drag and float.
        popAnim.finished.then(() => {
            popAnim.cancel();
            el.style.opacity = '1';
            el.style.transform = `rotate(${rotation}deg)`;
        });
    }

    // ========================================
    // 2. GENTLE FLOAT VIA CSS (no JS RAF jitter)
    // ========================================
    // After entrance animations finish, apply CSS-based float via custom
    // animation per shape. This avoids JS RAF jitter entirely.
    setTimeout(() => {
        draggables.forEach(el => {
            if (el.dataset.isDragging === 'true') return;

            const rot = parseFloat(el.dataset.rotation);
            const dur = parseFloat(el.dataset.floatDuration);
            const amp = parseFloat(el.dataset.floatAmp);
            const phase = parseFloat(el.dataset.floatPhase);
            const xOff = parseFloat(el.dataset.xOffset) || 0;
            const yOff = parseFloat(el.dataset.yOffset) || 0;

            // Inject a unique @keyframes for each shape (rotation-aware)
            const id = `float_${Math.random().toString(36).slice(2, 8)}`;
            const halfAmpX = amp * 0.3;

            const keyframes = `
                @keyframes ${id} {
                    0%   { transform: translate(${xOff}px, ${yOff}px) rotate(${rot}deg); }
                    25%  { transform: translate(${xOff + halfAmpX}px, ${yOff - amp}px) rotate(${rot}deg); }
                    50%  { transform: translate(${xOff}px, ${yOff}px) rotate(${rot}deg); }
                    75%  { transform: translate(${xOff - halfAmpX}px, ${yOff + amp * 0.5}px) rotate(${rot}deg); }
                    100% { transform: translate(${xOff}px, ${yOff}px) rotate(${rot}deg); }
                }
            `;
            const styleTag = document.createElement('style');
            styleTag.textContent = keyframes;
            document.head.appendChild(styleTag);

            el.dataset.floatAnimId = id;
            el.style.animation = `${id} ${dur}s ease-in-out infinite`;
            el.style.animationDelay = `${-phase}s`;
        });
    }, 1500); // Wait for entrance animations to finish

    // ========================================
    // 3. HERO CARD: REMOVE ENTRANCE ANIMATION AFTER IT PLAYS
    // ========================================
    // After heroSlideUp finishes, switch to ONLY cardBreathe so the
    // entrance animation can never restart on hover/unhover cycles.
    if (heroCard) {
        heroCard.addEventListener('animationend', (e) => {
            if (e.animationName === 'heroSlideUp') {
                // Lock in the final state and keep only the breathing
                heroCard.style.opacity = '1';
                heroCard.style.animation = 'cardBreathe 6s ease-in-out infinite';
            }
        });
    }

    // ========================================
    // 4. DRAG LOGIC
    // ========================================
    let activeDrag = null;
    let initialX, initialY, currentX, currentY;

    const cursor = document.querySelector('.custom-cursor');

    draggables.forEach(target => {
        target.addEventListener('mousedown', dragStart);
        target.addEventListener('touchstart', dragStart, { passive: false });
        target.addEventListener('mouseenter', () => { if (cursor) cursor.classList.add('hovering'); });
        target.addEventListener('mouseleave', () => { if (cursor) cursor.classList.remove('hovering'); });
    });

    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchend', dragEnd);
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });

    function dragStart(e) {
        e.preventDefault();
        activeDrag = e.target.closest('.decor');
        if (!activeDrag) return;

        // Kill float animation while dragging
        activeDrag.style.animation = 'none';
        activeDrag.dataset.isDragging = 'true';

        const xOffset = parseFloat(activeDrag.dataset.xOffset);
        const yOffset = parseFloat(activeDrag.dataset.yOffset);

        if (e.type === 'touchstart') {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }

        // Lifted shadow
        activeDrag.style.boxShadow = `${activeDrag.dataset.shadowLiftX}px ${activeDrag.dataset.shadowLiftY}px 0 var(--ink)`;
        activeDrag.style.zIndex = '100';
        renderTransform(activeDrag, xOffset, yOffset);
    }

    function dragEnd() {
        if (!activeDrag) return;

        const finalX = currentX != null ? currentX : parseFloat(activeDrag.dataset.xOffset);
        const finalY = currentY != null ? currentY : parseFloat(activeDrag.dataset.yOffset);
        activeDrag.dataset.xOffset = finalX;
        activeDrag.dataset.yOffset = finalY;
        activeDrag.dataset.isDragging = 'false';

        // Restore normal shadow
        activeDrag.style.boxShadow = `${activeDrag.dataset.shadowNormalX}px ${activeDrag.dataset.shadowNormalY}px 0 var(--ink)`;
        activeDrag.style.zIndex = '1';
        renderTransform(activeDrag, finalX, finalY);

        // Restart float from new position by regenerating keyframes
        const rot = parseFloat(activeDrag.dataset.rotation);
        const dur = parseFloat(activeDrag.dataset.floatDuration);
        const amp = parseFloat(activeDrag.dataset.floatAmp);
        const halfAmpX = amp * 0.3;
        const id = `float_${Math.random().toString(36).slice(2, 8)}`;
        const keyframes = `
            @keyframes ${id} {
                0%   { transform: translate(${finalX}px, ${finalY}px) rotate(${rot}deg); }
                25%  { transform: translate(${finalX + halfAmpX}px, ${finalY - amp}px) rotate(${rot}deg); }
                50%  { transform: translate(${finalX}px, ${finalY}px) rotate(${rot}deg); }
                75%  { transform: translate(${finalX - halfAmpX}px, ${finalY + amp * 0.5}px) rotate(${rot}deg); }
                100% { transform: translate(${finalX}px, ${finalY}px) rotate(${rot}deg); }
            }
        `;
        const styleTag = document.createElement('style');
        styleTag.textContent = keyframes;
        document.head.appendChild(styleTag);

        activeDrag.style.animation = `${id} ${dur}s ease-in-out infinite`;
        currentX = null;
        currentY = null;
        activeDrag = null;
    }

    function drag(e) {
        if (!activeDrag) return;
        e.preventDefault();

        if (e.type === 'touchmove') {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
        } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
        }

        renderTransform(activeDrag, currentX, currentY);
    }

    function renderTransform(el, x, y) {
        const isDragging = el.dataset.isDragging === 'true';
        const rotation = parseFloat(el.dataset.rotation);
        const liftX = isDragging ? -4 : 0;
        const liftY = isDragging ? -4 : 0;
        el.style.transform = `translate(${parseFloat(x) + liftX}px, ${parseFloat(y) + liftY}px) rotate(${rotation}deg)`;
    }
});
