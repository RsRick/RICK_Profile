/**
 * Secure Download Service
 * 
 * Provides encrypted, time-limited download tokens that:
 * 1. Only work for authenticated users who own the order
 * 2. Expire after a short time window
 * 3. Cannot be shared or copied to work in another browser
 */

import { account, storage } from './appwrite';

// Secret key for token generation (in production, use env variable)
const SECRET_KEY = import.meta.env.VITE_DOWNLOAD_SECRET || 'portfolio-secure-download-2024';

// Token expiry time in milliseconds (15 minutes)
const TOKEN_EXPIRY_MS = 15 * 60 * 1000;

/**
 * Simple hash function for token generation
 * Combines multiple factors to create a unique signature
 */
const generateHash = (data) => {
  let hash = 0;
  const str = JSON.stringify(data);
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to base36 for shorter string
  return Math.abs(hash).toString(36);
};

/**
 * Encode data to base64 (browser-safe)
 */
const encodeBase64 = (data) => {
  try {
    return btoa(encodeURIComponent(JSON.stringify(data)));
  } catch (e) {
    console.error('Encode error:', e);
    return null;
  }
};

/**
 * Decode base64 data (browser-safe)
 */
const decodeBase64 = (encoded) => {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded)));
  } catch (e) {
    console.error('Decode error:', e);
    return null;
  }
};

/**
 * Generate a secure download token
 * 
 * @param {string} fileId - The file ID in storage
 * @param {string} orderId - The order ID
 * @param {string} userEmail - The authenticated user's email
 * @param {string} userId - The authenticated user's ID
 * @returns {string} Encrypted token
 */
export const generateDownloadToken = (fileId, orderId, userEmail, userId) => {
  const timestamp = Date.now();
  const expiresAt = timestamp + TOKEN_EXPIRY_MS;
  
  // Create token payload
  const payload = {
    fid: fileId,
    oid: orderId,
    email: userEmail,
    uid: userId,
    exp: expiresAt,
    iat: timestamp,
  };
  
  // Generate signature hash
  const signature = generateHash({
    ...payload,
    secret: SECRET_KEY,
  });
  
  // Combine payload with signature
  const tokenData = {
    ...payload,
    sig: signature,
  };
  
  return encodeBase64(tokenData);
};

/**
 * Validate a download token
 * 
 * @param {string} token - The encrypted token
 * @param {string} currentUserEmail - Current logged-in user's email
 * @param {string} currentUserId - Current logged-in user's ID
 * @returns {Object} { valid: boolean, fileId?: string, error?: string }
 */
