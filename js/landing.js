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

    // Make elements draggable
    const draggables = Array.from(document.querySelectorAll('.decor'));
    let activeDrag = null;
    let initialX, initialY, currentX, currentY, xOffset, yOffset;

    draggables.forEach(target => {
        // Initialize position data for each element
        target.setAttribute('data-xOffset', 0);
        target.setAttribute('data-yOffset', 0);

        // Add cursor style to indicate interactivity
        target.style.cursor = 'grab';

        target.addEventListener('mousedown', dragStart);
        target.addEventListener('touchstart', dragStart, { passive: false });
    });

    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchend', dragEnd);
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });

    function dragStart(e) {
        activeDrag = e.target;
        if (e.type === 'touchstart') {
            initialX = e.touches[0].clientX - parseFloat(activeDrag.getAttribute('data-xOffset'));
            initialY = e.touches[0].clientY - parseFloat(activeDrag.getAttribute('data-yOffset'));
        } else {
            initialX = e.clientX - parseFloat(activeDrag.getAttribute('data-xOffset'));
            initialY = e.clientY - parseFloat(activeDrag.getAttribute('data-yOffset'));
        }

        // Visual feedback during drag
        activeDrag.style.cursor = 'grabbing';
        activeDrag.style.boxShadow = '16px 16px 0 var(--ink)';
        activeDrag.style.zIndex = '100'; // Bring to front
    }

    function dragEnd(e) {
        if (!activeDrag) return;

        activeDrag.setAttribute('data-xOffset', currentX);
        activeDrag.setAttribute('data-yOffset', currentY);

        // Reset visual feedback
        activeDrag.style.cursor = 'grab';
        activeDrag.style.boxShadow = '4px 4px 0 var(--ink)'; // normal shadow for decor
        activeDrag.style.zIndex = '1';
        activeDrag = null;
    }

    function drag(e) {
        if (!activeDrag) return;

        if (e.type === 'touchmove') {
            e.preventDefault(); // prevent scrolling
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
        } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
        }

        const transform = `translate(${currentX}px, ${currentY}px)`;
        // Preserve any rotation if we wanted, but for simple MVP lets apply translate
        // The original CSS has some rotations, to keep them we need to read inline style
        // Let's keep it simple
        activeDrag.style.transform = transform;
    }
});
