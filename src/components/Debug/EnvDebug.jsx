import React from 'react';

const EnvDebug = () => {
  // Only show in development or when explicitly enabled
  if (import.meta.env.PROD && !import.meta.env.VITE_SHOW_DEBUG) {
    return null;
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Environment Debug</h4>
      <div>Mode: {import.meta.env.MODE}</div>
      <div>Endpoint: {import.meta.env.VITE_APPWRITE_ENDPOINT || 'MISSING'}</div>
      <div>Project ID: {import.meta.env.VITE_APPWRITE_PROJECT_ID || 'MISSING'}</div>
      <div>Database ID: {import.meta.env.VITE_APPWRITE_DATABASE_ID || 'MISSING'}</div>
    </div>
  );
};

export default EnvDebug;