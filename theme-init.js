// Theme initialization script - runs before page renders to prevent flash
// This file should be loaded synchronously in <head>
(() => {
    try {
        const stored = localStorage.getItem('theme');
        const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = stored === 'light' || stored === 'dark' ? stored : (systemDark ? 'dark' : 'light');
        document.documentElement.dataset.theme = theme;
    } catch { }
})();
