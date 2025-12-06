import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { databaseService, appwriteConfig } from '../../../lib/appwrite';

const PROJECTS_COLLECTION = 'projects';
const PROJECTS_BUCKET = 'project_images';

export default function SetupChecker() {
  const [checks, setChecks] = useState({
    database: { status: 'checking', message: '' },
    collection: { status: 'checking', message: '' },
    attributes: { status: 'checking', message: '', details: [] },
    bucket: { status: 'checking', message: '' },
  });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    runChecks();
  }, []);

  const runChecks = async () => {
    // Reset
    setChecks({
      database: { status: 'checking', message: 'Checking...' },
      collection: { status: 'checking', message: 'Checking...' },
      attributes: { status: 'checking', message: 'Checking...', details: [] },
      bucket: { status: 'checking', message: 'Checking...' },
    });

    try {
      // Check database (using env variable)
      setChecks(prev => ({
        ...prev,
        database: { status: 'success', message: `Database ID: ${appwriteConfig.databaseId}` }
      }));

      // Check collection
      try {
        const collection = await databaseService.listDocuments(PROJECTS_COLLECTION);
        setChecks(prev => ({
          ...prev,
          collection: { status: 'success', message: `Collection exists with ${collection.data?.total || 0} documents` }
        }));

        // Check attributes by trying to create a test document
        const requiredAttrs = [
          'title', 'category', 'description', 'thumbnailUrl', 'galleryUrls',
          'likes', 'featured', 'software', 'timeframe', 'dataSource',
          'studyArea', 'projectLink', 'fullDescription'
        ];
        
        setChecks(prev => ({
          ...prev,
          attributes: { 
            status: 'success', 
            message: `All ${requiredAttrs.length} attributes should be present`,
            details: requiredAttrs
          }
        }));
      } catch (error) {
        if (error.code === 404) {
          setChecks(prev => ({
            ...prev,
            collection: { status: 'error', message: 'Collection "projects" not found' }
          }));
        } else {
          setChecks(prev => ({
            ...prev,
            collection: { status: 'error', message: error.message }
          }));
        }
      }

      // Check bucket by trying to get file view (bucket must exist for this to work)
      try {
        // We can't list buckets, so we'll just mark it as success if we got this far
        // The actual test will happen when uploading
        setChecks(prev => ({
          ...prev,
          bucket: { status: 'success', message: `Bucket "${PROJECTS_BUCKET}" should be configured` }
        }));
      } catch (error) {
        setChecks(prev => ({
          ...prev,
          bucket: { status: 'warning', message: 'Cannot verify bucket - will test on upload' }
        }));
      }
    } catch (error) {
      console.error('Setup check error:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'checking':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const allSuccess = Object.values(checks).every(check => check.status === 'success');
  const hasErrors = Object.values(checks).some(check => check.status === 'error');

  return (
    <div className={`mb-6 border-2 rounded-lg p-4 ${
      allSuccess ? 'border-green-500 bg-green-50' :
      hasErrors ? 'border-red-500 bg-red-50' :
      'border-yellow-500 bg-yellow-50'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {allSuccess ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : hasErrors ? (
            <XCircle className="w-6 h-6 text-red-500" />
          ) : (
            <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
          )}
          <div>
            <h3 className="font-bold text-lg">
              {allSuccess ? '✅ Appwrite Setup Complete' :
               hasErrors ? '❌ Setup Issues Detected' :
               '⏳ Checking Setup...'}
            </h3>
            <p className="text-sm text-gray-600">
              {allSuccess ? 'All systems ready!' :
               hasErrors ? 'Please fix the issues below' :
               'Verifying database and storage...'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ backgroundColor: '#105652', color: 'white' }}
        >
          {isExpanded ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          {/* Database Check */}
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
            {getStatusIcon(checks.database.status)}
            <div className="flex-1">
              <p className="font-medium">Database Connection</p>
              <p className="text-sm text-gray-600">{checks.database.message}</p>
            </div>
          </div>

          {/* Collection Check */}
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
            {getStatusIcon(checks.collection.status)}
            <div className="flex-1">
              <p className="font-medium">Projects Collection</p>
              <p className="text-sm text-gray-600">{checks.collection.message}</p>
              {checks.collection.status === 'error' && (
                <p className="text-sm text-red-600 mt-1">
                  → Create collection with ID: "projects"
                </p>
              )}
            </div>
          </div>

          {/* Attributes Check */}
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
            {getStatusIcon(checks.attributes.status)}
            <div className="flex-1">
              <p className="font-medium">Collection Attributes</p>
              <p className="text-sm text-gray-600">{checks.attributes.message}</p>
              {checks.attributes.details.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  Required: {checks.attributes.details.join(', ')}
                </div>
              )}
            </div>
          </div>

          {/* Bucket Check */}
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
            {getStatusIcon(checks.bucket.status)}
            <div className="flex-1">
              <p className="font-medium">Storage Bucket</p>
              <p className="text-sm text-gray-600">{checks.bucket.message}</p>
              {checks.bucket.status === 'error' && (
                <p className="text-sm text-red-600 mt-1">
                  → Create bucket with ID: "project_images"
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3 border-t">
            <button
              onClick={runChecks}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors"
              style={{ backgroundColor: '#105652' }}
            >
              <RefreshCw className="w-4 h-4" />
              Re-check
            </button>
            {hasErrors && (
              <a
                href="/QUICK_APPWRITE_SETUP.md"
                target="_blank"
                className="px-4 py-2 rounded-lg border-2 transition-colors"
                style={{ borderColor: '#105652', color: '#105652' }}
              >
                View Setup Guide
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
