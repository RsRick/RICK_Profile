import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BlogCard from './BlogCard';
import BlogModal from './BlogModal';
import { databaseService } from '../../lib/appwrite';

const BLOG_COLLECTION = 'blogs';

export default function Blog() {
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
        
        // Only show featured blogs on homepage
        const featuredBlogs = transformedBlogs.filter(b => b.featured === true);
        setBlogs(featuredBlogs);
      }
    } catch (error) {
      console.error('Error loading blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter blogs based on selected category
  const filteredBlogs = selectedCategory === "All Blogs"
    ? blogs.slice(0, 6) // Show only 6 blogs on homepage
    : blogs.filter(b => b.category === selectedCategory).slice(0, 6);

  const handleCategoryChange = (category) => {
    if (category === selectedCategory) return;
    setSelectedCategory(category);
    setFilterKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <section id="blog" className="min-h-screen py-12 relative overflow-hidden scroll-mt-20">
        <div className="container mx-auto px-6">
          <p className="text-center text-gray-500">Loading blogs...</p>
        </div>
      </section>
    );
  }

  if (blogs.length === 0) {
    return null; // Don't show section if no blogs
  }

  return (
    <section id="blog" className="py-10 relative overflow-hidden scroll-mt-20">
      {/* Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            background: '#3ba8d1',
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
        {/* Section Title - Compact */}
        <h2 className="text-3xl font-bold mb-5 text-center" style={{ color: '#2596be' }}>
          From the Blog
        </h2>

        {/* Category Filter - Underline Style */}
        <div className="flex flex-wrap justify-center gap-1 mb-6">
          {categories.map((category, index) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`relative px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'text-[#2596be]'
                  : 'text-gray-500 hover:text-[#2596be]'
              }`}
            >
              {category}
              {/* Animated Underline */}
              <span 
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-[#2596be] transition-all duration-300 ${
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

        {/* Blogs Grid */}
        <div className="relative mb-6 max-w-6xl mx-auto">
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
        </div>

        {/* View All Blogs Button - Editorial Style */}
        <div className="flex justify-center mt-6">
          <Link
            to="/blogs"
            className="group flex items-center gap-2 px-6 py-2 border-2 border-[#2596be] text-[#2596be] font-medium rounded-none hover:bg-[#2596be] hover:text-white transition-all duration-300"
          >
            <span className="tracking-wider text-sm uppercase">Explore All Articles</span>
            <svg 
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
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
    </section>
  );
}


