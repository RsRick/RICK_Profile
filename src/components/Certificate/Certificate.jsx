import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowRight, X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { databaseService } from '../../lib/appwrite';

const CERTIFICATES_COLLECTION = 'certificates';
const CERTIFICATE_CATEGORIES_COLLECTION = 'certificate_categories';

export default function Certificate() {
  const [certificates, setCertificates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [categoryColors, setCategoryColors] = useState({});
  const [modalCert, setModalCert] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [certsResult, categoriesResult] = await Promise.all([
        databaseService.listDocuments(CERTIFICATES_COLLECTION),
        databaseService.listDocuments(CERTIFICATE_CATEGORIES_COLLECTION)
      ]);

      if (certsResult.success) {
        setCertificates(certsResult.data.documents);
      }

      if (categoriesResult.success) {
        const cats = categoriesResult.data.documents.sort((a, b) => (a.order || 0) - (b.order || 0));
        setCategories(cats);
        const colorMap = {};
        cats.forEach(cat => { colorMap[cat.name] = cat.color; });
        setCategoryColors(colorMap);
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCerts = selectedCategory === 'All' 
    ? certificates.filter(c => c.featured).slice(0, 6) 
    : certificates.filter(c => c.category === selectedCategory && c.featured).slice(0, 6);

  // Open modal - this is called when clicking a certificate card
  const openModal = (cert, e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Opening modal for:', cert.title);
    setModalCert(cert);
    document.body.style.overflow = 'hidden';
  };

  // Close modal
  const closeModal = () => {
    console.log('Closing modal');
    setModalCert(null);
    document.body.style.overflow = 'auto';
  };

  // Navigate between certificates in modal
  const navigateModal = (direction) => {
    const currentIndex = filteredCerts.findIndex(c => c.$id === modalCert.$id);
    if (direction === 'prev' && currentIndex > 0) {
      setModalCert(filteredCerts[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < filteredCerts.length - 1) {
      setModalCert(filteredCerts[currentIndex + 1]);
    }
  };

  // Don't render if loading or no featured certificates
  if (loading) return null;
  
  const featuredCerts = certificates.filter(c => c.featured);
  if (featuredCerts.length === 0) return null;

  return (
    <section 
      id="certificate" 
      className="py-10 relative overflow-hidden"
      style={{ 
        background: '#FFFAEB',
        backgroundImage: `linear-gradient(rgba(16, 86, 82, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 86, 82, 0.05) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
      }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            background: '#1E8479',
            width: '500px',
            height: '500px',
            top: '10%',
            right: '-150px',
            animation: 'float 25s ease-in-out infinite',
            opacity: 0.1,
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Title */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold" style={{ color: '#105652' }}>Certificate</h2>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === 'All'
                  ? 'text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
              }`}
              style={{ backgroundColor: selectedCategory === 'All' ? '#105652' : undefined }}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.$id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === cat.name
                    ? 'text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
                }`}
                style={{ backgroundColor: selectedCategory === cat.name ? cat.color : undefined }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredCerts.map((cert, index) => (
            <button
              key={cert.$id}
              type="button"
              className="group cursor-pointer text-left w-full"
              onClick={(e) => openModal(cert, e)}
              style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` }}
            >
              <div
                className="relative bg-white rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-2"
                style={{
                  boxShadow: '6px 6px 0px #105652',
                  border: '2px solid #105652',
                }}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={cert.imageUrl}
                    alt={cert.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div 
                  className="p-3"
                  style={{ background: 'linear-gradient(135deg, #105652 0%, #1E8479 100%)' }}
                >
                  <h3 className="text-white text-sm font-semibold line-clamp-1">{cert.title}</h3>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* View All Button - Always show if there are certificates */}
        {certificates.length > 0 && (
          <div className="text-center mt-10">
            <Link
              to="/certificates"
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-full font-medium hover:opacity-90 transition-all hover:scale-105"
              style={{ backgroundColor: '#105652' }}
            >
              View All Certificates
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>

      {/* Certificate Modal - Using Portal */}
      {modalCert && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Certificate Image (68% width) */}
            <div className="md:w-[68%] bg-gray-100 flex items-center justify-center p-6">
              <img
                src={modalCert.imageUrl}
                alt={modalCert.title}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Right: Details (32% width) */}
            <div className="md:w-[32%] p-6 flex flex-col bg-white">
              {/* Close Button */}
              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Category Badge */}
              <span 
                className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white w-fit mb-4"
                style={{ backgroundColor: categoryColors[modalCert.category] || '#105652' }}
              >
                {modalCert.category}
              </span>

              {/* Title */}
              <h2 className="text-xl font-bold mb-4" style={{ color: '#105652' }}>
                {modalCert.title}
              </h2>

              {/* Description */}
              {modalCert.description && (
                <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow overflow-y-auto">
                  {modalCert.description}
                </p>
              )}

              {/* Issue Date */}
              {modalCert.issueDate && (
                <p className="text-gray-500 text-xs mb-4">
                  Issued: {new Date(modalCert.issueDate).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              )}

              {/* Open Full Page Link */}
              {modalCert.slug && (
                <a
                  href={`/certificate/${modalCert.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium mb-6 hover:underline"
                  style={{ color: '#105652' }}
                >
                  <ExternalLink className="w-4 h-4" />
                  Open full page
                </a>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigateModal('prev')}
                  disabled={filteredCerts.findIndex(c => c.$id === modalCert.$id) === 0}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </button>
                <span className="text-gray-400 text-xs">
                  {filteredCerts.findIndex(c => c.$id === modalCert.$id) + 1} / {filteredCerts.length}
                </span>
                <button
                  type="button"
                  onClick={() => navigateModal('next')}
                  disabled={filteredCerts.findIndex(c => c.$id === modalCert.$id) === filteredCerts.length - 1}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
