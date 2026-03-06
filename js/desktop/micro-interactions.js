/* ========================================
   MICRO-INTERACTIONS - JS-Driven Effects
   Magnetic pull, 3D tilt, staggered reveals
   Desktop-only (pointer: fine)
   ======================================== */

import { prefersReducedMotion } from '../core/utils.js';

/**
 * Magnetic pull effect — button subtly follows cursor on hover.
 * Max displacement: ±6px
 */
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn, .btn-primary, .btn-secondary, .btn-tech, .btn-outline');

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Offset from center, clamped to ±6px
            const maxPull = 6;
            const dx = ((e.clientX - centerX) / (rect.width / 2)) * maxPull;
            const dy = ((e.clientY - centerY) / (rect.height / 2)) * maxPull;

            btn.style.setProperty('--mag-x', `${dx.toFixed(1)}px`);
            btn.style.setProperty('--mag-y', `${dy.toFixed(1)}px`);
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.setProperty('--mag-x', '0px');
            btn.style.setProperty('--mag-y', '0px');
        });
    });
}

/**
 * 3D card tilt — perspective rotate toward cursor position.
 * Max rotation: ±4deg
 */
function initCardTilt() {
    const cards = document.querySelectorAll('.project-card, .toolbox-card');

    cards.forEach(card => {
        let rAF = null;
        let targetX = 0;
        let targetY = 0;

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();

            // Normalize cursor position to -1..1 within the card
            const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;

            // Map to rotation: X-axis rotation inverted (top = positive tilt)
            targetX = -ny * 4;  // max ±4deg
            targetY = nx * 4;

            if (!rAF) {
                rAF = requestAnimationFrame(() => {
                    card.style.setProperty('--tilt-x', `${targetX.toFixed(1)}deg`);
                    card.style.setProperty('--tilt-y', `${targetY.toFixed(1)}deg`);
                    rAF = null;
                });
            }
        });

        card.addEventListener('mouseleave', () => {
            if (rAF) {
                cancelAnimationFrame(rAF);
                rAF = null;
            }
            card.style.setProperty('--tilt-x', '0deg');
            card.style.setProperty('--tilt-y', '0deg');
        });
    });
}

/**
 * Staggered skill pill entrance animation.
 * Uses IntersectionObserver to trigger when pill container scrolls into view.
 */
function initStaggeredPills() {
    const pillContainers = document.querySelectorAll('.skill-pills');
    if (!pillContainers.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const pills = entry.target.querySelectorAll('.skill-pill');
            pills.forEach((pill, i) => {
                pill.style.animationDelay = `${i * 0.07}s`;
                pill.classList.add('pill-animate');
            });

            obs.unobserve(entry.target);
        });
    }, { threshold: 0.3, rootMargin: '0px 0px -5% 0px' });

    pillContainers.forEach(container => observer.observe(container));
}

/**
 * Section heading underline reveal.
 * Adds .heading-revealed when h2 scrolls into view.
 */
function initHeadingUnderlines() {
    const headings = document.querySelectorAll('section h2');
    if (!headings.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            // Small delay so it feels intentional after the reveal slide-up
            setTimeout(() => {
                entry.target.classList.add('heading-revealed');
            }, 300);
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.5, rootMargin: '0px 0px -10% 0px' });

    headings.forEach(h => observer.observe(h));
}

/**
 * Keyword shimmer trigger.
 * Adds .shimmer-active to .keyword elements when parent card becomes visible.
 */
function initKeywordShimmer() {
    const cards = document.querySelectorAll('.about-card, .project-card');
    if (!cards.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const keywords = entry.target.querySelectorAll('.keyword');
            keywords.forEach((kw, i) => {
                setTimeout(() => {
                    kw.classList.add('shimmer-active');
                }, 400 + i * 150);
            });

            obs.unobserve(entry.target);
        });
    }, { threshold: 0.4, rootMargin: '0px 0px -5% 0px' });

    cards.forEach(card => observer.observe(card));
}

/**
 * Main entry point — initializes all micro-interactions.
 * Gated behind non-touch device check and reduced motion check.
 */
export const initMicroInteractions = () => {
    // Skip on touch devices or if user prefers reduced motion
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (prefersReducedMotion) return;

    initMagneticButtons();
    initCardTilt();
    initStaggeredPills();
    initHeadingUnderlines();
    initKeywordShimmer();
};
