import { databases, storage, ID, Query } from './appwrite';
import { checkAllCollisions, validatePathFormat } from './collisionDetection';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const SHORTLINK_BUCKET_ID = import.meta.env.VITE_SHORTLINK_BUCKET_ID || 'shortlink-previews';

/**
 * Generate a random short path
 * @param {number} length - Length of the random path
 * @returns {string} Random path
 */
export const generateRandomPath = (length = 6) => {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Generate a unique random path that doesn't collide
 * @returns {Promise<string>} Unique random path
 */
export const generateUniquePath = async () => {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const path = generateRandomPath(6 + attempts); // Increase length with attempts
    const collision = await checkAllCollisions(path);
    
    if (!collision.hasCollision) {
      return path;
    }
    
    attempts++;
  }
  
  // Fallback to timestamp-based path
  return `link-${Date.now().toString(36)}`;
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {Object} Validation result
 */
export const validateUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      error: 'URL is required'
    };
  }
  
  try {
    const urlObj = new URL(url);
    
    // Check if protocol is http or https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        isValid: false,
        error: 'URL must use HTTP or HTTPS protocol'
      };
    }
    
    return {
      isValid: true,
      url: url.trim()
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid URL format'
    };
  }
};

/**
 * Upload preview image to storage
 * @param {File} file - Image file to upload
 * @returns {Promise<Object>} Upload result with file ID and URL
 */
export const uploadPreviewImage = async (file) => {
  try {
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error('Image size must be less than 5MB');
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Image must be JPEG, PNG, WebP, or GIF format');
    }
    
    // Upload to storage
    const fileId = ID.unique();
    const response = await storage.createFile(
      SHORTLINK_BUCKET_ID,
      fileId,
      file
    );
    
    // Get file URL
    const fileUrl = storage.getFileView(SHORTLINK_BUCKET_ID, response.$id);
    
    return {
      fileId: response.$id,
      fileUrl: fileUrl.href
    };
  } catch (error) {
    console.error('Error uploading preview image:', error);
    throw error;
  }
};

/**
 * Delete preview image from storage
 * @param {string} fileId - File ID to delete
 */
export const deletePreviewImage = async (fileId) => {
  try {
    if (fileId) {
      await storage.deleteFile(SHORTLINK_BUCKET_ID, fileId);
    }
  } catch (error) {
    console.error('Error deleting preview image:', error);
    // Don't throw error, just log it
  }
};

/**
 * Create a new shortlink
 * @param {Object} data - Shortlink data
 * @returns {Promise<Object>} Created shortlink
 */
export const createShortlink = async (data) => {
  try {
    const {
      destinationUrl,
      customPath,
      autoGenerate = false,
      previewImage = null,
      title = null,
      description = null,
      domainId = null,
      userId
    } = data;
    
    // Validate destination URL
    const urlValidation = validateUrl(destinationUrl);
    if (!urlValidation.isValid) {
      throw new Error(urlValidation.error);
    }
    
    // Determine the path to use
    let finalPath;
    if (autoGenerate || !customPath) {
      finalPath = await generateUniquePath();
    } else {
      // Validate custom path format
      const pathValidation = validatePathFormat(customPath);
      if (!pathValidation.isValid) {
        throw new Error(pathValidation.error);
      }
      
      finalPath = pathValidation.normalizedPath;
      
      // Check for collisions
      const collision = await checkAllCollisions(finalPath);
      if (collision.hasCollision) {
        const firstCollision = collision.collisions[0];
        throw new Error(firstCollision.message);
      }
    }
    
    // Upload preview image if provided
    let previewImageId = null;
    let previewImageUrl = null;
    if (previewImage) {
      const uploadResult = await uploadPreviewImage(previewImage);
      previewImageId = uploadResult.fileId;
      previewImageUrl = uploadResult.fileUrl;
    }
    
    // Create shortlink document
    const now = new Date().toISOString();
    const shortlink = await databases.createDocument(
      DATABASE_ID,
      'shortlinks',
      ID.unique(),
      {
        customPath: finalPath,
        destinationUrl: urlValidation.url,
        previewImageId,
        previewImageUrl,
        domainId,
        title,
        description,
        isActive: true,
        clickCount: 0,
        createdAt: now,
        updatedAt: now,
        createdBy: userId
      }
    );
    
    return shortlink;
  } catch (error) {
    console.error('Error creating shortlink:', error);
    throw error;
  }
};

/**
 * Get shortlink by ID
 * @param {string} id - Shortlink ID
 * @returns {Promise<Object>} Shortlink document
 */
export const getShortlink = async (id) => {
  try {
    const shortlink = await databases.getDocument(
      DATABASE_ID,
      'shortlinks',
      id
    );
    return shortlink;
  } catch (error) {
    console.error('Error getting shortlink:', error);
    throw error;
  }
};

/**
 * Get shortlink by custom path
 * @param {string} path - Custom path
 * @param {string} domainId - Optional domain ID
 * @returns {Promise<Object|null>} Shortlink document or null
 */
