/* ========================================
   BLOG - Dynamic Post Loader
   Loads posts from blog/posts/manifest.json
   Cards are collapsible — click to expand
   ======================================== */

let allPosts = [];
let filteredPosts = [];
let activeTag = null;
let currentPage = 1;
const postsPerPage = 10;

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
 * Create a simple slug from title for anchor links
 */
function createSlug(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

/**
 * Estimate reading time based on word count
 */
function getReadingTime(text) {
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
}

/**
 * Create a blog post card element from post data
 */
function createPostCard(post, index) {
    const card = document.createElement('article');
    card.className = 'blog-post-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-expanded', 'false');
    
    // Assign ID for deep linking
    const slug = createSlug(post.title);
    card.id = slug;

    // Header row (always visible)
    const header = document.createElement('div');
    header.className = 'blog-post-header';

    const headerLeft = document.createElement('div');
    headerLeft.className = 'blog-post-header-left';

    // Date badge + Anchor Link + Depth Indicator
    const dateRow = document.createElement('div');
    dateRow.style.display = 'flex';
    dateRow.style.alignItems = 'center';
    dateRow.style.gap = '0.5rem';
    
    const dateEl = document.createElement('div');
    dateEl.className = 'blog-post-date';
    dateEl.innerHTML = `<i class="fas fa-calendar-alt"></i> ${formatDate(post.date)}`;
    
    // Anchor Link
    const anchorBtn = document.createElement('a');
    anchorBtn.href = `#${slug}`;
    anchorBtn.className = 'blog-anchor-link';
    anchorBtn.innerHTML = '<i class="fas fa-link"></i>';
    anchorBtn.title = "Copy link to this entry";
    anchorBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card toggle
        navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#${slug}`);
        
        // Brief visual feedback
        const icon = anchorBtn.querySelector('i');
        icon.className = 'fas fa-check';
        icon.style.color = 'var(--accent-mint)';
        setTimeout(() => {
            icon.className = 'fas fa-link';
            icon.style.color = '';
        }, 1500);
    });

    dateRow.appendChild(dateEl);
    dateRow.appendChild(anchorBtn);
    headerLeft.appendChild(dateRow);

    // Title
    const titleEl = document.createElement('h2');
    titleEl.className = 'blog-post-title';
    titleEl.textContent = post.title;
    headerLeft.appendChild(titleEl);

    // Tags + Depth Indicator
    const tagsRow = document.createElement('div');
    tagsRow.className = 'blog-post-tags';
    
    // Depth Indicator (Read time / Commits)
    const depthTag = document.createElement('span');
    depthTag.className = 'blog-tag';
    depthTag.style.borderStyle = 'dashed';
    const readTime = getReadingTime(post.summary);
    const commitCount = post.commitMessages ? post.commitMessages.length : 0;
    
    if (commitCount > 0) {
        depthTag.innerHTML = `<i class="fas fa-code-branch" style="margin-right: 4px;"></i> ${commitCount} commits`;
    } else {
        depthTag.innerHTML = `<i class="far fa-clock" style="margin-right: 4px;"></i> ~${readTime} min read`;
    }
    tagsRow.appendChild(depthTag);

    // Actual Tags
    if (post.tags && post.tags.length > 0) {
        post.tags.forEach(tag => {
            const tagEl = document.createElement('span');
            tagEl.className = 'blog-tag';
            tagEl.textContent = tag;
            tagsRow.appendChild(tagEl);
        });
    }

    headerLeft.appendChild(tagsRow);

    // Expand icon
    const expandIcon = document.createElement('div');
    expandIcon.className = 'blog-expand-icon';
    expandIcon.innerHTML = '<i class="fas fa-chevron-down"></i>';

    header.appendChild(headerLeft);
    header.appendChild(expandIcon);

    // Body (hidden when collapsed via grid-template-rows)
    const body = document.createElement('div');
    body.className = 'blog-post-body';

    // Inner wrapper required for grid collapse animation
    const bodyInner = document.createElement('div');
    bodyInner.className = 'blog-post-body-inner';

    // Summary
    const summaryEl = document.createElement('div');
    summaryEl.className = 'blog-post-summary';
    const paragraphs = post.summary.split('\n\n');
    summaryEl.innerHTML = paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
    bodyInner.appendChild(summaryEl);

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
            more.style.fontStyle = 'italic';
            more.textContent = `...and ${post.commitMessages.length - 5} more`;
            commitList.appendChild(more);
        }

        commitsSection.appendChild(commitsLabel);
        commitsSection.appendChild(commitList);
        bodyInner.appendChild(commitsSection);
    }

    body.appendChild(bodyInner);
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

    // We no longer auto-expand the first post unconditionally, 
    // we let the hash handler take precedence, but we can default it if no hash
    if (index === 0 && !window.location.hash) {
        card.classList.add('expanded');
        card.setAttribute('aria-expanded', 'true');
    }

    return card;
}

