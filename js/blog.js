/* ========================================
   BLOG - Dynamic Post Loader
   Loads posts from blog/posts/manifest.json
   Cards are collapsible — click to expand
   ======================================== */

let allPosts = [];

/**
 * Format a date string (YYYY-MM-DD) into a readable format
 */
function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Create a blog post card element from post data
 */
function createPostCard(post, index) {
    const card = document.createElement('article');
    card.className = 'blog-post-card collapsed';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-expanded', 'false');

    // Header row (always visible)
    const header = document.createElement('div');
    header.className = 'blog-post-header';

    const headerLeft = document.createElement('div');
    headerLeft.className = 'blog-post-header-left';

    // Date badge
    const dateEl = document.createElement('div');
    dateEl.className = 'blog-post-date';
    dateEl.innerHTML = `<i class="fas fa-calendar-alt"></i> ${formatDate(post.date)}`;

    // Title
    const titleEl = document.createElement('h2');
    titleEl.className = 'blog-post-title';
    titleEl.textContent = post.title;

    // Tags
    const tagsRow = document.createElement('div');
    tagsRow.className = 'blog-post-tags';
    if (post.tags && post.tags.length > 0) {
        post.tags.forEach(tag => {
            const tagEl = document.createElement('span');
            tagEl.className = 'blog-tag';
            tagEl.textContent = tag;
            tagsRow.appendChild(tagEl);
        });
    }

    headerLeft.appendChild(dateEl);
    headerLeft.appendChild(titleEl);
    headerLeft.appendChild(tagsRow);

    // Expand icon
    const expandIcon = document.createElement('div');
    expandIcon.className = 'blog-expand-icon';
    expandIcon.innerHTML = '<i class="fas fa-chevron-down"></i>';

    header.appendChild(headerLeft);
    header.appendChild(expandIcon);

    // Body (hidden when collapsed)
    const body = document.createElement('div');
    body.className = 'blog-post-body';

    // Summary
    const summaryEl = document.createElement('div');
    summaryEl.className = 'blog-post-summary';
    const paragraphs = post.summary.split('\n\n');
    summaryEl.innerHTML = paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
    body.appendChild(summaryEl);

    // Commit messages
    if (post.commitMessages && post.commitMessages.length > 0) {
        const commitsSection = document.createElement('div');
        commitsSection.className = 'blog-post-commits';

        const commitsLabel = document.createElement('div');
        commitsLabel.className = 'blog-post-commits-label';
        commitsLabel.textContent = `${post.commitMessages.length} commit${post.commitMessages.length > 1 ? 's' : ''}`;

        const commitList = document.createElement('ul');
        commitList.className = 'blog-commit-list';

        const visibleCommits = post.commitMessages.slice(0, 5);
        visibleCommits.forEach(msg => {
            const li = document.createElement('li');
            li.className = 'blog-commit-item';
            li.textContent = msg;
            commitList.appendChild(li);
        });

        if (post.commitMessages.length > 5) {
            const more = document.createElement('li');
            more.className = 'blog-commit-item';
            more.textContent = `...and ${post.commitMessages.length - 5} more`;
            more.style.color = 'var(--ink-light)';
            more.style.fontStyle = 'italic';
            commitList.appendChild(more);
        }

        commitsSection.appendChild(commitsLabel);
        commitsSection.appendChild(commitList);
        body.appendChild(commitsSection);
    }

    card.appendChild(header);
    card.appendChild(body);

    // Toggle on click
    card.addEventListener('click', () => toggleCard(card));
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleCard(card);
        }
    });

    // Auto-expand the newest post
    if (index === 0) {
        card.classList.remove('collapsed');
        card.classList.add('expanded');
        card.setAttribute('aria-expanded', 'true');
    }

    return card;
}

/**
 * Toggle a card between collapsed and expanded
 */
function toggleCard(card) {
    const isCollapsed = card.classList.contains('collapsed');
    if (isCollapsed) {
        card.classList.remove('collapsed');
        card.classList.add('expanded');
        card.setAttribute('aria-expanded', 'true');
    } else {
        card.classList.remove('expanded');
        card.classList.add('collapsed');
        card.setAttribute('aria-expanded', 'false');
    }
}

/**
 * Render all posts into the feed
 */
function renderPosts() {
    const feed = document.getElementById('blog-feed');
    feed.innerHTML = '';

    allPosts.forEach((post, index) => {
        const card = createPostCard(post, index);
        card.style.opacity = '0';
        card.style.transform = 'translateY(12px)';
        feed.appendChild(card);

        requestAnimationFrame(() => {
            setTimeout(() => {
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 30);
        });
    });
}

function showLoading() {
    const feed = document.getElementById('blog-feed');
    feed.innerHTML = `
        <div class="blog-loading">
            <div class="blog-loading-spinner"></div>
            <div>Loading posts...</div>
        </div>
    `;
}

function showEmpty() {
    const feed = document.getElementById('blog-feed');
    feed.innerHTML = `
        <div class="blog-empty">
            <div class="blog-empty-icon">📝</div>
            <h3>No Posts Yet</h3>
            <p>Blog posts will appear here. Check back soon!</p>
        </div>
    `;
}

function showError(message) {
    const feed = document.getElementById('blog-feed');
    feed.innerHTML = `
        <div class="blog-empty">
            <div class="blog-empty-icon">⚠️</div>
            <h3>Couldn't load posts</h3>
            <p>${message}</p>
        </div>
    `;
}

/**
 * Load posts from manifest.json
 */
async function loadBlog() {
    showLoading();

    try {
        const response = await fetch('../blog/posts/manifest.json');
        if (!response.ok) {
            if (response.status === 404) {
                showEmpty();
                return;
            }
            throw new Error(`HTTP ${response.status}`);
        }

        const manifest = await response.json();

        if (!manifest.posts || manifest.posts.length === 0) {
            showEmpty();
            return;
        }

        const postPromises = manifest.posts.map(async (entry) => {
            try {
                const res = await fetch(`../blog/posts/${entry.file}`);
                if (!res.ok) return null;
                return await res.json();
            } catch {
                return null;
            }
        });

        const posts = (await Promise.all(postPromises)).filter(Boolean);
        posts.sort((a, b) => b.date.localeCompare(a.date));
        allPosts = posts;

        if (allPosts.length === 0) {
            showEmpty();
            return;
        }

        // Update post count
        const countEl = document.getElementById('blog-post-count');
        if (countEl) {
            countEl.textContent = `${allPosts.length} posts`;
        }

        renderPosts();
    } catch (err) {
        console.error('Blog load error:', err);
        showError('Could not load blog posts. Please try again later.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadBlog();
});
