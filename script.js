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
        tags: ['AI', 'Tech', 'Future']
    },
    {
        id: '2',
        title: 'Minimalism in Design',
        image: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?auto=format&fit=crop&q=80&w=1000',
        excerpt: 'Why less is more. A deep dive into the philosophy of minimalist design in modern applications.',
        content: '# Less is More\n\nMinimalism is about stripping away the unnecessary to focus on what truly matters. It is not just an aesthetic choice, but a functional one.\n\n> "Simplicity is the ultimate sophistication." - Leonardo da Vinci',
        date: 'Nov 02, 2023',
        tags: ['Design', 'Minimalism']
    },
    {
        id: '3',
        title: 'Exploring the Night',
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1000',
        excerpt: 'A photographic journey through the neon-lit streets of Tokyo after dark.',
        content: '# Neon Lights\n\nThe city comes alive at night. Neon signs reflect off wet pavement, creating a cyberpunk atmosphere that is both eerie and beautiful.',
        date: 'Nov 15, 2023',
        tags: ['Photography', 'Travel', 'Night']
    }
];

// Initialization
function init() {
    const storedPosts = localStorage.getItem(STORAGE_KEY);
    if (storedPosts) {
        posts = JSON.parse(storedPosts);
    } else {
        posts = defaultPosts;
        savePosts();
    }

    // Event Listeners
    const navHome = document.getElementById('nav-home');
    if (navHome) {
        navHome.addEventListener('click', () => {
            updateUrlParams({});
            navigate('home');
        });
    }

    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            filterPosts(query);
        });
    }

    // Check URL params for initial route
    handleRouting();

    // Handle browser back/forward
    window.addEventListener('popstate', handleRouting);
}

function handleRouting() {
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get('article');
    const view = params.get('view');

    if (articleId) {
        const post = posts.find(p => p.id === articleId);
        if (post) {
            navigate('article', post);
        } else {
            navigate('home');
        }
    } else if (view === 'admin') {
        navigate('admin');
    } else {
        navigate('home');
    }
}

function updateUrlParams(params) {
    const url = new URL(window.location);
    url.search = ''; // Clear existing
    for (const key in params) {
        url.searchParams.set(key, params[key]);
    }
    window.history.pushState({}, '', url);
}

// Navigation
function navigate(view, data = null) {
    const mainContent = document.getElementById('main-content');
    const navHome = document.getElementById('nav-home');
    const searchContainer = document.querySelector('.search-container');

    // Update Nav State
    if (view === 'home') {
        if (navHome) navHome.classList.add('active');
        if (searchContainer) searchContainer.style.display = 'block';
    } else if (view === 'admin') {
        if (navHome) navHome.classList.remove('active');
        if (searchContainer) searchContainer.style.display = 'none';
    } else if (view === 'article') {
        if (navHome) navHome.classList.remove('active');
        if (searchContainer) searchContainer.style.display = 'none';
    }

    // Render View
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

    container.appendChild(clone);
}

function renderPostsToGrid(gridElement, postsToRender) {
    gridElement.innerHTML = '';
    postsToRender.forEach(post => {
        const card = document.createElement('div');
        card.className = 'blog-card';
        card.onclick = () => {
            updateUrlParams({ article: post.id });
            navigate('article', post);
        };

        const imgUrl = post.image || 'https://via.placeholder.com/400x200?text=No+Image';

        // Tags rendering
        const tagsHtml = post.tags ? post.tags.map(tag => `<span class="tag-pill">#${tag}</span>`).join('') : '';

        card.innerHTML = `
            <img src="${imgUrl}" alt="${post.title}" class="card-image">
            <div class="card-content">
                <div style="margin-bottom: 12px; display: flex; gap: 6px; flex-wrap: wrap;">${tagsHtml}</div>
                <h3 class="card-title">${post.title}</h3>
                <p class="card-excerpt">${post.excerpt}</p>
                <div class="card-meta">${post.date}</div>
            </div>
        `;
        gridElement.prepend(card); // Newest first
    });
}

function filterPosts(query) {
    const grid = document.getElementById('blog-grid');
    if (!grid) return; // Not on home page

    const filtered = posts.filter(post => {
        const matchTitle = post.title.toLowerCase().includes(query);
        const matchTags = post.tags && post.tags.some(tag => tag.toLowerCase().includes(query));
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
                    navigate('admin'); // Re-render to show updated list
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
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };

        posts.push(newPost);
        savePosts();
        updateUrlParams({});
        navigate('home');
    });

    container.appendChild(clone);
}

// Render Article
function renderArticle(container, post) {
    const template = document.getElementById('article-template');
    const clone = template.content.cloneNode(true);

    clone.querySelector('.back-btn').onclick = () => {
        updateUrlParams({});
        navigate('home');
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