export const getShortlinkByPath = async (path, domainId = null) => {
  try {
    const normalizedPath = path.toLowerCase().trim();
    
    const queries = [
      Query.equal('customPath', normalizedPath),
      Query.equal('isActive', true),
      Query.limit(1)
    ];
    
    // If domain ID is provided, filter by it
    if (domainId) {
      queries.push(Query.equal('domainId', domainId));
    }
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      'shortlinks',
      queries
    );
    
    return response.documents.length > 0 ? response.documents[0] : null;
  } catch (error) {
    console.error('Error getting shortlink by path:', error);
    return null;
  }
};

/**
 * List all shortlinks with pagination and search
 * @param {Object} options - Query options
 * @returns {Promise<Object>} List of shortlinks
 */
export const listShortlinks = async (options = {}) => {
  try {
    const {
      search = '',
      limit = 25,
      offset = 0,
      orderBy = 'createdAt',
      orderDirection = 'DESC'
    } = options;
    
    const queries = [
      Query.limit(limit),
      Query.offset(offset)
    ];
    
    // Add search query if provided
    if (search) {
      queries.push(Query.search('customPath', search));
    }
    
    // Add ordering
    if (orderDirection === 'DESC') {
      queries.push(Query.orderDesc(orderBy));
    } else {
      queries.push(Query.orderAsc(orderBy));
    }
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      'shortlinks',
      queries
    );
    
    return response;
  } catch (error) {
    console.error('Error listing shortlinks:', error);
    throw error;
  }
};

/**
 * Update an existing shortlink
 * @param {string} id - Shortlink ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object>} Updated shortlink
 */
export const updateShortlink = async (id, data) => {
  try {
    const {
      destinationUrl,
      customPath,
      previewImage,
      title,
      description,
      domainId,
      isActive
    } = data;
    
    const updateData = {
      updatedAt: new Date().toISOString()
    };
    
    // Validate and update destination URL if provided
    if (destinationUrl !== undefined) {
      const urlValidation = validateUrl(destinationUrl);
      if (!urlValidation.isValid) {
        throw new Error(urlValidation.error);
      }
      updateData.destinationUrl = urlValidation.url;
    }
    
    // Validate and update custom path if provided
    if (customPath !== undefined) {
      const pathValidation = validatePathFormat(customPath);
      if (!pathValidation.isValid) {
        throw new Error(pathValidation.error);
      }
      
      // Check for collisions (excluding current shortlink)
      const collision = await checkAllCollisions(pathValidation.normalizedPath, id);
      if (collision.hasCollision) {
        const firstCollision = collision.collisions[0];
        throw new Error(firstCollision.message);
      }
      
      updateData.customPath = pathValidation.normalizedPath;
    }
    
    // Handle preview image update
    if (previewImage !== undefined) {
      if (previewImage === null) {
        // Remove existing preview image
        const existing = await getShortlink(id);
        if (existing.previewImageId) {
          await deletePreviewImage(existing.previewImageId);
        }
        updateData.previewImageId = null;
        updateData.previewImageUrl = null;
      } else if (previewImage instanceof File) {
        // Upload new preview image
        const existing = await getShortlink(id);
        if (existing.previewImageId) {
          await deletePreviewImage(existing.previewImageId);
        }
        const uploadResult = await uploadPreviewImage(previewImage);
        updateData.previewImageId = uploadResult.fileId;
        updateData.previewImageUrl = uploadResult.fileUrl;
      }
    }
    
    // Update other fields
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (domainId !== undefined) updateData.domainId = domainId;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    // Update document
    const shortlink = await databases.updateDocument(
      DATABASE_ID,
      'shortlinks',
      id,
      updateData
    );
    
    return shortlink;
  } catch (error) {
    console.error('Error updating shortlink:', error);
    throw error;
  }
};

/**
 * Delete a shortlink
 * @param {string} id - Shortlink ID
 */
export const deleteShortlink = async (id) => {
  try {
    // Get shortlink to delete preview image
    const shortlink = await getShortlink(id);
    
    // Delete preview image if exists
    if (shortlink.previewImageId) {
      await deletePreviewImage(shortlink.previewImageId);
    }
    
    // Delete shortlink document
    await databases.deleteDocument(
      DATABASE_ID,
      'shortlinks',
      id
    );
  } catch (error) {
    console.error('Error deleting shortlink:', error);
    throw error;
  }
};

/**
 * Increment click count for a shortlink
 * @param {string} id - Shortlink ID
 */
export const incrementClickCount = async (id) => {
  try {
    const shortlink = await getShortlink(id);
    await databases.updateDocument(
      DATABASE_ID,
      'shortlinks',
      id,
      {
        clickCount: (shortlink.clickCount || 0) + 1,
        updatedAt: new Date().toISOString()
      }
    );
  } catch (error) {
    console.error('Error incrementing click count:', error);
    // Don't throw error, just log it
  }
};
