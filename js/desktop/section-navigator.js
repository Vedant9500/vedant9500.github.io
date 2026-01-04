/* ========================================
   SECTION NAVIGATOR - Desktop horizontal section navigation
   Handles wheel scrolling, keyboard navigation, section switching
   ======================================== */

import { TIMING, sectionOrder } from '../core/constants.js';

// Unified Section Navigator - handles desktop, mobile nav, and touch swipe
const SectionNavigator = (() => {
    // DOM elements (cached on init)
    let sectionsTrack = null;
    let contentSections = null;
    let desktopNavBtns = null;
    let mobileNavItems = null;
    let viewport = null;

    // State
    let currentSection = 'about';
    let isTransitioning = false;
    let scrollAccumulator = 0;
    let lastTransitionTime = 0;
    let lastScrollTime = 0;
    let velocitySamples = [];

    // Constants
    const SCROLL_THRESHOLD = 120;
    const MIN_TIME_BETWEEN_TRANSITIONS = 100;
    const MIN_TRANSITION_DURATION = 300;
    const MAX_TRANSITION_DURATION = 800;
    const DEFAULT_TRANSITION_DURATION = 600;
    const MAX_VELOCITY_SAMPLES = 5;
    const MIN_SWIPE_DISTANCE = 80;

    // Touch tracking
    let touchStartX = 0;
    let touchStartY = 0;

    const calculateTransitionDuration = () => {
        if (velocitySamples.length === 0) return DEFAULT_TRANSITION_DURATION;
        const avgVelocity = velocitySamples.reduce((a, b) => a + b, 0) / velocitySamples.length;
        const velocityNormalized = Math.min(Math.max(avgVelocity, 5), 80);
        return Math.round(MAX_TRANSITION_DURATION - ((velocityNormalized - 5) / 75) * (MAX_TRANSITION_DURATION - MIN_TRANSITION_DURATION));
    };

    const updateNavActiveStates = (targetSection) => {
        desktopNavBtns?.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === targetSection);
        });
        mobileNavItems?.forEach(item => {
            item.classList.toggle('active', item.dataset.section === targetSection);
        });
    };

    const switchSection = (targetSection, options = {}) => {
        const { scrollToTop = true, useVelocity = false, transitionMs = null } = options;

        if (targetSection === currentSection || isTransitioning) return;
        if (!sectionsTrack) return;

        isTransitioning = true;
        scrollAccumulator = 0;

        const currentIndex = sectionOrder.indexOf(currentSection);
        const targetIndex = sectionOrder.indexOf(targetSection);
        const direction = targetIndex > currentIndex ? 'right' : 'left';

        // Calculate transition duration and hint compositor
        const transitionDuration = transitionMs ?? (useVelocity ? calculateTransitionDuration() : DEFAULT_TRANSITION_DURATION);
        sectionsTrack.style.willChange = 'transform';
        sectionsTrack.style.transitionDuration = `${transitionDuration}ms`;

        // Update all nav states
        updateNavActiveStates(targetSection);

        // Remove active from all sections
        contentSections?.forEach(section => {
            section.classList.remove('active', 'slide-in-left', 'slide-in-right');
        });

        // Update track position
        sectionsTrack.dataset.activeSection = targetSection;

        // Add slide direction and active to target section
        const targetSectionEl = document.querySelector(`.content-section[data-section="${targetSection}"]`);
        if (targetSectionEl) {
            targetSectionEl.classList.add(`slide-in-${direction === 'right' ? 'right' : 'left'}`);

            // Always scroll to top when switching sections (regardless of direction)
            if (scrollToTop) {
                targetSectionEl.scrollTop = 0;
                // Also reset any inner scrollable containers
                const innerScrollables = targetSectionEl.querySelectorAll('.about-content, .projects-grid, .toolbox-accordion');
                innerScrollables.forEach(el => el.scrollTop = 0);
            }

            requestAnimationFrame(() => {
                targetSectionEl.classList.add('active');
            });
        }

        // Reset scroll progress bar
        const progressBar = document.querySelector('.scroll-progress-bar');
        if (progressBar) {
            progressBar.style.transform = 'scaleX(0)';
        }

        currentSection = targetSection;
        velocitySamples = [];
        lastTransitionTime = performance.now();

        // Update nav indicator position
        if (window.updateNavIndicator) {
            requestAnimationFrame(window.updateNavIndicator);
        }

        // Trigger haptic feedback on section change
        if (window.triggerHaptic) {
            window.triggerHaptic('light');
        }

        // Trigger reveal animations for the target section after slide-in
        setTimeout(() => {
            if (window.triggerSectionReveals) {
                window.triggerSectionReveals(targetSection);
            }
        }, transitionDuration * 0.3);

        // Reset transition lock after animation completes
        setTimeout(() => {
            isTransitioning = false;
            scrollAccumulator = 0;
            sectionsTrack.style.transitionDuration = '';
            // Remove will-change after animation completes to free compositor memory
            sectionsTrack.style.willChange = '';
        }, transitionDuration + 50);
    };

    const getActiveSection = () => {
        return document.querySelector(`.content-section[data-section="${currentSection}"]`);
    };

    const handleWheel = (e) => {
        const activeSection = getActiveSection();
        if (!activeSection || isTransitioning) return;

        const now = performance.now();
        const timeSinceLastScroll = now - lastScrollTime;
        const timeSinceTransition = now - lastTransitionTime;
        const isFreshScrollGesture = timeSinceLastScroll > MIN_TIME_BETWEEN_TRANSITIONS;

        if (isFreshScrollGesture) {
            scrollAccumulator = 0;
            velocitySamples = [];
        }

        lastScrollTime = now;

        if (timeSinceLastScroll > 0 && timeSinceLastScroll < 200) {
            velocitySamples.push(Math.abs(e.deltaY));
            if (velocitySamples.length > MAX_VELOCITY_SAMPLES) velocitySamples.shift();
        }

        const currentIndex = sectionOrder.indexOf(currentSection);
        const atTop = activeSection.scrollTop <= 0;
        const atBottom = activeSection.scrollTop + activeSection.clientHeight >= activeSection.scrollHeight - 2;
        const isLikelyMomentum = !isFreshScrollGesture && timeSinceTransition < 800;

        // Only intercept scroll at section boundaries
        if (e.deltaY > 0 && atBottom && currentIndex < sectionOrder.length - 1) {
            if (!isLikelyMomentum) {
                e.preventDefault();
                scrollAccumulator += e.deltaY;
                if (scrollAccumulator >= SCROLL_THRESHOLD) {
                    switchSection(sectionOrder[currentIndex + 1], { useVelocity: true });
                }
            }
        } else if (e.deltaY < 0 && atTop && currentIndex > 0) {
            if (!isLikelyMomentum) {
                e.preventDefault();
                scrollAccumulator += Math.abs(e.deltaY);
                if (scrollAccumulator >= SCROLL_THRESHOLD) {
                    switchSection(sectionOrder[currentIndex - 1], { useVelocity: true });
                }
            }
        } else {
            // Allow native scrolling within section
            scrollAccumulator = 0;
        }
    };

    const handleKeyboard = (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (isTransitioning) return;

        const currentIndex = sectionOrder.indexOf(currentSection);

        if (e.key === 'ArrowRight' && currentIndex < sectionOrder.length - 1) {
            switchSection(sectionOrder[currentIndex + 1]);
        } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
            switchSection(sectionOrder[currentIndex - 1]);
        }
    };

    const handleTouchStart = (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        // Track if swipe started near screen edge for easier navigation
        const clientX = e.changedTouches[0].clientX;
        const screenWidth = window.innerWidth;
        const isEdgeSwipe = clientX < 30 || clientX > screenWidth - 30;
        e.target._isEdgeSwipe = isEdgeSwipe;
    };

    const handleTouchEnd = (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        // Use lower threshold for edge swipes (40px vs 80px for regular swipes)
        const isEdgeSwipe = e.target._isEdgeSwipe;
        const swipeThreshold = isEdgeSwipe ? 40 : MIN_SWIPE_DISTANCE;

        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
            const currentIndex = sectionOrder.indexOf(currentSection);

            if (deltaX < 0 && currentIndex < sectionOrder.length - 1) {
                switchSection(sectionOrder[currentIndex + 1], { transitionMs: isEdgeSwipe ? 300 : 400 });
            } else if (deltaX > 0 && currentIndex > 0) {
                switchSection(sectionOrder[currentIndex - 1], { transitionMs: isEdgeSwipe ? 300 : 400 });
            }
        }
    };

    const init = () => {
        sectionsTrack = document.querySelector('.sections-track');
        if (!sectionsTrack) return; // Not on content page

        contentSections = document.querySelectorAll('.content-section');
        desktopNavBtns = document.querySelectorAll('.nav-section-btn');
        mobileNavItems = document.querySelectorAll('.mobile-bottom-nav .mobile-nav-item[data-section]');
        viewport = document.querySelector('.sections-viewport');

        // Desktop nav button clicks
        desktopNavBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                switchSection(btn.dataset.section);
            });
        });

        // Mobile nav button clicks
        mobileNavItems.forEach(item => {
            item.addEventListener('click', () => {
                if (item.dataset.section) {
                    switchSection(item.dataset.section, { transitionMs: 500 });
                }
            });
        });

        // Wheel scrolling
        if (viewport) {
            viewport.addEventListener('wheel', handleWheel, { passive: false });
            viewport.addEventListener('touchstart', handleTouchStart, { passive: true });
            viewport.addEventListener('touchend', handleTouchEnd, { passive: true });
        }

        // Keyboard navigation
        document.addEventListener('keydown', handleKeyboard);
    };

    return { init, switchSection };
})();

export default SectionNavigator;
