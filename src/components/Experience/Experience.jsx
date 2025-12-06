import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, MapPin, Calendar, Award, Briefcase, GraduationCap, Trophy, X, ExternalLink } from 'lucide-react';
import { databaseService } from '../../lib/appwrite';

const EXPERIENCES_COLLECTION = 'experiences';

// Icon mapping for different experience types
const typeIcons = {
  work: Briefcase,
  education: GraduationCap,
  achievement: Trophy,
  award: Award,
  default: Award
};

export default function Experience() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalExp, setModalExp] = useState(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    try {
      const result = await databaseService.listDocuments(EXPERIENCES_COLLECTION);
      if (result.success && result.data?.documents) {
        const sorted = result.data.documents.sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
          }
          return new Date(b.startDate || 0) - new Date(a.startDate || 0);
        });
        setExperiences(sorted.filter(exp => exp.featured !== false));
      }
    } catch (error) {
      console.error('Error loading experiences:', error);
      // Don't crash the app if collection doesn't exist
    } finally {
      setLoading(false);
    }
  };

  const scrollToIndex = (index) => {
    if (carouselRef.current) {
      const cards = carouselRef.current.children;
      if (cards[index]) {
        cards[index].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
    setActiveIndex(index);
  };

  const handlePrev = () => {
    const newIndex = Math.max(0, activeIndex - 1);
    scrollToIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = Math.min(experiences.length - 1, activeIndex + 1);
    scrollToIndex(newIndex);
  };

  const openModal = (exp, e) => {
    e.preventDefault();
    e.stopPropagation();
    setModalExp(exp);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalExp(null);
    document.body.style.overflow = 'auto';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getTypeIcon = (type) => {
    const IconComponent = typeIcons[type?.toLowerCase()] || typeIcons.default;
    return IconComponent;
  };

  if (loading) return null;
  if (experiences.length === 0) return null;

  return (
    <section 
      id="experience" 
      className="py-16 relative overflow-hidden"
      style={{ 
        background: '#FFFAEB',
        backgroundImage: `linear-gradient(rgba(16, 86, 82, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 86, 82, 0.03) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }}
    >
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            background: 'linear-gradient(135deg, #105652 0%, #1E8479 100%)',
            width: '400px',
            height: '400px',
            top: '-100px',
            left: '-100px',
            opacity: 0.08,
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header - Compact */}
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#105652' }}>
            Experience & Milestones
          </h2>
        </div>

        {/* Cards with Navigation - Arrows aligned to card middle */}
        <div className="flex items-center justify-center gap-4 max-w-6xl mx-auto">
          {/* Left Arrow - Only show if multiple cards */}
          {experiences.length > 1 && (
            <button
              onClick={handlePrev}
              disabled={activeIndex === 0}
              className="p-3 rounded-full transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-110 flex-shrink-0"
              style={{ 
                backgroundColor: '#105652',
                boxShadow: activeIndex === 0 ? 'none' : '4px 4px 0px #0a3533'
              }}
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          )}

          {/* Experience Cards */}
          <div 
            ref={carouselRef}
            className={`flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide ${
              experiences.length === 1 ? 'justify-center' : ''
            }`}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
          {experiences.map((exp, index) => {
            const TypeIcon = getTypeIcon(exp.type);
            const isActive = index === activeIndex;
            const cardColor = exp.color || '#105652';
            const cardColorSecondary = exp.colorSecondary || '#1E8479';
            
            return (
              <button
                key={exp.$id}
                type="button"
                onClick={(e) => openModal(exp, e)}
                className={`flex-shrink-0 w-80 md:w-[340px] snap-center text-left transition-all duration-500 ${
                  isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-70'
                }`}
                style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` }}
              >
                {/* Card with unique folder-style design */}
                <div
                  className="relative rounded-3xl overflow-hidden h-full transition-all duration-300 hover:-translate-y-2 group"
                  style={{
                    backgroundColor: cardColor,
                    boxShadow: `6px 6px 0px ${cardColor}66`,
                    border: `3px solid ${cardColor}`,
                  }}
                >
                  {/* Top Section with Image */}
                  <div className="relative p-4">
                    {/* Type Icon - Top Left */}
                    <div 
                      className="absolute top-4 left-4 w-12 h-12 rounded-full flex items-center justify-center z-10"
                      style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                    >
                      <TypeIcon className="w-6 h-6 text-white" />
                    </div>

                    {/* Type Badge - Top Right */}
                    <div 
                      className="absolute top-4 right-4 px-3 py-1 rounded-full z-10"
                      style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
                    >
                      <span className="text-white text-xs font-bold uppercase tracking-wider">
                        {exp.type || 'Achievement'}
                      </span>
                    </div>

                    {/* Folder-Style Image Container */}
                    <div className="mt-14 relative">
                      {/* Left curved tab - the folder tab effect */}
                      <div 
                        className="absolute -left-4 top-4 bottom-0 w-6 rounded-tl-2xl"
                        style={{ backgroundColor: cardColorSecondary }}
                      />
                      
                      {/* Main image container */}
                      <div 
                        className="relative bg-white rounded-2xl overflow-hidden ml-2"
                        style={{
                          borderTopLeftRadius: '0',
                          borderBottomLeftRadius: '16px',
                        }}
                      >
                        {/* Top-left corner cut */}
                        <div 
                          className="absolute top-0 left-0 w-6 h-6 z-10"
                          style={{ 
                            background: cardColor,
                            borderBottomRightRadius: '16px'
                          }}
                        />
                        
                        {exp.imageUrl ? (
                          <div className="aspect-[4/3] bg-gray-100 p-2">
                            <img
                              src={exp.imageUrl}
                              alt={exp.title}
                              className="w-full h-full object-contain rounded-lg"
                            />
                          </div>
                        ) : (
                          <div 
                            className="aspect-[4/3] flex items-center justify-center"
                            style={{ backgroundColor: cardColorSecondary }}
                          >
                            <TypeIcon className="w-16 h-16 text-white/40" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Title on colored section */}
                    <h3 className="text-white text-lg font-bold mt-3 line-clamp-2">
                      {exp.title}
                    </h3>
                  </div>

                  {/* Bottom White Section - Compact */}
                  <div className="bg-white px-4 py-3 rounded-t-2xl">
                    {/* Organization & Date in one line if possible */}
                    <div className="text-sm text-gray-600 mb-2 line-clamp-1">
                      {exp.organization || (exp.startDate && formatDate(exp.startDate))}
                    </div>

                    {/* View Details - No extra spacing */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="font-semibold text-sm" style={{ color: cardColor }}>
                        View Details
                      </span>
                      <ChevronRight className="w-5 h-5" style={{ color: cardColor }} />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
          </div>

          {/* Right Arrow - Only show if multiple cards */}
          {experiences.length > 1 && (
            <button
              onClick={handleNext}
              disabled={activeIndex === experiences.length - 1}
              className="p-3 rounded-full transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-110 flex-shrink-0"
              style={{ 
                backgroundColor: '#105652',
                boxShadow: activeIndex === experiences.length - 1 ? 'none' : '4px 4px 0px #0a3533'
              }}
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>


      {/* Experience Detail Modal */}
      {modalExp && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'fadeInUp 0.3s ease-out' }}
          >
            {/* Modal Header */}
            <div 
              className="p-6 relative"
              style={{ 
                background: `linear-gradient(135deg, ${modalExp.color || '#105652'} 0%, ${modalExp.colorSecondary || '#1E8479'} 100%)` 
              }}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Type Badge */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full mb-4">
                {(() => {
                  const TypeIcon = getTypeIcon(modalExp.type);
                  return <TypeIcon className="w-4 h-4 text-white" />;
                })()}
                <span className="text-white text-sm font-semibold uppercase tracking-wider">
                  {modalExp.type || 'Achievement'}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white mb-2">
                {modalExp.title}
              </h2>

              {/* Organization */}
              {modalExp.organization && (
                <p className="text-white/90 text-lg font-medium">
                  {modalExp.organization}
                </p>
              )}

              {/* Date & Location */}
              <div className="flex flex-wrap gap-4 mt-4">
                {(modalExp.startDate || modalExp.date) && (
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(modalExp.startDate || modalExp.date)}
                      {modalExp.endDate && ` - ${modalExp.current ? 'Present' : formatDate(modalExp.endDate)}`}
                    </span>
                  </div>
                )}
                {modalExp.location && (
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{modalExp.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {/* Image - Smaller in modal since it's shown on card */}
              {modalExp.imageUrl && (
                <div className="mb-6">
                  <img
                    src={modalExp.imageUrl}
                    alt={modalExp.title}
                    className="w-full max-h-48 object-contain rounded-lg bg-gray-100"
                  />
                </div>
              )}

              {/* Description */}
              {modalExp.description && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Description
                  </h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {modalExp.description}
                  </p>
                </div>
              )}

              {/* Highlights */}
              {modalExp.highlights && modalExp.highlights.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Key Highlights
                  </h4>
                  <ul className="space-y-2">
                    {modalExp.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div 
                          className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                          style={{ backgroundColor: modalExp.color || '#105652' }}
                        />
                        <span className="text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills */}
              {modalExp.skills && modalExp.skills.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Skills & Technologies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {modalExp.skills.map((skill, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1.5 rounded-full text-sm font-medium"
                        style={{ 
                          backgroundColor: `${modalExp.color || '#105652'}15`,
                          color: modalExp.color || '#105652'
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Credential Link */}
              {modalExp.credentialUrl && (
                <a
                  href={modalExp.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 text-white"
                  style={{ backgroundColor: modalExp.color || '#105652' }}
                >
                  <ExternalLink className="w-4 h-4" />
                  View Credential
                </a>
              )}
            </div>

            {/* Modal Footer - Navigation */}
            <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <button
                type="button"
                onClick={() => {
                  const currentIndex = experiences.findIndex(e => e.$id === modalExp.$id);
                  if (currentIndex > 0) {
                    setModalExp(experiences[currentIndex - 1]);
                  }
                }}
                disabled={experiences.findIndex(e => e.$id === modalExp.$id) === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-gray-400 text-sm">
                {experiences.findIndex(e => e.$id === modalExp.$id) + 1} / {experiences.length}
              </span>
              <button
                type="button"
                onClick={() => {
                  const currentIndex = experiences.findIndex(e => e.$id === modalExp.$id);
                  if (currentIndex < experiences.length - 1) {
                    setModalExp(experiences[currentIndex + 1]);
                  }
                }}
                disabled={experiences.findIndex(e => e.$id === modalExp.$id) === experiences.length - 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
