// State
let posts = [];
const STORAGE_KEY = 'tasu_blog_posts';
const ADMIN_PASSWORD = 'le3gagnant@gmail.com';

// Default Data
const defaultPosts = [
    {
        id: '1',
        title: 'The Future of AI is Here',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000',
        excerpt: 'Discover how artificial intelligence is reshaping our daily lives and what to expect in the coming years.',
        content: '# The Future of AI\n\nArtificial Intelligence is no longer just a buzzword. It is integrated into our phones, our cars, and our homes. \n\n## What to expect\n\nIn this article, we explore the transformative power of AI...',
        date: 'Oct 24, 2023',
        tags: ['AI', 'Technology', 'Innovation']
    },
    {
        id: '2',
        title: 'Minimalism in Design',
        image: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?auto=format&fit=crop&q=80&w=1000',
        excerpt: 'Why less is more. A deep dive into the philosophy of minimalist design in modern applications.',
        content: '# Less is More\n\nMinimalism is about stripping away the unnecessary to focus on what truly matters. It is not just an aesthetic choice, but a functional one.\n\n> "Simplicity is the ultimate sophistication." - Leonardo da Vinci',
        date: 'Nov 02, 2023',
        tags: ['Design', 'UX', 'Tutorial']
    },
    {
        id: '3',
        title: 'Exploring the Night',
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1000',
        excerpt: 'A photographic journey through the neon-lit streets of Tokyo after dark.',
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
            // Ensure all posts have slugs
            posts.forEach(p => {
                if (!p.slug) p.slug = createSlug(p.title);
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

    // Render Sidebar Tags
    renderSidebarTags();

    // Event Listeners
    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            filterPosts(query);
        });
    }

    // Sidebar Navigation
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            // Add to clicked
            e.target.classList.add('active');

            const filter = e.target.dataset.filter;
            if (filter === 'all') {
                navigate('home');
            } else {
                filterPosts(filter);
            }
        });
    });

    // Handle hash routing
    handleHashRouting();

    // Handle browser back/forward
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

    allTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'nav-item';
        btn.textContent = tag;
        btn.dataset.filter = tag;
        btn.onclick = (e) => {
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterPosts(tag);
            // Stay on home when filtering
            window.location.hash = '';
        };
        tagList.appendChild(btn);
    });
}

function handleHashRouting() {
    const hash = window.location.hash.substring(1); // Remove #

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

// Navigation
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

// Render Home
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

        const imgUrl = post.image || 'https://via.placeholder.com/400x200?text=No+Image';
        const dateStr = post.date || '';

        card.innerHTML = `
            <img src="${imgUrl}" alt="${post.title}" class="card-image">
            <div class="card-content">
                <div class="card-meta-top">${post.tags ? post.tags[0] : 'Article'}</div>
                <h3 class="card-title">${post.title}</h3>
                <div class="card-meta-bottom">${dateStr}</div>
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

// Render Admin
function renderAdmin(container) {
    const template = document.getElementById('admin-template');
    const clone = template.content.cloneNode(true);

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

            item.appendChild(title);
            item.appendChild(deleteBtn);
            listContainer.appendChild(item);
        });
    }

    // Form Handling
    const form = clone.querySelector('#post-form');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const password = form.querySelector('#admin-password').value;
        if (password !== ADMIN_PASSWORD) {
            alert('Incorrect Admin Password!');
            return;
        }

        const title = form.querySelector('#post-title').value;
        const image = form.querySelector('#post-image').value;
        const tagsStr = form.querySelector('#post-tags').value;
        const excerpt = form.querySelector('#post-excerpt').value;
        const content = form.querySelector('#post-content').value;

        const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t.length > 0);

        const newPost = {
            id: Date.now().toString(),
            title,
            image,
            tags,
            excerpt,
            content,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            slug: createSlug(title)
        };

        posts.push(newPost);
        savePosts();
        renderSidebarTags(); // Re-render tags in case new ones were added
        window.location.hash = '';
    });

    container.appendChild(clone);
}

// Render Article
function renderArticle(container, post) {
    const template = document.getElementById('article-template');
    const clone = template.content.cloneNode(true);

    clone.querySelector('.back-btn').onclick = () => {
        window.location.hash = '';
    };

    clone.querySelector('.article-hero-img').src = post.image || 'https://via.placeholder.com/800x400?text=No+Image';
    clone.querySelector('.article-title').textContent = post.title;
    clone.querySelector('.article-date').textContent = post.date;

    // Render Tags
    const tagsContainer = clone.querySelector('.article-tags');
    if (post.tags) {
        post.tags.forEach(tag => {
            const span = document.createElement('span');
            span.className = 'tag-pill';
            span.textContent = '#' + tag;
            tagsContainer.appendChild(span);
        });
    }

    // Render Markdown Content
    const bodyContainer = clone.querySelector('.article-body');
    if (window.marked) {
        bodyContainer.innerHTML = marked.parse(post.content);
    } else {
        // Fallback if marked isn't loaded
        bodyContainer.innerHTML = post.content.split('\n').map(p => `<p>${p}</p>`).join('');
    }

    container.appendChild(clone);
    window.scrollTo(0, 0);
}

// Utilities
function savePosts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

// Start
init();
