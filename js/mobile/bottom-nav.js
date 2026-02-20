/* ========================================
   BOTTOM NAV - Mobile bottom navigation and toggles
   ======================================== */

import { TIMING } from '../core/constants.js';
import { getTheme, applyTheme, updateThemeToggleUI } from '../core/theme.js';

// ========================================
// MOBILE BOTTOM NAV - THEME & CONTACT TOGGLES
// ========================================
export const initMobileToggles = () => {
    // Mobile theme toggle
    const mobileThemeBtn = document.querySelector('.theme-toggle-mobile');
    if (mobileThemeBtn) {
        const updateMobileThemeIcon = () => {
            const icon = mobileThemeBtn.querySelector('i');
            if (icon) {
                const isDark = getTheme() === 'dark';
                icon.classList.remove('fa-sun', 'fa-moon');
                icon.classList.add(isDark ? 'fa-sun' : 'fa-moon');
            }
        };

        updateMobileThemeIcon();

        mobileThemeBtn.addEventListener('click', () => {
            const next = getTheme() === 'dark' ? 'light' : 'dark';

            if (typeof document.startViewTransition === 'function') {
                document.startViewTransition(() => {
                    applyTheme(next);
                    updateThemeToggleUI();
                    updateMobileThemeIcon();
                });
            } else {
                applyTheme(next);
                updateThemeToggleUI();
                updateMobileThemeIcon();
            }
        });
    }

    // Mobile contact toggle
    const mobileContactBtn = document.querySelector('.contact-toggle-mobile');
    const popover = document.querySelector('.contact-popover');

    if (mobileContactBtn && popover) {
        const positionMobilePopover = () => {
            const btnRect = mobileContactBtn.getBoundingClientRect();
            const popoverWidth = popover.offsetWidth || 200;

            // Position above the button, centered under it
            const btnCenterX = btnRect.left + (btnRect.width / 2);
            let left = btnCenterX - (popoverWidth / 2);

            // Keep popover on screen
            if (left < TIMING.MOBILE_POPOVER_PADDING) left = TIMING.MOBILE_POPOVER_PADDING;
            if (left + popoverWidth > window.innerWidth - TIMING.MOBILE_POPOVER_PADDING) {
                left = window.innerWidth - popoverWidth - TIMING.MOBILE_POPOVER_PADDING;
            }

            popover.style.position = 'fixed';
            popover.style.bottom = (window.innerHeight - btnRect.top + TIMING.MOBILE_POPOVER_PADDING) + 'px';
            popover.style.left = left + 'px';
            popover.style.top = 'auto';
            popover.style.transform = 'none';
        };

        mobileContactBtn.addEventListener('click', (evt) => {
            evt.stopPropagation();
            const aboutHero = document.querySelector('.about-hero');

            if (popover.hidden) {
                popover.hidden = false;
                requestAnimationFrame(positionMobilePopover);
                // Slide about-hero away
                if (aboutHero) aboutHero.classList.add('popover-open');
            } else {
                popover.hidden = true;
                // Slide about-hero back
                if (aboutHero) aboutHero.classList.remove('popover-open');
            }
        });
    }
};

// ========================================
// MORPHING NAV INDICATOR (Mobile)
// ========================================
export const initNavIndicator = () => {
    // Only run on mobile
    if (window.innerWidth > 768) return;

    const nav = document.querySelector('.mobile-bottom-nav');
    const indicator = nav?.querySelector('.nav-indicator');
    if (!nav || !indicator) return;

    const updateIndicator = () => {
        const activeItem = nav.querySelector('.mobile-nav-item.active');
        if (!activeItem) {
            indicator.style.opacity = '0';
            return;
        }

        indicator.style.opacity = '1';

        // Get positions relative to nav container
        const navRect = nav.getBoundingClientRect();
        const activeRect = activeItem.getBoundingClientRect();

        // Get nav padding (indicator needs to start after padding)
        const navPaddingLeft = parseFloat(getComputedStyle(nav).paddingLeft);

        // Calculate offset from nav left edge to active item left edge for exact overlap
        const offsetX = activeRect.left - navRect.left;

        // Apply visual adjustments to account for shadow and maintain exact centering
        indicator.style.transform = `translate(${offsetX}px, -50%) translate(-2px, -2px)`;
    };

    // Initial position
    updateIndicator();

    // Update on nav item click
    const navItems = nav.querySelectorAll('.mobile-nav-item[data-section]');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Small delay to let class update happen first
            requestAnimationFrame(updateIndicator);
        });
    });

    // Update on window resize
    window.addEventListener('resize', updateIndicator);

    // Expose function globally for use by SectionNavigator
    window.updateNavIndicator = updateIndicator;
};
