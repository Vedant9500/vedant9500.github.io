/* ========================================
   VEDANTIUM.DEV - JAVASCRIPT FUNCTIONALITY
   ======================================== */

// ========================================
// CONSTANTS
// ========================================
const TIMING = {
    THEME_SWITCH_DELAY_MS: 110,      // Delay before applying theme during ripple animation
    RIPPLE_CLEANUP_MS: 650,          // Time before removing ripple element
    POPOVER_OFFSET: 12,              // Spacing between popover and trigger element
    NAVBAR_SCROLL_THRESHOLD: 20,     // Scroll distance to trigger navbar 'scrolled' state
    SCROLL_OFFSET: 120,              // Offset for scrollspy active section detection
    REVEAL_THRESHOLD: 0.12,          // Intersection observer threshold for reveal animations
    MOBILE_POPOVER_PADDING: 12,      // Edge padding for mobile popover positioning
};

// ========================================
// THEME TOGGLE (PERSISTENT)
// ========================================
const applyTheme = (theme) => {
    if (theme !== 'light' && theme !== 'dark') return;
    document.documentElement.dataset.theme = theme;
    try {
        localStorage.setItem('theme', theme);
    } catch { }
};

const getTheme = () => {
    const current = document.documentElement.dataset.theme;
    if (current === 'light' || current === 'dark') return current;
    try {
        const stored = localStorage.getItem('theme');
        if (stored === 'light' || stored === 'dark') return stored;
    } catch { }
    const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemDark ? 'dark' : 'light';
};

const updateThemeToggleUI = () => {
    const btn = document.querySelector('.theme-toggle');
    if (!btn) return;

    const theme = getTheme();
    const isDark = theme === 'dark';
    btn.setAttribute('aria-pressed', String(isDark));

    const icon = btn.querySelector('i');
    if (icon) {
        icon.classList.remove('fa-sun', 'fa-moon');
        icon.classList.add(isDark ? 'fa-sun' : 'fa-moon');
    }

    btn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
};

const createThemeRipple = (x, y, nextTheme) => {
    const ripple = document.createElement('div');
    ripple.className = 'theme-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    // Freeze ripple color so it doesn't change mid-animation when theme tokens flip.
    if (nextTheme === 'dark') ripple.style.background = 'var(--theme-bg-dark)';
    if (nextTheme === 'light') ripple.style.background = 'var(--theme-bg-light)';

    document.body.appendChild(ripple);

    // Trigger layout then animate
    ripple.getBoundingClientRect();
    ripple.classList.add('is-on');
    return ripple;
};

const initThemeAndPopover = () => {
    applyTheme(getTheme());
    updateThemeToggleUI();

    const btn = document.querySelector('.theme-toggle');
    if (btn) {
        btn.addEventListener('click', (e) => {
            const next = getTheme() === 'dark' ? 'light' : 'dark';

            const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
            if (reduceMotion) {
                applyTheme(next);
                updateThemeToggleUI();
                return;
            }

            const rect = btn.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            // Prefer View Transitions — smooth cross-fade.
            if (typeof document.startViewTransition === 'function') {
                document.startViewTransition(() => {
                    applyTheme(next);
                    updateThemeToggleUI();
                });
                return;
            }

            const ripple = createThemeRipple(x, y, next);

            // Switch theme shortly after ripple starts, then clean up.
            window.setTimeout(() => {
                applyTheme(next);
                updateThemeToggleUI();
            }, TIMING.THEME_SWITCH_DELAY_MS);

            window.setTimeout(() => {
                ripple?.remove();
            }, TIMING.RIPPLE_CLEANUP_MS);
        });
    }

    const contactBtn = document.querySelector('.contact-toggle');
    const popover = document.querySelector('.contact-popover');
    if (contactBtn && popover) {
        const positionPopover = () => {
            const rect = contactBtn.getBoundingClientRect();
            const popoverWidth = popover.offsetWidth || 240;

            // Position below the button, centered under the button
            const top = rect.bottom + TIMING.POPOVER_OFFSET;
            const buttonCenter = rect.left + (rect.width / 2);
            let left = buttonCenter - (popoverWidth / 2);

            // Ensure popover doesn't go off-screen on the left
            if (left < TIMING.POPOVER_OFFSET) left = TIMING.POPOVER_OFFSET;

            // Ensure popover doesn't go off-screen on the right
            if (left + popoverWidth > window.innerWidth - TIMING.POPOVER_OFFSET) {
                left = window.innerWidth - popoverWidth - TIMING.POPOVER_OFFSET;
            }

            popover.style.top = `${top}px`;
            popover.style.left = `${left}px`;
        };

        const close = () => {
            popover.hidden = true;
            contactBtn.setAttribute('aria-expanded', 'false');
        };

        const open = () => {
            popover.hidden = false;
            contactBtn.setAttribute('aria-expanded', 'true');
            // Use requestAnimationFrame to ensure popover is rendered before measuring
            requestAnimationFrame(() => {
                positionPopover();
            });
        };

        contactBtn.addEventListener('click', (evt) => {
            evt.stopPropagation();
            const isOpen = !popover.hidden;
            if (isOpen) close();
            else open();
        });

        // Reposition on scroll/resize when open
        window.addEventListener('scroll', () => {
            if (!popover.hidden) positionPopover();
        }, { passive: true });
        window.addEventListener('resize', () => {
            if (!popover.hidden) positionPopover();
        }, { passive: true });

        popover.addEventListener('click', (evt) => {
            evt.stopPropagation();
        });

        document.addEventListener('click', () => close());
        document.addEventListener('keydown', (evt) => {
            if (evt.key === 'Escape') close();
        });
    }
};

