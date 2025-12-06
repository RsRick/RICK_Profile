import React, { createContext, useContext, useState, useEffect } from 'react';
import { account, teams, ADMIN_TEAM_ID } from '../lib/appwrite';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const session = await account.get();
      setUser(session);
      
      // Check if user is in admin team
      const adminStatus = await checkAdminStatus();
      setIsAdmin(adminStatus);
    } catch (error) {
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  // Check if current user is in the admin team
  const checkAdminStatus = async () => {
    try {
      // Get user's team memberships
      const memberships = await teams.list();
      
      // Check if user is member of admin team
      const isInAdminTeam = memberships.teams.some(
        team => team.$id === ADMIN_TEAM_ID || team.name.toLowerCase() === 'admins'
      );
      
      return isInAdminTeam;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      // Appwrite SDK v13 method name
      await account.createEmailSession(email, password);
      const userData = await account.get();
      setUser(userData);
      
      // Check admin status after login
      const adminStatus = await checkAdminStatus();
      setIsAdmin(adminStatus);
      
      // If trying to access admin but not an admin, return error
      if (!adminStatus) {
        return { success: false, error: 'Access denied. Admin privileges required.', notAdmin: true };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Invalid email or password' };
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin,
    checkAdminStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
