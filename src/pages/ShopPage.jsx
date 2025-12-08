import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, User, LogIn, UserPlus, LogOut, LayoutDashboard, Menu, Mail, Lock, Sparkles } from 'lucide-react';
import ProductCard from '../components/Shop/ProductCard';
import ProductModal from '../components/Shop/ProductModal';
import OTPVerification from '../components/OTPVerification/OTPVerification';
import PageWrapper from '../components/PageWrapper/PageWrapper';
import Footer from '../components/Footer/Footer';
import { databaseService } from '../lib/appwrite';
import { useCart } from '../contexts/CartContext';
import { useShopAuth } from '../contexts/ShopAuthContext';
import siteLogo from '../assets/logo.png';

const SHOP_COLLECTION = 'products';
const MENUBAR_COLLECTION = 'menubar_settings';

export default function ShopPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpId, setOtpId] = useState('');
  const [tempAuthData, setTempAuthData] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [showNewOtpNotification, setShowNewOtpNotification] = useState(false);
  const authDropdownRef = useRef(null);
  const { addToCart } = useCart();
  const { customer, isAuthenticated, logout, signUp, completeSignUp, login, resendOTP } = useShopAuth();

  // NavMenu state - Hardcoded to prevent flickering
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navLinks = [
    { name: 'Home', href: '/', enabled: true },
    { name: 'About Me', href: '/about', enabled: true },
    { name: 'Project', href: '/projects', enabled: true },
    { name: 'Spatial Canvas', href: '/spatial-canvas', enabled: true },
    { name: 'Certificate', href: '/certificates', enabled: true },
    { name: 'Blog', href: '/blogs', enabled: true },
    { name: 'Experience', href: '/about#experience', enabled: true },
    { name: 'Galleries', href: '/project-gallery', enabled: true },
    { name: 'Shop', href: '/shop', enabled: true },
    { name: 'Contact', href: '/contact', enabled: true },
  ];
  const [menuItemsFont, setMenuItemsFont] = useState("'Poppins', sans-serif");
  const [cvButton, setCvButton] = useState({ text: 'Get My CV', link: '#' });
  const [cvButtonFont, setCvButtonFont] = useState("'Poppins', sans-serif");

  useEffect(() => {
    loadProducts();
    loadMenubarSettings();
  }, []);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close auth dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (authDropdownRef.current && !authDropdownRef.current.contains(event.target)) {
        setShowAuthDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadMenubarSettings = async () => {
    try {
      const result = await databaseService.listDocuments(MENUBAR_COLLECTION);
      if (result.success && result.data.documents.length > 0) {
        const settings = result.data.documents[0];
        // Menu items and logo are hardcoded to prevent flickering
        // Only load fonts and CV button from database
        if (settings.menuItemsFont) setMenuItemsFont(settings.menuItemsFont);
        if (settings.cvButton) setCvButton(JSON.parse(settings.cvButton));
        if (settings.cvButtonFont) setCvButtonFont(settings.cvButtonFont);
      }
    } catch (error) {
      console.error('Error loading menubar settings:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const result = await databaseService.listDocuments(SHOP_COLLECTION);
      if (result.success && result.data.documents.length > 0) {
        const allProducts = result.data.documents.map(doc => ({
          id: doc.$id,
          name: doc.name,
          price: doc.price,
          discountedPrice: doc.discountedPrice,
          onSale: doc.onSale === true,
          imageUrl: doc.imageUrl,
          fullImageUrl: doc.fullImageUrl || doc.imageUrl,
          featured: doc.featured,
          category: doc.category || '',
          tags: doc.tags || [],
          description: doc.description || '',
          additionalInfo: doc.additionalInfo || '',
          galleryUrls: doc.galleryUrls || [],
        }));
        setProducts(allProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRelatedProducts = (product) => {
    return products.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4);
  };

  const handleProductClick = (product) => setSelectedProduct(product);
  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    // Handle hash-only links
    if (href.startsWith('#')) {
      navigate('/' + href);
      return;
    }
    
    // Handle page links with hash (e.g., /about#experience)
    if (href.includes('#')) {
      // Navigate with the full path including hash
      navigate(href);
      return;
    }
    
    // Use React Router for instant navigation
    navigate(href);
  };

  const handleLogout = () => {
    logout();
    setShowAuthDropdown(false);
  };

  const openAuthModal = (signUpMode = false) => {
    setIsSignUp(signUpMode);
    setAuthForm({ name: '', email: '', password: '' });
    setAuthError('');
    setShowAuthDropdown(false);
    setShowAuthModal(true);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (isSignUp) {
        if (!authForm.name || !authForm.email || !authForm.password) {
          setAuthError('Please fill in all fields');
          setAuthLoading(false);
          return;
        }
        if (authForm.password.length < 6) {
          setAuthError('Password must be at least 6 characters');
          setAuthLoading(false);
          return;
        }

        const result = await signUp(authForm.name, authForm.email, authForm.password);
        
        if (result.success && result.requiresVerification) {
          setOtpId(result.otpId);
          setTempAuthData(result.tempData);
          setShowAuthModal(false);
          setShowOTPModal(true);
          setShowNewOtpNotification(false);
        } else if (result.requiresVerification) {
          // Account exists but not verified (from signup error)
          setOtpId(result.otpId);
          setTempAuthData({ email: authForm.email, name: authForm.name });
          setShowAuthModal(false);
          setShowOTPModal(true);
          setShowNewOtpNotification(result.newOtpSent || false);
        } else if (!result.success) {
          setAuthError(result.error);
        }
      } else {
        if (!authForm.email || !authForm.password) {
          setAuthError('Please enter email and password');
          setAuthLoading(false);
          return;
        }

        const result = await login(authForm.email, authForm.password);
        
        if (result.requiresVerification) {
          // User has unverified OTP, show OTP modal
          setOtpId(result.otpId);
          setTempAuthData({ email: authForm.email, name: '' });
          setShowOTPModal(true);
          setShowNewOtpNotification(true); // New OTP was sent during login
        } else if (result.success) {
          setShowAuthModal(false);
          setAuthForm({ name: '', email: '', password: '' });
        } else {
          setAuthError(result.error);
        }
      }
    } catch (error) {
      setAuthError('An error occurred. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOTPVerify = async (otp) => {
    setOtpLoading(true);
    try {
      const result = await completeSignUp(tempAuthData, otpId, otp);
      
      if (result.success) {
        // Close all modals
        setShowOTPModal(false);
        setShowAuthModal(false);
        setTempAuthData(null);
        setOtpId('');
        setAuthForm({ name: '', email: '', password: '' });
        
        // Navigate to dashboard after successful verification
        setTimeout(() => {
          navigate('/dashboard');
        }, 100);
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('Verification failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (tempAuthData) {
      const result = await resendOTP(tempAuthData.email, tempAuthData.name);
      if (result.success) {
        setOtpId(result.otpId);
        setShowNewOtpNotification(true);
      }
    }
  };

  // Filter products by search query and sale filter
  const filteredProducts = products.filter(product => {
    if (filter === 'sale' && !product.onSale) return false;
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    const nameMatch = product.name?.toLowerCase().includes(query);
    const categoryMatch = product.category?.toLowerCase().includes(query);
    const tagsMatch = product.tags?.some(tag => tag.toLowerCase().includes(query));
    
    return nameMatch || categoryMatch || tagsMatch;
  });

  return (
    <PageWrapper showHeader={false} showFooter={false}>
      {/* Wrapper to ensure footer stays at bottom */}
      <div className="flex flex-col min-h-screen">
      {/* NavMenu Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-300 ${
          isScrolled
            ? 'bg-white/20 backdrop-blur-lg shadow-md border-b border-gray-100/50'
            : 'bg-white/20 backdrop-blur-lg'
        }`}
      >
        <nav className="container mx-auto px-6 py-2">
          <div className="flex items-center h-12">
            {/* Logo - Hardcoded */}
            <Link
              to="/"
              className="flex items-center group flex-shrink-0 h-full"
            >
              <img
                src={siteLogo}
                alt="Parvej Zero to One"
                className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:flex items-center gap-6 flex-1 justify-center px-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-gray-700 hover:text-[#2596be] font-medium transition-colors duration-300 relative group whitespace-nowrap"
                  style={{ fontFamily: menuItemsFont }}
                >
                  {link.name}
                  <span
                    className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                    style={{ background: '#2596be' }}
                  />
                </a>
              ))}
            </div>

            {/* Get My CV Button - Right Aligned */}
            <div className="hidden lg:block flex-shrink-0">
              <a
                href={cvButton.link}
                target="_blank"
                rel="noopener noreferrer"
                className="cv-button inline-block"
                style={{ fontFamily: cvButtonFont }}
              >
                {cvButton.text}
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-md ml-auto"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" style={{ color: '#2596be' }} />
              ) : (
                <Menu className="w-6 h-6" style={{ color: '#2596be' }} />
              )}
            </button>


          </div>

          {/* Mobile Menu */}
          <div
            className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              isMobileMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="block py-2 text-gray-700 hover:text-[#2596be] font-medium transition-colors duration-300"
                  style={{ fontFamily: menuItemsFont }}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* Gradient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            background: '#3ba8d1',
            width: '600px',
            height: '600px',
            top: '20%',
            right: '-10%',
            animation: 'float 35s ease-in-out infinite',
            opacity: 0.1,
          }}
        />
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            background: '#2596be',
            width: '400px',
            height: '400px',
            bottom: '10%',
            left: '-5%',
            animation: 'float 28s ease-in-out infinite reverse',
            opacity: 0.08,
          }}
        />
      </div>

      {/* Floating Search & Login - Below NavMenu */}
      <div className="fixed top-20 right-6 z-50 flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={`
              bg-white shadow-lg border border-gray-200 px-4 py-2.5 pl-11 rounded-xl
              transition-all duration-300 outline-none
              focus:border-[#2596be] focus:shadow-xl focus:ring-2 focus:ring-[#2596be]/20
              ${isSearchFocused ? 'w-64 sm:w-72' : 'w-48 sm:w-56'}
            `}
            style={{ fontSize: '0.95rem' }}
          />
          <Search 
            className={`w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
              isSearchFocused ? 'text-[#2596be]' : 'text-gray-400'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Login/User Icon */}
        <div className="relative" ref={authDropdownRef}>
          <button
            onClick={() => setShowAuthDropdown(!showAuthDropdown)}
            className={`
              w-11 h-11 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300
              ${isAuthenticated 
                ? 'bg-[#2596be] text-white hover:bg-[#1d7a9a]' 
                : 'bg-white text-gray-600 hover:text-[#2596be] hover:shadow-xl border border-gray-200'
              }
            `}
          >
            <User className="w-5 h-5" />
          </button>

          {/* Auth Dropdown */}
          {showAuthDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn">
              {isAuthenticated ? (
                <>
                  {/* User Info */}
                  <div className="px-4 py-3 bg-gradient-to-r from-[#2596be] to-[#3ba8d1]">
                    <p className="text-white text-sm font-medium truncate">{customer?.name || 'User'}</p>
                    <p className="text-white/70 text-xs truncate">{customer?.email}</p>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={() => {
                        navigate('/dashboard');
                        setShowAuthDropdown(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#2596be]" />
                      My Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">Welcome!</p>
                    <p className="text-xs text-gray-500">Sign in to track your orders</p>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={() => openAuthModal(false)}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <LogIn className="w-4 h-4 text-[#2596be]" />
                      Sign In
                    </button>
                    <button
                      onClick={() => openAuthModal(true)}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <UserPlus className="w-4 h-4 text-[#3ba8d1]" />
                      Create Account
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - flex-grow ensures it takes remaining space */}
      <div className="flex-grow container mx-auto px-6 pt-36 pb-10 relative z-10">
        {/* Filter Tabs */}
        <div className="flex justify-center gap-4 mb-10">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
              filter === 'all'
                ? 'bg-[#2596be] text-white shadow-lg'
                : 'bg-white text-[#2596be] border border-[#2596be] hover:bg-[#2596be]/10'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setFilter('sale')}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
              filter === 'sale'
                ? 'bg-[#ef4444] text-white shadow-lg'
                : 'bg-white text-[#ef4444] border border-[#ef4444] hover:bg-[#ef4444]/10'
            }`}
          >
            On Sale
          </button>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="text-center mb-6">
            <p className="text-gray-600">
              {filteredProducts.length > 0 ? (
                <>Showing results for "<span className="font-medium text-[#2596be]">{searchQuery}</span>"</>
              ) : (
                <>No results found for "<span className="font-medium">{searchQuery}</span>"</>
              )}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be]"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchQuery 
                ? 'No products match your search. Try different keywords.'
                : filter === 'sale' 
                  ? 'No products on sale right now.' 
                  : 'No products available.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 text-[#2596be] hover:bg-[#2596be]/10 rounded-lg transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Products Grid */}
        {!loading && filteredProducts.length > 0 && (
          <div className="flex flex-wrap justify-center gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="transform transition-all duration-500"
                style={{
                  animationDelay: `${index * 80}ms`,
                  animation: 'fadeInUp 0.5s ease-out forwards',
                }}
              >
                <ProductCard 
                  product={product} 
                  onClick={() => handleProductClick(product)}
                  onAddToCart={() => handleAddToCart({ ...product, quantity: 1 })}
                />
              </div>
            ))}
          </div>
        )}

        {/* Product Count */}
        {!loading && filteredProducts.length > 0 && (
          <p className="text-center text-gray-500 mt-10">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        )}
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          relatedProducts={getRelatedProducts(selectedProduct)}
          onAddToCart={handleAddToCart}
          onProductClick={handleProductClick}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
          onClick={() => setShowAuthModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative Header */}
            <div className="relative bg-gradient-to-r from-[#2596be] to-[#3ba8d1] px-6 py-8 text-center">
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-white/80 text-sm mt-1">
                {isSignUp ? 'Sign up to track your orders' : 'Sign in to your account'}
              </p>
            </div>

            {/* Auth Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => { setIsSignUp(false); setAuthError(''); }}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                  !isSignUp ? 'text-[#2596be]' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign In
                {!isSignUp && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2596be]" />
                )}
              </button>
              <button
                onClick={() => { setIsSignUp(true); setAuthError(''); }}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                  isSignUp ? 'text-[#2596be]' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign Up
                {isSignUp && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2596be]" />
                )}
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAuth} className="p-6 space-y-4">
              {isSignUp && (
                <div className="relative">
                  <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2596be] focus:bg-white transition-all"
                    required={isSignUp}
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2596be] focus:bg-white transition-all"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2596be] focus:bg-white transition-all"
                  required
                />
              </div>

              {authError && (
                <p className="text-red-500 text-xs text-center">{authError}</p>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 bg-gradient-to-r from-[#2596be] to-[#3ba8d1] text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <OTPVerification
          email={tempAuthData?.email || ''}
          onVerify={handleOTPVerify}
          onClose={() => {
            setShowOTPModal(false);
            setTempAuthData(null);
            setOtpId('');
            setShowNewOtpNotification(false);
          }}
          onResend={handleResendOTP}
          isLoading={otpLoading}
          showNewOtpNotification={showNewOtpNotification}
        />
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>

      {/* Footer - always at bottom due to flex layout */}
      <Footer />
      </div>
    </PageWrapper>
  );
}
