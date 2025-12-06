import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, ExternalLink, ArrowLeft } from 'lucide-react';
import DOMPurify from 'dompurify';
import { databaseService } from '../lib/appwrite';

const BLOG_COLLECTION = 'blogs';

export default function BlogPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadBlog();
  }, [slug]);

  const loadBlog = async () => {
    try {
      setLoading(true);
      const result = await databaseService.listDocuments(BLOG_COLLECTION);
      
      if (result.success) {
        const foundBlog = result.data.documents.find(doc => doc.customSlug === slug);
        
        if (foundBlog) {
          setBlog({
            id: foundBlog.$id,
            title: foundBlog.title,
            category: foundBlog.category,
            thumbnailUrl: foundBlog.thumbnailUrl,
            description: foundBlog.description,
            gallery: foundBlog.galleryUrls || [foundBlog.thumbnailUrl],
            fullDescription: foundBlog.fullDescription,
            authorNames: foundBlog.authorNames || [],
            authorImages: foundBlog.authorImages || [],
            publishDate: foundBlog.publishDate,
            customSlug: foundBlog.customSlug,
            useProjectPrefix: foundBlog.useProjectPrefix,
          });
        } else {
          navigate('/404');
        }
      }
    } catch (error) {
      console.error('Error loading blog:', error);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading blog...</p>
      </div>
    );
  }

  if (!blog) {
    return null;
  }

  const sanitizedHTML = DOMPurify.sanitize(blog.fullDescription || '', {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
  });

  return (
    <div className="min-h-screen py-20 relative overflow-hidden">
      {/* Back Button */}
      <div className="container mx-auto px-6 mb-6">
        <button
          onClick={() => navigate('/blogs')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#105652] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Blogs
        </button>
      </div>

      <div className="container mx-auto px-6 max-w-4xl">
        {/* Gallery */}
        {blog.gallery && blog.gallery.length > 0 && (
          <div className="relative h-96 bg-gray-100 rounded-2xl overflow-hidden mb-8">
            <img
              src={blog.gallery[currentImageIndex]}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
            
            {blog.gallery.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? blog.gallery.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev === blog.gallery.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {blog.gallery.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Title */}
          <h1 className="text-4xl font-bold mb-6" style={{ color: '#105652' }}>
            {blog.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b">
            {/* Authors */}
            <div className="flex items-center gap-3">
              <div className="flex items-center -space-x-3">
                {blog.authorImages && blog.authorImages.length > 0 ? (
                  blog.authorImages.map((imgUrl, index) => (
                    <img
                      key={index}
                      src={imgUrl}
                      alt={blog.authorNames?.[index] || 'Author'}
                      className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-md"
                      title={blog.authorNames?.[index] || 'Author'}
                    />
                  ))
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white">
                    <span className="text-gray-500 font-bold">
                      {blog.authorNames?.[0]?.charAt(0) || 'A'}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  {blog.authorNames && blog.authorNames.length > 0 
                    ? blog.authorNames.join(', ') 
                    : 'Anonymous'}
                </p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">{formatDate(blog.publishDate)}</span>
            </div>

            {/* Category */}
            <span
              className="px-3 py-1 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: '#105652' }}
            >
              {blog.category}
            </span>
          </div>

          {/* Full Description */}
          <div 
            className="prose prose-lg max-w-none blog-content"
            dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
          />

          {/* Share Link */}
          <div className="mt-8 pt-6 border-t">
            <button
              onClick={() => {
                const url = window.location.href;
                navigator.clipboard.writeText(url);
                alert('Link copied to clipboard!');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: '#105652' }}
            >
              <ExternalLink className="w-5 h-5" />
              Share Blog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
