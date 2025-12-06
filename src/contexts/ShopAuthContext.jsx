import { createContext, useContext, useState, useEffect } from 'react';
import { account, ID, databaseService, functions, Query } from '../lib/appwrite';

const ShopAuthContext = createContext();

const OTP_COLLECTION = 'shop_otp_codes';

export function ShopAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await account.get();
      
      // Check if there's a pending verification in localStorage
      const pending = localStorage.getItem('pending_verification');
      if (pending) {
        const pendingData = JSON.parse(pending);
        // If same user and not verified, don't auto-login
        if (pendingData.email === session.email && !pendingData.verified) {
          setPendingVerification(pendingData);
          setCustomer(null);
          setLoading(false);
          return;
        }
      }
      
      setCustomer({
        id: session.$id,
        name: session.name,
        email: session.email,
        emailVerified: session.emailVerification
      });
    } catch (error) {
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  // Generate 4-digit OTP
  const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  // Sign up - Create account but DON'T log in until OTP verified
  const signUp = async (name, email, password) => {
    try {
      // Check if user already exists by trying to create
      let newUser;
      try {
        newUser = await account.create(ID.unique(), email, password, name);
      } catch (createError) {
        if (createError.code === 409) {
          // Check if they have pending OTP verification
          const otpCheck = await databaseService.listDocuments(OTP_COLLECTION, [
            Query.equal('email', email.toLowerCase()),
            Query.equal('verified', false)
          ]);

          if (otpCheck.success && otpCheck.data.documents.length > 0) {
            const latestOTP = otpCheck.data.documents[0];
            
            // Always send a new OTP when they try to sign up again
            const newOtp = generateOTP();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

            const otpResult = await databaseService.createDocument(OTP_COLLECTION, {
              userId: latestOTP.userId,
              email: email.toLowerCase(),
              otp: newOtp,
              expiresAt,
              verified: false,
              name: name || latestOTP.name || ''
            });

            if (otpResult.success) {
              // Send new OTP email
              try {
                await functions.createExecution(
                  'send-otp-email',
                  JSON.stringify({ email, otp: newOtp, name: name || latestOTP.name }),
                  false
                );
              } catch (emailError) {
                console.error('Failed to send OTP email');
              }

              // Update pending verification
              const pendingData = {
                email: email.toLowerCase(),
                password,
                otpId: otpResult.data.$id,
                userId: latestOTP.userId,
                verified: false,
                name: name || latestOTP.name || ''
              };
              localStorage.setItem('pending_verification', JSON.stringify(pendingData));
              setPendingVerification(pendingData);

              return { 
                success: false, 
                error: 'Account exists but not verified. A new OTP has been sent to your email.',
                requiresVerification: true,
                otpId: otpResult.data.$id,
                newOtpSent: true
              };
            }
          }
          
          return { success: false, error: 'Email already registered. Please login.' };
        }
        throw createError;
      }

      // Generate OTP
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      // Try to store OTP in database
      const otpResult = await databaseService.createDocument(OTP_COLLECTION, {
        userId: newUser.$id,
        email: email.toLowerCase(),
        otp,
        expiresAt,
        verified: false,
        name: name || ''
      });

      if (!otpResult.success) {
        console.error('OTP creation failed:', otpResult.error);
        // Delete the created user since OTP failed
        // Note: This requires admin SDK, so we'll just proceed
        throw new Error('Failed to create verification code. Please try again.');
      }

      // Store pending verification in localStorage (NOT logged in yet)
      const pendingData = {
        email: email.toLowerCase(),
        name,
        password, // Stored temporarily for login after verification
        otpId: otpResult.data.$id,
        userId: newUser.$id,
        verified: false
      };
      localStorage.setItem('pending_verification', JSON.stringify(pendingData));
      setPendingVerification(pendingData);

      // Call Appwrite Function to send OTP email using SDK
      try {
        await functions.createExecution(
          'send-otp-email',
          JSON.stringify({ email, otp, name }),
          false // async = false, wait for response
        );
      } catch (emailError) {
        console.error('Failed to send OTP email');
      }

      return {
        success: true,
        requiresVerification: true,
        otpId: otpResult.data.$id,
        tempData: { name, email }
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
  };

  // Verify OTP and complete registration (NOW log them in)
  const completeSignUp = async (tempData, otpId, otp) => {
    try {
      const result = await databaseService.getDocument(OTP_COLLECTION, otpId);

      if (!result.success) {
        return { success: false, error: 'Invalid verification code' };
      }

      const otpRecord = result.data;

      if (otpRecord.otp !== otp) {
        return { success: false, error: 'Invalid verification code' };
      }

      if (new Date(otpRecord.expiresAt) < new Date()) {
        return { success: false, error: 'Verification code has expired' };
      }

      if (otpRecord.verified) {
        return { success: false, error: 'Code already used' };
      }

      // Mark OTP as verified
      await databaseService.updateDocument(OTP_COLLECTION, otpId, { verified: true });

      // NOW create session (log them in) after OTP is verified
      const pending = JSON.parse(localStorage.getItem('pending_verification') || '{}');
      
      if (pending.email && pending.password) {
        // Delete any existing session first to avoid "session is active" error
        try {
          await account.deleteSession('current');
        } catch (deleteError) {
          // Ignore error if no session exists
          console.log('No existing session to delete');
        }
        
        // Now create the new session
        await account.createEmailSession(pending.email, pending.password);
        
        const session = await account.get();
        setCustomer({
          id: session.$id,
          name: session.name,
          email: session.email,
          emailVerified: true
        });
      }

      // Clear pending verification
      localStorage.removeItem('pending_verification');
      setPendingVerification(null);

      return { success: true };
    } catch (error) {
      console.error('Verify OTP error:', error);
      return { success: false, error: error.message };
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    try {
      // First check if this email has unverified OTP
      const otpCheck = await databaseService.listDocuments(OTP_COLLECTION, [
        Query.equal('email', email.toLowerCase()),
        Query.equal('verified', false),
        Query.orderDesc('$createdAt'),
        Query.limit(1)
      ]);

      if (otpCheck.success && otpCheck.data.documents.length > 0) {
        // Check if OTP is still valid (not expired)
        const latestOTP = otpCheck.data.documents[0];
        const otpExpiry = new Date(latestOTP.expiresAt);
        const now = new Date();
        const isExpired = otpExpiry <= now;
        
        if (!isExpired) {
          // Account exists but OTP not verified yet
          const pendingData = {
            email: email.toLowerCase(),
            password,
            otpId: latestOTP.$id,
            userId: latestOTP.userId,
            verified: false,
            name: latestOTP.name || ''
          };
          
          // Resend OTP automatically and get new OTP ID
          const resendResult = await resendOTP(email, latestOTP.name || '');
          
          const newOtpId = resendResult.success ? resendResult.otpId : latestOTP.$id;
          
          const updatedPendingData = {
            email: email.toLowerCase(),
            password,
            otpId: newOtpId,
            userId: latestOTP.userId,
            verified: false,
            name: latestOTP.name || ''
          };
          
          localStorage.setItem('pending_verification', JSON.stringify(updatedPendingData));
          setPendingVerification(updatedPendingData);
          
          return { 
            success: false, 
            error: 'Please verify your email with the OTP code. A new code has been sent.',
            requiresVerification: true,
            otpId: newOtpId
          };
        }
        // If OTP expired, delete it and require new signup
        if (isExpired) {
          await databaseService.deleteDocument(OTP_COLLECTION, latestOTP.$id);
        }
      }

      await account.createEmailSession(email, password);
      const session = await account.get();

      // Clear any pending verification
      localStorage.removeItem('pending_verification');
      setPendingVerification(null);

      setCustomer({
        id: session.$id,
        name: session.name,
        email: session.email,
        emailVerified: session.emailVerification
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);

      if (error.code === 401) {
        return { success: false, error: 'Invalid email or password' };
      }
      if (error.code === 429) {
        return { success: false, error: 'Too many attempts. Please try again later.' };
      }

      return { success: false, error: error.message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await account.deleteSession('current');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setCustomer(null);
      localStorage.removeItem('pending_verification');
      setPendingVerification(null);
    }
  };

  // Resend OTP
  const resendOTP = async (email, name = '') => {
    try {
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      const pending = JSON.parse(localStorage.getItem('pending_verification') || '{}');
      const userId = pending.userId || 'unknown';

      const otpResult = await databaseService.createDocument(OTP_COLLECTION, {
        userId,
        email: email.toLowerCase(),
        otp,
        expiresAt,
        verified: false,
        name: name || ''
      });

      if (!otpResult.success) {
        throw new Error('Failed to create OTP');
      }

      // Update pending verification with new OTP ID
      if (pending.email) {
        pending.otpId = otpResult.data.$id;
        localStorage.setItem('pending_verification', JSON.stringify(pending));
        setPendingVerification(pending);
      }

      // Send email using SDK
      try {
        await functions.createExecution(
          'send-otp-email',
          JSON.stringify({ email, otp, name }),
          false
        );
      } catch (emailError) {
        console.error('Failed to send OTP email');
      }

      return { success: true, otpId: otpResult.data.$id };
    } catch (error) {
      console.error('Resend OTP error:', error);
      return { success: false, error: error.message };
    }
  };

  // Get pending verification data
  const getPendingVerification = () => {
    return pendingVerification;
  };

  return (
    <ShopAuthContext.Provider
      value={{
        customer,
        loading,
        isAuthenticated: !!customer,
        pendingVerification,
        signUp,
        completeSignUp,
        login,
        logout,
        resendOTP,
        checkSession,
        getPendingVerification
      }}
    >
      {children}
    </ShopAuthContext.Provider>
  );
}

export const useShopAuth = () => {
  const context = useContext(ShopAuthContext);
  if (!context) {
    throw new Error('useShopAuth must be used within ShopAuthProvider');
  }
  return context;
};
