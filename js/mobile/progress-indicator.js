/* ========================================
   PROGRESS INDICATOR - Mobile scroll progress bar
   ======================================== */

// ========================================
// SCROLL PROGRESS INDICATOR (Mobile)
// ========================================
export const initScrollProgressIndicator = () => {
    // Only run on mobile
    if (window.innerWidth > 768) return;

    const progressBar = document.querySelector('.scroll-progress-bar');
    if (!progressBar) return;

    // Get all scrollable sections
    const sections = document.querySelectorAll('.content-section');

    // Track scroll on each section
    sections.forEach(section => {
        const scrollContainer = section.querySelector('.section-inner') || section;

        // Find the scrollable element within the section
        const scrollableElements = [
            section.querySelector('.about-content'),
            section.querySelector('.projects-grid'),
            section
        ].filter(el => el && el.scrollHeight > el.clientHeight);

        scrollableElements.forEach(scrollable => {
            scrollable.addEventListener('scroll', () => {
                // Only update if this section is active
                if (!section.classList.contains('active')) return;

                const scrollTop = scrollable.scrollTop;
                const scrollHeight = scrollable.scrollHeight - scrollable.clientHeight;
                const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

                progressBar.style.transform = `scaleX(${Math.min(progress, 1)})`;
            }, { passive: true });
        });
    });

    // Also track main section scroll for sections without internal scroll
    const sectionsTrack = document.querySelector('.sections-track');
    if (sectionsTrack) {
        sectionsTrack.addEventListener('scroll', () => {
            const activeSection = document.querySelector('.content-section.active');
            if (!activeSection) return;

            const scrollTop = activeSection.scrollTop;
            const scrollHeight = activeSection.scrollHeight - activeSection.clientHeight;
            const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

            progressBar.style.transform = `scaleX(${Math.min(progress, 1)})`;
        }, { passive: true });
    }

    // Reset progress when section changes
    const navButtons = document.querySelectorAll('.mobile-bottom-nav button');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            progressBar.style.transform = 'scaleX(0)';
        });
    });
};