/**
 * Toggle a card between collapsed and expanded
 */
function toggleCard(card) {
    const isExpanded = card.classList.contains('expanded');
    if (isExpanded) {
        card.classList.remove('expanded');
        card.setAttribute('aria-expanded', 'false');
    } else {
        card.classList.add('expanded');
        card.setAttribute('aria-expanded', 'true');
    }
}

/**
 * Extract tags and render filter buttons
 */
function renderTags() {
    const filterContainer = document.getElementById('blog-tag-filters');
    if (!filterContainer) return;
    
    // Get unique tags
    const tagSet = new Set();
    allPosts.forEach(post => {
        if (post.tags) {
            post.tags.forEach(tag => tagSet.add(tag));
        }
    });
    
    // Sort tags alphabetically
    const uniqueTags = Array.from(tagSet).sort();
    
    filterContainer.innerHTML = '';
    
    // Create 'All' tag
    const allBtn = document.createElement('button');
    allBtn.className = `blog-tag ${activeTag === null ? 'active' : ''}`;
    allBtn.textContent = 'All Entries';
    allBtn.addEventListener('click', () => {
        activeTag = null;
        currentPage = 1;
        filteredPosts = [...allPosts];
        renderTags(); // Update active states
        renderPosts();
    });
    filterContainer.appendChild(allBtn);
    
    // Create specific tags
    uniqueTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = `blog-tag ${activeTag === tag ? 'active' : ''}`;
        btn.textContent = tag;
        btn.addEventListener('click', () => {
            if (activeTag === tag) {
                // Toggle off if already active
                activeTag = null;
                filteredPosts = [...allPosts];
            } else {
                activeTag = tag;
                filteredPosts = allPosts.filter(p => p.tags && p.tags.includes(tag));
            }
            currentPage = 1;
            renderTags(); // Update active states
            renderPosts();
        });
        filterContainer.appendChild(btn);
    });
}

/**
 * Render posts into the feed based on pagination and filters
 */
