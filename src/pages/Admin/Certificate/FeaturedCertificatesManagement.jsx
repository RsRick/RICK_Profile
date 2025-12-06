import { useState, useEffect } from 'react';
import { Star, StarOff } from 'lucide-react';
import { databaseService } from '../../../lib/appwrite';
import { useToast } from '../../../contexts/ToastContext';

const CERTIFICATES_COLLECTION = 'certificates';

export default function FeaturedCertificatesManagement() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const result = await databaseService.listDocuments(CERTIFICATES_COLLECTION);
      if (result.success) {
        setCertificates(result.data.documents);
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
      showToast('Failed to load certificates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (cert) => {
    try {
      const result = await databaseService.updateDocument(
        CERTIFICATES_COLLECTION,
        cert.$id,
        { featured: !cert.featured }
      );
      if (result.success) {
        showToast(cert.featured ? 'Removed from featured' : 'Added to featured', 'success');
        loadCertificates();
      }
    } catch (error) {
      showToast('Failed to update', 'error');
    }
  };

  const featuredCerts = certificates.filter(c => c.featured);
  const nonFeaturedCerts = certificates.filter(c => !c.featured);

  if (loading) return <div className="p-6"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6" style={{ color: '#105652' }}>Featured Certificates</h1>
      <p className="text-gray-600 mb-6">Select which certificates to display on the homepage.</p>

      {/* Featured Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#105652' }}>
          Featured ({featuredCerts.length})
        </h2>
        {featuredCerts.length === 0 ? (
          <p className="text-gray-500 bg-white p-4 rounded-lg">No featured certificates yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredCerts.map(cert => (
              <div key={cert.$id} className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-yellow-400">
                <div className="aspect-[4/3] relative">
                  <img src={cert.imageUrl} alt={cert.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">
                    Featured
                  </div>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <h4 className="font-semibold text-sm line-clamp-1" style={{ color: '#105652' }}>{cert.title}</h4>
                  <button
                    onClick={() => toggleFeatured(cert)}
                    className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200"
                    title="Remove from featured"
                  >
                    <StarOff className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Certificates Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-700">All Certificates ({nonFeaturedCerts.length})</h2>
        {nonFeaturedCerts.length === 0 ? (
          <p className="text-gray-500 bg-white p-4 rounded-lg">All certificates are featured.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nonFeaturedCerts.map(cert => (
              <div key={cert.$id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-[4/3]">
                  <img src={cert.imageUrl} alt={cert.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 flex items-center justify-between">
                  <h4 className="font-semibold text-sm line-clamp-1" style={{ color: '#105652' }}>{cert.title}</h4>
                  <button
                    onClick={() => toggleFeatured(cert)}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-[#105652] hover:text-white"
                    title="Add to featured"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
