/* ========================================
   CARDS FOCUS - Mobile auto-highlight for cards
   ======================================== */

// ========================================
// PROJECTS VERTICAL STACK FOCUS (Mobile)
// ========================================
export const initProjectsCarousel = () => {
    // Only run on mobile
    if (window.innerWidth > 768) return;

    const section = document.querySelector('.content-section[data-section="projects"]');
    if (!section) return;

    const cards = section.querySelectorAll('.project-card');
    if (!cards.length) return;

    // Intersection Observer to detect when card is in center of section
    const observerOptions = {
        root: section, // Section is now the scroll container
        rootMargin: '-30% 0px -30% 0px', // Card is "in focus" when in middle 40%
        threshold: 0.3
    };

    const handleIntersect = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove focus from all cards
                cards.forEach(card => card.classList.remove('in-focus'));
                // Add focus to intersecting card
                entry.target.classList.add('in-focus');
            }
        });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    cards.forEach(card => observer.observe(card));

    // Set first card as initially in focus
    if (cards[0]) cards[0].classList.add('in-focus');
};

// ========================================
// ABOUT CARDS AUTO-HIGHLIGHT (Mobile)
// ========================================
export const initAboutCardsFocus = () => {
    // Only run on mobile
    if (window.innerWidth > 768) return;

    const aboutSection = document.querySelector('.content-section[data-section="about"]');
    if (!aboutSection) return;

    const cards = aboutSection.querySelectorAll('.about-card');
    if (!cards.length) return;

    // Intersection Observer to detect when card is in center
    const observerOptions = {
        root: aboutSection,
        rootMargin: '-30% 0px -30% 0px', // Card is "in focus" when in middle 40%
        threshold: 0.5
    };

    const handleIntersect = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove focus from all cards
                cards.forEach(card => card.classList.remove('in-focus'));
                // Add focus to intersecting card
                entry.target.classList.add('in-focus');
            }
        });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    cards.forEach(card => observer.observe(card));

    // Set first card as initially in focus
    if (cards[0]) cards[0].classList.add('in-focus');
};
