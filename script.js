// State
let posts = [];
let selectedTagsForNewPost = new Set();
let editingPostId = null;
const STORAGE_KEY = 'tasu_blog_posts';
const ADMIN_PASSWORD = 'le3gagnant@gmail.com';

// Default Data
const defaultPosts = [
    {
        id: '1',
        title: 'The Future of AI is Here',
        subtitle: 'Discover how artificial intelligence is reshaping our daily lives',
        content: '# The Future of AI\n\nArtificial Intelligence is no longer just a buzzword. It is integrated into our phones, our cars, and our homes. \n\n## What to expect\n\nIn this article, we explore the transformative power of AI...',
        date: 'Oct 24, 2023',
        tags: ['AI', 'Technology', 'Innovation']
    },
    {
        id: '2',
        title: 'Minimalism in Design',
        subtitle: 'Why less is more in modern application design',
        content: '# Less is More\n\nMinimalism is about stripping away the unnecessary to focus on what truly matters. It is not just an aesthetic choice, but a functional one.\n\n> "Simplicity is the ultimate sophistication." - Leonardo da Vinci',
        date: 'Nov 02, 2023',
        tags: ['Design', 'UX', 'Tutorial']
    },
    {
        id: '3',
        title: 'Exploring the Night',
        subtitle: 'A photographic journey through neon-lit streets',
        content: '# Neon Lights\n\nThe city comes alive at night. Neon signs reflect off wet pavement, creating a cyberpunk atmosphere that is both eerie and beautiful.',
        date: 'Nov 15, 2023',
        tags: ['Photography', 'Travel', 'Insights']
    }
];

// Initialization
function init() {
    const storedPosts = localStorage.getItem(STORAGE_KEY);
    if (storedPosts) {
        try {
            posts = JSON.parse(storedPosts);
            posts.forEach(p => {
                if (!p.slug) p.slug = createSlug(p.title);
                if (!p.subtitle) p.subtitle = p.excerpt || '';
            });
        } catch (e) {
            console.error('Error parsing posts:', e);
            posts = defaultPosts;
            savePosts();
        }
    } else {
        posts = defaultPosts.map(p => ({ ...p, slug: createSlug(p.title) }));
        savePosts();
    }

    renderSidebarTags();

    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            filterPosts(query);
        });
    }

    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const filter = e.target.dataset.filter;
            if (filter === 'all') {
                window.location.hash = '';
            } else {
                filterPosts(filter);
            }
        });
    });

    handleHashRouting();
    window.addEventListener('hashchange', handleHashRouting);
}

function createSlug(title) {
    return title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

function renderSidebarTags() {
    const tagList = document.getElementById('tag-list');
    if (!tagList) return;

    const allTags = new Set();
    posts.forEach(post => {
        if (post.tags) {
            post.tags.forEach(tag => allTags.add(tag));
        }
    });

    tagList.innerHTML = '';
    allTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'nav-item';
        btn.textContent = tag;
        btn.dataset.filter = tag;
        btn.onclick = (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            // Navigate to home first, then filter
            if (window.location.hash) {
                window.location.hash = '';
                setTimeout(() => filterPosts(tag), 100);
            } else {
                filterPosts(tag);
            }
        };
        tagList.appendChild(btn);
    });
}

function handleHashRouting() {
    const hash = window.location.hash.substring(1);

    if (!hash || hash === '/') {
        navigate('home');
    } else if (hash === '/admin') {
        navigate('admin');
    } else if (hash.startsWith('/article/')) {
        const slug = hash.replace('/article/', '');
        const post = posts.find(p => p.slug === slug || p.id === slug);
        if (post) {
            navigate('article', post);
        } else {
            navigate('home');
        }
    } else {
        navigate('home');
    }
}

function navigate(view, data = null) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '';

    if (view === 'home') {
        renderHome(mainContent);
    } else if (view === 'admin') {
        renderAdmin(mainContent);
    } else if (view === 'article') {
        renderArticle(mainContent, data);
    }
}

function renderHome(container) {
    const template = document.getElementById('home-template');
    const clone = template.content.cloneNode(true);
    const grid = clone.querySelector('#blog-grid');

    renderPostsToGrid(grid, posts);

    const searchBar = clone.querySelector('#search-bar');
    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            filterPosts(query);
        });
    }

    container.appendChild(clone);
}

function renderPostsToGrid(gridElement, postsToRender) {
    if (!gridElement) gridElement = document.getElementById('blog-grid');
    if (!gridElement) return;

    gridElement.innerHTML = '';
    postsToRender.forEach(post => {
        const card = document.createElement('div');
        card.className = 'blog-card';
        card.onclick = () => {
            const slug = post.slug || createSlug(post.title);
            window.location.hash = `/article/${slug}`;
        };

        const dateStr = post.date || '';
        const tagsHtml = post.tags ? post.tags.map(tag => `<span class="card-tag">${tag}</span>`).join('') : '';

        card.innerHTML = `
            <div class="card-content">
                <h3 class="card-title">${post.title}</h3>
                <p class="card-subtitle">${post.subtitle || ''}</p>
                <div class="card-footer">
                    <div class="card-tags">${tagsHtml}</div>
                    <span class="card-date">${dateStr}</span>
                </div>
            </div>
        `;
        gridElement.prepend(card);
    });
}

