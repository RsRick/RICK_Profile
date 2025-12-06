import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Smooth page transition wrapper with fade animation
export default function PageTransition({ children }) {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    // Start fade out
    setIsVisible(false);
    
    // After fade out, update children and fade in
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsVisible(true);
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Initial mount - fade in immediately
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`page-transition ${isVisible ? 'page-visible' : 'page-hidden'}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
        minHeight: '100vh',
      }}
    >
      {displayChildren}
    </div>
  );
}

// Loading skeleton for page transitions
export function PageLoader() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{ 
        background: '#FFFAEB',
        backgroundImage: `linear-gradient(rgba(16, 86, 82, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 86, 82, 0.05) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
      }}
    >
      <div className="text-center">
        <div 
          className="w-16 h-16 mx-auto mb-4 rounded-full animate-pulse"
          style={{ background: 'linear-gradient(135deg, #105652, #1E8479)' }}
        />
        <div className="w-32 h-2 mx-auto rounded-full bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
}
