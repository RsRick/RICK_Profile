import { databases, ID, Query } from './appwrite';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;

/**
 * Generate a unique verification token
 * @returns {string} Verification token
 */
export const generateVerificationToken = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Validate domain format
 * @param {string} domain - Domain to validate
 * @returns {Object} Validation result
 */
export const validateDomain = (domain) => {
  if (!domain || typeof domain !== 'string') {
    return {
      isValid: false,
      error: 'Domain is required'
    };
  }
  
  const trimmedDomain = domain.trim().toLowerCase();
  
  // Basic domain format validation
  const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/;
  if (!domainRegex.test(trimmedDomain)) {
    return {
      isValid: false,
      error: 'Invalid domain format'
    };
  }
  
  // Check if it's a subdomain (required for shortlinks)
  const parts = trimmedDomain.split('.');
  if (parts.length < 3) {
    return {
      isValid: false,
      error: 'Please use a subdomain (e.g., link.yourdomain.com)'
    };
  }
  
  return {
    isValid: true,
    domain: trimmedDomain
  };
};

/**
 * Create a new custom domain
 * @param {string} domain - Domain name
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Created domain
 */
export const createDomain = async (domain, userId) => {
  try {
    // Validate domain
    const validation = validateDomain(domain);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    
    // Check if domain already exists
    const existing = await databases.listDocuments(
      DATABASE_ID,
      'shortlink_domains',
      [Query.equal('domain', validation.domain), Query.limit(1)]
    );
    
    if (existing.documents.length > 0) {
      throw new Error('Domain already exists');
    }
    
    // Generate verification token
    const verificationToken = generateVerificationToken();
    
    // Get server IP or CNAME target (you'll need to configure this)
    const serverIP = window.location.hostname;
    
    // Create DNS records instructions
    const dnsRecords = JSON.stringify({
      aRecord: {
        type: 'A',
        name: validation.domain.split('.')[0],
        content: serverIP,
        ttl: 'Auto',
        proxy: true
      },
      txtRecord: {
        type: 'TXT',
        name: `_shortlink-verify.${validation.domain.split('.')[0]}`,
        content: verificationToken,
        ttl: 'Auto'
      }
    });
    
    // Create domain document
    const now = new Date().toISOString();
    const domainDoc = await databases.createDocument(
      DATABASE_ID,
      'shortlink_domains',
      ID.unique(),
      {
        domain: validation.domain,
        isVerified: false,
        verificationToken,
        dnsRecords,
        lastVerifiedAt: null,
        isActive: true,
        createdAt: now,
        updatedBy: userId
      }
    );
    
    return domainDoc;
  } catch (error) {
    console.error('Error creating domain:', error);
    throw error;
  }
};

/**
 * Get domain by ID
 * @param {string} id - Domain ID
 * @returns {Promise<Object>} Domain document
 */
export const getDomain = async (id) => {
  try {
    const domain = await databases.getDocument(
      DATABASE_ID,
      'shortlink_domains',
      id
    );
    return domain;
  } catch (error) {
    console.error('Error getting domain:', error);
    throw error;
  }
};

/**
 * List all domains
 * @param {Object} options - Query options
 * @returns {Promise<Object>} List of domains
 */
export const listDomains = async (options = {}) => {
  try {
    const {
      limit = 25,
      offset = 0,
      onlyVerified = false
    } = options;
    
    const queries = [
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc('createdAt')
    ];
    
    if (onlyVerified) {
      queries.push(Query.equal('isVerified', true));
    }
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      'shortlink_domains',
      queries
    );
    
    return response;
  } catch (error) {
    console.error('Error listing domains:', error);
    throw error;
  }
};

/**
 * Update domain
 * @param {string} id - Domain ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated domain
 */
export const updateDomain = async (id, data) => {
  try {
    const updateData = {};
    
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }
    
    if (data.isVerified !== undefined) {
      updateData.isVerified = data.isVerified;
      if (data.isVerified) {
        updateData.lastVerifiedAt = new Date().toISOString();
      }
    }
    
    const domain = await databases.updateDocument(
      DATABASE_ID,
      'shortlink_domains',
      id,
      updateData
    );
    
    return domain;
  } catch (error) {
    console.error('Error updating domain:', error);
    throw error;
  }
};

/**
 * Delete domain
 * @param {string} id - Domain ID
 */
export const deleteDomain = async (id) => {
  try {
    // Check if domain is used by any shortlinks
    const shortlinks = await databases.listDocuments(
      DATABASE_ID,
      'shortlinks',
      [Query.equal('domainId', id), Query.limit(1)]
    );
    
    if (shortlinks.documents.length > 0) {
      throw new Error('Cannot delete domain that is used by shortlinks');
    }
    
    await databases.deleteDocument(
      DATABASE_ID,
      'shortlink_domains',
      id
    );
  } catch (error) {
    console.error('Error deleting domain:', error);
    throw error;
  }
};

/**
 * Get active verified domains for selection
 * @returns {Promise<Array>} List of active verified domains
 */
export const getActiveDomains = async () => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      'shortlink_domains',
      [
        Query.equal('isVerified', true),
        Query.equal('isActive', true),
        Query.limit(100)
      ]
    );
    
    return response.documents;
  } catch (error) {
    console.error('Error getting active domains:', error);
    return [];
  }
};