function filterPosts(query) {
    const grid = document.getElementById('blog-grid');
    if (!grid) return;

    const filtered = posts.filter(post => {
        const q = query.toLowerCase();
        const matchTitle = post.title.toLowerCase().includes(q);
        const matchTags = post.tags && post.tags.some(tag => tag.toLowerCase().includes(q));
        return matchTitle || matchTags;
    });

    renderPostsToGrid(grid, filtered);
}

function renderAdmin(container) {
    const template = document.getElementById('admin-template');
    const clone = template.content.cloneNode(true);

    // Setup password gate
    const gate = clone.querySelector('#admin-password-gate');
    const gateInput = clone.querySelector('#gate-password');
    const gateSubmit = clone.querySelector('#gate-submit');
    const gateError = clone.querySelector('#gate-error');
    const adminContent = clone.querySelector('#admin-content');

    const checkPassword = () => {
        if (gateInput.value === ADMIN_PASSWORD) {
            gate.style.display = 'none';
            adminContent.classList.remove('admin-content-blurred');
            adminContent.classList.add('admin-content-unlocked');
        } else {
            gateError.textContent = 'Incorrect password';
        }
    };

    gateSubmit.onclick = checkPassword;
    gateInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkPassword();
    });

    // Render Article List
    const listContainer = clone.querySelector('#admin-article-list');
    if (posts.length === 0) {
        listContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No articles found.</p>';
    } else {
        posts.forEach(post => {
            const item = document.createElement('div');
            item.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px;
                background: #0a0a0c;
                border: 1px solid var(--border-color);
                border-radius: 8px;
                margin-bottom: 12px;
            `;

            const title = document.createElement('span');
            title.textContent = post.title;
            title.style.fontWeight = '500';

            const actions = document.createElement('div');
            actions.style.display = 'flex';
            actions.style.gap = '8px';

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.style.cssText = `
                background: rgba(255, 159, 28, 0.1);
                color: var(--accent-orange);
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.85rem;
                font-weight: 600;
                transition: all 0.2s;
            `;
            editBtn.onmouseover = () => editBtn.style.background = 'rgba(255, 159, 28, 0.2)';
            editBtn.onmouseout = () => editBtn.style.background = 'rgba(255, 159, 28, 0.1)';
            editBtn.onclick = () => {
                editPost(post);
            };

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.style.cssText = `
                background: rgba(255, 50, 50, 0.1);
                color: #ff4444;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.85rem;
                font-weight: 600;
                transition: all 0.2s;
            `;
            deleteBtn.onmouseover = () => deleteBtn.style.background = 'rgba(255, 50, 50, 0.2)';
            deleteBtn.onmouseout = () => deleteBtn.style.background = 'rgba(255, 50, 50, 0.1)';

            deleteBtn.onclick = () => {
                if (confirm(`Are you sure you want to delete "${post.title}"?`)) {
                    posts = posts.filter(p => p.id !== post.id);
                    savePosts();
                    navigate('admin');
                }
            };

            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            item.appendChild(title);
            item.appendChild(actions);
            listContainer.appendChild(item);
        });
    }

    // Render existing tags
    renderExistingTags(clone);

    // Form Handling
    const form = clone.querySelector('#post-form');
    const cancelBtn = clone.querySelector('#cancel-button');

    cancelBtn.onclick = () => {
        resetForm();
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = form.querySelector('#post-title').value;
        const subtitle = form.querySelector('#post-subtitle').value;
        const tagsInput = form.querySelector('#post-tags').value;
        const content = form.querySelector('#post-content').value;
        const postId = form.querySelector('#post-id').value;

        const newTags = tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);
        const allTags = [...selectedTagsForNewPost, ...newTags];

        if (postId) {
            // Update existing post
            const postIndex = posts.findIndex(p => p.id === postId);
            if (postIndex !== -1) {
                posts[postIndex] = {
                    ...posts[postIndex],
                    title,
                    subtitle,
                    tags: allTags,
                    content,
                    slug: createSlug(title)
                };
            }
        } else {
            // Create new post
            const newPost = {
                id: Date.now().toString(),
                title,
                subtitle,
                tags: allTags,
                content,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                slug: createSlug(title)
            };
            posts.push(newPost);
        }

        savePosts();
        renderSidebarTags();
        selectedTagsForNewPost.clear();
        resetForm();
        navigate('admin');
    });

    container.appendChild(clone);

    // Helper function to edit a post
    function editPost(post) {
        editingPostId = post.id;
        document.getElementById('post-id').value = post.id;
        document.getElementById('post-title').value = post.title;
        document.getElementById('post-subtitle').value = post.subtitle || '';
        document.getElementById('post-content').value = post.content;
        document.getElementById('admin-form-title').textContent = 'Edit Article';
        document.getElementById('submit-button').textContent = 'Update Article';
        document.getElementById('cancel-button').style.display = 'inline-block';

        // Pre-select tags
        selectedTagsForNewPost.clear();
        if (post.tags) {
            post.tags.forEach(tag => selectedTagsForNewPost.add(tag));
        }
        renderExistingTags(document.querySelector('.admin-panel'));

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function resetForm() {
        editingPostId = null;
        document.getElementById('post-id').value = '';
        document.getElementById('post-title').value = '';
        document.getElementById('post-subtitle').value = '';
        document.getElementById('post-tags').value = '';
        document.getElementById('post-content').value = '';
        document.getElementById('admin-form-title').textContent = 'Create New Article';
        document.getElementById('submit-button').textContent = 'Publish Article';
        document.getElementById('cancel-button').style.display = 'none';
        selectedTagsForNewPost.clear();
        renderExistingTags(document.querySelector('.admin-panel'));
    }
}

function renderExistingTags(container) {
    const tagsContainer = container.querySelector('#existing-tags');
    if (!tagsContainer) return;

    const allTags = new Set();
    posts.forEach(post => {
        if (post.tags) {
            post.tags.forEach(tag => allTags.add(tag));
        }
    });

    tagsContainer.innerHTML = '';
    allTags.forEach(tag => {
        const chip = document.createElement('div');
        chip.className = 'tag-chip';

        const tagName = document.createElement('span');
        tagName.textContent = tag;

        chip.appendChild(tagName);
        chip.onclick = () => {
            if (selectedTagsForNewPost.has(tag)) {
                selectedTagsForNewPost.delete(tag);
                chip.style.opacity = '0.5';
            } else {
                selectedTagsForNewPost.add(tag);
                chip.style.opacity = '1';
            }
        };
        chip.style.opacity = selectedTagsForNewPost.has(tag) ? '1' : '0.5';
        chip.style.cursor = 'pointer';

        tagsContainer.appendChild(chip);
    });
}

function generateTOC(articleBody) {
    const headings = articleBody.querySelectorAll('h1, h2, h3');
    const tocNav = document.getElementById('toc-nav');
    const tocContainer = document.getElementById('article-toc');

    if (!headings.length || !tocNav) {
        if (tocContainer) tocContainer.style.display = 'none';
        return;
    }

    tocNav.innerHTML = '';
    headings.forEach((heading, index) => {
        const id = `heading-${index}`;
        heading.id = id;

        const link = document.createElement('a');
        link.href = `#${id}`;
        link.textContent = heading.textContent;
        link.className = `toc-link toc-${heading.tagName.toLowerCase()}`;
        link.onclick = (e) => {
            e.preventDefault();
            heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };

        tocNav.appendChild(link);
    });

    // Track scroll position to highlight active section
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateActiveTOCLink(headings);
                ticking = false;
            });
            ticking = true;
        }
    });
}

