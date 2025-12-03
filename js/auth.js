// ===== AUTHENTICATION SYSTEM =====
class AuthSystem {
    constructor() {
        console.log('✅ AuthSystem initialized');
        // Database akan di-init oleh db.js
    }

    // Login user
    login(email, password) {
        try {
            if (!email || !password) {
                return { success: false, message: 'Email dan password harus diisi' };
            }

            // Pastikan AgroDB sudah ada
            if (typeof AgroDB === 'undefined') {
                console.error('Database not loaded');
                return { success: false, message: 'Sistem belum siap' };
            }

            const user = AgroDB.getUserByEmail(email);
            
            if (!user) {
                return { success: false, message: 'Email tidak terdaftar' };
            }

            // Simple password check
            if (user.password !== password) {
                return { success: false, message: 'Password salah' };
            }

            AgroDB.setCurrentUser(user);
            return { success: true, user };
            
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Terjadi kesalahan saat login' };
        }
    }

    // Register new user
    register(name, email, password) {
        try {
            // Validation
            if (!name || !email || !password) {
                return { success: false, message: 'Semua field harus diisi' };
            }

            if (password.length < 6) {
                return { success: false, message: 'Password minimal 6 karakter' };
            }

            // Check if user already exists
            const existingUser = AgroDB.getUserByEmail(email);
            if (existingUser) {
                return { success: false, message: 'Email sudah terdaftar' };
            }

            // Create new user
            const user = AgroDB.createUser({
                name,
                email,
                password
            });

            // Auto login after registration
            AgroDB.setCurrentUser(user);
            return { success: true, user };
            
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Terjadi kesalahan saat pendaftaran' };
        }
    }

    // Logout user
    logout() {
        AgroDB.clearCurrentUser();
        console.log('✅ User logged out');
    }

    // Get current logged in user
    getCurrentUser() {
        return AgroDB.getCurrentUser();
    }

    // Check if user is authenticated
    isAuthenticated() {
        const user = this.getCurrentUser();
        return !!user;
    }

    // Check auth and redirect if not logged in
    requireAuth(redirectTo = 'login.html') {
        if (!this.isAuthenticated()) {
            window.location.href = redirectTo;
            return false;
        }
        return true;
    }
}

// ===== INITIALIZE AND SETUP =====

// Create global instance immediately
window.Auth = new AuthSystem();

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Auth.js loaded successfully');
    
    // Debug: Check if AgroDB is available
    console.log('AgroDB available:', typeof AgroDB !== 'undefined');
    console.log('Auth instance:', window.Auth);
    
    // Auto-redirect if user is already logged in (for login page)
    if (window.location.pathname.includes('login.html')) {
        if (window.Auth.isAuthenticated()) {
            console.log('User already logged in, redirecting to dashboard...');
            window.location.href = 'dashboard.html';
        }
    }
    
    // Setup login form if exists
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('Login form found, setting up event listener...');
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email')?.value.trim();
            const password = document.getElementById('password')?.value;
            
            console.log('Login attempt for:', email);
            
            const result = window.Auth.login(email, password);
            
            if (result.success) {
                alert(`Selamat datang, ${result.user.name}!`);
                window.location.href = 'dashboard.html';
            } else {
                alert(`❌ ${result.message}`);
            }
        });
    }
});

// Make class available globally for manual instantiation
window.AuthSystem = AuthSystem;