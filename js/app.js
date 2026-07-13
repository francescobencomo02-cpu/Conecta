// ============================================
// APLICACIÓN PRINCIPAL - APP.JS
// ============================================

class ConnectaApp {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.init();
    }

    init() {
        // Verificar si el usuario está autenticado
        if (this.currentUser) {
            // Usuario autenticado
            this.setupEventListeners();
            this.loadUserData();
        } else {
            // Usuario no autenticado
            this.redirectToLogin();
        }
    }

    getCurrentUser() {
        const userJson = localStorage.getItem('currentUser');
        return userJson ? JSON.parse(userJson) : null;
    }

    setCurrentUser(user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    redirectToLogin() {
        if (!window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        }
    }

    setupEventListeners() {
        // Botones de logout
        const logoutBtns = document.querySelectorAll('#logoutBtn');
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', () => this.logout());
        });

        // Botones de composición
        const composeBtns = document.querySelectorAll('.btn-compose');
        composeBtns.forEach(btn => {
            btn.addEventListener('click', () => this.showComposeModal());
        });
    }

    loadUserData() {
        // Cargar datos del usuario en el avatar y perfil
        const avatars = document.querySelectorAll('#userAvatar');
        const profileAvatar = document.getElementById('profileAvatar');
        const profileName = document.getElementById('profileName');
        const profileUsername = document.getElementById('profileUsername');
        const profileBio = document.getElementById('profileBio');

        avatars.forEach(avatar => {
            avatar.src = this.currentUser.avatar || 'https://via.placeholder.com/48';
        });

        if (profileAvatar) {
            profileAvatar.src = this.currentUser.avatar || 'https://via.placeholder.com/120';
        }

        if (profileName) profileName.textContent = this.currentUser.name;
        if (profileUsername) profileUsername.textContent = '@' + this.currentUser.username;
        if (profileBio) profileBio.textContent = this.currentUser.bio || 'Sin bio';

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

    showComposeModal() {
        const postInput = document.getElementById('postInput');
        if (postInput) {
            postInput.focus();
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background-color: ${type === 'success' ? '#17BF63' : '#E74C3C'};
            color: white;
            border-radius: 8px;
            z-index: 999;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    formatDate(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }

        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Ahora';
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}d`;

        return date.toLocaleDateString('es-ES', {
            month: 'short',
            day: 'numeric'
        });
    }

    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }
}

// Instancia global de la app
const app = new ConnectaApp();

// Agregar estilos para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .notification {
        animation: slideIn 0.3s ease;
    }
`;
document.head.appendChild(style);