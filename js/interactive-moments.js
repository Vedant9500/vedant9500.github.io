/**
 * interactive-moments.js
 * Implements Tier 4: Interactive Moments for Vedantium.dev
 * - Custom Cursor Logic
 * - Magnetic Buttons
 * - Text Scramble Effect
 */

class InteractiveMoments {
    constructor() {
        this.cursor = document.querySelector('.custom-cursor');
        this.cursorDot = document.querySelector('.cursor-dot');
        this.cursorCrosshair = document.querySelector('.cursor-crosshair');
        
        this.mouse = { x: 0, y: 0 };
        this.cursorPos = { x: 0, y: 0 };
        
        this.init();
    }

    init() {
        if (!this.cursor) return;
        
        this.addEventListeners();
        this.render();
        this.setupMagneticButtons();
    }

    addEventListeners() {
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            
            // Comprehensive check for interaction state
            const target = e.target;
            const computedStyle = window.getComputedStyle(target);
            const cursorType = computedStyle.cursor;
            
            // Reset states
            this.cursor.classList.remove('is-pointer', 'is-text');
            
            // Check for Pointer State (Links, Buttons, Toggles)
            if (cursorType === 'pointer' || 
                target.closest('a, button, [role="button"], .work-header, .blog-post-card')) {
                this.cursor.classList.add('is-pointer');
            } 
            // Check for Text State (Paragraphs, Spans, Inputs)
            else if (cursorType === 'text' || 
                     target.closest('p, span, h1, h2, h3, .body-lead, input, textarea')) {
                this.cursor.classList.add('is-text');
            }
        });

        // Handle cursor visibility
        document.addEventListener('mouseenter', () => this.cursor.style.opacity = 1);
        document.addEventListener('mouseleave', () => this.cursor.style.opacity = 0);
    }

    render() {
        // Smooth cursor movement
        const lerp = (a, b, n) => (1 - n) * a + n * b;
        
        this.cursorPos.x = lerp(this.cursorPos.x, this.mouse.x, 0.15);
        this.cursorPos.y = lerp(this.cursorPos.y, this.mouse.y, 0.15);
        
        this.cursor.style.left = `${this.cursorPos.x}px`;
        this.cursor.style.top = `${this.cursorPos.y}px`;
        
        requestAnimationFrame(() => this.render());
    }

    setupMagneticButtons() {
        const buttons = document.querySelectorAll('.btn-brutal, .nav-link, .footer-link');
        
        buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        new InteractiveMoments();
    }
});
