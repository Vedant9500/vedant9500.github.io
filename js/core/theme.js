/* ========================================
   THEME - Theme toggle and persistence
   ======================================== */

// Apply theme to the document
export const applyTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
};

// Get current theme (from localStorage or system preference)
export const getTheme = () => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
};

// Update theme toggle button UI
export const updateThemeToggleUI = () => {
    const btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    const icon = btn.querySelector('i');
    if (icon) {
        const isDark = getTheme() === 'dark';
        icon.classList.remove('fa-sun', 'fa-moon');
        icon.classList.add(isDark ? 'fa-sun' : 'fa-moon');
    }
};

// Create ripple effect for theme transition
export const createThemeRipple = (x, y, nextTheme) => {
    const existing = document.querySelector('.theme-ripple');
    if (existing) existing.remove();

    const ripple = document.createElement('div');
    ripple.className = 'theme-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.background = nextTheme === 'dark' ? 'var(--theme-bg-dark)' : 'var(--theme-bg-light)';
    document.body.appendChild(ripple);

    requestAnimationFrame(() => ripple.classList.add('is-on'));
    setTimeout(() => ripple.remove(), 600);
};

// Initialize theme toggle and contact popover
export const initThemeAndPopover = () => {
    // Apply initial theme
    applyTheme(getTheme());
    updateThemeToggleUI();

    // Theme toggle button
    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', (e) => {
            const rect = themeBtn.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            const next = getTheme() === 'dark' ? 'light' : 'dark';

            if (typeof document.startViewTransition === 'function') {
                createThemeRipple(x, y, next);
                document.startViewTransition(() => {
                    applyTheme(next);
                    updateThemeToggleUI();
                });
            } else {
                applyTheme(next);
                updateThemeToggleUI();
            }
        });
    }

    // Contact popover
    const contactBtn = document.querySelector('.contact-toggle');
    const popover = document.querySelector('.contact-popover');

    if (contactBtn && popover) {
        const positionPopover = () => {
            const btnRect = contactBtn.getBoundingClientRect();
            const popoverWidth = popover.offsetWidth || 200;
            const popoverHeight = popover.offsetHeight || 200;

            // Position below the button
            let top = btnRect.bottom + 8;
            let left = btnRect.left + (btnRect.width / 2) - (popoverWidth / 2);

            // Keep on screen
            if (left < 12) left = 12;
            if (left + popoverWidth > window.innerWidth - 12) {
                left = window.innerWidth - popoverWidth - 12;
            }
            if (top + popoverHeight > window.innerHeight - 12) {
                top = btnRect.top - popoverHeight - 8;
            }

            popover.style.position = 'fixed';
            popover.style.top = top + 'px';
            popover.style.left = left + 'px';
        };

        const close = () => {
            popover.hidden = true;
            contactBtn.setAttribute('aria-expanded', 'false');
            // Slide about-hero back
            const aboutHero = document.querySelector('.about-hero');
            if (aboutHero) aboutHero.classList.remove('popover-open');
        };

        const open = () => {
            popover.hidden = false;
            contactBtn.setAttribute('aria-expanded', 'true');
            requestAnimationFrame(positionPopover);
            // Slide about-hero away
            const aboutHero = document.querySelector('.about-hero');
            if (aboutHero) aboutHero.classList.add('popover-open');
        };

        contactBtn.addEventListener('click', (evt) => {
            evt.stopPropagation();
            popover.hidden ? open() : close();
        });

        document.addEventListener('click', (evt) => {
            if (!popover.hidden && !popover.contains(evt.target) && !contactBtn.contains(evt.target)) {
                close();
            }
        });

        document.addEventListener('keydown', (evt) => {
            if (evt.key === 'Escape' && !popover.hidden) close();
        });

        window.addEventListener('resize', () => {
            if (!popover.hidden) positionPopover();
        });
    }
};
