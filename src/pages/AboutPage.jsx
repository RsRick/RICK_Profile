import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, User, GraduationCap, BookOpen, Award,
  Calendar, MapPin, ExternalLink, Briefcase, Code,
  Mail, Trophy, ChevronRight
} from 'lucide-react';
import { databaseService } from '../lib/appwrite';
import { getIcon } from '../utils/iconMap';
import PageWrapper from '../components/PageWrapper/PageWrapper';

const ABOUT_COLLECTION = 'about_me';
const HEADER_COLLECTION = 'header_section';
const EXPERIENCES_COLLECTION = 'experiences';

export default function AboutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check URL hash to set default tab - if #experience, show experience tab
  const getTabFromHash = () => {
    const hash = location.hash.replace('#', '');
    if (hash === 'experience') return 'experience';
    if (hash === 'education') return 'education';
    if (hash === 'skills') return 'skills';
    return 'about';
  };
  
  const [activeTab, setActiveTab] = useState(getTabFromHash);
  
  // Update tab when URL hash changes
  useEffect(() => {
    const newTab = getTabFromHash();
    setActiveTab(newTab);
  }, [location.hash]);

  const [aboutData, setAboutData] = useState({
    title: 'Who is Authoy Biswas Bidda',
    subtitle: 'GIS & Remote Sensing Specialist',
    name: 'Authoy Biswas Bidda',
    nameFont: "'Playfair Display', serif",
    photoUrl: '',
    bioText: '',
    bioTextFont: "'Georgia', serif",
    researchLinks: []
  });

  const [researchLinks, setResearchLinks] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [selectedExp, setSelectedExp] = useState(null);

  const educationData = [
    {
      degree: 'BSc in Geography and Environment',
      institution: 'Islamic University Bangladesh',
      location: 'Kushtia, Bangladesh',
      duration: 'March 2022 - Current',
      cgpa: '3.45',
      scale: '4.00',
      status: 'ongoing',
      color: '#2596be',
    },
    {
      degree: 'HSC - Higher Secondary Certificate',
      institution: 'Govt. H.S.S. Collage, Magura',
      location: 'JHENAIDAH',
      duration: '2018 - 2020',
      cgpa: '5.00',
      scale: '5.00',
      status: 'completed',
      color: '#3ba8d1',
    },
    {
      degree: 'SSC - Secondary School Certificate',
      institution: 'JGHS - Jhenaidah Government High School',
      location: 'JHENAIDAH',
      duration: '2016 - 2018',
      cgpa: '5.00',
      scale: '5.00',
      status: 'completed',
      color: '#51b9e4',
    },
  ];

  const skills = [
    { name: 'ArcGIS Pro', category: 'GIS' },
    { name: 'QGIS', category: 'GIS' },
    { name: 'Python', category: 'Programming' },
    { name: 'R', category: 'Programming' },
    { name: 'SPSS', category: 'Analysis' },
    { name: 'MS Office', category: 'Tools' },
    { name: 'Remote Sensing', category: 'GIS' },
    { name: 'Spatial Analysis', category: 'GIS' },
  ];

  useEffect(() => {
    loadAboutData();
    loadResearchLinks();
    loadExperiences();
  }, []);

  const loadAboutData = async () => {
    try {
      const result = await databaseService.listDocuments(ABOUT_COLLECTION);
      if (result.success && result.data.documents.length > 0) {
        const data = result.data.documents[0];
        setAboutData({
          title: data.title || 'Who is Authoy Biswas Bidda',
          subtitle: data.subtitle || 'GIS & Remote Sensing Specialist',
          name: data.name || 'Authoy Biswas Bidda',
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

  const loadResearchLinks = async () => {
    try {
      const result = await databaseService.listDocuments(HEADER_COLLECTION);
      if (result.success && result.data.documents.length > 0) {
        const headerSettings = result.data.documents[0];
        if (headerSettings.socialLinks) {
          const links = JSON.parse(headerSettings.socialLinks);
          setResearchLinks(links.sort((a, b) => a.order - b.order));
        }
      }
    } catch (error) {
      console.error('Error loading research links:', error);
    }
  };

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
        if (sorted.length > 0) setSelectedExp(sorted[0]);
      }
    } catch (error) {
      console.error('Error loading experiences:', error);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getTypeIcon = (type) => {
    const icons = {
      work: Briefcase,
      education: GraduationCap,
      achievement: Trophy,
      award: Award,
    };
    return icons[type?.toLowerCase()] || Award;
  };

  const tabs = [
    { id: 'about', label: 'About', icon: User },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'skills', label: 'Skills', icon: Code },
  ];

  return (
    <PageWrapper>
      <main className="min-h-[calc(100vh-144px)] pt-6 pb-8">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-[#2596be] transition-colors mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {/* Main Content Card */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* Header Section */}
            <div
              className="p-8 lg:p-10 text-white relative"
              style={{ background: 'linear-gradient(160deg, #2596be 0%, #1d7a9a 50%, #3ba8d1 100%)' }}
            >
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Profile Image */}
                {aboutData.photoUrl ? (
                  <img
                    src={aboutData.photoUrl}
                    alt={aboutData.name}
                    className="w-28 h-28 rounded-2xl object-cover border-3 border-white/20 shadow-xl"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-2xl bg-white/10 flex items-center justify-center border-3 border-white/20">
                    <User className="w-12 h-12 text-white/60" />
                  </div>
                )}

                {/* Name & Title */}
                <div className="flex-grow">
                  <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: aboutData.nameFont }}>
                    {aboutData.name}
                  </h1>
                  <p className="text-white/70 text-sm mb-3">{aboutData.subtitle}</p>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate('/contact')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-all"
                    >
                      <Mail className="w-4 h-4" />
                      Contact Me
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4 md:gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">3+</div>
                    <div className="text-[10px] uppercase tracking-wider text-white/60">Years Exp</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">38+</div>
                    <div className="text-[10px] uppercase tracking-wider text-white/60">Projects</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-100">
              <div className="flex">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all border-b-2 ${
                        activeTab === tab.id
                          ? 'border-[#2596be] text-[#2596be]'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-8 lg:p-10">
              {/* About Tab */}
              {activeTab === 'about' && (
                <div className="space-y-8">
                  {/* Bio */}
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5" style={{ color: '#2596be' }} />
                      About Me
                    </h2>
                    <div
                      className="text-gray-600 leading-relaxed space-y-4"
                      style={{ fontFamily: aboutData.bioTextFont }}
                    >
                      {aboutData.bioText ? (
                        aboutData.bioText.split('\n\n').filter(p => p.trim()).map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))
                      ) : (
                        <p>
                          Authoy Biswas Bidda was born in Jhenaidah, Dhaka, Bangladesh. The name come from the oysters. He completed his school education in{' '}
                          <a 
                            href="http://www.jhenidahghs.edu.bd/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#2596be] hover:underline font-bold"
                          >
                            Jhenaidah Government High School
                          </a>
                          . He passed his HSC from{' '}
                          <a 
                            href="https://bn.wikipedia.org/wiki/%E0%A6%B8%E0%A6%B0%E0%A6%95%E0%A6%BE%E0%A6%B0%E0%A6%BF_%E0%A6%B9%E0%A7%8B%E0%A6%B8%E0%A7%87%E0%A6%A8_%E0%A6%B6%E0%A6%B9%E0%A7%80%E0%A6%A6_%E0%A6%B8%E0%A7%8B%E0%A6%B9%E0%A6%B0%E0%A6%BE%E0%A6%93%E0%A6%AF%E0%A6%BC%E0%A6%BE%E0%A6%B0%E0%A7%8D%E0%A6%A6%E0%A7%80_%E0%A6%95%E0%A6%B2%E0%A7%87%E0%A6%9C,_%E0%A6%AE%E0%A6%BE%E0%A6%97%E0%A7%81%E0%A6%B0%E0%A6%BE" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#2596be] hover:underline font-bold"
                          >
                            Govt. H.S.S. Collage, Magura
                          </a>
                          . His 4th year 2nd semester is running Department of Environmental Science and Geography at{' '}
                          <a 
                            href="https://iu.ac.bd/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#2596be] hover:underline font-bold"
                          >
                            Islamic University, Kushtia
                          </a>
                          , Bangladesh. Along with my studies, I like learning about maps, the environment, and how the Earth works. I enjoy using new tools and technology to understand different things in nature. People say I am ethical, creative, hardworking person. I take part in different class projects and enjoy learning with my friends. In my free time, I love traveling, seeing new places, and improving my skills.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Research Profile Links */}
                  {aboutData.researchLinks.length > 0 && (
                    <div>
                      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5" style={{ color: '#2596be' }} />
                        Research Profiles
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {aboutData.researchLinks
                          .filter(link => !link.hidden)
                          .sort((a, b) => (a.order || 0) - (b.order || 0))
                          .map((link, index) => (
                            <a
                              key={index}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-[#2596be] hover:text-white text-gray-700 transition-all group"
                            >
                              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md">
                                {link.iconUrl ? (
                                  <img src={link.iconUrl} alt={link.name} className="w-full h-full object-cover" />
                                ) : (
                                  <ExternalLink className="w-5 h-5 text-[#2596be]" />
                                )}
                              </div>
                              <span className="text-sm font-medium truncate">{link.name}</span>
                            </a>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Education Tab */}
              {activeTab === 'education' && (
                <div>
                  <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" style={{ color: '#2596be' }} />
                    Educational Qualification
                  </h2>

                  <div className="space-y-4">
                    {educationData.map((edu, index) => (
                      <div
                        key={index}
                        className="relative p-5 rounded-xl border-2 border-gray-100 hover:border-[#2596be]/30 transition-all group"
                      >
                        {/* Status Badge */}
                        {edu.status === 'ongoing' && (
                          <div
                            className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white"
                            style={{ background: edu.color }}
                          >
                            In Progress
                          </div>
                        )}

                        <div className="flex gap-4">
                          {/* Icon */}
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: `${edu.color}15` }}
                          >
                            {index === 0 ? (
                              <GraduationCap className="w-6 h-6" style={{ color: edu.color }} />
                            ) : index === 1 ? (
                              <BookOpen className="w-6 h-6" style={{ color: edu.color }} />
                            ) : (
                              <Award className="w-6 h-6" style={{ color: edu.color }} />
                            )}
                          </div>

                          <div className="flex-grow">
                            {/* Degree */}
                            <h3 className="text-base font-bold text-gray-800 mb-1">
                              {edu.degree}
                            </h3>

                            {/* Institution */}
                            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                              <BookOpen className="w-3.5 h-3.5" style={{ color: edu.color }} />
                              {edu.institution}
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                              <MapPin className="w-3.5 h-3.5" style={{ color: edu.color }} />
                              {edu.location}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between">
                              {/* Duration */}
                              <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <Calendar className="w-3.5 h-3.5" style={{ color: edu.color }} />
                                {edu.duration}
                              </div>

                              {/* CGPA Badge */}
                              <div
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-sm font-bold"
                                style={{ background: edu.color }}
                              >
                                <span className="text-[10px] opacity-80">
                                  {edu.status === 'ongoing' ? 'CGPA' : 'GPA'}
                                </span>
                                <span>{edu.cgpa}</span>
                                <span className="text-[10px] opacity-80">/ {edu.scale}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience Tab - Unique Timeline Design */}
              {activeTab === 'experience' && (
                <div>
                  <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" style={{ color: '#2596be' }} />
                    Experience & Milestones
                  </h2>

                  {experiences.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No experiences added yet</p>
                    </div>
                  ) : (
                    <div className="grid lg:grid-cols-5 gap-6">
                      {/* Left - Timeline List */}
                      <div className="lg:col-span-2 relative">
                        {/* Vertical Line */}
                        <div 
                          className="absolute left-5 top-0 bottom-0 w-0.5 hidden sm:block"
                          style={{ background: 'linear-gradient(180deg, #2596be 0%, #51b9e4 100%)' }}
                        />
                        
                        <div className="space-y-3">
                          {experiences.map((exp, index) => {
                            const TypeIcon = getTypeIcon(exp.type);
                            const isSelected = selectedExp?.$id === exp.$id;
                            const cardColor = exp.color || '#2596be';
                            
                            return (
                              <button
                                key={exp.$id}
                                onClick={() => setSelectedExp(exp)}
                                className={`w-full text-left relative pl-12 sm:pl-14 pr-4 py-4 rounded-xl transition-all duration-300 ${
                                  isSelected 
                                    ? 'bg-white shadow-lg border-2' 
                                    : 'bg-gray-50 hover:bg-white hover:shadow-md border-2 border-transparent'
                                }`}
                                style={{ 
                                  borderColor: isSelected ? cardColor : 'transparent',
                                }}
                              >
                                {/* Timeline Dot */}
                                <div 
                                  className={`absolute left-3 sm:left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-3 transition-all ${
                                    isSelected ? 'scale-125' : ''
                                  }`}
                                  style={{ 
                                    backgroundColor: isSelected ? cardColor : 'white',
                                    borderColor: cardColor,
                                  }}
                                />
                                
                                {/* Content */}
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span 
                                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                                        style={{ 
                                          backgroundColor: `${cardColor}15`,
                                          color: cardColor 
                                        }}
                                      >
                                        {exp.type || 'Achievement'}
                                      </span>
                                    </div>
                                    <h4 className="font-semibold text-gray-800 text-sm line-clamp-1">
                                      {exp.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {exp.organization || formatDate(exp.startDate)}
                                    </p>
                                  </div>
                                  <ChevronRight 
                                    className={`w-4 h-4 flex-shrink-0 transition-transform ${
                                      isSelected ? 'rotate-90' : ''
                                    }`}
                                    style={{ color: isSelected ? cardColor : '#9ca3af' }}
                                  />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right - Detail Card */}
                      <div className="lg:col-span-3">
                        {selectedExp && (
                          <div 
                            className="rounded-2xl overflow-hidden shadow-lg border-2 h-full"
                            style={{ borderColor: selectedExp.color || '#2596be' }}
                          >
                            {/* Header with gradient */}
                            <div 
                              className="p-6 text-white relative overflow-hidden"
                              style={{ 
                                background: `linear-gradient(135deg, ${selectedExp.color || '#2596be'} 0%, ${selectedExp.colorSecondary || '#3ba8d1'} 100%)` 
                              }}
                            >
                              {/* Decorative circle */}
                              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10" />
                              
                              <div className="relative z-10">
                                {/* Type Badge */}
                                <div className="inline-flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full mb-3">
                                  {(() => {
                                    const TypeIcon = getTypeIcon(selectedExp.type);
                                    return <TypeIcon className="w-3.5 h-3.5" />;
                                  })()}
                                  <span className="text-xs font-semibold uppercase tracking-wider">
                                    {selectedExp.type || 'Achievement'}
                                  </span>
                                </div>
                                
                                <h3 className="text-xl font-bold mb-1">{selectedExp.title}</h3>
                                {selectedExp.organization && (
                                  <p className="text-white/80 text-sm">{selectedExp.organization}</p>
                                )}
                                
                                {/* Date & Location */}
                                <div className="flex flex-wrap gap-4 mt-3">
                                  {selectedExp.startDate && (
                                    <div className="flex items-center gap-1.5 text-white/70 text-xs">
                                      <Calendar className="w-3.5 h-3.5" />
                                      <span>
                                        {formatDate(selectedExp.startDate)}
                                        {selectedExp.endDate && ` - ${selectedExp.current ? 'Present' : formatDate(selectedExp.endDate)}`}
                                      </span>
                                    </div>
                                  )}
                                  {selectedExp.location && (
                                    <div className="flex items-center gap-1.5 text-white/70 text-xs">
                                      <MapPin className="w-3.5 h-3.5" />
                                      <span>{selectedExp.location}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Body */}
                            <div className="p-6 bg-white">
                              {/* Image */}
                              {selectedExp.imageUrl && (
                                <div className="mb-4 rounded-xl overflow-hidden bg-gray-50">
                                  <img
                                    src={selectedExp.imageUrl}
                                    alt={selectedExp.title}
                                    className="w-full h-40 object-contain"
                                  />
                                </div>
                              )}

                              {/* Description */}
                              {selectedExp.description && (
                                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                  {selectedExp.description}
                                </p>
                              )}

                              {/* Skills */}
                              {selectedExp.skills && selectedExp.skills.length > 0 && (
                                <div className="mb-4">
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Skills
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {selectedExp.skills.map((skill, idx) => (
                                      <span 
                                        key={idx}
                                        className="px-2.5 py-1 rounded-full text-xs font-medium"
                                        style={{ 
                                          backgroundColor: `${selectedExp.color || '#2596be'}10`,
                                          color: selectedExp.color || '#2596be'
                                        }}
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Credential Link */}
                              {selectedExp.credentialUrl && (
                                <a
                                  href={selectedExp.credentialUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                                  style={{ backgroundColor: selectedExp.color || '#105652' }}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  View Credential
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Skills Tab - Redesigned */}
              {activeTab === 'skills' && (
                <div>
                  <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Code className="w-5 h-5" style={{ color: '#2596be' }} />
                    Skills & Expertise
                  </h2>

                  {/* Skills Grid - Card Style */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* GIS Category */}
                    <div 
                      className="relative p-5 rounded-2xl overflow-hidden group hover:shadow-lg transition-all"
                      style={{ background: 'linear-gradient(135deg, #2596be 0%, #1d7a9a 100%)' }}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-bold">GIS & Mapping</h3>
                            <p className="text-white/60 text-xs">Geographic Information Systems</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {skills.filter(s => s.category === 'GIS').map((skill, idx) => (
                            <span 
                              key={idx}
                              className="px-3 py-1.5 rounded-lg bg-white/15 text-white text-sm font-medium backdrop-blur-sm hover:bg-white/25 transition-all"
                            >
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Programming Category */}
                    <div 
                      className="relative p-5 rounded-2xl overflow-hidden group hover:shadow-lg transition-all"
                      style={{ background: 'linear-gradient(135deg, #3ba8d1 0%, #51b9e4 100%)' }}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <Code className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-bold">Programming</h3>
                            <p className="text-white/60 text-xs">Languages & Scripting</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {skills.filter(s => s.category === 'Programming').map((skill, idx) => (
                            <span 
                              key={idx}
                              className="px-3 py-1.5 rounded-lg bg-white/15 text-white text-sm font-medium backdrop-blur-sm hover:bg-white/25 transition-all"
                            >
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Analysis Category */}
                    <div 
                      className="relative p-5 rounded-2xl overflow-hidden group hover:shadow-lg transition-all"
                      style={{ background: 'linear-gradient(135deg, #51b9e4 0%, #6bc9f0 100%)' }}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <Award className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-bold">Data Analysis</h3>
                            <p className="text-white/60 text-xs">Statistical & Spatial Analysis</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {skills.filter(s => s.category === 'Analysis').map((skill, idx) => (
                            <span 
                              key={idx}
                              className="px-3 py-1.5 rounded-lg bg-white/15 text-white text-sm font-medium backdrop-blur-sm hover:bg-white/25 transition-all"
                            >
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Tools Category */}
                    <div 
                      className="relative p-5 rounded-2xl overflow-hidden group hover:shadow-lg transition-all"
                      style={{ background: 'linear-gradient(135deg, #1d7a9a 0%, #2596be 100%)' }}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-bold">Tools & Software</h3>
                            <p className="text-white/60 text-xs">Productivity & Documentation</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {skills.filter(s => s.category === 'Tools').map((skill, idx) => (
                            <span 
                              key={idx}
                              className="px-3 py-1.5 rounded-lg bg-white/15 text-white text-sm font-medium backdrop-blur-sm hover:bg-white/25 transition-all"
                            >
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skill Level Indicators */}
                  <div className="mt-8 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Proficiency Overview</h3>
                    <div className="space-y-3">
                      {[
                        { name: 'GIS & Remote Sensing', level: 90, color: '#105652' },
                        { name: 'Spatial Analysis', level: 85, color: '#1E8479' },
                        { name: 'Python & R', level: 75, color: '#2AA08F' },
                        { name: 'Data Visualization', level: 80, color: '#3db8a5' },
                      ].map((item, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">{item.name}</span>
                            <span className="text-xs font-semibold" style={{ color: item.color }}>{item.level}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-1000"
                              style={{ 
                                width: `${item.level}%`,
                                background: `linear-gradient(90deg, ${item.color}, ${item.color}99)`
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Research & Social Links Bar */}
          {researchLinks.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl shadow-md p-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Find me online</h3>
                  <p className="text-xs text-gray-500">Social links</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {researchLinks.map((link, index) => {
                    const Icon = getIcon(link.icon);
                    return (
                      <a
                        key={link.id || index}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 hover:bg-[#105652] hover:text-white text-gray-700 text-sm font-medium transition-all"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{link.label}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </PageWrapper>
  );
}
