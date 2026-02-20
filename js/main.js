/* ========================================
   VEDANTIUM.DEV - MAIN ENTRY POINT
   ES Module loader for all JavaScript functionality
   ======================================== */

// Core modules
import { initThemeAndPopover } from './core/theme.js';
import './core/utils.js'; // Runs global setup (triggerSectionReveals)

// Desktop modules
import SectionNavigator from './desktop/section-navigator.js';
import {
    initMobileNavigation,
    initNavbarScrollEffects,
    initScrollspy,
    initRevealAnimations,
    initScrollIndicators,
    initToolboxAccordion,
    initPageNavigation,
    initBackgroundParallax
} from './desktop/scroll-effects.js';
import { initCustomCursor } from './desktop/cursor.js';
import { initPetals } from './desktop/petals.js';

// Mobile modules
import { initMobileToggles, initNavIndicator } from './mobile/bottom-nav.js';
import { initTouchRipple } from './mobile/touch-handlers.js';
import { initHapticFeedback } from './mobile/haptic.js';
import { initProjectsCarousel, initAboutCardsFocus } from './mobile/cards-focus.js';
import { initScrollProgressIndicator } from './mobile/progress-indicator.js';

// ========================================
// CONSOLIDATED INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Core initialization (runs on all pages)
    initThemeAndPopover();

    // Desktop features (page navigation uses these)
    initMobileNavigation();
    initNavbarScrollEffects();
    initScrollspy();
    initRevealAnimations();
    initPageNavigation();
    initBackgroundParallax();
    initCustomCursor();
    initPetals();

    // Section-based page features (about/ page)
    SectionNavigator.init();
    initScrollIndicators();
    initToolboxAccordion();

    // Mobile-specific features (auto-skip on desktop via viewport check)
    initMobileToggles();
    initProjectsCarousel();
    initAboutCardsFocus();
    initScrollProgressIndicator();
    initTouchRipple();
    initNavIndicator();
    initHapticFeedback();
});