// ========================================
// MOBILE NAVIGATION
// ========================================
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        // Toggle aria-expanded for accessibility
        const expanded = hamburger.getAttribute('aria-expanded') === 'true';
        hamburger.setAttribute('aria-expanded', !expanded);
        hamburger.setAttribute('aria-label', expanded ? 'Open menu' : 'Close menu');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });
}

// ========================================
// SMOOTH SCROLLING
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
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

// ========================================
// NAVBAR SCROLL EFFECTS
// ========================================
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    if (window.scrollY > TIMING.NAVBAR_SCROLL_THRESHOLD) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ========================================
// SCROLLSPY (ACTIVE NAV LINK)
// ========================================
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

// ========================================
// REVEAL ANIMATIONS (SCROLL-TRIGGERED)
// ========================================
const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

const revealTargets = document.querySelectorAll(
    '.hero-content, section h2, .about-card, .project-card, .achievement-card, .contact-intro, .social-links, .footer p'
);

revealTargets.forEach(el => el.classList.add('reveal'));

// Function to re-trigger reveal animations for a section's children
const triggerSectionReveals = (sectionId) => {
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

// ========================================
// SECTION NAVIGATION (CONSOLIDATED)
// ========================================
const sectionOrder = ['about', 'projects', 'toolbox'];

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

            if (scrollToTop) {
                targetSectionEl.scrollTop = direction === 'right' ? 0 : Math.max(0, targetSectionEl.scrollHeight - targetSectionEl.clientHeight);
            }

            requestAnimationFrame(() => {
                targetSectionEl.classList.add('active');
            });
        }

        currentSection = targetSection;
        velocitySamples = [];
        lastTransitionTime = performance.now();

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
    };

    const handleTouchEnd = (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > MIN_SWIPE_DISTANCE) {
            const currentIndex = sectionOrder.indexOf(currentSection);

            if (deltaX < 0 && currentIndex < sectionOrder.length - 1) {
                switchSection(sectionOrder[currentIndex + 1], { transitionMs: 400 });
            } else if (deltaX > 0 && currentIndex > 0) {
                switchSection(sectionOrder[currentIndex - 1], { transitionMs: 400 });
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


// ========================================
// MOBILE BOTTOM NAV - THEME & CONTACT TOGGLES
// ========================================
const initMobileToggles = () => {
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

            if (popover.hidden) {
                popover.hidden = false;
                requestAnimationFrame(positionMobilePopover);
            } else {
                popover.hidden = true;
            }
        });
    }
};

// ========================================
// PAGE NAVIGATION WITH VIEW TRANSITIONS
// ========================================
const initPageNavigation = () => {
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

// ========================================
// SCROLL INDICATORS
// ========================================
const initScrollIndicators = () => {
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
const initToolboxAccordion = () => {
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
// PROJECTS CAROUSEL (Mobile)
// ========================================
const initProjectsCarousel = () => {
    const grid = document.querySelector('.projects-grid');
    const dotsContainer = document.querySelector('.carousel-dots');
    if (!grid || !dotsContainer) return;

    const cards = grid.querySelectorAll('.project-card');
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    if (!cards.length || !dots.length) return;

    let currentIndex = 0;
    let isScrolling = false;

    // Update active dot based on scroll position
    const updateActiveDot = () => {
        const scrollLeft = grid.scrollLeft;
        const cardWidth = cards[0].offsetWidth + 16; // Include gap
        const newIndex = Math.round(scrollLeft / cardWidth);

        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < dots.length) {
            currentIndex = newIndex;
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });
        }
    };

    // Scroll to card when dot is clicked
    const scrollToCard = (index) => {
        if (index < 0 || index >= cards.length) return;

        const cardWidth = cards[0].offsetWidth + 16;
        const scrollPosition = index * cardWidth;

        grid.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
    };

    // Listen for scroll events
    grid.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                updateActiveDot();
                isScrolling = false;
            });
            isScrolling = true;
        }
    }, { passive: true });

    // Handle dot clicks
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            scrollToCard(index);
        });
    });
};

// ========================================
// ABOUT CARDS AUTO-HIGHLIGHT (Mobile)
// ========================================
const initAboutCardsFocus = () => {
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

// ========================================
// CONSOLIDATED INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initThemeAndPopover();
    SectionNavigator.init();
    initMobileToggles();
    initPageNavigation();
    initScrollIndicators();
    initToolboxAccordion();
    initProjectsCarousel();
    initAboutCardsFocus();
});
