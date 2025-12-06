import { databases, Query } from './appwrite';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;

// Static routes that should not be used as shortlink paths
const STATIC_ROUTES = [
  'admin',
  'shop',
  'checkout',
  'blog',
  'projects',
  'certificates',
  'about',
  'contact',
  'login',
  'signup',
  'settings',
  'profile',
  'dashboard',
  'api',
  'assets',
  'static',
  'public',
  'images',
  'fonts',
  'css',
  'js',
  'favicon',
  'robots',
  'sitemap',
  'manifest',
  '.well-known'
];

/**
 * Check if path collides with blog posts
 */
export const checkBlogCollision = async (path) => {
  try {
    const normalizedPath = path.toLowerCase().trim();
    
    // Query blog posts collection for matching slug
    const response = await databases.listDocuments(
      DATABASE_ID,
      'blog_posts',
      [Query.equal('slug', normalizedPath), Query.limit(1)]
    );
    
    if (response.documents.length > 0) {
      return {
        hasCollision: true,
        type: 'blog',
        resource: response.documents[0],
        message: `Path "${path}" is already used by blog post: "${response.documents[0].title}"`
      };
    }
    
    return { hasCollision: false };
  } catch (error) {
    console.error('Error checking blog collision:', error);
    // If collection doesn't exist or error, assume no collision
    return { hasCollision: false };
  }
};

/**
 * Check if path collides with projects
 */
export const checkProjectCollision = async (path) => {
  try {
    const normalizedPath = path.toLowerCase().trim();
    
    // Query projects collection for matching slug
    const response = await databases.listDocuments(
      DATABASE_ID,
      'projects',
      [Query.equal('slug', normalizedPath), Query.limit(1)]
    );
    
    if (response.documents.length > 0) {
      return {
        hasCollision: true,
        type: 'project',
        resource: response.documents[0],
        message: `Path "${path}" is already used by project: "${response.documents[0].title}"`
      };
    }
    
    return { hasCollision: false };
  } catch (error) {
    console.error('Error checking project collision:', error);
    return { hasCollision: false };
  }
};

/**
 * Check if path collides with certificate routes
 */
export const checkCertificateCollision = async (path) => {
  try {
    const normalizedPath = path.toLowerCase().trim();
    
    // Check if path starts with common certificate patterns
    if (normalizedPath.startsWith('cert-') || normalizedPath.startsWith('certificate-')) {
      return {
        hasCollision: true,
        type: 'certificate',
        message: `Path "${path}" conflicts with certificate route pattern`
      };
    }
    
    // Query certificates collection if it exists
    const response = await databases.listDocuments(
      DATABASE_ID,
      'certificates',
      [Query.equal('certificateId', normalizedPath), Query.limit(1)]
    );
    
    if (response.documents.length > 0) {
      return {
        hasCollision: true,
        type: 'certificate',
        resource: response.documents[0],
        message: `Path "${path}" is already used by a certificate`
      };
    }
    
    return { hasCollision: false };
  } catch (error) {
    console.error('Error checking certificate collision:', error);
    return { hasCollision: false };
  }
};

/**
 * Check if path collides with existing shortlinks
 */
export const checkShortlinkCollision = async (path, excludeId = null) => {
  try {
    const normalizedPath = path.toLowerCase().trim();
    
    const queries = [
      Query.equal('customPath', normalizedPath),
      Query.limit(1)
    ];
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      'shortlinks',
      queries
    );
    
    // If we're editing, exclude the current shortlink from collision check
    const collision = response.documents.find(doc => doc.$id !== excludeId);
    
    if (collision) {
      return {
        hasCollision: true,
        type: 'shortlink',
        resource: collision,
        message: `Path "${path}" is already used by another shortlink`
      };
    }
    
    return { hasCollision: false };
  } catch (error) {
    console.error('Error checking shortlink collision:', error);
    return { hasCollision: false };
  }
};

/**
 * Check if path collides with static routes
 */
export const checkStaticRouteCollision = (path) => {
  const normalizedPath = path.toLowerCase().trim();
  
  // Check exact match
  if (STATIC_ROUTES.includes(normalizedPath)) {
    return {
      hasCollision: true,
      type: 'static',
      message: `Path "${path}" is a reserved system route`
    };
  }
  
  // Check if path starts with any static route
  const startsWithStatic = STATIC_ROUTES.some(route => 
    normalizedPath.startsWith(route + '-') || normalizedPath.startsWith(route + '_')
  );
  
  if (startsWithStatic) {
    return {
      hasCollision: true,
      type: 'static',
      message: `Path "${path}" conflicts with a reserved system route`
    };
  }
  
  return { hasCollision: false };
};

/**
 * Check all possible collisions for a given path
 * @param {string} path - The custom path to check
 * @param {string} excludeId - Optional shortlink ID to exclude (for edits)
 * @returns {Promise<Object>} Collision result with details
 */
export const checkAllCollisions = async (path, excludeId = null) => {
  if (!path || typeof path !== 'string') {
    return {
      hasCollision: false,
      collisions: []
    };
  }
  
  const normalizedPath = path.toLowerCase().trim();
  
  // Run all collision checks in parallel
  const [
    staticResult,
    blogResult,
    projectResult,
    certificateResult,
    shortlinkResult
  ] = await Promise.all([
    Promise.resolve(checkStaticRouteCollision(normalizedPath)),
    checkBlogCollision(normalizedPath),
    checkProjectCollision(normalizedPath),
    checkCertificateCollision(normalizedPath),
    checkShortlinkCollision(normalizedPath, excludeId)
  ]);
  
  // Collect all collisions
  const collisions = [
    staticResult,
    blogResult,
    projectResult,
    certificateResult,
    shortlinkResult
  ].filter(result => result.hasCollision);
  
  return {
    hasCollision: collisions.length > 0,
    collisions,
    path: normalizedPath
  };
};

/**
 * Validate custom path format
 * @param {string} path - The custom path to validate
 * @returns {Object} Validation result
 */
export const validatePathFormat = (path) => {
  if (!path || typeof path !== 'string') {
    return {
      isValid: false,
      error: 'Path is required'
    };
  }
  
  const trimmedPath = path.trim();
  
  // Check length (allow longer for paths with prefixes)
  if (trimmedPath.length < 2) {
    return {
      isValid: false,
      error: 'Path must be at least 2 characters long'
    };
  }
  
  if (trimmedPath.length > 100) {
    return {
      isValid: false,
      error: 'Path must be no more than 100 characters long'
    };
  }
  
  // Check format (alphanumeric, hyphens, underscores, and forward slashes for prefixes)
  const pathRegex = /^[a-zA-Z0-9_\/-]+$/;
  if (!pathRegex.test(trimmedPath)) {
    return {
      isValid: false,
      error: 'Path can only contain letters, numbers, hyphens, underscores, and forward slashes'
    };
  }
  
  // Check if starts with special character
  if (trimmedPath.startsWith('-') || trimmedPath.startsWith('_') || trimmedPath.startsWith('/')) {
    return {
      isValid: false,
      error: 'Path cannot start with a hyphen, underscore, or forward slash'
    };
  }
  
  // Check if ends with forward slash
  if (trimmedPath.endsWith('/')) {
    return {
      isValid: false,
      error: 'Path cannot end with a forward slash'
    };
  }
  
  // Check for multiple consecutive slashes
  if (trimmedPath.includes('//')) {
    return {
      isValid: false,
      error: 'Path cannot contain consecutive forward slashes'
    };
  }
  
  return {
    isValid: true,
    normalizedPath: trimmedPath.toLowerCase()
  };
};
