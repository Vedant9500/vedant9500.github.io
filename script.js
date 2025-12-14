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
        const close = () => {
            popover.hidden = true;
            contactBtn.setAttribute('aria-expanded', 'false');
        };

        const open = () => {
            popover.hidden = false;
            contactBtn.setAttribute('aria-expanded', 'true');
        };

        contactBtn.addEventListener('click', (evt) => {
            evt.stopPropagation();
            const isOpen = !popover.hidden;
            if (isOpen) close();
            else open();
        });

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