function updateActiveTOCLink(headings) {
    const scrollPos = window.scrollY + 100;
    let activeIndex = 0;

    headings.forEach((heading, index) => {
        if (heading.offsetTop <= scrollPos) {
            activeIndex = index;
        }
    });

    document.querySelectorAll('.toc-link').forEach((link, index) => {
        if (index === activeIndex) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function renderArticle(container, post) {
    const template = document.getElementById('article-template');
    const clone = template.content.cloneNode(true);

    clone.querySelector('.back-btn').onclick = () => {
        window.location.hash = '';
    };

    clone.querySelector('.article-title').textContent = post.title;
    clone.querySelector('.article-subtitle').textContent = post.subtitle || '';
    clone.querySelector('.article-date').textContent = post.date;

    const tagsContainer = clone.querySelector('.article-tags');
    if (post.tags) {
        post.tags.forEach(tag => {
            const span = document.createElement('span');
            span.className = 'tag-pill';
            span.textContent = '#' + tag;
            tagsContainer.appendChild(span);
        });
    }

    const bodyContainer = clone.querySelector('.article-body');
    if (window.marked) {
        bodyContainer.innerHTML = marked.parse(post.content);
    } else {
        bodyContainer.innerHTML = post.content.split('\n').map(p => `<p>${p}</p>`).join('');
    }

    container.appendChild(clone);

    // Generate TOC after content is in DOM
    setTimeout(() => {
        const articleBody = document.querySelector('.article-body');
        if (articleBody) {
            generateTOC(articleBody);
        }
    }, 100);

    window.scrollTo(0, 0);
}

function savePosts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

init();
