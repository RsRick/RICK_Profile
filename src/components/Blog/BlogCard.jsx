import { useState } from 'react';
import { Calendar, Clock, ArrowUpRight } from 'lucide-react';

export default function BlogCard({ blog, onClick, categoryColors, index = 0 }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Estimate read time (roughly 200 words per minute)
  const getReadTime = () => {
    if (blog.content) {
      const words = blog.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
      const minutes = Math.ceil(words / 200);
      return `${minutes} min read`;
    }
    return '3 min read';
  };

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer h-full mx-auto w-full"
      style={{
        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
        maxWidth: '350px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card with glass morphism effect */}
      <div
        className="relative h-full flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(16, 86, 82, 0.1)',
          boxShadow: '0 4px 20px rgba(16, 86, 82, 0.08)',
        }}
      >
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-100 to-gray-200" />
          )}
          <img
            src={blog.thumbnailUrl || blog.image}
            alt={blog.title}
            className={`w-full h-full object-cover transition-all duration-700 ${
              isHovered ? 'scale-110' : 'scale-100'
            } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Subtle gradient overlay */}
          <div 
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              background: isHovered
                ? 'linear-gradient(180deg, transparent 40%, rgba(16, 86, 82, 0.4) 100%)'
                : 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.2) 100%)',
            }}
          />

          {/* Arrow indicator on hover */}
          <div 
            className={`absolute bottom-3 right-3 z-10 w-9 h-9 rounded-full bg-white flex items-center justify-center transition-all duration-300 ${
              isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
            style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
          >
            <ArrowUpRight className="w-4 h-4 text-[#2596be]" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow flex flex-col p-5">
          {/* Category & Read Time Row */}
          <div className="flex items-center justify-between mb-3">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider"
              style={{
                backgroundColor: categoryColors[blog.category] || '#2596be',
              }}
            >
              {blog.category}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              {getReadTime()}
            </span>
          </div>

          {/* Title - Fixed height for 3 lines */}
          <h3 
            className="text-lg font-bold line-clamp-3 leading-snug transition-colors duration-300"
            style={{ 
              color: isHovered ? '#2596be' : '#1f2937',
              minHeight: '4.5rem', // Space for 3 lines
            }}
          >
            {blog.title}
          </h3>

          {/* Divider with gradient */}
          <div 
            className="h-px my-4 transition-all duration-500"
            style={{
              background: isHovered 
                ? 'linear-gradient(90deg, #2596be, #3ba8d1, transparent)'
                : 'linear-gradient(90deg, #e5e7eb, transparent)',
            }}
          />

          {/* Footer */}
          <div className="flex items-center justify-between">
            {/* Authors */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {blog.authorImages && blog.authorImages.length > 0 ? (
                  blog.authorImages.slice(0, 2).map((imgUrl, idx) => (
                    <img
                      key={idx}
                      src={imgUrl}
                      alt={blog.authorNames?.[idx] || 'Author'}
                      className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-sm"
                    />
                  ))
                ) : (
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #2596be, #3ba8d1)' }}
                  >
                    {blog.authorNames?.[0]?.charAt(0) || 'A'}
                  </div>
                )}
              </div>
              <p className="font-medium text-gray-700 text-xs line-clamp-1">
                {blog.authorNames?.slice(0, 2).join(', ') || 'Author'}
              </p>
            </div>

            {/* Date */}
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(blog.publishDate)}</span>
            </div>
          </div>
        </div>

        {/* Bottom accent line that animates on hover */}
        <div 
          className="absolute bottom-0 left-0 h-1 transition-all duration-500 ease-out"
          style={{
            width: isHovered ? '100%' : '0%',
            background: 'linear-gradient(90deg, #2596be, #3ba8d1)',
          }}
        />
      </div>
    </div>
  );
}



