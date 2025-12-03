// ===== DATABASE SYSTEM =====
const AgroDB = {
    // Initialize database
    init() {
        // Initialize users
        if (!localStorage.getItem('agro_users')) {
            const demoUser = {
                id: 'demo123',
                name: 'Petani Demo',
                email: 'demo@agroprofit.com',
                password: 'demo123',
                points: 150,
                level: 2,
                simulationsCount: 8,
                badges: [
                    { name: 'Pemula', icon: '🌱', earnedAt: new Date().toISOString() }
                ],
                createdAt: new Date().toISOString()
            };
            localStorage.setItem('agro_users', JSON.stringify([demoUser]));
        }

        // Initialize simulations
        if (!localStorage.getItem('agro_simulations')) {
            localStorage.setItem('agro_simulations', JSON.stringify([]));
        }

        // Initialize current user
        if (!localStorage.getItem('agro_current_user')) {
            localStorage.setItem('agro_current_user', JSON.stringify(null));
        }
        
        console.log('✅ Database initialized');
    },

    // ===== USER METHODS =====
    getUsers() {
        return JSON.parse(localStorage.getItem('agro_users') || '[]');
    },

    saveUsers(users) {
        localStorage.setItem('agro_users', JSON.stringify(users));
    },

    getUserByEmail(email) {
        return this.getUsers().find(user => 
            user.email.toLowerCase() === email.toLowerCase()
        );
    },

    getUserById(id) {
        return this.getUsers().find(user => user.id === id);
    },

    createUser(userData) {
        const users = this.getUsers();
        const newUser = {
            id: 'user_' + Date.now(),
            ...userData,
            points: 0,
            level: 1,
            simulationsCount: 0,
            badges: [],
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        this.saveUsers(users);
        console.log('✅ User created:', newUser.email);
        return newUser;
    },

    updateUserPoints(userId, pointsToAdd) {
        const users = this.getUsers();
        const userIndex = users.findIndex(user => user.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex].points += pointsToAdd;
            users[userIndex].simulationsCount += 1;
            
            // Update level (every 100 points = 1 level)
            users[userIndex].level = Math.floor(users[userIndex].points / 100) + 1;
            
            // Check and award badges
            this.checkBadges(users[userIndex]);
            
            this.saveUsers(users);
            
            // Update current user if logged in
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.id === userId) {
                this.setCurrentUser(users[userIndex]);
            }
            
            console.log(`✅ User ${users[userIndex].name} +${pointsToAdd} points`);
            return users[userIndex];
        }
        return null;
    },

    checkBadges(user) {
        const badges = user.badges || [];
        const hasBadge = (name) => badges.some(b => b.name === name);

        if (user.simulationsCount >= 5 && !hasBadge('Pemula')) {
            badges.push({
                name: 'Pemula',
                icon: '🌱',
                earnedAt: new Date().toISOString()
            });
            console.log('🎖️ Badge earned: Pemula');
        }

        if (user.simulationsCount >= 15 && !hasBadge('Petani Hebat')) {
            badges.push({
                name: 'Petani Hebat',
                icon: '🌾',
                earnedAt: new Date().toISOString()
            });
            console.log('🎖️ Badge earned: Petani Hebat');
        }

        if (user.simulationsCount >= 50 && !hasBadge('Master Panen')) {
            badges.push({
                name: 'Master Panen',
                icon: '🏆',
                earnedAt: new Date().toISOString()
            });
            console.log('🎖️ Badge earned: Master Panen');
        }

        user.badges = badges;
        return user;
    },

    // ===== SIMULATION METHODS =====
    getSimulations() {
        return JSON.parse(localStorage.getItem('agro_simulations') || '[]');
    },

    getSimulationsByUser(userId) {
        const simulations = this.getSimulations();
        return simulations
            .filter(sim => sim.userId === userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    addSimulation(simulationData) {
        const simulations = this.getSimulations();
        const newSimulation = {
            id: 'sim_' + Date.now(),
            ...simulationData,
            createdAt: new Date().toISOString()
        };
        simulations.push(newSimulation);
        localStorage.setItem('agro_simulations', JSON.stringify(simulations));
        console.log('✅ Simulation saved:', newSimulation.cropType);
        return newSimulation;
    },

    // ===== AUTH METHODS =====
    getCurrentUser() {
        return JSON.parse(localStorage.getItem('agro_current_user'));
    },

    setCurrentUser(user) {
        // Remove password before storing
        const { password, ...userWithoutPassword } = user;
        localStorage.setItem('agro_current_user', JSON.stringify(userWithoutPassword));
        console.log('✅ User logged in:', user.name);
    },

    clearCurrentUser() {
        localStorage.removeItem('agro_current_user');
        console.log('✅ User logged out');
    }
};

// Initialize database on load
document.addEventListener('DOMContentLoaded', function() {
    AgroDB.init();
});