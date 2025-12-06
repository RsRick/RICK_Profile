import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Code, Sparkles } from 'lucide-react';
import { databaseService } from '../../lib/appwrite';
import { getIcon } from '../../utils/iconMap';
import { useToast } from '../../contexts/ToastContext';

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { showToast } = useToast();
  const EMAIL_ADDRESS = 'official.parvej.hossain@gmail.com';
  const [heroName, setHeroName] = useState('Authoy Biswas Bidda');
  const [roles, setRoles] = useState(['GIS Enthusiast', 'Cartographer', 'GIS Data Analyst']);
  const [description, setDescription] = useState(
    'Skilled in Python, R, and GIS software like ArcGIS Pro, ArcMap, QGIS, and Erdas Imagine, with practical experience in analyzing environmental data. Eager to learn from experts and contribute to impactful research that promotes sustainability and addresses global climate challenges.'
  );
  const [photoUrl, setPhotoUrl] = useState(null);
  const [yearsExperience, setYearsExperience] = useState({ number: '5+', text: 'Years\nExperience' });
  const [projectsCompleted, setProjectsCompleted] = useState({ number: '10+', text: 'Projects\nCompleted' });
  const [statsFont, setStatsFont] = useState("'Poppins', sans-serif");
  const [socialLinks, setSocialLinks] = useState([
    { icon: 'github', label: 'GitHub', href: '#' },
    { icon: 'linkedin', label: 'LinkedIn', href: '#' },
    { icon: 'code', label: 'Portfolio', href: '#' },
    { icon: 'mapPin', label: 'Google Scholar', href: '#' },
  ]);

  const [displayText, setDisplayText] = useState('');
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    loadHeaderSettings();
    setIsVisible(true);
  }, []);

  const loadHeaderSettings = async () => {
    try {
      const HEADER_COLLECTION = 'header_section';
      const result = await databaseService.listDocuments(HEADER_COLLECTION);
      if (result.success && result.data.documents.length > 0) {
        const settings = result.data.documents[0];
        if (settings.heroName) setHeroName(settings.heroName);
        if (settings.roles) {
          const rolesData = JSON.parse(settings.roles);
          setRoles(rolesData.sort((a, b) => a.order - b.order).map((r) => r.text));
        }
        if (settings.description) setDescription(settings.description);
        if (settings.photoUrl) setPhotoUrl(settings.photoUrl);
        if (settings.yearsExperience) setYearsExperience(JSON.parse(settings.yearsExperience));
        if (settings.projectsCompleted) setProjectsCompleted(JSON.parse(settings.projectsCompleted));
        if (settings.statsFont) setStatsFont(settings.statsFont);
        if (settings.socialLinks) {
          const links = JSON.parse(settings.socialLinks);
          setSocialLinks(links.sort((a, b) => a.order - b.order));
        }
      }
    } catch (error) {
      console.error('Error loading header settings:', error);
    }
  };

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  useEffect(() => {
    const currentRole = roles[currentRoleIndex];
    let timeout;

    if (!isDeleting && displayText === currentRole) {
      // Finished typing, wait then start deleting
      timeout = setTimeout(() => {
        setIsDeleting(true);
        setTypingSpeed(50);
      }, 2000);
    } else if (isDeleting && displayText === '') {
      // Finished deleting, move to next role
      setIsDeleting(false);
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
      setTypingSpeed(100);
    } else if (!isDeleting) {
      // Typing
      timeout = setTimeout(() => {
        setDisplayText(currentRole.substring(0, displayText.length + 1));
      }, typingSpeed);
    } else {
      // Deleting
      timeout = setTimeout(() => {
        setDisplayText(displayText.substring(0, displayText.length - 1));
      }, typingSpeed);
    }

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayText, isDeleting, currentRoleIndex, typingSpeed]);

  const handleContactClick = (e) => {
    e.preventDefault();
    const contactSection = document.querySelector('#contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    const aboutSection = document.querySelector('#about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleEmailCopy = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(EMAIL_ADDRESS);
      showToast('Email address copied successfully!');
    } catch (error) {
      console.error('Failed to copy email:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = EMAIL_ADDRESS;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        showToast('Email address copied successfully!');
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <section
      id="home"
      className="min-h-screen relative overflow-hidden scroll-mt-20"
      onMouseMove={handleMouseMove}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full opacity-20 blur-3xl"
          style={{
            background: '#105652',
            width: '600px',
            height: '600px',
            top: '-200px',
            right: '-100px',
            animation: 'float 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full opacity-10 blur-3xl"
          style={{
            background: '#1E8479',
            width: '400px',
            height: '400px',
            bottom: '-100px',
            left: '-100px',
            animation: 'float 15s ease-in-out infinite reverse',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-8rem)]">
          {/* Left Content */}
          <div
            className={`space-y-8 transform transition-all duration-1000 ${
              isVisible
                ? 'translate-x-0 opacity-100'
                : '-translate-x-20 opacity-0'
            }`}
          >
            {/* Greeting Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-lg">
              <Sparkles className="w-4 h-4" style={{ color: '#105652' }} />
              <span
                className="text-sm font-medium"
                style={{ color: '#105652' }}
              >
                Available for Collaboration
              </span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-gray-800 leading-tight whitespace-nowrap">
                Hi, I'm{' '}
                <span
                  className="hero-name relative inline-block"
                  style={{ 
                    color: '#105652',
                    fontSize: 'inherit',
                    letterSpacing: '-0.02em'
                  }}
                >
                  {heroName}
                  <div
                    className="absolute -bottom-2 left-0 right-0 h-1 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #105652, #1E8479)',
                      animation: 'shimmer 3s ease-in-out infinite',
                    }}
                  />
                </span>
              </h1>
            </div>

            {/* Animated Role - Typewriter Effect */}
            <div className="flex items-center gap-3 text-2xl lg:text-3xl font-semibold text-gray-700">
              <span>a</span>
              <span
                className="relative inline-block min-w-[200px]"
                style={{ color: '#1E8479' }}
              >
                {displayText}
                <span className="typewriter-cursor">|</span>
              </span>
            </div>

            {/* Description */}
            <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
              {description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleProfileClick}
                className="px-8 py-4 rounded-full font-semibold text-white shadow-xl transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #105652, #1E8479)',
                }}
              >
                View Research Profile
              </button>
              <button
                onClick={handleContactClick}
                className="px-8 py-4 rounded-full font-semibold border-2 transform hover:scale-105 transition-all duration-300 bg-white shadow-lg hover:shadow-xl flex items-center"
                style={{
                  borderColor: '#105652',
                  color: '#105652',
                }}
              >
                <Mail className="w-5 h-5 mr-2" />
                Get In Touch
              </button>
            </div>

            {/* Social Links */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Find Me On
              </p>
              <div className="flex gap-4">
                {socialLinks.map((link, index) => {
                  const Icon = getIcon(link.icon);
                  const isEmail = link.icon === 'mail';
                  
                  if (isEmail) {
                    return (
                      <button
                        key={link.id || index}
                        onClick={handleEmailCopy}
                        className="w-14 h-14 rounded-xl flex items-center justify-center bg-white shadow-lg transform hover:scale-110 transition-all duration-300 hover:shadow-xl group cursor-pointer"
                        style={{
                          animationDelay: `${index * 100}ms`,
                        }}
                        aria-label={`Copy ${EMAIL_ADDRESS} to clipboard`}
                        title={`Copy ${EMAIL_ADDRESS} to clipboard`}
                      >
                        <Icon
                          className="w-6 h-6 group-hover:scale-110 transition-transform duration-300"
                          style={{ color: '#105652' }}
                        />
                      </button>
                    );
                  }
                  
                  return (
                    <a
                      key={link.id || index}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 rounded-xl flex items-center justify-center bg-white shadow-lg transform hover:scale-110 transition-all duration-300 hover:shadow-xl group"
                      style={{
                        animationDelay: `${index * 100}ms`,
                      }}
                      aria-label={link.label}
                    >
                      <Icon
                        className="w-6 h-6 group-hover:scale-110 transition-transform duration-300"
                        style={{ color: '#105652' }}
                      />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side - Professional Photo with Floating Stats */}
          <div
            className={`relative flex items-center justify-center transform transition-all duration-1000 delay-300 ${
              isVisible
                ? 'translate-x-0 opacity-100'
                : 'translate-x-20 opacity-0'
            }`}
          >
            <div className="relative w-full max-w-md">
              {/* Glow Effect Behind Photo */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-30 blur-3xl"
                style={{ background: '#105652' }}
              />

              {/* Professional Photo */}
              <div className="relative z-10">
                <div
                  className="relative w-80 h-96 mx-auto rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-500"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(16, 86, 82, 0.05), rgba(30, 132, 121, 0.05))',
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, #105652, transparent 50%)`,
                    }}
                  />

                  {/* Professional Photo */}
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Professional"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-white to-gray-100 flex items-center justify-center">
                      <div className="text-center p-8">
                        <div
                          className="w-32 h-32 mx-auto rounded-full mb-4 flex items-center justify-center"
                          style={{
                            background:
                              'linear-gradient(135deg, #105652, #1E8479)',
                          }}
                        >
                          <Code className="w-16 h-16 text-white" />
                        </div>
                        <p className="text-gray-400 text-sm">
                          Your Professional Photo
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Floating Stat - Years Experience (Top Right) */}
                <div
                  className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-2xl p-5 transform hover:scale-110 transition-all duration-300 cursor-pointer"
                  style={{ animation: 'float 3s ease-in-out infinite', fontFamily: statsFont }}
                >
                  <div
                    className="text-4xl font-bold mb-1"
                    style={{ color: '#105652' }}
                  >
                    {yearsExperience.number}
                  </div>
                  <div className="text-xs font-semibold text-gray-600 whitespace-pre-line">
                    {yearsExperience.text}
                  </div>
                </div>

                {/* Floating Stat - Projects Completed (Bottom Left) */}
                <div
                  className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-2xl p-5 transform hover:scale-110 transition-all duration-300 cursor-pointer"
                  style={{ animation: 'float 3s ease-in-out infinite 1.5s', fontFamily: statsFont }}
                >
                  <div
                    className="text-4xl font-bold mb-1"
                    style={{ color: '#105652' }}
                  >
                    {projectsCompleted.number}
                  </div>
                  <div className="text-xs font-semibold text-gray-600 whitespace-pre-line">
                    {projectsCompleted.text}
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

