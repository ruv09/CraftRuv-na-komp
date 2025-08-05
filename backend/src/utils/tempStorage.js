// Temporary in-memory storage for testing without database
export const tempUsers = new Map();
export const tempProjects = new Map();
export const tempFurniture = new Map();

// Initialize admin user
const adminUser = {
  _id: '1754421054869',
  name: 'Admin User',
  email: 'admin@craftruv.com',
  password: 'admin123',
  role: 'admin',
  isActive: true,
  createdAt: new Date(),
  lastLogin: new Date(),
  preferences: {
    theme: 'light',
    language: 'ru',
    units: 'metric'
  },
  subscription: {
    plan: 'pro',
    expiresAt: null
  }
};

tempUsers.set('admin@craftruv.com', adminUser);

// Helper functions
export const findUserById = (userId) => {
  for (const [email, user] of tempUsers.entries()) {
    if (user._id === userId) {
      return user;
    }
  }
  return null;
};

export const findUserByEmail = (email) => {
  return tempUsers.get(email);
};

export const saveUser = (user) => {
  tempUsers.set(user.email, user);
  return user;
};

export const deleteUser = (email) => {
  return tempUsers.delete(email);
}; 