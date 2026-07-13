// ============================================
// FEED - FEED.JS
// ============================================

class FeedManager {
    constructor() {
        this.currentUser = app.currentUser;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFeed();
        this.loadTrends();
        this.loadSuggestions();
    }

    setupEventListeners() {
        const postBtn = document.getElementById('postBtn');
        const postInput = document.getElementById('postInput');
        const searchInput = document.getElementById('searchInput');

        if (postBtn) {
            postBtn.addEventListener('click', () => this.createPost());
        }

        if (postInput) {
            postInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    this.createPost();
                }
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.search(e.target.value));
        }
    }

    createPost() {
        const postInput = document.getElementById('postInput');
        const content = postInput.value.trim();

        if (!content) {
            app.showNotification('Por favor escribe algo', 'error');
            return;
        }

        const post = db.createPost({
            userId: this.currentUser.id,
            author: this.currentUser.name,
            username: this.currentUser.username,
            avatar: this.currentUser.avatar,
            content: content,
            image: null,
            timestamp: new Date()
        });

        postInput.value = '';
        app.showNotification('¡Publicación creada!');
        this.loadFeed();
    }

    loadFeed() {
        const feed = document.getElementById('feed');
        if (!feed) return;

        feed.innerHTML = '';
        const posts = db.getPosts();

        if (posts.length === 0) {
            feed.innerHTML = '<div class="loading">No hay publicaciones aún</div>';
            return;
        }

        posts.forEach(post => {
            const postHTML = this.createPostElement(post);
            feed.appendChild(postHTML);
        });
    }

    createPostElement(post) {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        postDiv.innerHTML = `
            <div class="post-header">
                <img src="${post.avatar}" alt="${post.author}" class="post-avatar">
                <div class="post-info">
                    <div class="post-top">
                        <span class="post-author">${post.author}</span>
                        <span class="post-username">@${post.username}</span>
                        <span class="post-time">${app.formatDate(post.timestamp)}</span>
                    </div>
                </div>
            </div>
            <div class="post-content">${this.escapeHtml(post.content)}</div>
            ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image">` : ''}
            <div class="post-stats">
                <span class="stat-item">💬 ${post.comments ? post.comments.length : 0} Comentarios</span>
                <span class="stat-item">❤️ ${post.likes || 0} Me gusta</span>
                <span class="stat-item">🔄 ${Math.floor(Math.random() * 100)} Compartir</span>
            </div>
            <div class="post-actions-bottom">
                <button class="interaction-btn" data-action="comment" data-post-id="${post.id}">
                    💬 Comentar
                </button>
                <button class="interaction-btn" data-action="like" data-post-id="${post.id}">
                    ❤️ Me gusta
                </button>
                <button class="interaction-btn" data-action="share" data-post-id="${post.id}">
                    🔄 Compartir
                </button>
            </div>
        `;

        // Agregar event listeners
        const likeBtn = postDiv.querySelector('[data-action="like"]');
        const commentBtn = postDiv.querySelector('[data-action="comment"]');
        const shareBtn = postDiv.querySelector('[data-action="share"]');

        if (likeBtn) {
            likeBtn.addEventListener('click', () => this.likePost(post.id));
        }

        if (commentBtn) {
            commentBtn.addEventListener('click', () => {
                app.showNotification('Comentarios próximamente');
            });
        }

        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                app.showNotification('¡Publicación compartida!');
            });
        }

        return postDiv;
    }

    likePost(postId) {
        const post = db.posts.find(p => p.id === postId);
        if (post) {
            post.likes = (post.likes || 0) + 1;
            db.saveStorageData('posts', db.posts);
            app.showNotification('¡Te encanta esta publicación!');
            this.loadFeed();
        }
    }

    loadTrends() {
        const trendsList = document.getElementById('trendsList');
        if (!trendsList) return;

        const trends = [
            { category: 'Tendencia Global', name: '#Conecta', volume: '125K' },
            { category: 'Tecnología', name: '#JavaScript', volume: '89.5K' },
            { category: 'Social', name: '#RedesSociales', volume: '75.3K' },
            { category: 'Web', name: '#WebDevelopment', volume: '62K' }
        ];

        trendsList.innerHTML = '';
        trends.forEach(trend => {
            const trendDiv = document.createElement('div');
            trendDiv.className = 'trend-item';
            trendDiv.innerHTML = `
                <p class="trend-category">${trend.category}</p>
                <p class="trend-name">${trend.name}</p>
                <p class="trend-volume">${trend.volume} publicaciones</p>
            `;
            trendDiv.style.cursor = 'pointer';
            trendDiv.addEventListener('click', () => {
                app.showNotification(`Buscando ${trend.name}...`);
            });
            trendsList.appendChild(trendDiv);
        });
    }

    loadSuggestions() {
        const suggestionsList = document.getElementById('suggestionsList');
        if (!suggestionsList) return;

        // Obtener usuarios que el usuario actual no sigue
        const following = db.getFollowing(this.currentUser.id).map(f => f.followingId);
        const suggestions = db.users.filter(u => 
            u.id !== this.currentUser.id && !following.includes(u.id)
        ).slice(0, 3);

        suggestionsList.innerHTML = '';
        suggestions.forEach(user => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.className = 'suggestion-item';
            suggestionDiv.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid var(--border-color);
            `;
            suggestionDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; flex-grow: 1;">
                    <img src="${user.avatar}" alt="${user.name}" style="width: 36px; height: 36px; border-radius: 50%;">
                    <div>
                        <p style="font-weight: 700; font-size: 14px;">${user.name}</p>
                        <p style="font-size: 12px; color: var(--text-secondary);">@${user.username}</p>
                    </div>
                </div>
                <button class="btn btn-primary" style="padding: 6px 16px; font-size: 12px;" data-user-id="${user.id}">
                    Seguir
                </button>
            `;

            const followBtn = suggestionDiv.querySelector('button');
            followBtn.addEventListener('click', () => {
                db.followUser(this.currentUser.id, user.id);
                app.showNotification(`¡Ahora sigues a ${user.name}!`);
                this.loadSuggestions();
                app.updateStats();
            });

            suggestionsList.appendChild(suggestionDiv);
        });
    }

    search(query) {
        if (!query.trim()) {
            this.loadFeed();
            return;
        }

        const feed = document.getElementById('feed');
        if (!feed) return;

        feed.innerHTML = '';
        const posts = db.getPosts().filter(post =>
            post.content.toLowerCase().includes(query.toLowerCase()) ||
            post.author.toLowerCase().includes(query.toLowerCase())
        );

        if (posts.length === 0) {
            feed.innerHTML = '<div class="loading">No se encontraron resultados</div>';
            return;
        }

        posts.forEach(post => {
            const postHTML = this.createPostElement(post);
            feed.appendChild(postHTML);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Instancia global del gestor de feed
const feed = new FeedManager();