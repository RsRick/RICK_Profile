import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { databaseService } from '../lib/appwrite';
import PageWrapper from '../components/PageWrapper/PageWrapper';

const CERTIFICATES_COLLECTION = 'certificates';
const CERTIFICATE_CATEGORIES_COLLECTION = 'certificate_categories';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [categoryColors, setCategoryColors] = useState({});
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    loadData();
    window.scrollTo(0, 0);
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
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCerts = selectedCategory === 'All' 
    ? certificates 
    : certificates.filter(c => c.category === selectedCategory);

  const handleCategoryChange = (category) => {
    if (category === selectedCategory) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedCategory(category);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 250);
  };

  const handleCertClick = (cert) => {
    setSelectedCert(cert);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedCert(null);
    document.body.style.overflow = 'auto';
  };

  const navigateCert = (direction) => {
    const currentIndex = filteredCerts.findIndex(c => c.$id === selectedCert.$id);
    if (direction === 'prev' && currentIndex > 0) {
      setSelectedCert(filteredCerts[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < filteredCerts.length - 1) {
      setSelectedCert(filteredCerts[currentIndex + 1]);
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-[calc(100vh-144px)] pt-8 pb-16 relative">
        {/* Background gradient */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute rounded-full blur-3xl"
            style={{
              background: '#1E8479',
              width: '500px',
              height: '500px',
              top: '10%',
              left: '-150px',
              animation: 'float 25s ease-in-out infinite',
              opacity: 0.1,
            }}
          />
          <div
            className="absolute rounded-full blur-3xl"
            style={{
              background: '#105652',
              width: '400px',
              height: '400px',
              bottom: '20%',
              right: '-100px',
              animation: 'float 20s ease-in-out infinite reverse',
              opacity: 0.08,
            }}
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold" style={{ color: '#105652' }}>Certificates</h1>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              <button
                onClick={() => handleCategoryChange('All')}
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
                  onClick={() => handleCategoryChange(cat.name)}
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

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#105652', borderTopColor: 'transparent' }} />
              <p className="text-gray-500">Loading certificates...</p>
            </div>
          ) : filteredCerts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500">No certificates found in this category.</p>
            </div>
          ) : (
            /* Certificates Grid - 3 per row */
            <div 
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto transition-all duration-300 ${
                isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              {filteredCerts.map((cert, index) => (
                <div
                  key={cert.$id}
                  className="group cursor-pointer"
                  style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both` }}
                  onClick={() => handleCertClick(cert)}
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Certificate Modal */}
      {selectedCert && createPortal(
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Certificate Image (65-70% width) */}
            <div className="md:w-[68%] bg-gray-100 flex items-center justify-center p-6">
              <img
                src={selectedCert.imageUrl}
                alt={selectedCert.title}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Right: Details (30-35% width) */}
            <div className="md:w-[32%] p-6 flex flex-col bg-white">
              {/* Close Button */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Category Badge */}
              <span 
                className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white w-fit mb-4"
                style={{ backgroundColor: categoryColors[selectedCert.category] || '#105652' }}
              >
                {selectedCert.category}
              </span>

              {/* Title */}
              <h2 className="text-xl font-bold mb-4" style={{ color: '#105652' }}>
                {selectedCert.title}
              </h2>

              {/* Description */}
              {selectedCert.description && (
                <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow overflow-y-auto">
                  {selectedCert.description}
                </p>
              )}

              {/* Issue Date */}
              {selectedCert.issueDate && (
                <p className="text-gray-500 text-xs mb-4">
                  Issued: {new Date(selectedCert.issueDate).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              )}

              {/* Open Full Page Link */}
              {selectedCert.slug && (
                <a
                  href={`/certificate/${selectedCert.slug}`}
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
                  onClick={() => navigateCert('prev')}
                  disabled={filteredCerts.findIndex(c => c.$id === selectedCert.$id) === 0}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </button>
                <span className="text-gray-400 text-xs">
                  {filteredCerts.findIndex(c => c.$id === selectedCert.$id) + 1} / {filteredCerts.length}
                </span>
                <button
                  onClick={() => navigateCert('next')}
                  disabled={filteredCerts.findIndex(c => c.$id === selectedCert.$id) === filteredCerts.length - 1}
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
    </PageWrapper>
  );
}
