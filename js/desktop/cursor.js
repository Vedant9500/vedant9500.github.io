/* ========================================
   CUSTOM CURSOR LOGIC - Desktop Only
   ======================================== */

export const initCustomCursor = () => {
    // Only run on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    // Create cursor element
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let isClicking = false;

    // Cursor tracking
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Smooth follow logic using requestAnimationFrame
    const updateCursor = () => {
        // Interpolate for smooth trailing effect
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;

        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%) scale(${isClicking ? 0.8 : 1})`;

        requestAnimationFrame(updateCursor);
    };

    requestAnimationFrame(updateCursor);

    // Hover states for links and buttons
    const interactiveElements = document.querySelectorAll('a, button, .draggable, .toolbox-card, .project-card');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });

    // Click Ripple Effect
    document.addEventListener('mousedown', (e) => {
        isClicking = true;
        cursor.classList.add('clicking');

        // Create ripple element
        const ripple = document.createElement('div');
        ripple.classList.add('click-ripple');
        // Set fixed position based on viewport coordinates
        ripple.style.left = `${e.clientX}px`;
        ripple.style.top = `${e.clientY}px`;
        document.body.appendChild(ripple);

        // Clean up ripple after animation
        setTimeout(() => {
            if (document.body.contains(ripple)) {
                document.body.removeChild(ripple);
            }
        }, 600); // Must match CSS animation duration
    });

    document.addEventListener('mouseup', () => {
        isClicking = false;
        cursor.classList.remove('clicking');
    });
};
