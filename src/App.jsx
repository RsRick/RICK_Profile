import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { FontProvider } from './contexts/FontContext';
import { CartProvider } from './contexts/CartContext';
import { ShopAuthProvider } from './contexts/ShopAuthContext';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import Loader from './components/Loader/Loader';
import FloatingNav from './components/FloatingNav/FloatingNav';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminHome from './pages/Admin/AdminHome';
import Menubar from './pages/Admin/Menubar/Menubar';
import Settings from './pages/Admin/Settings/Settings';
import HeaderSection from './pages/Admin/HeaderSection/HeaderSection';
import AboutMe from './pages/Admin/AboutMe/AboutMe';
import FontManagement from './pages/Admin/FontManagement/FontManagement';
import ProjectManagement from './pages/Admin/ProjectManagement/ProjectManagement';
import CategoryManagement from './pages/Admin/CategoryManagement/CategoryManagement';
import BlogManagement from './pages/Admin/BlogManagement/BlogManagement';
import BlogCategoryManagement from './pages/Admin/BlogCategoryManagement/BlogCategoryManagement';
import ContactSettings from './pages/Admin/ContactManagement/ContactSettings';
import ContactResponses from './pages/Admin/ContactManagement/ContactResponses';
import MapUpload from './pages/Admin/SpatialCanvas/MapUpload';
import MapCategoryManagement from './pages/Admin/SpatialCanvas/MapCategoryManagement';
import FeaturedMapsManagement from './pages/Admin/SpatialCanvas/FeaturedMapsManagement';
import CertificateUpload from './pages/Admin/Certificate/CertificateUpload';
import CertificateCategoryManagement from './pages/Admin/Certificate/CertificateCategoryManagement';
import FeaturedCertificatesManagement from './pages/Admin/Certificate/FeaturedCertificatesManagement';
import ExperienceManagement from './pages/Admin/Experience/ExperienceManagement';
import GalleryManagement from './pages/Admin/ProjectGallery/GalleryManagement';
import ProductManagement from './pages/Admin/Shop/ProductManagement';
import ShopCategoryManagement from './pages/Admin/Shop/CategoryManagement';
import CouponManagement from './pages/Admin/Shop/CouponManagement';
import OrderManagement from './pages/Admin/Shop/OrderManagement';
import NewsletterManagement from './pages/Admin/Newsletter/NewsletterManagement';
import ShortlinkManagement from './pages/Admin/ShortlinkManagement/ShortlinkManagement';
import Login from './pages/Admin/Login/Login';
import FloatingCart from './components/FloatingCart/FloatingCart';
import ShortlinkRedirect from './components/ShortlinkRedirect/ShortlinkRedirect';
import Footer from './components/Footer/Footer';
import { databaseService } from './lib/appwrite';
import { loadAllCustomFonts } from './utils/fontLoader';
import './App.css';

