/* ========================================
   HAPTIC - Mobile vibration feedback
   ======================================== */

// ========================================
// HAPTIC FEEDBACK (Mobile)
// ========================================
export const triggerHaptic = (type = 'success') => {
    // Check if vibration API is available
    if (!navigator.vibrate) return;

    switch (type) {
        case 'light':
            navigator.vibrate(10);
            break;
        case 'medium':
            navigator.vibrate(25);
            break;
        case 'heavy':
            navigator.vibrate(50);
            break;
        case 'success':
            navigator.vibrate([10, 50, 10]);
            break;
        default:
            navigator.vibrate(10);
    }
};

export const initHapticFeedback = () => {
    // Only run on mobile with vibration support
    if (window.innerWidth > 768 || !navigator.vibrate) return;

    // Add haptic to nav items
    const navItems = document.querySelectorAll('.mobile-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => triggerHaptic('light'), { passive: true });
    });

    // Add haptic to cards (on touch)
    const cards = document.querySelectorAll('.about-card, .project-card');
    cards.forEach(card => {
        card.addEventListener('touchstart', () => triggerHaptic('light'), { passive: true });
    });

    // Expose globally for section switches
    window.triggerHaptic = triggerHaptic;
};
