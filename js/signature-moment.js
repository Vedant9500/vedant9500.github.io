/**
 * signature-moment.js
 * Generative Node Graph (Neural Network Topology)
 * Implements Tier 6: Signature Moment for Vedantium.dev
 */

class NodeGraph {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.nodeCount = 60;
        this.connectionDistance = 180;
        this.mouse = { x: null, y: null, radius: 150 };
        
        this.colors = {
            node: 'rgba(28, 26, 23, 0.4)',
            line: 'rgba(28, 26, 23, 0.08)'
        };

        this.init();
        this.animate();
        this.addEventListeners();
    }

    init() {
        this.resize();
        this.createNodes();
    }

    resize() {
        this.canvas.width = this.canvas.offsetWidth * window.devicePixelRatio;
        this.canvas.height = this.canvas.offsetHeight * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        // Adjust node count based on screen size
        if (window.innerWidth < 768) {
            this.nodeCount = 30;
            this.connectionDistance = 120;
        } else {
            this.nodeCount = 60;
            this.connectionDistance = 180;
        }
    }

    createNodes() {
        this.nodes = [];
        const width = this.canvas.offsetWidth;
        const height = this.canvas.offsetHeight;

        for (let i = 0; i < this.nodeCount; i++) {
            this.nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 2 + 1
            });
        }
    }

    addEventListeners() {
        window.addEventListener('resize', () => {
            this.resize();
            this.createNodes();
        });

        // Mouse interaction
        const heroSection = document.getElementById('hero');
        heroSection.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        heroSection.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);

        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];

            // Update position
            node.x += node.vx;
            node.y += node.vy;

            // Bounce off edges
            if (node.x < 0 || node.x > this.canvas.offsetWidth) node.vx *= -1;
            if (node.y < 0 || node.y > this.canvas.offsetHeight) node.vy *= -1;

            // Mouse interaction (subtle attraction)
            if (this.mouse.x !== null) {
                const dx = this.mouse.x - node.x;
                const dy = this.mouse.y - node.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < this.mouse.radius) {
                    node.x += dx * 0.01;
                    node.y += dy * 0.01;
                }
            }

            // Draw connections
            for (let j = i + 1; j < this.nodes.length; j++) {
                const other = this.nodes[j];
                const dx = node.x - other.x;
                const dy = node.y - other.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.connectionDistance) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(28, 26, 23, ${0.15 * (1 - dist / this.connectionDistance)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(node.x, node.y);
                    this.ctx.lineTo(other.x, other.y);
                    this.ctx.stroke();
                }
            }

            // Draw node
            this.ctx.beginPath();
            this.ctx.fillStyle = this.colors.node;
            this.ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Only run if not prefers-reduced-motion
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        new NodeGraph('signature-canvas');
    }
});
