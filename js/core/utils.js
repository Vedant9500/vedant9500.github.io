/* ========================================
   UTILS - Shared utility functions
   ======================================== */

// Check if user prefers reduced motion
export const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

// Function to check if on mobile viewport
export const isMobile = () => window.innerWidth <= 768;

// Re-trigger reveal animations for a section's children
export const triggerSectionReveals = (sectionId) => {
    const section = document.querySelector(`[data-section="${sectionId}"]`);
    if (!section) return;

    const cards = section.querySelectorAll('.reveal');
    cards.forEach((card, index) => {
        // Reset animation
        card.classList.remove('is-visible');
        card.style.animationDelay = `${index * 0.08}s`;

        // Trigger reflow, then add visible class
        void card.offsetWidth;
        requestAnimationFrame(() => {
            card.classList.add('is-visible');
        });
    });
};

// Expose globally for SectionNavigator to use
window.triggerSectionReveals = triggerSectionReveals;
