/**
 * landing.js
 * Implements playful drag interactions for the decorative elements on the homepage.
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

    // 1. Generate Random Shapes
    const shapes = ['50%', '8px', '50% 50% 8px 8px', '8px 50% 50% 8px', '50% 8px 50% 8px'];
    const colors = ['var(--accent-pink)', 'var(--accent-mint)', 'var(--accent-blue)', 'var(--accent-yellow)', 'var(--accent-lavender)'];

    // Remove any hardcoded decor that might be in the HTML
    document.querySelectorAll('.decor').forEach(el => el.remove());

    const draggables = [];
    const numShapes = window.innerWidth < 768 ? 2 : 4; // Fewer on mobile

    for (let i = 0; i < numShapes; i++) {
        const el = document.createElement('div');
        el.classList.add('decor');

        // Randomize dimensions
        const size = Math.random() * 80 + 40;
        el.style.width = `${size}px`;
        el.style.height = `${Math.random() > 0.5 ? size : size * 0.7}px`;

        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.borderRadius = shapes[Math.floor(Math.random() * shapes.length)];

        // Randomize placement (Avoid center hero card by distributing into quadrants)
        let left, top;
        const quadrant = i % 4;

        switch (quadrant) {
            case 0: // Top-Left
                left = Math.random() * 20 + 5; // 5% to 25%
                top = Math.random() * 20 + 5;  // 5% to 25%
                break;
            case 1: // Top-Right
                left = Math.random() * 20 + 70; // 70% to 90%
                top = Math.random() * 20 + 5;
                break;
            case 2: // Bottom-Left
                left = Math.random() * 20 + 5;
                top = Math.random() * 20 + 70; // 70% to 90%
                break;
            case 3: // Bottom-Right
                left = Math.random() * 20 + 70;
                top = Math.random() * 20 + 70;
                break;
        }

        el.style.left = `${left}%`;
        el.style.top = `${top}%`;

        const rotation = Math.random() * 360;
        el.dataset.rotation = rotation;
        el.dataset.xOffset = 0;
        el.dataset.yOffset = 0;

        el.style.transform = `rotate(${rotation}deg)`;

        // Ensure they spawn behind the main hero card
        main.insertBefore(el, heroCard);
        draggables.push(el);
    }

    // 2. Drag Logic
    let activeDrag = null;
    let initialX, initialY, currentX, currentY;

    // Get cursor for hover states
    const cursor = document.querySelector('.custom-cursor');

    draggables.forEach(target => {
        target.addEventListener('mousedown', dragStart);
        target.addEventListener('touchstart', dragStart, { passive: false });

        // Add custom cursor hover state support since we're generating these dynamically
        target.addEventListener('mouseenter', () => { if (cursor) cursor.classList.add('hovering'); });
        target.addEventListener('mouseleave', () => { if (cursor) cursor.classList.remove('hovering'); });
    });

    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchend', dragEnd);
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });

    function dragStart(e) {
        activeDrag = e.target;

        const xOffset = parseFloat(activeDrag.dataset.xOffset);
        const yOffset = parseFloat(activeDrag.dataset.yOffset);

        if (e.type === 'touchstart') {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }

        activeDrag.style.boxShadow = '16px 16px 0 var(--ink)';
        activeDrag.style.zIndex = '100'; // Bring to front while dragging
        activeDrag.dataset.isDragging = 'true';
        renderTransform(activeDrag, xOffset, yOffset);
    }

    function dragEnd(e) {
        if (!activeDrag) return;

        activeDrag.dataset.xOffset = currentX || parseFloat(activeDrag.dataset.xOffset);
        activeDrag.dataset.yOffset = currentY || parseFloat(activeDrag.dataset.yOffset);
        activeDrag.dataset.isDragging = 'false';

        activeDrag.style.boxShadow = '4px 4px 0 var(--ink)';
        activeDrag.style.zIndex = '1';
        renderTransform(activeDrag, activeDrag.dataset.xOffset, activeDrag.dataset.yOffset);

        activeDrag = null;
    }

    function drag(e) {
        if (!activeDrag) return;

        if (e.type === 'touchmove') {
            e.preventDefault();
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
        } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
        }

        renderTransform(activeDrag, currentX, currentY);
    }

    function renderTransform(el, x, y) {
        const rotation = el.dataset.rotation;
        const isDragging = el.dataset.isDragging === 'true';

        // Lift effect: if grabbing, move object up and left by 12px to match the shadow expanding from 4px to 16px
        const liftX = isDragging ? -12 : 0;
        const liftY = isDragging ? -12 : 0;

        el.style.transform = `translate(${parseFloat(x) + liftX}px, ${parseFloat(y) + liftY}px) rotate(${rotation}deg)`;
    }
});
