import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Menu, ChevronDown, ChevronRight, LogOut, Settings as SettingsIcon, User, FileText, Briefcase, Tag, PanelLeftClose, PanelLeftOpen, ArrowLeft, BookOpen, FolderOpen, Mail, MessageSquare, Map, Upload, Star, Award, Trophy, Image, ShoppingBag, Ticket, ClipboardList, Newspaper, Link2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isHomeExpanded, setIsHomeExpanded] = useState(
    location.pathname.includes('/menubar') || location.pathname.includes('/header-section') || location.pathname.includes('/about-me')
  );
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(
    location.pathname.includes('/projects') || location.pathname.includes('/categories')
  );
  const [isBlogsExpanded, setIsBlogsExpanded] = useState(
    location.pathname.includes('/blogs') || location.pathname.includes('/blog-categories')
  );
  const [isContactExpanded, setIsContactExpanded] = useState(
    location.pathname.includes('/contact-settings') || location.pathname.includes('/contact-responses')
  );
  const [isSpatialExpanded, setIsSpatialExpanded] = useState(
    location.pathname.includes('/spatial-canvas') || location.pathname.includes('/map-upload') || location.pathname.includes('/map-categories') || location.pathname.includes('/featured-maps')
  );
  const [isCertificateExpanded, setIsCertificateExpanded] = useState(
    location.pathname.includes('/certificate-upload') || location.pathname.includes('/certificate-categories') || location.pathname.includes('/featured-certificates')
  );
  const [isExperienceExpanded, setIsExperienceExpanded] = useState(
    location.pathname.includes('/experiences')
  );
  const [isShopExpanded, setIsShopExpanded] = useState(
    location.pathname.includes('/products') || location.pathname.includes('/shop-categories') || location.pathname.includes('/coupons') || location.pathname.includes('/orders')
  );
  const [isShortlinksExpanded, setIsShortlinksExpanded] = useState(
    location.pathname.includes('/shortlinks')
  );

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isHomeActive = (location.pathname === '/admin' || location.pathname === '/admin/') || 
    location.pathname.includes('/menubar') || 
    location.pathname.includes('/header-section') || 
    location.pathname.includes('/about-me');
  const isMenubarActive = isActive('/admin/menubar');
  const isHeaderSectionActive = isActive('/admin/header-section');
  const isAboutMeActive = isActive('/admin/about-me');
  const isProjectsActive = isActive('/admin/projects') && !location.pathname.includes('/categories');
  const isCategoriesActive = isActive('/admin/categories');
  const isBlogsActive = isActive('/admin/blogs') && !location.pathname.includes('/blog-categories');
  const isBlogCategoriesActive = isActive('/admin/blog-categories');
  const isContactSettingsActive = isActive('/admin/contact-settings');
  const isContactResponsesActive = isActive('/admin/contact-responses');
  const isMapUploadActive = isActive('/admin/map-upload');
  const isMapCategoriesActive = isActive('/admin/map-categories');
  const isFeaturedMapsActive = isActive('/admin/featured-maps');
  const isCertificateUploadActive = isActive('/admin/certificate-upload');
  const isCertificateCategoriesActive = isActive('/admin/certificate-categories');
  const isFeaturedCertificatesActive = isActive('/admin/featured-certificates');
  const isExperiencesActive = isActive('/admin/experiences');
  const isProjectGalleryActive = isActive('/admin/project-gallery');
  const isProductsActive = isActive('/admin/products');
  const isShopCategoriesActive = isActive('/admin/shop-categories');
  const isCouponsActive = isActive('/admin/coupons');
  const isOrdersActive = isActive('/admin/orders');
  const isSettingsActive = isActive('/admin/settings');
  const isNewsletterActive = isActive('/admin/newsletter');
  const isShortlinksActive = isActive('/admin/shortlinks');

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-white shadow-lg border-r border-gray-200 flex flex-col transition-all duration-300 ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}>

        
        {/* Collapse/Expand Button */}
        <div className="px-4 py-2 border-b border-gray-200">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <>
                <PanelLeftClose className="w-5 h-5" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
        <nav className="px-4 space-y-2 flex-1 overflow-y-auto">
          {/* Home with submenu */}
          <div>
            <button
              onClick={() => !isSidebarCollapsed && setIsHomeExpanded(!isHomeExpanded)}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} gap-3 px-4 py-3 rounded-lg transition-colors ${
                isHomeActive
                  ? 'bg-[#2596be] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={isSidebarCollapsed ? 'Home' : ''}
            >
              <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                <Home className="w-5 h-5" />
                {!isSidebarCollapsed && <span>Home</span>}
              </div>
              {!isSidebarCollapsed && (isHomeExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              ))}
            </button>
            {/* Submenu */}
            {isHomeExpanded && !isSidebarCollapsed && (
              <div className="ml-4 mt-2 space-y-1">
                <Link
                  to="/admin/menubar"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isMenubarActive
                      ? 'bg-[#2596be] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Menu className="w-4 h-4" />
                  <span>Menubar</span>
                </Link>
                <Link
                  to="/admin/header-section"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isHeaderSectionActive
                      ? 'bg-[#2596be] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Header Section</span>
                </Link>
                <Link
                  to="/admin/about-me"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isAboutMeActive
                      ? 'bg-[#2596be] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>About Me</span>
                </Link>
              </div>
            )}
          </div>

          {/* Projects with submenu */}
          <div>
            <button
              onClick={() => !isSidebarCollapsed && setIsProjectsExpanded(!isProjectsExpanded)}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} gap-3 px-4 py-3 rounded-lg transition-colors ${
                isProjectsActive || isCategoriesActive
                  ? 'bg-[#2596be] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={isSidebarCollapsed ? 'Projects' : ''}
            >
              <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                <Briefcase className="w-5 h-5" />
                {!isSidebarCollapsed && <span>Projects</span>}
              </div>
              {!isSidebarCollapsed && (isProjectsExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              ))}
            </button>
            {/* Submenu */}
            {isProjectsExpanded && !isSidebarCollapsed && (
              <div className="ml-4 mt-2 space-y-1">
                <Link
                  to="/admin/projects"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isProjectsActive
                      ? 'bg-[#2596be] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>All Projects</span>
                </Link>
                <Link
                  to="/admin/categories"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isCategoriesActive
                      ? 'bg-[#2596be] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Tag className="w-4 h-4" />
                  <span>Categories</span>
                </Link>
              </div>
            )}
          </div>

          {/* Blogs with submenu */}
          <div>
            <button
              onClick={() => !isSidebarCollapsed && setIsBlogsExpanded(!isBlogsExpanded)}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} gap-3 px-4 py-3 rounded-lg transition-colors ${
                isBlogsActive || isBlogCategoriesActive
                  ? 'bg-[#2596be] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={isSidebarCollapsed ? 'Blogs' : ''}
            >
              <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                <BookOpen className="w-5 h-5" />
                {!isSidebarCollapsed && <span>Blogs</span>}
              </div>
              {!isSidebarCollapsed && (isBlogsExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              ))}
            </button>
            {/* Submenu */}
            {isBlogsExpanded && !isSidebarCollapsed && (
              <div className="ml-4 mt-2 space-y-1">
                <Link
                  to="/admin/blogs"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isBlogsActive
                      ? 'bg-[#2596be] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>All Blogs</span>
                </Link>
                <Link
                  to="/admin/blog-categories"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isBlogCategoriesActive
                      ? 'bg-[#2596be] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Blog Categories</span>
                </Link>
              </div>
            )}
          </div>

          {/* Contact with submenu */}
          <div>
            <button
              onClick={() => !isSidebarCollapsed && setIsContactExpanded(!isContactExpanded)}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} gap-3 px-4 py-3 rounded-lg transition-colors ${
                isContactSettingsActive || isContactResponsesActive
                  ? 'bg-[#2596be] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={isSidebarCollapsed ? 'Contact' : ''}
            >
              <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                <Mail className="w-5 h-5" />
                {!isSidebarCollapsed && <span>Contact</span>}
              </div>
              {!isSidebarCollapsed && (isContactExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              ))}
            </button>
            {/* Submenu */}
            {isContactExpanded && !isSidebarCollapsed && (
              <div className="ml-4 mt-2 space-y-1">
                <Link
                  to="/admin/contact-settings"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isContactSettingsActive
                      ? 'bg-[#2596be] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <SettingsIcon className="w-4 h-4" />
                  <span>Contact Settings</span>
                </Link>
                <Link
                  to="/admin/contact-responses"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isContactResponsesActive
                      ? 'bg-[#2596be] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Form Responses</span>
                </Link>
              </div>
            )}
          </div>

          {/* Spatial Canvas with submenu */}
          <div>
            <button
              onClick={() => !isSidebarCollapsed && setIsSpatialExpanded(!isSpatialExpanded)}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} gap-3 px-4 py-3 rounded-lg transition-colors ${
                isMapUploadActive || isMapCategoriesActive || isFeaturedMapsActive
                  ? 'bg-[#2596be] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={isSidebarCollapsed ? 'Spatial Canvas' : ''}
            >
              <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                <Map className="w-5 h-5" />
                {!isSidebarCollapsed && <span>Spatial Canvas</span>}
              </div>
              {!isSidebarCollapsed && (isSpatialExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              ))}
            </button>
            {/* Submenu */}
            {isSpatialExpanded && !isSidebarCollapsed && (
              <div className="ml-4 mt-2 space-y-1">
                <Link
                  to="/admin/map-upload"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isMapUploadActive
                      ? 'bg-[#2596be] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Map Upload</span>
                </Link>
                <Link
                  to="/admin/map-categories"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isMapCategoriesActive
                      ? 'bg-[#2596be] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Tag className="w-4 h-4" />
                  <span>Map Categories</span>
                </Link>
                <Link
                  to="/admin/featured-maps"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isFeaturedMapsActive
                      ? 'bg-[#2596be] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Star className="w-4 h-4" />
                  <span>Featured Maps</span>
                </Link>
              </div>
            )}
          </div>

          {/* Certificate with submenu */}
          <div>
            <button
              onClick={() => !isSidebarCollapsed && setIsCertificateExpanded(!isCertificateExpanded)}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} gap-3 px-4 py-3 rounded-lg transition-colors ${
                isCertificateUploadActive || isCertificateCategoriesActive || isFeaturedCertificatesActive
                  ? 'bg-[#2596be] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={isSidebarCollapsed ? 'Certificate' : ''}
            >
              <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                <Award className="w-5 h-5" />
                {!isSidebarCollapsed && <span>Certificate</span>}
              </div>
              {!isSidebarCollapsed && (isCertificateExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              ))}
            </button>
            {/* Submenu */}
            {isCertificateExpanded && !isSidebarCollapsed && (
              <div className="ml-4 mt-2 space-y-1">
                <Link
                  to="/admin/certificate-upload"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isCertificateUploadActive
                      ? 'bg-[#2596be] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Certificate Upload</span>
                </Link>
                <Link
                  to="/admin/certificate-categories"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isCertificateCategoriesActive
                      ? 'bg-[#2596be] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Tag className="w-4 h-4" />
                  <span>Categories</span>
                </Link>
                <Link
                  to="/admin/featured-certificates"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isFeaturedCertificatesActive
                      ? 'bg-[#2596be] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Star className="w-4 h-4" />
                  <span>Featured</span>
                </Link>
              </div>
            )}
          </div>

          {/* Experience */}
          <Link
            to="/admin/experiences"
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : ''} gap-3 px-4 py-3 rounded-lg transition-colors ${
              isExperiencesActive
                ? 'bg-[#2596be] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title={isSidebarCollapsed ? 'Experience' : ''}
          >
            <Trophy className="w-5 h-5" />
            {!isSidebarCollapsed && <span>Experience</span>}
          </Link>

          {/* Project Gallery */}
          <Link
            to="/admin/project-gallery"
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : ''} gap-3 px-4 py-3 rounded-lg transition-colors ${
              isProjectGalleryActive
                ? 'bg-[#2596be] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title={isSidebarCollapsed ? 'Project Gallery' : ''}
          >
            <Image className="w-5 h-5" />
            {!isSidebarCollapsed && <span>Project Gallery</span>}
          </Link>

          {/* Shop with submenu */}
          <div>
            <button
              onClick={() => !isSidebarCollapsed && setIsShopExpanded(!isShopExpanded)}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} gap-3 px-4 py-3 rounded-lg transition-colors ${
                isProductsActive || isShopCategoriesActive || isCouponsActive || isOrdersActive
                  ? 'bg-[#2596be] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={isSidebarCollapsed ? 'Shop' : ''}
            >
              <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                <ShoppingBag className="w-5 h-5" />
                {!isSidebarCollapsed && <span>Shop</span>}
              </div>
              {!isSidebarCollapsed && (isShopExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              ))}
            </button>
            {/* Submenu */}
            {isShopExpanded && !isSidebarCollapsed && (
              <div className="ml-4 mt-2 space-y-1">
                <Link
                  to="/admin/products"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isProductsActive
                      ? 'bg-[#2596be] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>All Products</span>
                </Link>
                <Link
                  to="/admin/shop-categories"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isShopCategoriesActive
                      ? 'bg-[#2596be] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Tag className="w-4 h-4" />
                  <span>Categories</span>
                </Link>
                <Link
                  to="/admin/coupons"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isCouponsActive
                      ? 'bg-[#2596be] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  <span>Coupons</span>
                </Link>
                <Link
                  to="/admin/orders"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isOrdersActive
                      ? 'bg-[#2596be] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Orders</span>
                </Link>
              </div>
            )}
          </div>

          {/* Newsletter */}
          <Link
            to="/admin/newsletter"
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : ''} gap-3 px-4 py-3 rounded-lg transition-colors ${
              isNewsletterActive
                ? 'bg-[#2596be] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title={isSidebarCollapsed ? 'Newsletter' : ''}
          >
            <Newspaper className="w-5 h-5" />
            {!isSidebarCollapsed && <span>Newsletter</span>}
          </Link>

          {/* Shortlinks */}
          <Link
            to="/admin/shortlinks"
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : ''} gap-3 px-4 py-3 rounded-lg transition-colors ${
              isShortlinksActive
                ? 'bg-[#2596be] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title={isSidebarCollapsed ? 'Shortlinks' : ''}
          >
            <Link2 className="w-5 h-5" />
            {!isSidebarCollapsed && <span>Shortlinks</span>}
          </Link>

          {/* Settings - Separate menu item */}
          <Link
            to="/admin/settings"
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : ''} gap-3 px-4 py-3 rounded-lg transition-colors ${
              isSettingsActive
                ? 'bg-[#2596be] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title={isSidebarCollapsed ? 'Settings' : ''}
          >
            <SettingsIcon className="w-5 h-5" />
            {!isSidebarCollapsed && <span>Settings</span>}
          </Link>
          
        </nav>
        
        {/* Back to Site and Logout Buttons */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link
            to="/"
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : ''} gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors`}
            title={isSidebarCollapsed ? 'Back to Site' : ''}
          >
            <ArrowLeft className="w-5 h-5" />
            {!isSidebarCollapsed && <span>Back to Site</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : ''} gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors`}
            title={isSidebarCollapsed ? 'Logout' : ''}
          >
            <LogOut className="w-5 h-5" />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`p-8 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Outlet />
      </main>
    </div>
  );
}


