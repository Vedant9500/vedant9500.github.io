/* ========================================
   VEDANTIUM.DEV - JAVASCRIPT FUNCTIONALITY
   ======================================== */

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

document.addEventListener('DOMContentLoaded', () => {
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
            }, 110);

            window.setTimeout(() => {
                ripple?.remove();
            }, 650);
        });
    }

    const contactBtn = document.querySelector('.contact-toggle');
    const popover = document.querySelector('.contact-popover');
    if (contactBtn && popover) {
        const positionPopover = () => {
            const rect = contactBtn.getBoundingClientRect();
            const popoverWidth = popover.offsetWidth || 240;
            
            // Position below the button, centered under the button
            const top = rect.bottom + 12;
            const buttonCenter = rect.left + (rect.width / 2);
            let left = buttonCenter - (popoverWidth / 2);
            
            // Ensure popover doesn't go off-screen on the left
            if (left < 12) left = 12;
            
            // Ensure popover doesn't go off-screen on the right
            if (left + popoverWidth > window.innerWidth - 12) {
                left = window.innerWidth - popoverWidth - 12;
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
});

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
    
    if (window.scrollY > 20) {
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

    const scrollPos = window.scrollY + 120;
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
// REVEAL ANIMATIONS (SUBTLE)
// ========================================
const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

const revealTargets = document.querySelectorAll(
    '.hero-content, section h2, .about p, .project-card, .achievement-card, .contact-intro, .social-links, .footer p'
);

revealTargets.forEach(el => el.classList.add('reveal'));

if (prefersReducedMotion) {
    revealTargets.forEach(el => el.classList.add('is-visible'));
} else {
    const revealObserver = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
    );

    revealTargets.forEach(el => revealObserver.observe(el));
}

// ========================================
// SECTION NAVIGATION (CONTENT PAGE)
// ========================================
const sectionOrder = ['about', 'projects', 'toolbox'];

const initSectionNavigation = () => {
    const sectionBtns = document.querySelectorAll('.nav-section-btn');
    const sectionsTrack = document.querySelector('.sections-track');
    const contentSections = document.querySelectorAll('.content-section');
    
    if (!sectionBtns.length || !sectionsTrack) return;
    
    let currentSection = 'about';
    let isTransitioning = false;
    let scrollAccumulator = 0;
    let lastTransitionTime = 0; // Track when last transition happened
    const scrollThreshold = 120; // Pixels of overscroll needed to trigger section change
    const minTimeBetweenTransitions = 100; // ms - minimum pause in scrolling before allowing new transition
    
    // Velocity tracking
    let lastScrollTime = 0;
    let scrollVelocity = 0;
    let velocitySamples = [];
    const maxSamples = 5;
    
    // Transition speed limits (in ms)
    const minTransitionDuration = 300;  // Fastest transition
    const maxTransitionDuration = 800;  // Slowest transition
    const defaultTransitionDuration = 600; // For button clicks
    
    const calculateTransitionDuration = () => {
        if (velocitySamples.length === 0) return defaultTransitionDuration;
        
        // Average velocity from samples
        const avgVelocity = velocitySamples.reduce((a, b) => a + b, 0) / velocitySamples.length;
        
        // Map velocity to duration (higher velocity = shorter duration)
        // Typical trackpad scroll is 1-10 pixels per event, fast scroll is 50+
        const velocityNormalized = Math.min(Math.max(avgVelocity, 5), 80); // Clamp between 5-80
        
        // Inverse mapping: low velocity = long duration, high velocity = short duration
        const duration = maxTransitionDuration - ((velocityNormalized - 5) / 75) * (maxTransitionDuration - minTransitionDuration);
        
        return Math.round(duration);
    };
    
    const switchSection = (targetSection, scrollToTop = true, useVelocity = true) => {
        if (targetSection === currentSection || isTransitioning) return;
        
        isTransitioning = true;
        scrollAccumulator = 0;
        
        const currentIndex = sectionOrder.indexOf(currentSection);
        const targetIndex = sectionOrder.indexOf(targetSection);
        const direction = targetIndex > currentIndex ? 'right' : 'left';
        
        // Calculate transition duration based on scroll velocity
        const transitionDuration = useVelocity ? calculateTransitionDuration() : defaultTransitionDuration;
        
        // Apply dynamic transition duration
        sectionsTrack.style.transitionDuration = `${transitionDuration}ms`;
        
        // Update navbar buttons
        sectionBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === targetSection);
        });
        
        // Remove active from all sections
        contentSections.forEach(section => {
            section.classList.remove('active', 'slide-in-left', 'slide-in-right');
        });
        
        // Update track position
        sectionsTrack.dataset.activeSection = targetSection;
        
        // Add slide direction and active to target section
        const targetSectionEl = document.querySelector(`.content-section[data-section="${targetSection}"]`);
        if (targetSectionEl) {
            targetSectionEl.classList.add(`slide-in-${direction === 'right' ? 'right' : 'left'}`);
            
            // Scroll target section to appropriate position
            if (scrollToTop) {
                if (direction === 'right') {
                    targetSectionEl.scrollTop = 0;
                } else {
                    // When going back, scroll to bottom of previous section
                    targetSectionEl.scrollTop = targetSectionEl.scrollHeight;
                }
            }
            
            // Small delay to ensure transition plays
            requestAnimationFrame(() => {
                targetSectionEl.classList.add('active');
            });
        }
        
        currentSection = targetSection;
        velocitySamples = []; // Reset velocity samples
        lastTransitionTime = performance.now(); // Record when transition started
        
        // Reset transition lock after animation completes
        setTimeout(() => {
            isTransitioning = false;
            scrollAccumulator = 0; // Reset accumulator
            // Reset to default transition duration
            sectionsTrack.style.transitionDuration = '';
        }, transitionDuration + 50);
    };
    
    // Get the currently active section element
    const getActiveSection = () => {
        return document.querySelector(`.content-section[data-section="${currentSection}"]`);
    };
    
    // Handle wheel events at viewport level to avoid focus issues
    const viewport = document.querySelector('.sections-viewport');
    if (viewport) {
        viewport.addEventListener('wheel', (e) => {
            // Always prevent default to control scroll behavior
            e.preventDefault();
            
            const activeSection = getActiveSection();
            if (!activeSection) return;
            
            // During transition, absorb all scroll events (no momentum carry-over)
            if (isTransitioning) {
                return;
            }
            
            const now = performance.now();
            const timeSinceLastScroll = now - lastScrollTime;
            const timeSinceTransition = now - lastTransitionTime;
            
            // Only allow new page transition if there was a pause in scrolling
            // This detects when momentum has stopped and user started a new scroll gesture
            const isFreshScrollGesture = timeSinceLastScroll > minTimeBetweenTransitions;
            
            // Reset accumulator if this is a fresh gesture
            if (isFreshScrollGesture) {
                scrollAccumulator = 0;
                velocitySamples = [];
            }
            
            // Track velocity
            const deltaTime = timeSinceLastScroll;
            lastScrollTime = now;
            
            if (deltaTime > 0 && deltaTime < 200) {
                scrollVelocity = Math.abs(e.deltaY) / (deltaTime / 16.67);
                velocitySamples.push(Math.abs(e.deltaY));
                if (velocitySamples.length > maxSamples) {
                    velocitySamples.shift();
                }
            }
            
            const currentIndex = sectionOrder.indexOf(currentSection);
            
            const atTop = activeSection.scrollTop <= 0;
            const atBottom = activeSection.scrollTop + activeSection.clientHeight >= activeSection.scrollHeight - 2;
            
            // Check if this scroll is likely momentum from a recent transition
            const isLikelyMomentum = !isFreshScrollGesture && timeSinceTransition < 800;
            
            // Scrolling down at bottom
            if (e.deltaY > 0 && atBottom && currentIndex < sectionOrder.length - 1) {
                if (!isLikelyMomentum) {
                    scrollAccumulator += e.deltaY;
                    if (scrollAccumulator >= scrollThreshold) {
                        switchSection(sectionOrder[currentIndex + 1], true, true);
                    }
                }
                // Momentum after transition - just absorb it
            }
            // Scrolling up at top
            else if (e.deltaY < 0 && atTop && currentIndex > 0) {
                if (!isLikelyMomentum) {
                    scrollAccumulator += Math.abs(e.deltaY);
                    if (scrollAccumulator >= scrollThreshold) {
                        switchSection(sectionOrder[currentIndex - 1], true, true);
                    }
                }
                // Momentum after transition - just absorb it
            }
            // Normal scrolling within the section
            else {
                scrollAccumulator = 0;
                // Manually scroll the active section since we're capturing at viewport level
                activeSection.scrollTop += e.deltaY;
            }
        }, { passive: false });
    }
    
    sectionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            switchSection(section, true, false); // Use default speed for clicks
        });
    });
    
    // Handle keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (isTransitioning) return;
        
        const currentIndex = sectionOrder.indexOf(currentSection);
        
        if (e.key === 'ArrowRight' && currentIndex < sectionOrder.length - 1) {
            switchSection(sectionOrder[currentIndex + 1], true, false);
        } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
            switchSection(sectionOrder[currentIndex - 1]);
        }
    });
};

document.addEventListener('DOMContentLoaded', initSectionNavigation);

// ========================================
// PAGE NAVIGATION WITH VIEW TRANSITIONS
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Handle navigation links with View Transitions API
    const navigationLinks = document.querySelectorAll('a[href="content.html"], a[href="index.html"], .nav-logo-minimal a, .nav-logo a');
    
    navigationLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Skip if it's the current page
            if (window.location.pathname.endsWith(href)) return;
            
            // Check if View Transitions API is supported
            if (!document.startViewTransition) {
                // Fallback: just navigate normally
                return;
            }
            
            e.preventDefault();
            
            // Determine direction based on navigation
            const isGoingToContent = href === 'content.html';
            document.documentElement.dataset.navDirection = isGoingToContent ? 'forward' : 'back';
            
            // Start view transition
            document.startViewTransition(() => {
                window.location.href = href;
            });
        });
    });
});