function renderPosts() {
    const feed = document.getElementById('blog-feed');
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    if (currentPage === 1) {
        feed.innerHTML = ''; // Only clear if we're rendering page 1 (or filtering)
    }

    if (filteredPosts.length === 0) {
        showEmpty("No entries found for this tag.");
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
    }

    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const postsToRender = filteredPosts.slice(startIndex, endIndex);

    postsToRender.forEach((post, i) => {
        const card = createPostCard(post, startIndex + i);
        card.style.opacity = '0';
        card.style.transform = 'translateY(12px)';
        feed.appendChild(card);

        requestAnimationFrame(() => {
            setTimeout(() => {
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, i * 30);
        });
    });

    // Update Load More button visibility
    if (loadMoreBtn) {
        if (endIndex >= filteredPosts.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }
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

function showEmpty(msg = "Blog posts will appear here. Check back soon!") {
    const feed = document.getElementById('blog-feed');
    feed.innerHTML = `
        <div class="blog-empty">
            <div class="blog-empty-icon">📝</div>
            <h3>No Posts Yet</h3>
            <p>${msg}</p>
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
        filteredPosts = [...allPosts];

        if (allPosts.length === 0) {
            showEmpty();
            return;
        }

        // Update post count
        const countEl = document.getElementById('blog-post-count');
        if (countEl) {
            countEl.textContent = `${allPosts.length} posts`;
        }

        renderTags();
        renderPosts();
        
        // Handle Deep Linking / Anchor Hash on load
        setTimeout(() => {
            if (window.location.hash) {
                const hashId = window.location.hash.substring(1);
                const targetCard = document.getElementById(hashId);
                
                if (targetCard) {
                    // Expand it
                    targetCard.classList.add('expanded');
                    targetCard.setAttribute('aria-expanded', 'true');
                    
                    // Scroll to it smoothly
                    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Add a brief highlight effect
                    targetCard.style.transition = 'box-shadow 0.3s ease';
                    targetCard.style.boxShadow = '0 0 0 2px var(--accent-mint)';
                    setTimeout(() => {
                        targetCard.style.boxShadow = 'none';
                    }, 2000);
                }
            }
        }, 500);

    } catch (err) {
        console.error('Blog load error:', err);
        showError('Could not load blog posts. Please try again later.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadBlog();

    // Arrow Key Navigation for Cards
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.classList.contains('blog-post-card')) {
                e.preventDefault(); // Prevent default page scrolling
                
                const cards = Array.from(document.querySelectorAll('.blog-post-card'));
                const currentIndex = cards.indexOf(activeElement);
                
                if (e.key === 'ArrowDown' && currentIndex < cards.length - 1) {
                    cards[currentIndex + 1].focus();
                } else if (e.key === 'ArrowUp' && currentIndex > 0) {
                    cards[currentIndex - 1].focus();
                }
            }
        }
    });

    // Sort Toggle
    let isNewestFirst = true;
    const sortBtn = document.getElementById('sort-toggle-btn');
    if (sortBtn) {
        sortBtn.addEventListener('click', () => {
            isNewestFirst = !isNewestFirst;
            sortBtn.textContent = isNewestFirst ? 'Newest first' : 'Oldest first';
            
            // Reverse both lists
            allPosts.reverse();
            filteredPosts.reverse();
            
            // Reset to page 1 and render
            currentPage = 1;
            renderPosts();
        });
    }

    // Load More Button
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            currentPage++;
            renderPosts();
        });
    }

    // Smart Navbar & Quick Jump
    const jumpBtn = document.getElementById('quick-jump-btn');
    const nav = document.querySelector('.fixed-nav');
    let lastScrollY = window.scrollY;
    let navOffset = 0;

    if (jumpBtn) {
        // Initial state
        jumpBtn.style.transform = 'translateY(10px)';
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            const deltaY = currentScrollY - lastScrollY;

            // Quick jump button visibility
            if (currentScrollY > 500) {
                jumpBtn.style.opacity = '1';
                jumpBtn.style.pointerEvents = 'auto';
                jumpBtn.style.transform = 'translateY(0)';
            } else {
                jumpBtn.style.opacity = '0';
                jumpBtn.style.pointerEvents = 'none';
                jumpBtn.style.transform = 'translateY(10px)';
            }

            // Smart Navbar auto-hide logic (scroll-linked)
            if (nav) {
                const navHeight = nav.offsetHeight;
                
                if (currentScrollY <= 0) {
                    navOffset = 0;
                } else {
                    navOffset -= deltaY;
                    navOffset = Math.max(-navHeight, Math.min(0, navOffset));
                }
                
                nav.style.transform = `translateY(${navOffset}px)`;
            }
            
            lastScrollY = currentScrollY;
        }, { passive: true });

        jumpBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
