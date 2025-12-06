import { useState, useEffect } from 'react';
import { databaseService } from '../lib/appwrite';
import BlogCard from '../components/Blog/BlogCard';
import BlogModal from '../components/Blog/BlogModal';
import PageWrapper from '../components/PageWrapper/PageWrapper';

const BLOG_COLLECTION = 'blogs';

export default function BlogsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Blogs");
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryColors, setCategoryColors] = useState({});
  const [categories, setCategories] = useState(["All Blogs"]);
  const [filterKey, setFilterKey] = useState(0);

  useEffect(() => {
    loadCategories();
    loadBlogs();
  }, []);

  const loadCategories = async () => {
    try {
      const result = await databaseService.listDocuments('blog_categories');
      if (result.success && result.data.documents.length > 0) {
        const sortedCategories = result.data.documents.sort((a, b) => a.order - b.order);
        const categoryNames = ["All Blogs", ...sortedCategories.map(cat => cat.name)];
        setCategories(categoryNames);
        
        const colorMap = {};
        sortedCategories.forEach(cat => {
          colorMap[cat.name] = cat.color;
        });
        setCategoryColors(colorMap);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadBlogs = async () => {
    try {
      const result = await databaseService.listDocuments(BLOG_COLLECTION);
      if (result.success && result.data.documents.length > 0) {
        const transformedBlogs = result.data.documents.map(doc => {
          // Ensure gallery is always an array with at least the thumbnail
          const galleryUrls = doc.galleryUrls && Array.isArray(doc.galleryUrls) && doc.galleryUrls.length > 0 
            ? doc.galleryUrls 
            : [doc.thumbnailUrl];
          
          return {
            id: doc.$id,
            title: doc.title,
            category: doc.category,
            image: doc.thumbnailUrl,
            thumbnailUrl: doc.thumbnailUrl,
            description: doc.description,
            featured: doc.featured === true,
            gallery: galleryUrls,
            fullDescription: doc.fullDescription || '',
            authorNames: doc.authorNames || [],
            authorImages: doc.authorImages || [],
            publishDate: doc.publishDate,
            customSlug: doc.customSlug,
            useProjectPrefix: doc.useProjectPrefix,
          };
        });
        
        // Show all blogs on this page
        setBlogs(transformedBlogs);
      }
    } catch (error) {
      console.error('Error loading blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter blogs based on selected category
  const filteredBlogs = selectedCategory === "All Blogs"
    ? blogs
    : blogs.filter(b => b.category === selectedCategory);

  const handleCategoryChange = (category) => {
    if (category === selectedCategory) return;
    setSelectedCategory(category);
    setFilterKey(prev => prev + 1);
  };

  return (
    <PageWrapper>
      <div className="min-h-[calc(100vh-144px)] pt-8 pb-16 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            background: '#1E8479',
            width: '450px',
            height: '450px',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            animation: 'float 25s ease-in-out infinite',
            opacity: 0.15,
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Page Title - Simple */}
        <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: '#105652' }}>
          Blog
        </h1>

        {/* Category Filter - Underline Style */}
        <div className="flex flex-wrap justify-center gap-1 mb-8 border-b border-gray-200 pb-3">
          {categories.map((category, index) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`relative px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'text-[#105652]'
                  : 'text-gray-500 hover:text-[#105652]'
              }`}
            >
              {category}
              {/* Animated Underline */}
              <span 
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-[#105652] transition-all duration-300 ${
                  selectedCategory === category ? 'w-full' : 'w-0'
                }`}
              ></span>
              {/* Dot separator */}
              {index < categories.length - 1 && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-gray-300"></span>
              )}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <p className="text-center text-gray-500">Loading blogs...</p>
        ) : filteredBlogs.length === 0 ? (
          <p className="text-center text-gray-500">No blogs found in this category.</p>
        ) : (
          /* Blogs Grid */
          <div 
            key={filterKey}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredBlogs.map((blog, index) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                index={index}
                onClick={() => setSelectedBlog(blog)}
                categoryColors={categoryColors}
              />
            ))}
          </div>
        )}
      </div>

      {/* Blog Modal */}
      {selectedBlog && (
        <BlogModal
          blog={selectedBlog}
          onClose={() => setSelectedBlog(null)}
          onNavigate={(direction) => {
            const currentIndex = filteredBlogs.findIndex(b => b.id === selectedBlog.id);
            if (direction === 'prev' && currentIndex > 0) {
              setSelectedBlog(filteredBlogs[currentIndex - 1]);
            } else if (direction === 'next' && currentIndex < filteredBlogs.length - 1) {
              setSelectedBlog(filteredBlogs[currentIndex + 1]);
            }
          }}
          currentIndex={filteredBlogs.findIndex(b => b.id === selectedBlog.id)}
          totalBlogs={filteredBlogs.length}
        />
      )}
      </div>
    </PageWrapper>
  );
}