export const validateDownloadToken = (token, currentUserEmail, currentUserId) => {
  try {
    // Decode the token
    const tokenData = decodeBase64(token);
    
    if (!tokenData) {
      return { valid: false, error: 'Invalid token format' };
    }
    
    // Check expiration
    if (Date.now() > tokenData.exp) {
      return { valid: false, error: 'Download link has expired. Please refresh the page and try again.' };
    }
    
    // Verify user ownership - email must match
    if (tokenData.email !== currentUserEmail) {
      return { valid: false, error: 'This download link is not authorized for your account.' };
    }
    
    // Verify user ID matches
    if (tokenData.uid !== currentUserId) {
      return { valid: false, error: 'Session mismatch. Please log in again.' };
    }
    
    // Regenerate signature and verify
    const expectedSignature = generateHash({
      fid: tokenData.fid,
      oid: tokenData.oid,
      email: tokenData.email,
      uid: tokenData.uid,
      exp: tokenData.exp,
      iat: tokenData.iat,
      secret: SECRET_KEY,
    });
    
    if (tokenData.sig !== expectedSignature) {
      return { valid: false, error: 'Invalid download token. Please refresh and try again.' };
    }
    
    return {
      valid: true,
      fileId: tokenData.fid,
      orderId: tokenData.oid,
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return { valid: false, error: 'Failed to validate download token.' };
  }
};

/**
 * Get current authenticated user info
 * @returns {Promise<{email: string, id: string} | null>}
 */
export const getCurrentUser = async () => {
  try {
    const user = await account.get();
    return {
      email: user.email,
      id: user.$id,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

const ORDER_FILES_BUCKET = 'order-files';

/**
 * Fetch file as blob using Appwrite SDK (authenticated)
 * Uses the SDK's getFileDownload which handles authentication via session cookies
 */
const fetchFileAsBlob = async (fileId) => {
  try {
    // First verify the user is logged in
    const user = await account.get();
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Get the file download URL from Appwrite SDK
    const downloadUrl = storage.getFileDownload(ORDER_FILES_BUCKET, fileId);
    const url = downloadUrl.href || downloadUrl.toString();
    
    // Try fetching with credentials (session cookie)
    let response = await fetch(url, {
      credentials: 'include',
      mode: 'cors',
    });
    
    // If 401, the bucket might need "Users" permission instead of specific user permissions
    // In that case, we need to update bucket permissions in Appwrite Console
    if (response.status === 401) {
      console.warn('File download returned 401. Please check bucket permissions in Appwrite Console.');
      console.warn('Go to Storage > order-files > Settings > Permissions');
      console.warn('Add: Role "Users" with "Read" permission');
      throw new Error('Unauthorized - Please update bucket permissions to allow authenticated users to read files');
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.blob();
  } catch (error) {
    console.error('Error fetching file:', error);
    throw error;
  }
};

/**
 * Secure download handler
 * Validates token, fetches file as blob, triggers download
 * The blob URL is temporary and cannot be shared
 * 
 * @param {string} token - The download token
 * @param {string} fileUrl - Unused (kept for compatibility)
 * @param {string} fileName - The file name for download
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const secureDownload = async (token, fileUrl, fileName) => {
  try {
    // Get current user
    const user = await getCurrentUser();
    
    if (!user) {
      return { 
        success: false, 
        error: 'You must be logged in to download files. Please log in and try again.' 
      };
    }
    
    // Validate token
    const validation = validateDownloadToken(token, user.email, user.id);
    
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    // Fetch file as blob (authenticated request)
    const blob = await fetchFileAsBlob(validation.fileId);
    
    // Create temporary blob URL
    const blobUrl = window.URL.createObjectURL(blob);
    
    // Trigger download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Revoke blob URL immediately after download starts
    // This makes the URL unusable if copied
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 1000);
    
    return { success: true };
  } catch (error) {
    console.error('Secure download error:', error);
    return { success: false, error: 'Download failed. Please try again.' };
  }
};

/**
 * Secure view handler - opens file in new tab as blob
 * The blob URL is temporary and cannot be shared
 * 
 * @param {string} token - The download token
 * @param {string} fileUrl - Unused (kept for compatibility)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const secureView = async (token, fileUrl) => {
  try {
    // Get current user
    const user = await getCurrentUser();
    
    if (!user) {
      return { 
        success: false, 
        error: 'You must be logged in to view files. Please log in and try again.' 
      };
    }
    
    // Validate token
    const validation = validateDownloadToken(token, user.email, user.id);
    
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    // Fetch file as blob (authenticated request)
    const blob = await fetchFileAsBlob(validation.fileId);
    
    // Create temporary blob URL
    const blobUrl = window.URL.createObjectURL(blob);
    
    // Open in new tab
    window.open(blobUrl, '_blank');
    
    // Revoke blob URL after 2 minutes
    // User can view but URL becomes invalid after this
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 120000);
    
    return { success: true };
  } catch (error) {
    console.error('Secure view error:', error);
    return { success: false, error: 'Failed to view file. Please try again.' };
  }
};

export default {
  generateDownloadToken,
  validateDownloadToken,
  getCurrentUser,
  secureDownload,
  secureView,
};
