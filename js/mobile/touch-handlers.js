/* ========================================
   TOUCH HANDLERS - Mobile touch ripple and feedback
   ======================================== */

// ========================================
// TOUCH RIPPLE FEEDBACK (Mobile)
// ========================================
export const initTouchRipple = () => {
    // Only run on mobile/touch devices
    if (window.innerWidth > 768) return;

    // Select all cards that should have ripple
    const cards = document.querySelectorAll('.about-card, .project-card');

    cards.forEach(card => {
        card.classList.add('touch-ripple');

        card.addEventListener('touchstart', function (e) {
            // Add rippling class
            this.classList.add('rippling');

            // Remove rippling class after animation completes
            setTimeout(() => {
                this.classList.remove('rippling');
            }, 400);
        }, { passive: true });
    });
};
