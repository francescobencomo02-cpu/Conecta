// ============================================
// PERFIL - PROFILE.JS
// ============================================

class ProfileManager {
    constructor() {
        this.currentUser = app.currentUser;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadProfile();
        this.loadUserPosts();
    }

    setupEventListeners() {
        const editProfileBtn = document.getElementById('editProfileBtn');
        const closeEditModal = document.getElementById('closeEditModal');
        const editProfileForm = document.getElementById('editProfileForm');
        const editProfileModal = document.getElementById('editProfileModal');

        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => this.showEditModal());
        }

        if (closeEditModal) {
            closeEditModal.addEventListener('click', () => this.closeEditModal());
        }

        if (editProfileForm) {
            editProfileForm.addEventListener('submit', (e) => this.saveProfile(e));
        }

        if (editProfileModal) {
            editProfileModal.addEventListener('click', (e) => {
                if (e.target === editProfileModal) {
                    this.closeEditModal();
                }
            });
        }
    }

    loadProfile() {
        const profileName = document.getElementById('profileName');
        const profileUsername = document.getElementById('profileUsername');
        const profileBio = document.getElementById('profileBio');
        const profileAvatar = document.getElementById('profileAvatar');
        const coverPhoto = document.getElementById('coverPhoto');

        if (profileName) profileName.textContent = this.currentUser.name;
        if (profileUsername) profileUsername.textContent = '@' + this.currentUser.username;
        if (profileBio) profileBio.textContent = this.currentUser.bio || 'Sin bio';
        if (profileAvatar) profileAvatar.src = this.currentUser.avatar;
        if (coverPhoto) coverPhoto.src = this.currentUser.cover || 'https://via.placeholder.com/1200x300/1DA1F2/ffffff';

        this.updateStats();
    }

    updateStats() {
        const following = db.getFollowing(this.currentUser.id);
        const followers = db.getFollowers(this.currentUser.id);
        const posts = db.getPostsByUserId(this.currentUser.id);

        const followerCount = document.getElementById('followerCount');
        const followingCount = document.getElementById('followingCount');
        const postCount = document.getElementById('postCount');

        if (followerCount) followerCount.textContent = followers.length;
        if (followingCount) followingCount.textContent = following.length;
        if (postCount) postCount.textContent = posts.length;
    }

    loadUserPosts() {
        const userPostsList = document.getElementById('userPostsList');
        if (!userPostsList) return;

        const posts = db.getPostsByUserId(this.currentUser.id);
        userPostsList.innerHTML = '';

        if (posts.length === 0) {
            userPostsList.innerHTML = '<div class="loading">Sin publicaciones aún</div>';
            return;
        }

        posts.forEach(post => {
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
                <div class="post-stats">
                    <span class="stat-item">💬 ${post.comments ? post.comments.length : 0}</span>
                    <span class="stat-item">❤️ ${post.likes || 0}</span>
                    <span class="stat-item">🔄 ${Math.floor(Math.random() * 100)}</span>
                </div>
            `;

            userPostsList.appendChild(postDiv);
        });
    }

    showEditModal() {
        const modal = document.getElementById('editProfileModal');
        if (!modal) return;

        // Llenar formulario con datos actuales
        document.getElementById('editName').value = this.currentUser.name;
        document.getElementById('editBio').value = this.currentUser.bio || '';

        modal.classList.remove('hidden');
    }

    closeEditModal() {
        const modal = document.getElementById('editProfileModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    saveProfile(event) {
        event.preventDefault();

        const name = document.getElementById('editName').value;
        const bio = document.getElementById('editBio').value;
        const avatarInput = document.getElementById('editAvatar');
        const coverInput = document.getElementById('editCover');

        // Actualizar datos del usuario
        const updates = {
            name: name,
            bio: bio
        };

        // Simular carga de imágenes (en producción usarías Firebase Storage)
        if (avatarInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                updates.avatar = e.target.result;
                this.updateUserData(updates);
            };
            reader.readAsDataURL(avatarInput.files[0]);
        } else {
            this.updateUserData(updates);
        }
    }

    updateUserData(updates) {
        const user = db.updateUser(this.currentUser.id, updates);
        
        // Actualizar usuario actual en sesión
        Object.assign(this.currentUser, updates);
        app.setCurrentUser(this.currentUser);

        this.closeEditModal();
        this.loadProfile();
        app.showNotification('¡Perfil actualizado!');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Instancia global del gestor de perfil
const profile = new ProfileManager();