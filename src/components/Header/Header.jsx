import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { databaseService } from '../../lib/appwrite';
import siteLogo from '../../assets/logo.png';

// Hardcoded navigation links - prevents flickering on page load
const HARDCODED_NAV_LINKS = [
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

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Use hardcoded nav links - no state updates from database to prevent flickering
  const navLinks = HARDCODED_NAV_LINKS;
  const [menuItemsFont, setMenuItemsFont] = useState("'Poppins', sans-serif");
  // Logo is hardcoded - no database sync needed
  const [cvButton, setCvButton] = useState({ text: 'Get My CV', link: '#' });
  const [cvButtonFont, setCvButtonFont] = useState("'Poppins', sans-serif");

  const navigate = useNavigate();
  const location = useLocation();
  const MENUBAR_COLLECTION = 'menubar_settings';

  useEffect(() => {
    loadMenubarSettings();
  }, []);

  const loadMenubarSettings = async () => {
    try {
      console.log('🔍 Loading menubar settings from collection:', MENUBAR_COLLECTION);
      const result = await databaseService.listDocuments(MENUBAR_COLLECTION);
      
      if (result.success) {
        console.log('✅ Database query successful');
        console.log('   Documents found:', result.data.documents.length);
        
        if (result.data.documents.length > 0) {
          const settings = result.data.documents[0];
          console.log('✅ Settings loaded from database');
          
          // NOTE: Menu items are hardcoded to prevent flickering
          // Only load fonts, logo, and CV button from database
          if (settings.menuItemsFont) {
            setMenuItemsFont(settings.menuItemsFont);
            console.log('   Menu items font loaded');
          }
          // Logo is hardcoded - skipping database sync
          if (settings.cvButton) {
            setCvButton(JSON.parse(settings.cvButton));
            console.log('   CV button loaded');
          }
          if (settings.cvButtonFont) {
            setCvButtonFont(settings.cvButtonFont);
            console.log('   CV button font loaded');
          }
        } else {
          console.warn('⚠️ No documents found in collection - using hardcoded values');
        }
      } else {
        console.error('❌ Database query failed:', result.error);
        console.warn('⚠️ Using hardcoded menu items');
      }
    } catch (error) {
      console.error('❌ Error loading menubar settings:', error);
      console.warn('⚠️ Using hardcoded menu items');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const handleNavClick = useCallback((e, href) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    // Handle hash-only links (scroll to section on homepage)
    if (href.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate('/' + href);
      } else {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      return;
    }

    // Handle page links with hash (e.g., /about#experience)
    if (href.includes('#')) {
      // Navigate with the full path including hash
      navigate(href);
      return;
    }

    // Handle regular page links using React Router (instant navigation)
    navigate(href);
  }, [navigate, location.pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-300 ${
        isScrolled
          ? 'bg-white/20 backdrop-blur-lg shadow-md border-b border-gray-100/50'
          : 'bg-white/20 backdrop-blur-lg'
      }`}
    >
      <nav className="container mx-auto px-6 py-2">
        <div className="flex items-center h-12">
          {/* Logo - Hardcoded for instant load */}
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
          <div className="hidden lg:block flex-shrink-0 ml-auto">
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
            {/* Mobile CV Button */}
            <a
              href={cvButton.link}
              target="_blank"
              rel="noopener noreferrer"
              className="cv-button inline-block mt-4"
              style={{ fontFamily: cvButtonFont }}
            >
              {cvButton.text}
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}

