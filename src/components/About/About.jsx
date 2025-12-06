import React, { useState, useEffect } from 'react';
import { User, ExternalLink } from 'lucide-react';
import { databaseService } from '../../lib/appwrite';

export default function About() {
  const [aboutData, setAboutData] = useState({
    title: 'about me',
    subtitle: 'Who am I?',
    name: 'AUTHOY BISWAS BIDDA',
    nameFont: "'Playfair Display', serif",
    photoUrl: '',
    bioText: '',
    bioTextFont: "'Georgia', serif",
    researchLinks: []
  });
  const [isVisible, setIsVisible] = useState(false);

  const ABOUT_COLLECTION = 'about_me';

  useEffect(() => {
    setIsVisible(true);
    loadAboutData();
  }, []);

  const loadAboutData = async () => {
    try {
      const result = await databaseService.listDocuments(ABOUT_COLLECTION);
      if (result.success && result.data.documents.length > 0) {
        const data = result.data.documents[0];
        setAboutData({
          title: data.title || 'about me',
          subtitle: data.subtitle || 'Who am I?',
          name: data.name || 'AUTHOY BISWAS BIDDA',
          nameFont: data.nameFont || "'Playfair Display', serif",
          photoUrl: data.photoUrl || '',
          bioText: data.bioText || '',
          bioTextFont: data.bioTextFont || "'Georgia', serif",
          researchLinks: data.researchLinks ? JSON.parse(data.researchLinks) : []
        });
      }
    } catch (error) {
      console.error('Error loading about data:', error);
    }
  };

  return (
    <section
      id="about"
      className="py-8 relative overflow-hidden scroll-mt-20"
      style={{ background: '#FFFAEB' }}
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Vintage Paper Container */}
          <div
            className={`bg-white relative transform transition-all duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
            style={{
              boxShadow: '0 10px 40px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(0,0,0,0.1)',
              border: '3px solid #105652',
              position: 'relative'
            }}
          >
            {/* Decorative Lines - Top */}
            <div className="absolute top-0 left-0 right-0 flex gap-1 p-3">
              <div className="h-1 flex-1 bg-black"></div>
              <div className="h-1 flex-1 bg-black"></div>
            </div>

            {/* Decorative Lines - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 flex gap-1 p-3">
              <div className="h-1 flex-1 bg-black"></div>
              <div className="h-1 flex-1 bg-black"></div>
            </div>

            <div className="grid md:grid-cols-[240px_1fr] gap-6 p-6 md:p-8 mt-6 mb-6">
              {/* Left Side - Photo and Research Profile */}
              <div className="flex flex-col gap-4">
                {/* Photo */}
                <div
                  className="relative"
                  style={{
                    border: '3px solid #105652',
                    boxShadow: '6px 6px 0 rgba(16, 86, 82, 0.2)'
                  }}
                >
                  {aboutData.photoUrl ? (
                    <img
                      src={aboutData.photoUrl}
                      alt="Profile"
                      className="w-full aspect-[3/4] object-cover"
                      onError={() => setAboutData((prev) => ({ ...prev, photoUrl: '' }))}
                    />
                  ) : (
                    <div className="w-full aspect-[3/4] bg-gray-200 flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Research Profile Box */}
                <div
                  className="border-4 border-dashed p-4"
                  style={{ borderColor: '#105652' }}
                >
                  <h3
                    className="text-center font-bold mb-4 text-lg"
                    style={{
                      fontFamily: 'Georgia, serif',
                      color: '#105652',
                      letterSpacing: '1.5px'
                    }}
                  >
                    Research Profile
                  </h3>
                  <div className="flex flex-wrap justify-center gap-3">
                    {aboutData.researchLinks
                      .filter(link => !link.hidden)
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative transform transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                        title={link.name}
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden shadow-md group-hover:shadow-xl"
                          style={{
                            background: link.iconUrl ? 'white' : '#105652',
                            border: '2px solid #105652'
                          }}
                        >
                          {link.iconUrl ? (
                            <img
                              src={link.iconUrl}
                              alt={link.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ExternalLink className="w-5 h-5 text-white" />
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Content */}
              <div className="flex flex-col pr-8 md:pr-12">
                {/* Header */}
                <div className="mb-4">
                  <h1
                    className="text-4xl md:text-5xl font-bold mb-2 uppercase"
                    style={{
                      fontFamily: 'Georgia, serif',
                      letterSpacing: '3px',
                      color: '#000'
                    }}
                  >
                    {aboutData.title}
                  </h1>
                  <div
                    className="w-full h-1 mb-4"
                    style={{ background: '#105652' }}
                  ></div>
                  <h2
                    className="text-2xl md:text-3xl font-serif mb-4"
                    style={{
                      fontFamily: 'Georgia, serif',
                      color: '#105652'
                    }}
                  >
                    {aboutData.subtitle}
                  </h2>
                </div>

                {/* Bio Text - Vintage Newspaper Style */}
                <div className="flex-1">
                  <div
                    className="grid md:grid-cols-2 gap-x-8"
                    style={{
                      fontFamily: aboutData.bioTextFont,
                      fontSize: '14px',
                      lineHeight: '1.7',
                      color: '#333',
                      textAlign: 'justify'
                    }}
                  >
                    {(() => {
                      if (!aboutData.bioText || aboutData.bioText.trim() === '') {
                        return (
                          <div className="md:col-span-2">
                            <p>
                              Authoy Biswas Bidda was born in Jhenaidah, Dhaka, Bangladesh. The name come from the oysters. He completed his school education in Jhenaidah Government High School. He passed his HSC from Govt. H.S.S. Collage, Magura. His 4th year 2nd semester is running Department of Environmental Science and Geography at Islamic University, Kushtia, Bangladesh.Along with my studies, I like learning about maps, the environment, and how the Earth works. I enjoy using new tools and technology to understand different things in nature. People say I am ethical, creative, hardworking person. I take part in different class projects and enjoy learning with my friends. In my free time, I love traveling, seeing new places, and improving my skills.
                            </p>
                          </div>
                        );
                      }
                      
                      const paragraphs = aboutData.bioText.split('\n\n').filter(p => p.trim());
                      const midPoint = Math.ceil(paragraphs.length / 2);
                      const leftColumn = paragraphs.slice(0, midPoint);
                      const rightColumn = paragraphs.slice(midPoint);
                      
                      return (
                        <>
                          <div className="space-y-3">
                            {leftColumn.map((paragraph, index) => (
                              <p key={`left-${index}`}>{paragraph}</p>
                            ))}
                          </div>
                          <div className="space-y-3">
                            {rightColumn.map((paragraph, index) => (
                              <p key={`right-${index}`}>{paragraph}</p>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Decorative Element - Vertical Text */}
                <div className="hidden md:block absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div
                    className="writing-mode-vertical text-lg font-bold tracking-widest uppercase"
                    style={{
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                      color: '#105652',
                      letterSpacing: '6px',
                      fontFamily: aboutData.nameFont
                    }}
                  >
                    {aboutData.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
