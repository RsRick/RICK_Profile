import React, { useState } from 'react';
import { Heart, ArrowRight } from 'lucide-react';

export default function ProjectCard({ project, index, isLiked, onLike, onClick, categoryColors = {} }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getCategoryColor = (categoryName) => {
    return categoryColors[categoryName] || '#105652';
  };

  return (
    <div
      className="group relative cursor-pointer h-full"
      style={{
        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Main Card */}
      <div
        className="relative bg-white rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 h-full flex flex-col"
        style={{
          boxShadow: '6px 6px 0px #105652',
          border: '2px solid #105652',
          minHeight: '420px',
        }}
      >
        {/* Image Container */}
        <div className="relative h-52 overflow-hidden flex-shrink-0">
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 to-gray-300" />
          )}
          <img
            src={project.image}
            alt={project.title}
            className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
              isHovered ? 'scale-110' : 'scale-100'
            } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Gradient overlay for bottom badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Category Badge - Bottom Left */}
          <div className="absolute bottom-4 left-4 z-10">
            <span
              className="text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider"
              style={{ 
                backgroundColor: getCategoryColor(project.category),
                boxShadow: '3px 3px 0px rgba(0,0,0,0.3)',
              }}
            >
              {project.category}
            </span>
          </div>

          {/* Like Button - Bottom Right */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike(project.id);
            }}
            className="absolute bottom-4 right-4 z-10 flex items-center gap-2 px-3 py-2 rounded-full bg-white transition-all duration-200 hover:scale-105"
            style={{
              boxShadow: '3px 3px 0px rgba(0,0,0,0.2)',
            }}
          >
            <Heart
              className={`w-4 h-4 transition-colors duration-200 ${
                isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'
              }`}
            />
            <span className={`text-sm font-bold ${isLiked ? 'text-red-500' : 'text-gray-700'}`}>
              {project.likes}
            </span>
          </button>
        </div>

        {/* Content Section with Title & Description */}
        <div 
          className="p-5 relative overflow-hidden flex-grow flex flex-col"
          style={{
            background: 'linear-gradient(135deg, #105652 0%, #1E8479 100%)',
          }}
        >
          {/* Decorative circles */}
          <div 
            className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-10"
            style={{ background: 'white' }}
          />
          <div 
            className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full opacity-10"
            style={{ background: 'white' }}
          />

          {/* Title */}
          <h3 className="text-white text-lg font-bold line-clamp-2 leading-tight relative z-10">
            {project.title}
          </h3>

          {/* Description - with more gap from title */}
          <p className="text-white/80 text-sm line-clamp-2 leading-relaxed relative z-10 mt-4 flex-grow">
            {project.description || 'Click to view project details'}
          </p>

          {/* View Project Button */}
          <div 
            className={`flex items-center gap-2 text-white font-semibold text-sm transition-transform duration-200 relative z-10 mt-4 ${
              isHovered ? 'translate-x-2' : ''
            }`}
          >
            <span className="uppercase tracking-wider text-xs">View Project</span>
            <ArrowRight className={`w-4 h-4 transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
