const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('[data-reveal]');

if (prefersReducedMotion) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.16,
        rootMargin: '0px 0px -8% 0px'
    });

    revealItems.forEach((item) => revealObserver.observe(item));
}

const trackedLinks = Array.from(document.querySelectorAll('[data-section-link]'));
const trackedSections = Array.from(document.querySelectorAll('section[id]')).filter((section) =>
    trackedLinks.some((link) => link.dataset.sectionLink === section.id)
);

const setActiveLink = (activeId) => {
    trackedLinks.forEach((link) => {
        if (link.dataset.sectionLink === activeId) {
            link.setAttribute('aria-current', 'true');
        } else {
            link.removeAttribute('aria-current');
        }
    });
};

if (trackedSections.length > 0) {
    setActiveLink(trackedSections[0].id);

    const sectionObserver = new IntersectionObserver((entries) => {
        const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

        if (visible) {
            setActiveLink(visible.target.id);
        }
    }, {
        threshold: [0.2, 0.4, 0.6],
        rootMargin: '-30% 0px -45% 0px'
    });

    trackedSections.forEach((section) => sectionObserver.observe(section));
}
