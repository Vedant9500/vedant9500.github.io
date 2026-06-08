/**
 * scroll-engine.js
 * A lightweight scroll and intersection observer for triggering section animations.
 */

document.addEventListener("DOMContentLoaded", () => {
    const nav = document.querySelector('.fixed-nav');
    if (nav) {
        nav.classList.add('is-inview');
    }

    let lastScrollY = window.scrollY;
    let navOffset = 0;

    function getNavHiddenDistance() {
        if (!nav) return 0;

        const navTop = Number.parseFloat(window.getComputedStyle(nav).top);
        return nav.offsetHeight + (Number.isFinite(navTop) ? Math.max(navTop, 0) : 0);
    }

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const deltaY = currentScrollY - lastScrollY;

        if (nav) {
            const navHiddenDistance = getNavHiddenDistance();

            if (currentScrollY <= 0) {
                navOffset = 0;
            } else {
                navOffset -= deltaY;
                navOffset = Math.max(-navHiddenDistance, Math.min(0, navOffset));
            }

            nav.style.transform = `translateY(${navOffset}px)`;
        }

        lastScrollY = currentScrollY;
    }, { passive: true });

    // 1. Setup Intersection Observer for Sections
    const sections = document.querySelectorAll('[data-scroll-section]');
    
    // Options for the observer
    const observerOptions = {
        root: null, // Use viewport
        rootMargin: '0px',
        threshold: 0.4 // Trigger when 40% of the section is visible
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the animation trigger class
                entry.target.classList.add('is-inview');
                
                // Update scroll progress relative to sections
                updateProgress(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach((section, index) => {
        section.setAttribute('data-index', index);
        sectionObserver.observe(section);
    });

    // 2. Scroll Progress Bar
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    const totalSections = sections.length;

    function updateProgress(currentSection) {
        if (!progressFill || !progressText) return;
        
        const index = parseInt(currentSection.getAttribute('data-index'));
        const percentage = ((index + 1) / totalSections) * 100;
        
        progressFill.style.width = `${percentage}%`;
        
        // Format as 01, 02, etc.
        const formattedIndex = String(index + 1).padStart(2, '0');
        const formattedTotal = String(totalSections).padStart(2, '0');
        progressText.textContent = `${formattedIndex} / ${formattedTotal}`;
        
        // Handle dark section color swapping for global elements
        checkTheme(currentSection);
    }
    
    // 3. Theme Toggle Engine
    const body = document.body;
    
    function checkTheme(section) {
        if (!body) return;
        
        // If the section being viewed into is dark, we swap the global theme attribute
        if (section.classList.contains('section-dark')) {
            body.setAttribute('data-theme', 'dark');
        } else {
            body.removeAttribute('data-theme');
        }
    }

    // 4. Accordion Logic for Work Items
    const workHeaders = document.querySelectorAll('.work-header');

    function setWorkItemExpanded(item, expanded) {
        const header = item.querySelector('.work-header');
        const body = item.querySelector('.work-body');

        item.classList.toggle('is-expanded', expanded);
        if (header) header.setAttribute('aria-expanded', String(expanded));
        if (body) body.setAttribute('aria-hidden', String(!expanded));
    }
    
    workHeaders.forEach(header => {
        const currentItem = header.closest('.work-item');
        const body = currentItem ? currentItem.querySelector('.work-body') : null;

        if (body) {
            body.setAttribute('aria-hidden', 'true');
        }

        const toggleHeader = () => {
            if (!currentItem) return;
            const shouldExpand = !currentItem.classList.contains('is-expanded');

            document.querySelectorAll('.work-item').forEach(item => {
                setWorkItemExpanded(item, item === currentItem && shouldExpand);
            });
        };

        header.addEventListener('click', toggleHeader);
    });
});
