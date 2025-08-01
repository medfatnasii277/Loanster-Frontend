import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import borrowerService from '../services/borrowerService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileCreating, setProfileCreating] = useState(false);
  const [borrowerProfile, setBorrowerProfile] = useState(null); // Store borrower profile data

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        console.log('🔍 Current user from localStorage:', currentUser);
        if (currentUser && authService.isAuthenticated()) {
          // Validate token with backend
          await authService.validateToken(currentUser.role.toLowerCase());
          console.log('✅ Token validated, setting user:', currentUser);
          setUser(currentUser);
          
          // If user is a borrower, check if they have a profile
          if (currentUser?.role === 'BORROWER' && currentUser?.email) {
            try {
              console.log('🔍 Checking borrower profile for email:', currentUser.email);
              const borrowerData = await borrowerService.getBorrowerByEmail(currentUser.email);
              console.log('✅ Found borrower profile:', borrowerData);
              setBorrowerProfile(borrowerData);
            } catch (error) {
              console.log('❌ No borrower profile found for email:', currentUser.email);
              setBorrowerProfile(null);
            }
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization failed:', error);
        authService.logout();
      } finally {
        setLoading(false);
        console.log('🏁 Auth initialization complete, loading set to false');
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const user = response.user;
      console.log('🔐 Login response user:', user);
      setUser(user);
      
      // If user is a borrower, check if they have a profile
      if (user?.role === 'BORROWER' && user?.email) {
        try {
          console.log('🔍 Checking borrower profile for email:', user.email);
          const borrowerData = await borrowerService.getBorrowerByEmail(user.email);
          console.log('✅ Found borrower profile:', borrowerData);
          setBorrowerProfile(borrowerData);
        } catch (error) {
          console.log('❌ No borrower profile found for email:', user.email);
          setBorrowerProfile(null);
        }
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setBorrowerProfile(null);
  };

  const refreshBorrowerProfile = async () => {
    if (user?.role === 'BORROWER' && user?.email) {
      try {
        console.log('🔄 Refreshing borrower profile for email:', user.email);
        const borrowerData = await borrowerService.getBorrowerByEmail(user.email);
        console.log('✅ Refreshed borrower profile:', borrowerData);
        setBorrowerProfile(borrowerData);
        return borrowerData;
      } catch (error) {
        console.log('❌ Failed to refresh borrower profile:', error);
        setBorrowerProfile(null);
        return null;
      }
    }
    return null;
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    profileCreating,
    borrowerProfile,
    refreshBorrowerProfile,
    isAuthenticated: !!user,
    isBorrower: user?.role === 'BORROWER',
    isOfficer: user?.role === 'OFFICER',
    hasProfile: !!borrowerProfile,
    borrowerId: borrowerProfile?.id,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
