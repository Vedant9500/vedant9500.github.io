/**
 * scroll-engine.js
 * A lightweight scroll and intersection observer for triggering section animations.
 */

document.addEventListener("DOMContentLoaded", () => {
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
    
    // 3. Dark Theme Navigation Check
    const fixedNav = document.querySelector('.fixed-nav');
    const scrollProgress = document.querySelector('.scroll-progress');
    
    function checkTheme(section) {
        if (!fixedNav || !scrollProgress) return;
        
        // If the section being viewed into is dark, we swap some styles
        if (section.classList.contains('section-dark')) {
            fixedNav.style.color = 'var(--paper)';
            // We use specific CSS inheritance tricks or targeted styling here
            document.querySelectorAll('.brand-name, .nav-link').forEach(el => {
                el.style.color = 'var(--paper)';
            });
            document.querySelectorAll('.nav-link').forEach(el => {
                el.style.setProperty('--after-bg', 'var(--paper)'); // custom prop if needed
            });
            document.querySelector('.progress-fill').style.background = 'var(--paper)';
        } else {
            // Reset to default ink
            document.querySelectorAll('.brand-name, .nav-link').forEach(el => {
                el.style.color = 'var(--ink)';
            });
            document.querySelector('.progress-fill').style.background = 'var(--ink)';
        }
    }

    // 4. Accordion Logic for Work Items
    const workHeaders = document.querySelectorAll('.work-header');
    
    workHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const currentItem = header.closest('.work-item');
            
            // Close other items
            document.querySelectorAll('.work-item').forEach(item => {
                if(item !== currentItem) {
                    item.classList.remove('is-expanded');
                }
            });
            
            // Toggle current
            currentItem.classList.toggle('is-expanded');
        });
    });
});
