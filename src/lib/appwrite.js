import { Client, Databases, Account, Storage, Teams, Functions, ID, Permission, Role, Query } from 'appwrite';

// Appwrite Configuration
const appwriteConfig = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || '',
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || '',
  // Add collection IDs as needed
  collections: {
    // Example: projects: import.meta.env.VITE_APPWRITE_COLLECTION_PROJECTS || '',
  },
  storageId: import.meta.env.VITE_APPWRITE_STORAGE_ID || '',
};

// Storage Bucket IDs
export const STORAGE_BUCKET_ID = import.meta.env.VITE_APPWRITE_STORAGE_ID || 'reactbucket'; // Default bucket
export const PROFILE_IMAGES_BUCKET_ID = 'profile-images';

// Debug: Log configuration status (only in production to help debug)
if (import.meta.env.PROD) {
  console.log('🔍 Appwrite Configuration Check:');
  console.log('   Endpoint:', appwriteConfig.endpoint ? '✅ Set' : '❌ Missing');
  console.log('   Project ID:', appwriteConfig.projectId ? `✅ Set (${appwriteConfig.projectId.substring(0, 8)}...)` : '❌ Missing');
  console.log('   Database ID:', appwriteConfig.databaseId ? `✅ Set (${appwriteConfig.databaseId.substring(0, 8)}...)` : '❌ Missing');
  console.log('   Storage ID:', appwriteConfig.storageId ? `✅ Set (${appwriteConfig.storageId.substring(0, 8)}...)` : '⚠️ Optional');
  
  // Check if env vars are actually being read
  console.log('   VITE_APPWRITE_ENDPOINT exists:', !!import.meta.env.VITE_APPWRITE_ENDPOINT);
  console.log('   VITE_APPWRITE_PROJECT_ID exists:', !!import.meta.env.VITE_APPWRITE_PROJECT_ID);
  console.log('   VITE_APPWRITE_DATABASE_ID exists:', !!import.meta.env.VITE_APPWRITE_DATABASE_ID);
}

// Initialize Appwrite Client
const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

// Initialize Services
export const databases = new Databases(client);
export const account = new Account(client);
export const storage = new Storage(client);
export const teams = new Teams(client);
export const functions = new Functions(client);

// Admin Team ID - Your team ID in Appwrite Console
export const ADMIN_TEAM_ID = import.meta.env.VITE_APPWRITE_ADMIN_TEAM_ID || 'admin';

// Export helpers
export { ID, Permission, Role, Query };

// Export config for reference
export { appwriteConfig };

// Helper function to check if Appwrite is configured
export const isAppwriteConfigured = () => {
  const isConfigured = !!(
    appwriteConfig.endpoint &&
    appwriteConfig.projectId &&
    appwriteConfig.databaseId
  );
  
  // Log warning in production if not configured
  if (!isConfigured && import.meta.env.PROD) {
    console.warn('⚠️ Appwrite is not properly configured. Please set environment variables in Vercel:');
    console.warn('   - VITE_APPWRITE_ENDPOINT');
    console.warn('   - VITE_APPWRITE_PROJECT_ID');
    console.warn('   - VITE_APPWRITE_DATABASE_ID');
    console.warn('   - VITE_APPWRITE_STORAGE_ID (optional)');
  }
  
  return isConfigured;
};

