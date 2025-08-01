import api from './api';

export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    console.log('🔑 Login response:', response.data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('🔑 Stored user in localStorage:', response.data.user);
    }
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    const parsedUser = user ? JSON.parse(user) : null;
    console.log('👤 getCurrentUser - Raw from localStorage:', user);
    console.log('👤 getCurrentUser - Parsed user:', parsedUser);
    return parsedUser;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Validate token
  validateToken: async (role = 'borrower') => {
    const response = await api.get(`/auth/validate/${role}`);
    return response.data;
  },
};

export default authService;
