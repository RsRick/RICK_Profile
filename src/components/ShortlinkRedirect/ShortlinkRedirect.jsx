import { useEffect, useState, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { getShortlinkByPath } from '../../lib/shortlinkService';
import { recordClick } from '../../lib/analyticsService';
import { Loader } from 'lucide-react';

// Lazy load NotFound404 for broken links
const NotFound404 = lazy(() => import('../../pages/NotFound404'));

export default function ShortlinkRedirect() {
  const { path, prefix } = useParams();
  const [checking, setChecking] = useState(true);
  const [isShortlink, setIsShortlink] = useState(false);

  useEffect(() => {
    handleRedirect();
  }, [path, prefix]);

  const handleRedirect = async () => {
    try {
      // Build the full path (with prefix if present)
      const fullPath = prefix ? `${prefix}/${path}` : path;
      
      // Get the shortlink from database
      const shortlink = await getShortlinkByPath(fullPath);

      if (!shortlink) {
        // No shortlink found - show 404 page
        setChecking(false);
        setIsShortlink(false);
        return;
      }

      setIsShortlink(true);

      // Record analytics asynchronously (don't wait for it)
      recordClick(shortlink.$id, {
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        customDomain: false
      }).catch(err => console.error('Error recording analytics:', err));

      // Perform redirect
      window.location.replace(shortlink.destinationUrl);
    } catch (error) {
      console.error('Error handling shortlink redirect:', error);
      setChecking(false);
      setIsShortlink(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#105652' }} />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not a shortlink, show 404 page
  if (!isShortlink) {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#105652' }}></div>
        </div>
      }>
        <NotFound404 />
      </Suspense>
    );
  }

  // If it is a shortlink, show redirecting message
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#105652' }} />
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}

// Component to inject Open Graph meta tags for social media previews
export function ShortlinkMetaTags({ shortlink }) {
  useEffect(() => {
    if (!shortlink) return;

    // Create meta tags
    const metaTags = [];

    if (shortlink.title) {
      const ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      ogTitle.content = shortlink.title;
      metaTags.push(ogTitle);
    }

    if (shortlink.description) {
      const ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      ogDescription.content = shortlink.description;
      metaTags.push(ogDescription);
    }

    if (shortlink.previewImageUrl) {
      const ogImage = document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      ogImage.content = shortlink.previewImageUrl;
      metaTags.push(ogImage);
    }

    const ogUrl = document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    ogUrl.content = window.location.href;
    metaTags.push(ogUrl);

    // Append to head
    metaTags.forEach(tag => document.head.appendChild(tag));

    // Cleanup on unmount
    return () => {
      metaTags.forEach(tag => {
        if (tag.parentNode) {
          tag.parentNode.removeChild(tag);
        }
      });
    };
  }, [shortlink]);

  return null;
}