// Example: Database operations helper functions
export const databaseService = {
  // Create a document
  createDocument: async (collectionId, data, documentId = null) => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        collectionId,
        documentId || ID.unique(),
        data
      );
      return { success: true, data: response };
    } catch (error) {
      console.error('Error creating document:', error);
      return { success: false, error: error.message };
    }
  },

  // Get a document by ID
  getDocument: async (collectionId, documentId) => {
    try {
      const response = await databases.getDocument(
        appwriteConfig.databaseId,
        collectionId,
        documentId
      );
      return { success: true, data: response };
    } catch (error) {
      console.error('Error getting document:', error);
      return { success: false, error: error.message };
    }
  },

  // List documents
  listDocuments: async (collectionId, queries = []) => {
    try {
      // Check if Appwrite is configured
      if (!isAppwriteConfigured()) {
        console.warn('❌ Appwrite not configured - returning empty result');
        console.warn('   Collection:', collectionId);
        console.warn('   Endpoint:', appwriteConfig.endpoint);
        console.warn('   Project ID:', appwriteConfig.projectId || 'MISSING');
        console.warn('   Database ID:', appwriteConfig.databaseId || 'MISSING');
        return { success: false, error: 'Appwrite not configured', data: { documents: [] } };
      }
      
      if (import.meta.env.PROD) {
        console.log(`📡 Fetching documents from collection: ${collectionId}`);
      }
      
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        collectionId,
        queries
      );
      
      if (import.meta.env.PROD) {
        console.log(`✅ Successfully fetched ${response.documents.length} document(s) from ${collectionId}`);
      }
      
      return { success: true, data: response };
    } catch (error) {
      console.error('❌ Error listing documents:', error);
      console.error('   Collection:', collectionId);
      console.error('   Error Type:', error.type || 'Unknown');
      console.error('   Error Code:', error.code || 'Unknown');
      console.error('   Error Message:', error.message);
      
      // Check for common errors
      if (error.code === 401 || error.message?.includes('Unauthorized')) {
        console.error('   ⚠️ Authentication issue - check Appwrite project settings');
      }
      if (error.code === 404 || error.message?.includes('not found')) {
        console.error('   ⚠️ Collection or database not found - check collection ID');
      }
      if (error.message?.includes('CORS')) {
        console.error('   ⚠️ CORS issue - add your Vercel domain to Appwrite Web Platform settings');
      }
      
      return { success: false, error: error.message, data: { documents: [] } };
    }
  },

  // Update a document
  updateDocument: async (collectionId, documentId, data) => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        collectionId,
        documentId,
        data
      );
      return { success: true, data: response };
    } catch (error) {
      console.error('Error updating document:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete a document
  deleteDocument: async (collectionId, documentId) => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        collectionId,
        documentId
      );
      return { success: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      return { success: false, error: error.message };
    }
  },

  // Legacy methods with database ID parameter (now uses env variable, ignores first param)
  // These are kept for backward compatibility - the databaseId parameter is ignored
  createDocumentWithDb: async (databaseId, collectionId, data, documentId = null) => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId, // Always use env variable
        collectionId,
        documentId || ID.unique(),
        data
      );
      return { success: true, data: response };
    } catch (error) {
      console.error('Error creating document:', error);
      return { success: false, error: error.message };
    }
  },

  getDocumentWithDb: async (databaseId, collectionId, documentId) => {
    try {
      const response = await databases.getDocument(
        appwriteConfig.databaseId, // Always use env variable
        collectionId,
        documentId
      );
      return { success: true, data: response };
    } catch (error) {
      console.error('Error getting document:', error);
      return { success: false, error: error.message };
    }
  },

  listDocumentsWithDb: async (databaseId, collectionId, queries = []) => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId, // Always use env variable
        collectionId,
        queries
      );
      return { success: true, data: response };
    } catch (error) {
      console.error('Error listing documents:', error);
      return { success: false, error: error.message, data: { documents: [] } };
    }
  },

  updateDocumentWithDb: async (databaseId, collectionId, documentId, data) => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId, // Always use env variable
        collectionId,
        documentId,
        data
      );
      return { success: true, data: response };
    } catch (error) {
      console.error('Error updating document:', error);
      return { success: false, error: error.message };
    }
  },

  deleteDocumentWithDb: async (databaseId, collectionId, documentId) => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId, // Always use env variable
        collectionId,
        documentId
      );
      return { success: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      return { success: false, error: error.message };
    }
  },
};

