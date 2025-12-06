import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

export default function Toast({ message, isVisible, onClose }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-hide after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] pointer-events-none"
      style={{
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 px-6 py-4 flex items-center gap-3 min-w-[300px] max-w-md pointer-events-auto">
        <div className="flex-shrink-0">
          <CheckCircle className="w-6 h-6" style={{ color: '#105652' }} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">{message}</p>
        </div>
      </div>
    </div>
  );
}

