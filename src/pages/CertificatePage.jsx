import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Share2, ExternalLink } from 'lucide-react';
import { databaseService } from '../lib/appwrite';
import Header from '../components/Header/Header';
import { Query } from 'appwrite';

const CERTIFICATES_COLLECTION = 'certificates';
const CERTIFICATE_CATEGORIES_COLLECTION = 'certificate_categories';

export default function CertificatePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryColor, setCategoryColor] = useState('#105652');

  useEffect(() => {
    loadCertificate();
    window.scrollTo(0, 0);
  }, [slug]);

  const loadCertificate = async () => {
    try {
      setLoading(true);
      
      const result = await databaseService.listDocuments(
        CERTIFICATES_COLLECTION,
        [Query.equal('slug', slug)]
      );

      if (result.success && result.data.documents.length > 0) {
        const certData = result.data.documents[0];
        setCertificate(certData);
        
        if (certData.category) {
          const catResult = await databaseService.listDocuments(
            CERTIFICATE_CATEGORIES_COLLECTION,
            [Query.equal('name', certData.category)]
          );
          if (catResult.success && catResult.data.documents.length > 0) {
            setCategoryColor(catResult.data.documents[0].color || '#105652');
          }
        }
      } else {
        navigate('/certificates');
      }
    } catch (error) {
      console.error('Error loading certificate:', error);
      navigate('/certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: certificate.title, url });
      } catch (err) {
        navigator.clipboard.writeText(url);
      }
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFAEB' }}>
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#105652', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!certificate) return null;

  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: '#FFFAEB',
        backgroundImage: `linear-gradient(rgba(16, 86, 82, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 86, 82, 0.05) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
      }}
    >
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <button
            onClick={() => navigate('/certificates')}
            className="flex items-center gap-2 text-gray-600 hover:text-[#105652] mb-6 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Certificates
          </button>

          {/* Certificate Image - 60% width, centered */}
          <div className="flex justify-center mb-8">
            <div 
              className="bg-white rounded-2xl overflow-hidden shadow-xl"
              style={{ width: '60%', maxWidth: '900px', border: '2px solid #105652' }}
            >
              <img
                src={certificate.imageUrl}
                alt={certificate.title}
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Certificate Details Below - Centered */}
          <div 
            className="mx-auto bg-white rounded-xl p-6 shadow-lg"
            style={{ width: '60%', maxWidth: '900px', border: '2px solid #105652' }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <span 
                  className="inline-block px-4 py-1.5 rounded-full text-sm font-bold text-white mb-3"
                  style={{ backgroundColor: categoryColor }}
                >
                  {certificate.category}
                </span>
                <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#105652' }}>
                  {certificate.title}
                </h1>
                {certificate.description && (
                  <p className="text-gray-600 mt-3">{certificate.description}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 flex-shrink-0">
                {certificate.verifyUrl && (
                  <a
                    href={certificate.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
                    style={{ borderColor: '#105652', color: '#105652' }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Verify Certificate
                  </a>
                )}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white hover:opacity-90 transition-colors"
                  style={{ backgroundColor: '#105652' }}
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