// Lazy load other sections for better performance
const About = lazy(() => import('./components/About/About'));
const SkilledOn = lazy(() => import('./components/SkilledOn/SkilledOn'));
const EducationalQualification = lazy(() => import('./components/EducationalQualification/EducationalQualification'));
const Projects = lazy(() => import('./components/Projects/Projects'));
const Research = lazy(() => import('./components/Research/Research'));
const Contact = lazy(() => import('./components/Contact/Contact'));
const SpatialCanvas = lazy(() => import('./components/SpatialCanvas/SpatialCanvas'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const SpatialCanvasPage = lazy(() => import('./pages/SpatialCanvasPage'));
const ProjectPage = lazy(() => import('./pages/ProjectPage'));

// Blog components
const Blog = lazy(() => import('./components/Blog/Blog'));
const BlogsPage = lazy(() => import('./pages/BlogsPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));

// Map page
const MapPage = lazy(() => import('./pages/MapPage'));

// Certificate components
const Certificate = lazy(() => import('./components/Certificate/Certificate'));
const CertificatesPage = lazy(() => import('./pages/CertificatesPage'));
const CertificatePage = lazy(() => import('./pages/CertificatePage'));

// Experience component
const Experience = lazy(() => import('./components/Experience/Experience'));

// Project Gallery components
const ProjectGallery = lazy(() => import('./components/ProjectGallery/ProjectGallery'));
const ProjectGalleryPage = lazy(() => import('./pages/ProjectGalleryPage'));

// Contact page
const ContactPage = lazy(() => import('./pages/ContactPage'));

// About page
const AboutPage = lazy(() => import('./pages/AboutPage'));

// Prefetch function to load pages in background after homepage loads
const prefetchPages = () => {
  // Wait a bit after homepage loads, then prefetch other pages
  setTimeout(() => {
    // Prefetch main navigation pages
    import('./pages/AboutPage');
    import('./pages/ProjectsPage');
    import('./pages/ContactPage');
  }, 2000);
  
  setTimeout(() => {
    // Prefetch secondary pages
    import('./pages/SpatialCanvasPage');
    import('./pages/CertificatesPage');
    import('./pages/BlogsPage');
    import('./pages/ProjectGalleryPage');
  }, 4000);
  
  setTimeout(() => {
    // Prefetch shop pages
    import('./pages/ShopPage');
  }, 6000);
};

// Shop components
const Shop = lazy(() => import('./components/Shop/Shop'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));

// Dashboard components
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const OrderStatus = lazy(() => import('./pages/Dashboard/OrderStatus'));
const Support = lazy(() => import('./pages/Dashboard/Support'));

function Portfolio() {
  // Loader disabled - set to false immediately
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Loader is disabled, just prefetch pages
    prefetchPages();
  }, []);

  // Save and restore scroll position on refresh
  useEffect(() => {
    // Save scroll position before page unload
    const saveScrollPosition = () => {
      sessionStorage.setItem('scrollPosition', window.scrollY.toString());
    };

    window.addEventListener('beforeunload', saveScrollPosition);

    // Restore scroll position after content loads
    const restoreScrollPosition = () => {
      const savedPosition = sessionStorage.getItem('scrollPosition');
      if (savedPosition && !isLoading) {
        // Wait a bit for content to render
        setTimeout(() => {
          window.scrollTo({
            top: parseInt(savedPosition, 10),
            behavior: 'instant'
          });
          // Clear the saved position after restoring
          sessionStorage.removeItem('scrollPosition');
        }, 100);
      }
    };

    if (!isLoading) {
      // Prefetch other pages in background after homepage loads
      prefetchPages();
      restoreScrollPosition();
    }

    return () => {
      window.removeEventListener('beforeunload', saveScrollPosition);
    };
  }, [isLoading]);

  return (
    <div 
      className={`App relative overflow-hidden ${isLoading ? 'app-loading' : 'app-loaded'}`}
      style={{ 
        background: '#FFFAEB',
        backgroundImage: `linear-gradient(rgba(16, 86, 82, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 86, 82, 0.05) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
        backgroundPosition: '0 0',
        minHeight: '100vh'
      }}
    >

      {isLoading && <Loader />}
      <Header />
      {!isLoading && <FloatingNav />}
      <div className={`relative z-10 ${isLoading ? 'content-hidden' : 'content-visible'}`}>
        <Hero />
        <Suspense fallback={<div className="min-h-screen" />}>
          <SkilledOn />
          <EducationalQualification />
          <About />
          {/* Research section - temporarily disabled, will be designed later */}
          {/* <Research /> */}
          <Projects />
          <SpatialCanvas />
          <Certificate />
          <Experience />
          <ProjectGallery />
          <Blog />
          <Shop />
          <Contact />
        </Suspense>
        <Footer />
      </div>
    </div>
  );
}

function App() {
  // Load site settings (title, favicon, and custom fonts) for ALL routes
  useEffect(() => {
    const loadSiteSettings = async () => {
      try {
        const SETTINGS_COLLECTION = 'site_settings';
        const result = await databaseService.listDocuments(SETTINGS_COLLECTION);
        if (result.success && result.data.documents.length > 0) {
          const settings = result.data.documents[0];
          
          // Update site title
          if (settings.siteTitle) {
            document.title = settings.siteTitle;
          } else {
            document.title = 'GIS & Remote Sensing Specialist Authoy Biswas Bidda';
          }
          
          // Update favicon
          if (settings.faviconUrl) {
            updateFavicon(settings.faviconUrl);
          }
        } else {
          document.title = 'GIS & Remote Sensing Specialist Authoy Biswas Bidda';
        }
      } catch (error) {
        console.error('Error loading site settings:', error);
        document.title = 'GIS & Remote Sensing Specialist Authoy Biswas Bidda';
      }
    };

    // Load custom fonts
    const loadCustomFonts = async () => {
      try {
        const result = await databaseService.listDocuments('custom_fonts');
        if (result.success && result.data.documents.length > 0) {
          loadAllCustomFonts(result.data.documents);
        }
      } catch (error) {
        console.error('Error loading custom fonts:', error);
      }
    };

    const updateFavicon = (url) => {
      if (!url || typeof url !== 'string') {
        console.error('Invalid favicon URL:', url);
        return;
      }

      // Remove all existing favicon links
      const existingLinks = document.querySelectorAll("link[rel*='icon'], link[rel='shortcut icon']");
      existingLinks.forEach(link => link.remove());

      // Detect file type from URL
      const urlLower = url.toLowerCase();
      let type = 'image/x-icon';
      if (urlLower.includes('.png')) {
        type = 'image/png';
      } else if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) {
        type = 'image/jpeg';
      } else if (urlLower.includes('.svg')) {
        type = 'image/svg+xml';
      } else if (urlLower.includes('.webp')) {
        type = 'image/webp';
      } else if (urlLower.includes('.ico')) {
        type = 'image/x-icon';
      }

      // Create new favicon links (multiple for browser compatibility)
      const link1 = document.createElement('link');
      link1.rel = 'icon';
      link1.type = type;
      link1.href = url;
      document.head.appendChild(link1);

      const link2 = document.createElement('link');
      link2.rel = 'shortcut icon';
      link2.type = type;
      link2.href = url;
      document.head.appendChild(link2);

      // Force browser to reload favicon by adding timestamp
      const link3 = document.createElement('link');
      link3.rel = 'icon';
      link3.type = type;
      link3.href = `${url}?t=${Date.now()}`;
      document.head.appendChild(link3);
    };

    loadSiteSettings();
    loadCustomFonts();
  }, []);

  // Prevent automatic scroll restoration by the browser
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <FontProvider>
          <CartProvider>
            <ShopAuthProvider>
            <BrowserRouter>
            <Routes>
            <Route path="/admin/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminHome />} />
              <Route path="menubar" element={<Menubar />} />
              <Route path="header-section" element={<HeaderSection />} />
              <Route path="about-me" element={<AboutMe />} />
              <Route path="projects" element={<ProjectManagement />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="blogs" element={<BlogManagement />} />
              <Route path="blog-categories" element={<BlogCategoryManagement />} />
              <Route path="contact-settings" element={<ContactSettings />} />
              <Route path="contact-responses" element={<ContactResponses />} />
              <Route path="map-upload" element={<MapUpload />} />
              <Route path="map-categories" element={<MapCategoryManagement />} />
              <Route path="featured-maps" element={<FeaturedMapsManagement />} />
              <Route path="certificate-upload" element={<CertificateUpload />} />
              <Route path="certificate-categories" element={<CertificateCategoryManagement />} />
              <Route path="featured-certificates" element={<FeaturedCertificatesManagement />} />
              <Route path="experiences" element={<ExperienceManagement />} />
              <Route path="project-gallery" element={<GalleryManagement />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="shop-categories" element={<ShopCategoryManagement />} />
              <Route path="coupons" element={<CouponManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="newsletter" element={<NewsletterManagement />} />
              <Route path="shortlinks" element={<ShortlinkManagement />} />
              <Route path="settings" element={<Settings />} />
              <Route path="font-management" element={<FontManagement />} />
            </Route>
            <Route path="/projects" element={
              <Suspense fallback={<div className="min-h-screen" />}>
                <ProjectsPage />
              </Suspense>
            } />
            {/* Blog Page Routes */}
            <Route path="/blogs" element={
              <Suspense fallback={<div className="min-h-screen" />}>
                <BlogsPage />
              </Suspense>
            } />
            {/* Spatial Canvas Page Route */}
            <Route path="/spatial-canvas" element={
              <Suspense fallback={<div className="min-h-screen" />}>
                <SpatialCanvasPage />
              </Suspense>
            } />
            {/* Single Map Page Route */}
            <Route path="/map/:slug" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#105652' }}></div></div>}>
                <MapPage />
              </Suspense>
            } />
            {/* Certificate Routes */}
            <Route path="/certificates" element={
              <Suspense fallback={<div className="min-h-screen" />}>
                <CertificatesPage />
              </Suspense>
            } />
            <Route path="/certificate/:slug" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#dc2626' }}></div></div>}>
                <CertificatePage />
              </Suspense>
            } />
            {/* Project Gallery Route */}
            <Route path="/project-gallery" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#ec4899' }}></div></div>}>
                <ProjectGalleryPage />
              </Suspense>
            } />
            {/* Contact Page Route */}
            <Route path="/contact" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#105652' }}></div></div>}>
                <ContactPage />
              </Suspense>
            } />
            {/* About Page Route */}
            <Route path="/about" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#105652' }}></div></div>}>
                <AboutPage />
              </Suspense>
            } />
            {/* Shop Route */}
            <Route path="/shop" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#105652' }}></div></div>}>
                <ShopPage />
              </Suspense>
            } />
            {/* Cart Route */}
            <Route path="/cart" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#105652' }}></div></div>}>
                <CartPage />
              </Suspense>
            } />
            {/* Checkout Route */}
            <Route path="/checkout" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#105652' }}></div></div>}>
                <CheckoutPage />
              </Suspense>
            } />
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#105652' }}></div></div>}>
                <Dashboard />
              </Suspense>
            } />
            <Route path="/dashboard/order/:orderId" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#105652' }}></div></div>}>
                <OrderStatus />
              </Suspense>
            } />
            <Route path="/dashboard/support" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#105652' }}></div></div>}>
                <Support />
              </Suspense>
            } />
            <Route path="/blog/:slug" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#105652' }}></div></div>}>
                <BlogPage />
              </Suspense>
            } />
            {/* Project Page Routes - with and without prefix */}
            <Route path="/project/:slug" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#105652' }}></div></div>}>
                <ProjectPage />
              </Suspense>
            } />
            {/* Shortlink redirect handler - must come before catch-all */}
            {/* Handles both simple paths and paths with prefixes like group1/link */}
            <Route path="/:path" element={<ShortlinkRedirect />} />
            <Route path="/:prefix/:path" element={<ShortlinkRedirect />} />
            <Route path="/*" element={<Portfolio />} />
            </Routes>
            <FloatingCart />
            </BrowserRouter>
            </ShopAuthProvider>
          </CartProvider>
        </FontProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

