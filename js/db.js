// ===== DATABASE SYSTEM =====
const AgroDB = {
    // Initialize database
    init() {
        try {
            console.log('🔧 Initializing database...');
            
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
                    simulations: [], // Array untuk menyimpan ID simulasi
                    badges: [
                        { 
                            name: 'Pemula', 
                            icon: '🌱', 
                            earnedAt: new Date().toISOString(),
                            description: 'Menyelesaikan 5 simulasi' 
                        }
                    ],
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                };
                localStorage.setItem('agro_users', JSON.stringify([demoUser]));
                console.log('✅ Demo user created');
            }

            // Initialize simulations
            if (!localStorage.getItem('agro_simulations')) {
                // Create some demo simulations for demo user
                const demoSimulations = [
                    {
                        id: 'sim_1',
                        userId: 'demo123',
                        cropType: 'padi',
                        cropName: 'Padi Sawah',
                        landArea: 1,
                        unit: 'hektar',
                        seedCost: 2000000,
                        fertilizerCost: 1500000,
                        laborCost: 3000000,
                        estimatedHarvest: 6000,
                        pricePerKg: 5000,
                        totalCost: 6500000,
                        totalRevenue: 30000000,
                        profit: 23500000,
                        roi: 361.54,
                        createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
                    },
                    {
                        id: 'sim_2',
                        userId: 'demo123',
                        cropType: 'jagung',
                        cropName: 'Jagung',
                        landArea: 2,
                        unit: 'hektar',
                        seedCost: 3000000,
                        fertilizerCost: 2000000,
                        laborCost: 4000000,
                        estimatedHarvest: 10000,
                        pricePerKg: 4000,
                        totalCost: 9000000,
                        totalRevenue: 40000000,
                        profit: 31000000,
                        roi: 344.44,
                        createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
                    }
                ];
                localStorage.setItem('agro_simulations', JSON.stringify(demoSimulations));
                console.log('✅ Demo simulations created');
            }

            // Initialize current user
            if (!localStorage.getItem('agro_current_user')) {
                localStorage.setItem('agro_current_user', JSON.stringify(null));
            }

            console.log('✅ Database initialization complete');
            return true;
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            return false;
        }
    },

    // ===== USER METHODS =====
    getUsers() {
        try {
            const users = JSON.parse(localStorage.getItem('agro_users') || '[]');
            console.log(`📊 Found ${users.length} users in database`);
            return users;
        } catch (error) {
            console.error('❌ Error getting users:', error);
            return [];
        }
    },

    saveUsers(users) {
        try {
            localStorage.setItem('agro_users', JSON.stringify(users));
            console.log(`💾 Saved ${users.length} users`);
            return true;
        } catch (error) {
            console.error('❌ Error saving users:', error);
            return false;
        }
    },

    getUserByEmail(email) {
        if (!email) return null;
        const user = this.getUsers().find(user => 
            user.email.toLowerCase() === email.toLowerCase()
        );
        console.log(user ? `👤 Found user by email: ${email}` : `❌ User not found: ${email}`);
        return user;
    },

    getUserById(id) {
        if (!id) return null;
        const user = this.getUsers().find(user => user.id === id);
        console.log(user ? `👤 Found user by ID: ${id}` : `❌ User ID not found: ${id}`);
        return user;
    },

    createUser(userData) {
        try {
            const users = this.getUsers();
            
            // Check if email already exists
            if (this.getUserByEmail(userData.email)) {
                console.log(`❌ Email already exists: ${userData.email}`);
                return null;
            }

            const newUser = {
                id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                name: userData.name || 'Petani Baru',
                email: userData.email.toLowerCase(),
                password: userData.password, // In production, this should be hashed!
                points: 0,
                level: 1,
                simulationsCount: 0,
                simulations: [],
                badges: [],
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                isActive: true
            };
            
            users.push(newUser);
            const saved = this.saveUsers(users);
            
            if (saved) {
                console.log(`✅ User created: ${newUser.email} (ID: ${newUser.id})`);
                return newUser;
            }
            return null;
        } catch (error) {
            console.error('❌ Error creating user:', error);
            return null;
        }
    },

    updateUserPoints(userId, pointsToAdd) {
        try {
            if (!userId || pointsToAdd === undefined) {
                console.error('❌ Invalid parameters for updateUserPoints');
                return null;
            }

            const users = this.getUsers();
            const userIndex = users.findIndex(user => user.id === userId);
            
            if (userIndex === -1) {
                console.error(`❌ User not found for points update: ${userId}`);
                return null;
            }
            
            users[userIndex].points += pointsToAdd;
            users[userIndex].simulationsCount += 1;
            users[userIndex].lastLogin = new Date().toISOString();
            
            // Update level (every 100 points = 1 level)
            const newLevel = Math.floor(users[userIndex].points / 100) + 1;
            if (newLevel > users[userIndex].level) {
                console.log(`🎉 Level up! ${users[userIndex].name} reached level ${newLevel}`);
                users[userIndex].level = newLevel;
            }
            
            // Check and award badges
            this.checkBadges(users[userIndex]);
            
            const saved = this.saveUsers(users);
            
            if (saved) {
                // Update current user in localStorage if logged in
                const currentUser = this.getCurrentUser();
                if (currentUser && currentUser.id === userId) {
                    this.setCurrentUser(users[userIndex]);
                }
                
                console.log(`✅ ${users[userIndex].name} +${pointsToAdd} points (Total: ${users[userIndex].points})`);
                return users[userIndex];
            }
            return null;
        } catch (error) {
            console.error('❌ Error updating user points:', error);
            return null;
        }
    },

    checkBadges(user) {
        try {
            if (!user) return user;
            
            const badges = user.badges || [];
            const hasBadge = (name) => badges.some(b => b.name === name);

            // Pemula badge - 5 simulations
            if (user.simulationsCount >= 5 && !hasBadge('Pemula')) {
                badges.push({
                    name: 'Pemula',
                    icon: '🌱',
                    earnedAt: new Date().toISOString(),
                    description: 'Menyelesaikan 5 simulasi'
                });
                console.log(`🎖️ ${user.name} earned badge: Pemula`);
            }

            // Petani Hebat badge - 15 simulations
            if (user.simulationsCount >= 15 && !hasBadge('Petani Hebat')) {
                badges.push({
                    name: 'Petani Hebat',
                    icon: '🌾',
                    earnedAt: new Date().toISOString(),
                    description: 'Menyelesaikan 15 simulasi'
                });
                console.log(`🎖️ ${user.name} earned badge: Petani Hebat`);
            }

            // Master Panen badge - 50 simulations
            if (user.simulationsCount >= 50 && !hasBadge('Master Panen')) {
                badges.push({
                    name: 'Master Panen',
                    icon: '🏆',
                    earnedAt: new Date().toISOString(),
                    description: 'Menyelesaikan 50 simulasi'
                });
                console.log(`🎖️ ${user.name} earned badge: Master Panen`);
            }

            // Expert Planner badge - ROI > 100%
            // This would require checking simulation data
            
            user.badges = badges;
            return user;
        } catch (error) {
            console.error('❌ Error checking badges:', error);
            return user;
        }
    },

    // ===== SIMULATION METHODS =====
    getSimulations() {
        try {
            const simulations = JSON.parse(localStorage.getItem('agro_simulations') || '[]');
            console.log(`📊 Found ${simulations.length} simulations in database`);
            return simulations;
        } catch (error) {
            console.error('❌ Error getting simulations:', error);
            return [];
        }
    },

    getSimulationsByUser(userId) {
        try {
            if (!userId) {
                console.error('❌ No user ID provided');
                return [];
            }
            
            const simulations = this.getSimulations();
            const userSimulations = simulations
                .filter(sim => sim.userId === userId)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            console.log(`📊 Found ${userSimulations.length} simulations for user ${userId}`);
            return userSimulations;
        } catch (error) {
            console.error('❌ Error getting user simulations:', error);
            return [];
        }
    },

    addSimulation(simulationData) {
        try {
            if (!simulationData) {
                console.error('❌ No simulation data provided');
                return null;
            }

            // Validate required fields
            const requiredFields = ['userId', 'cropType', 'totalCost', 'totalRevenue', 'profit'];
            const missingFields = requiredFields.filter(field => !simulationData[field]);
            
            if (missingFields.length > 0) {
                console.error(`❌ Missing required fields: ${missingFields.join(', ')}`);
                return null;
            }

            const simulations = this.getSimulations();
            
            // Generate unique ID
            const simulationId = 'sim_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            // Map crop type to crop name
            const cropNames = {
                'padi': 'Padi Sawah',
                'jagung': 'Jagung', 
                'kedelai': 'Kedelai',
                'cabe': 'Cabe Merah',
                'tomat': 'Tomat',
                'bawang': 'Bawang Merah'
            };

            const newSimulation = {
                id: simulationId,
                cropName: cropNames[simulationData.cropType] || simulationData.cropType,
                createdAt: new Date().toISOString(),
                status: 'saved',
                ...simulationData
            };

            // Add to simulations array
            simulations.push(newSimulation);
            
            // Save to localStorage
            const saved = this.saveSimulations(simulations);
            
            if (saved) {
                // Add simulation ID to user's simulations array
                this.addSimulationToUser(simulationData.userId, simulationId);
                
                console.log(`✅ Simulation saved successfully! ID: ${simulationId}`);
                console.log(`📈 Data: ${newSimulation.cropName}, Profit: Rp ${newSimulation.profit.toLocaleString('id-ID')}, ROI: ${newSimulation.roi}%`);
                
                return newSimulation;
            }
            
            return null;
        } catch (error) {
            console.error('❌ Error adding simulation:', error);
            return null;
        }
    },

    saveSimulations(simulations) {
        try {
            localStorage.setItem('agro_simulations', JSON.stringify(simulations));
            console.log(`💾 Saved ${simulations.length} simulations`);
            return true;
        } catch (error) {
            console.error('❌ Error saving simulations:', error);
            return false;
        }
    },

    addSimulationToUser(userId, simulationId) {
        try {
            const users = this.getUsers();
            const userIndex = users.findIndex(user => user.id === userId);
            
            if (userIndex !== -1) {
                if (!users[userIndex].simulations) {
                    users[userIndex].simulations = [];
                }
                
                // Add simulation ID if not already present
                if (!users[userIndex].simulations.includes(simulationId)) {
                    users[userIndex].simulations.push(simulationId);
                    console.log(`📝 Added simulation ${simulationId} to user ${userId}`);
                }
                
                return this.saveUsers(users);
            }
            
            console.error(`❌ User not found for adding simulation: ${userId}`);
            return false;
        } catch (error) {
            console.error('❌ Error adding simulation to user:', error);
            return false;
        }
    },

    deleteSimulation(simulationId) {
        try {
            const simulations = this.getSimulations();
            const simulationIndex = simulations.findIndex(sim => sim.id === simulationId);
            
            if (simulationIndex === -1) {
                console.error(`❌ Simulation not found: ${simulationId}`);
                return false;
            }
            
            // Remove from simulations array
            const removedSimulation = simulations.splice(simulationIndex, 1)[0];
            
            // Save updated simulations
            const saved = this.saveSimulations(simulations);
            
            if (saved) {
                console.log(`🗑️ Simulation deleted: ${simulationId}`);
                
                // Remove from user's simulations array
                this.removeSimulationFromUser(removedSimulation.userId, simulationId);
                
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('❌ Error deleting simulation:', error);
            return false;
        }
    },

    removeSimulationFromUser(userId, simulationId) {
        try {
            const users = this.getUsers();
            const userIndex = users.findIndex(user => user.id === userId);
            
            if (userIndex !== -1 && users[userIndex].simulations) {
                users[userIndex].simulations = users[userIndex].simulations.filter(
                    id => id !== simulationId
                );
                console.log(`📝 Removed simulation ${simulationId} from user ${userId}`);
                return this.saveUsers(users);
            }
            
            return false;
        } catch (error) {
            console.error('❌ Error removing simulation from user:', error);
            return false;
        }
    },

    // ===== AUTH METHODS =====
    getCurrentUser() {
        try {
            const userData = localStorage.getItem('agro_current_user');
            if (!userData) {
                console.log('👤 No user currently logged in');
                return null;
            }
            
            const user = JSON.parse(userData);
            console.log(`👤 Current user: ${user.name} (${user.email})`);
            return user;
        } catch (error) {
            console.error('❌ Error getting current user:', error);
            return null;
        }
    },

    setCurrentUser(user) {
        try {
            if (!user) {
                console.error('❌ No user data to set');
                return false;
            }

            // Remove password before storing
            const { password, ...userWithoutPassword } = user;
            userWithoutPassword.lastLogin = new Date().toISOString();
            
            localStorage.setItem('agro_current_user', JSON.stringify(userWithoutPassword));
            console.log(`👤 User logged in: ${user.name} (${user.email})`);
            return true;
        } catch (error) {
            console.error('❌ Error setting current user:', error);
            return false;
        }
    },

    clearCurrentUser() {
        try {
            localStorage.removeItem('agro_current_user');
            console.log('👤 User logged out');
            return true;
        } catch (error) {
            console.error('❌ Error clearing current user:', error);
            return false;
        }
    },

    // ===== UTILITY METHODS =====
    clearAllData() {
        try {
            localStorage.removeItem('agro_users');
            localStorage.removeItem('agro_simulations');
            localStorage.removeItem('agro_current_user');
            console.log('🧹 All database data cleared');
            return true;
        } catch (error) {
            console.error('❌ Error clearing database:', error);
            return false;
        }
    },

    getStats() {
        try {
            const users = this.getUsers().length;
            const simulations = this.getSimulations().length;
            const currentUser = this.getCurrentUser();
            
            const stats = {
                totalUsers: users,
                totalSimulations: simulations,
                currentUser: currentUser ? {
                    name: currentUser.name,
                    simulationsCount: currentUser.simulationsCount || 0,
                    points: currentUser.points || 0,
                    level: currentUser.level || 1
                } : null
            };
            
            console.log('📈 Database Stats:', stats);
            return stats;
        } catch (error) {
            console.error('❌ Error getting database stats:', error);
            return null;
        }
    }
};

// Initialize database on load
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 Initializing AgroDB...');
        AgroDB.init();
        
        // Make AgroDB globally available
        window.AgroDB = AgroDB;
        window.db = AgroDB; // Alias for compatibility
        
        console.log('✅ AgroDB is ready and available globally');
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgroDB;
}