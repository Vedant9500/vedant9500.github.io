/* ========================================
   CHERRY BLOSSOM PETALS PARTICLE SYSTEM
   ======================================== */

export const initPetals = () => {
    // Prevent multiple canvases
    if (document.getElementById('sakura-canvas')) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'sakura-canvas';
    // Style canvas to stay in background
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';

    // Insert behind main content
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Handle resize
    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    });

    const petals = [];
    // Even fewer on mobile for battery and FPS, to maintain 60FPS while scrolling
    const numPetals = width < 768 ? 12 : 40;

    const petalImg = new Image();
    // Use a data URI for a simple pink petal to avoid an external HTTP request
    petalImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMCAzMCI+PHBhdGggZD0iTTE1IDJDMTEgOCAyIDIwIDE1IDI4QzI4IDIwIDE5IDggMTUgMloiIGZpbGw9IiNGRkI3QzUiIG9wYWNpdHk9IjAuNiIvPjwvc3ZnPg==';

    class Petal {
        constructor() {
            // Start scattered across a larger area to pre-fill the screen on load
            this.x = (Math.random() * width * 1.5) - (width * 0.5);
            this.y = (Math.random() * height * 2) - height;

            // Slightly bigger: baseline 12 + random up to 15
            this.size = (Math.random() * 15) + 12;

            // Gentler, slower speeds for a serene fall
            this.speedY = (Math.random() * 0.7) + 0.3;
            this.speedX = (Math.random() * 1.0) + 0.2; // Always positive (moving right)

            this.angle = Math.random() * 360;
            this.spin = (Math.random() * 0.05) - 0.025; // Slower spin
            this.wobble = Math.random() * 2 * Math.PI;
            this.wobbleSpeed = (Math.random() * 0.03) + 0.01; // Slower wobble
        }

        update() {
            this.y += this.speedY;
            // Gentle wobble added to general rightward movement
            this.x += this.speedX + Math.sin(this.wobble) * 0.8;
            this.angle += this.spin;
            this.wobble += this.wobbleSpeed;

            // Removed the sudden gust of wind for a more peaceful, steady fall

            // Reset when falling off screen (wrap around to top-left-ish)
            if (this.y > height + this.size || this.x > width + this.size) {
                this.y = -this.size;
                // Re-spawn near top-left area
                this.x = (Math.random() * width * 0.5) - (width * 0.2);

                // Reset speeds to serene baseline
                this.speedY = (Math.random() * 0.7) + 0.3;
                this.speedX = (Math.random() * 1.0) + 0.2;
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.drawImage(petalImg, -this.size / 2, -this.size / 2, this.size, this.size);
            ctx.restore();
        }
    }

    // Wait for image load before animating
    petalImg.onload = () => {
        for (let i = 0; i < numPetals; i++) {
            petals.push(new Petal());
        }
        animate();
    };

    const animate = () => {
        ctx.clearRect(0, 0, width, height);
        petals.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    };
};
