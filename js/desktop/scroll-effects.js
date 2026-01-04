/* ========================================
   SCROLL EFFECTS - Desktop scrollspy, navbar, reveal animations
   ======================================== */

import { TIMING } from '../core/constants.js';
import { prefersReducedMotion } from '../core/utils.js';

// ========================================
// MOBILE NAVIGATION
// ========================================
export const initMobileNavigation = () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking nav links
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Smooth scroll for all nav links
    document.querySelectorAll('.nav-menu a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
};

// ========================================
// NAVBAR SCROLL EFFECTS
// ========================================
export const initNavbarScrollEffects = () => {
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
};

// ========================================
// SCROLLSPY (ACTIVE NAV LINK)
// ========================================
export const initScrollspy = () => {
    const navLinks = Array.from(document.querySelectorAll('.nav-menu a[href^="#"]'));
    const sections = navLinks
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    const setActiveNav = () => {
        if (!navLinks.length || !sections.length) return;

        const scrollPos = window.scrollY + TIMING.SCROLL_OFFSET;
        let activeId = sections[0].id;

        for (const section of sections) {
            if (section.offsetTop <= scrollPos) activeId = section.id;
        }

        navLinks.forEach(link => {
            const isActive = link.getAttribute('href') === `#${activeId}`;
            link.classList.toggle('active', isActive);
        });
    };

    window.addEventListener('scroll', setActiveNav, { passive: true });
    window.addEventListener('load', setActiveNav);
};

// ========================================
// REVEAL ANIMATIONS (SCROLL-TRIGGERED)
// ========================================
export const initRevealAnimations = () => {
    const revealTargets = document.querySelectorAll(
        '.hero-content, section h2, .about-card, .project-card, .achievement-card, .contact-intro, .social-links, .footer p'
    );

    revealTargets.forEach(el => el.classList.add('reveal'));

    if (prefersReducedMotion) {
        revealTargets.forEach(el => el.classList.add('is-visible'));
    } else {
        const revealObserver = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    // Apply will-change before animation
                    entry.target.style.willChange = 'opacity, transform';
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                    // Remove will-change after animation completes (600ms from CSS)
                    setTimeout(() => {
                        entry.target.style.willChange = '';
                    }, 700);
                });
            },
            { threshold: TIMING.REVEAL_THRESHOLD, rootMargin: '0px 0px -10% 0px' }
        );

        revealTargets.forEach(el => revealObserver.observe(el));
    }
};

// ========================================
// SCROLL INDICATORS
// ========================================
export const initScrollIndicators = () => {
    const sections = document.querySelectorAll('.content-section');
    if (!sections.length) return;

    const updateScrollIndicators = (section) => {
        const { scrollTop, scrollHeight, clientHeight } = section;
        const canScrollUp = scrollTop > 20;
        const canScrollDown = scrollTop + clientHeight < scrollHeight - 20;

        section.classList.toggle('can-scroll-up', canScrollUp);
        section.classList.toggle('can-scroll-down', canScrollDown);
    };

    sections.forEach(section => {
        // Initial check
        updateScrollIndicators(section);

        // Update on scroll
        section.addEventListener('scroll', () => {
            updateScrollIndicators(section);
        }, { passive: true });
    });

    // Re-check on window resize
    window.addEventListener('resize', () => {
        sections.forEach(updateScrollIndicators);
    }, { passive: true });
};

// ========================================
// TOOLBOX ACCORDION
// ========================================
export const initToolboxAccordion = () => {
    const accordion = document.querySelector('.toolbox-accordion');
    if (!accordion) return;

    const categories = accordion.querySelectorAll('.toolbox-category');

    categories.forEach(category => {
        const header = category.querySelector('.toolbox-header');
        if (!header) return;

        header.addEventListener('click', () => {
            const isExpanded = category.dataset.expanded === 'true';

            // Toggle current category
            category.dataset.expanded = isExpanded ? 'false' : 'true';
            header.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
        });
    });
};

// ========================================
// PAGE NAVIGATION WITH VIEW TRANSITIONS
// ========================================
export const initPageNavigation = () => {
    // Handle navigation links with View Transitions API
    // Note: For cross-document navigation, browsers that support MPA View Transitions
    // will automatically pick up transitions via CSS @view-transition rule.
    // We add direction hints for styling purposes.
    const navigationLinks = document.querySelectorAll('a[href="/about/"], a[href="/"], .nav-logo-minimal a, .nav-logo a');

    navigationLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            const currentPath = window.location.pathname;

            // Skip if it's the current page
            const isHome = href === '/' && (currentPath === '/' || currentPath.endsWith('/index.html') || currentPath === '/index.html');
            const isAbout = href === '/about/' && (currentPath.includes('/about') || currentPath.endsWith('/about/'));

            if (isHome || isAbout) {
                e.preventDefault();
                return;
            }

            // Set direction hint for CSS transitions (used by browsers with MPA View Transitions)
            const isGoingToContent = href === '/about/' || href.includes('/about');
            document.documentElement.dataset.navDirection = isGoingToContent ? 'forward' : 'back';

            // Let the browser handle navigation normally
            // MPA View Transitions are handled automatically via CSS @view-transition
        });
    });
};
