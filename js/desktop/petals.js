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
    const numPetals = width < 768 ? 20 : 40; // Fewer on mobile

    const petalImg = new Image();
    // Use a data URI for a simple pink petal to avoid an external HTTP request
    petalImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMCAzMCI+PHBhdGggZD0iTTE1IDJDMTEgOCAyIDIwIDE1IDI4QzI4IDIwIDE5IDggMTUgMloiIGZpbGw9IiNGRkI3QzUiIG9wYWNpdHk9IjAuNiIvPjwvc3ZnPg==';

    class Petal {
        constructor() {
            this.x = Math.random() * width;
            this.y = (Math.random() * height) - height; // Start offscreen above
            this.size = (Math.random() * 10) + 10;
            this.speedY = (Math.random() * 1) + 0.5;
            this.speedX = (Math.random() * 2) - 1;
            this.angle = Math.random() * 360;
            this.spin = (Math.random() * 0.1) - 0.05;
            this.wobble = Math.random() * 2 * Math.PI;
            this.wobbleSpeed = (Math.random() * 0.05) + 0.01;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.wobble) * 0.5;
            this.angle += this.spin;
            this.wobble += this.wobbleSpeed;

            // Reset when falling off screen
            if (this.y > height + this.size) {
                this.y = -this.size;
                this.x = Math.random() * width;
                this.speedX = (Math.random() * 2) - 1;
            }
            if (this.x > width + this.size) {
                this.x = -this.size;
            } else if (this.x < -this.size) {
                this.x = width + this.size;
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