// Storage operations helper functions
export const storageService = {
  // Upload a file
  uploadFile: async (bucketId, fileId, file) => {
    try {
      const response = await storage.createFile(
        bucketId,
        fileId,
        file,
        [Permission.read(Role.any())]
      );
      return { success: true, data: response };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { success: false, error: error.message };
    }
  },

  setFilePublic: async (bucketId, fileId) => {
    try {
      const response = await storage.updateFile(
        bucketId,
        fileId,
        undefined,
        [Permission.read(Role.any())]
      );
      return { success: true, data: response };
    } catch (error) {
      console.error('Error setting file public:', error);
      return { success: false, error: error.message };
    }
  },

  // Get file preview URL
  getFilePreview: (bucketId, fileId, width = 300, height = 300) => {
    try {
      const url = storage.getFilePreview(bucketId, fileId, width, height);
      // URL object has href property
      const urlString = url.href || url.toString();
      console.log('🖼️ Preview URL generated:', urlString);
      return urlString;
    } catch (error) {
      console.error('❌ Error getting file preview:', error);
      return '';
    }
  },

  // Get file view URL (full size)
  getFileView: (bucketId, fileId) => {
    try {
      console.log('🔍 Getting file view for:', { bucketId, fileId });
      const url = storage.getFileView(bucketId, fileId);
      console.log('📍 Raw URL object:', url);
      console.log('📍 URL type:', typeof url);
      console.log('📍 URL constructor:', url?.constructor?.name);
      
      // URL object has href property
      const urlString = url.href || url.toString();
      console.log('📍 Final URL string:', urlString);
      return urlString;
    } catch (error) {
      console.error('❌ Error getting file view:', error);
      return '';
    }
  },

  // Delete a file
  deleteFile: async (bucketId, fileId) => {
    try {
      await storage.deleteFile(bucketId, fileId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting file:', error);
      return { success: false, error: error.message };
    }
  },
};

// Newsletter service
export const newsletterService = {
  // Subscribe to newsletter
  subscribe: async (email) => {
    try {
      // Check if email already exists
      const existing = await databases.listDocuments(
        appwriteConfig.databaseId,
        'newsletter',
        [Query.equal('email', email)]
      );
      
      if (existing.documents.length > 0) {
        return { success: false, error: 'Already subscribed' };
      }
      
      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        'newsletter',
        ID.unique(),
        {
          email,
          subscribedAt: new Date().toISOString(),
          isActive: true
        }
      );
      return { success: true, data: response };
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all subscribers
  getSubscribers: async (queries = []) => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        'newsletter',
        queries
      );
      return { success: true, data: response };
    } catch (error) {
      console.error('Error getting subscribers:', error);
      return { success: false, error: error.message, data: { documents: [] } };
    }
  },

  // Update subscriber status
  updateSubscriber: async (documentId, data) => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        'newsletter',
        documentId,
        data
      );
      return { success: true, data: response };
    } catch (error) {
      console.error('Error updating subscriber:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete subscriber
  deleteSubscriber: async (documentId) => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        'newsletter',
        documentId
      );
      return { success: true };
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ FOLDER MANAGEMENT ============
  
  // Create folder
  createFolder: async (name, description = '') => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        'newsletter_folders',
        ID.unique(),
        { name, description, createdAt: new Date().toISOString() }
      );
      return { success: true, data: response };
    } catch (error) {
      console.error('Error creating folder:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all folders
  getFolders: async () => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        'newsletter_folders',
        [Query.orderDesc('createdAt')]
      );
      return { success: true, data: response };
    } catch (error) {
      console.error('Error getting folders:', error);
      return { success: false, error: error.message, data: { documents: [] } };
    }
  },

  // Delete folder
  deleteFolder: async (folderId) => {
    try {
      await databases.deleteDocument(appwriteConfig.databaseId, 'newsletter_folders', folderId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting folder:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ CAMPAIGN MANAGEMENT ============
  
  // Create campaign
  createCampaign: async (data) => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        'newsletter_campaigns',
        ID.unique(),
        {
          ...data,
          status: 'draft',
          sentCount: 0,
          failedCount: 0,
          openCount: 0,
          clickCount: 0,
          createdAt: new Date().toISOString()
        }
      );
      return { success: true, data: response };
    } catch (error) {
      console.error('Error creating campaign:', error);
      return { success: false, error: error.message };
    }
  },

  // Get campaigns
  getCampaigns: async (folderId = null) => {
    try {
      const queries = [Query.orderDesc('createdAt')];
      if (folderId) {
        queries.push(Query.equal('folderId', folderId));
      }
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        'newsletter_campaigns',
        queries
      );
      return { success: true, data: response };
    } catch (error) {
      console.error('Error getting campaigns:', error);
      return { success: false, error: error.message, data: { documents: [] } };
    }
  },

  // Update campaign
  updateCampaign: async (campaignId, data) => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        'newsletter_campaigns',
        campaignId,
        data
      );
      return { success: true, data: response };
    } catch (error) {
      console.error('Error updating campaign:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete campaign
  deleteCampaign: async (campaignId) => {
    try {
      await databases.deleteDocument(appwriteConfig.databaseId, 'newsletter_campaigns', campaignId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting campaign:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ EMAIL TRACKING ============
  
  // Get tracking data for a campaign
  getCampaignTracking: async (campaignId) => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        'email_tracking',
        [Query.equal('campaignId', campaignId), Query.limit(1000)]
      );
      return { success: true, data: response };
    } catch (error) {
      console.error('Error getting tracking data:', error);
      return { success: false, error: error.message, data: { documents: [] } };
    }
  },

  // Send campaign via Appwrite function
  sendCampaign: async (campaignId, campaignData, recipients) => {
    try {
      const payload = {
        campaignId,
        fromName: campaignData.fromName,
        fromEmail: campaignData.fromEmail,
        subject: campaignData.subject,
        contentType: campaignData.contentType,
        textContent: campaignData.textContent,
        htmlContent: campaignData.htmlContent,
        recipients: recipients.map(r => ({ email: r.email, subscriberId: r.$id })),
        trackOpens: campaignData.trackOpens !== false,
        trackClicks: campaignData.trackClicks !== false
      };

      const response = await functions.createExecution(
        'newsletter-emails',
        JSON.stringify({ data: payload }),
        false
      );
      
      return { success: true, data: response };
    } catch (error) {
      console.error('Error sending campaign:', error);
      return { success: false, error: error.message };
    }
  }
};

export default client;

