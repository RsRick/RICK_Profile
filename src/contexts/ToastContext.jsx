import React, { createContext, useContext, useState } from 'react';
import Toast from '../components/Toast/Toast';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ visible: false, message: '' });

  const showToast = (message) => {
    setToast({ visible: true, message });
  };

  const hideToast = () => {
    setToast({ visible: false, message: '' });
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        message={toast.message}
        isVisible={toast.visible}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
};

