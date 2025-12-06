import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

// Page wrapper with smooth fade-in animation for all single pages
// Footer is always fixed at bottom using flexbox layout
export default function PageWrapper({ children, showHeader = true, showFooter = true }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Only scroll to top if there's no hash in the URL
    if (!location.hash) {
      window.scrollTo(0, 0);
    }
    
    // Trigger fade-in animation after a brief delay
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        background: '#FFFAEB',
        backgroundImage: `linear-gradient(rgba(16, 86, 82, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 86, 82, 0.05) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
        backgroundPosition: '0 0',
      }}
    >
      {showHeader && <Header />}
      {/* Main content area - flex-grow ensures it takes remaining space, pushing footer to bottom */}
      <main 
        className={`flex-grow transition-all duration-500 ease-out ${
          isLoaded 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-4'
        }`}
        style={{ 
          paddingTop: showHeader ? '64px' : '0',
          minHeight: showHeader ? 'calc(100vh - 64px - 80px)' : 'calc(100vh - 80px)' // viewport - header - footer
        }}
      >
        {children}
      </main>
      {/* Footer is always at the bottom due to flex layout */}
      {showFooter && <Footer />}
    </div>
  );
}
