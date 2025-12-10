import { createContext, useContext, useState, useEffect } from 'react';
import { account, appwriteConfig } from '../lib/appwrite';

const AuthContext = createContext(null);

// Super Admin Email - Only this email can access admin panel
const SUPER_ADMIN_EMAIL = 'rsrickbiswas007@gmail.com';

// Debug Appwrite configuration
console.log('🔧 Appwrite Configuration Debug:');
console.log('   Endpoint:', appwriteConfig.endpoint);
console.log('   Project ID:', appwriteConfig.projectId);
console.log('   Database ID:', appwriteConfig.databaseId);
console.log('   Super Admin Email:', SUPER_ADMIN_EMAIL);

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
      console.log('🔍 Checking existing session...');
      const session = await account.get();
      console.log('✅ Existing session found:', session.email);
      setUser(session);
      
      // Check if user is the super admin
      const adminStatus = session.email === SUPER_ADMIN_EMAIL;
      setIsAdmin(adminStatus);
      console.log('🔍 Admin status from existing session:', adminStatus);
    } catch (error) {
      console.log('ℹ️ No existing session found');
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  // Check if current user is the super admin
  const checkAdminStatus = async (userData = null) => {
    try {
      // Use provided userData or current user state
      const currentUser = userData || user;
      console.log('🔍 Checking admin status for user:', currentUser?.email);
      
      // Only allow specific super admin email
      if (currentUser && currentUser.email === SUPER_ADMIN_EMAIL) {
        console.log('✅ User is super admin');
        return true;
      }
      
      console.log('❌ User is not super admin');
      return false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 Login attempt for:', email);
      console.log('🔐 Super admin email:', SUPER_ADMIN_EMAIL);
      console.log('🔐 Email match:', email === SUPER_ADMIN_EMAIL);
      
      // Only allow super admin email to login to admin panel
      if (email !== SUPER_ADMIN_EMAIL) {
        console.log('❌ Email not authorized for admin access');
        return { success: false, error: 'Access denied. Only super admin can access admin panel.', notAdmin: true };
      }
      
      console.log('✅ Email authorized, attempting Appwrite login...');
      
      // Appwrite SDK v13 method name
      await account.createEmailSession(email, password);
      console.log('✅ Appwrite session created successfully');
      
      const userData = await account.get();
      console.log('✅ User data retrieved:', userData.email);
      setUser(userData);
      
      // Check admin status after login (pass userData directly)
      const adminStatus = await checkAdminStatus(userData);
      console.log('✅ Admin status check:', adminStatus);
      setIsAdmin(adminStatus);
      
      // If trying to access admin but not an admin, return error
      if (!adminStatus) {
        console.log('❌ Admin status check failed');
        return { success: false, error: 'Access denied. Admin privileges required.', notAdmin: true };
      }
      
      console.log('✅ Login successful');
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Error type:', error.type);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
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
