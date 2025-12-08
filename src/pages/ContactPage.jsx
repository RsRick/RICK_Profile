import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Phone, Send, ArrowLeft, MapPin,
  Linkedin, Github, Twitter, Facebook, Instagram,
  Youtube, Globe, ExternalLink, Copy, Check
} from 'lucide-react';
import { databaseService } from '../lib/appwrite';
import { getIcon } from '../utils/iconMap';
import PageWrapper from '../components/PageWrapper/PageWrapper';

const CONTACT_SETTINGS_COLLECTION = 'contact_settings';
const CONTACT_RESPONSES_COLLECTION = 'contact_responses';
const HEADER_COLLECTION = 'header_section';

const socialIconMap = {
  linkedin: Linkedin,
  github: Github,
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  globe: Globe,
  mail: Mail,
  link: ExternalLink,
};

export default function ContactPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const [settings, setSettings] = useState({
    profileImage: '',
    name: 'Authoy Biswas Bidda',
    title: 'GIS & Remote Sensing Specialist',
    description: 'Authoy Biswas Bidda is available for impactful research that promotes sustainability and addresses global Climate Change and Environment.',
    phone: '+880 1703 958919',
    email: 'rsrickbiswas007@gmail.com',
    location: 'Bangladesh',
    socialLinks: []
  });

  const [researchLinks, setResearchLinks] = useState([]);

  useEffect(() => {
    loadSettings();
    loadResearchLinks();
  }, []);

  const loadSettings = async () => {
    try {
      const result = await databaseService.listDocuments(CONTACT_SETTINGS_COLLECTION);
      if (result.success && result.data.documents.length > 0) {
        const data = result.data.documents[0];
        let socialLinks = [];
        if (data.socialLinks) {
          try {
            socialLinks = JSON.parse(data.socialLinks);
          } catch (e) {
            socialLinks = [];
          }
        }
        setSettings({
          profileImage: data.profileImage || '',
          name: data.name || settings.name,
          title: data.title || settings.title,
          description: data.description || settings.description,
          phone: data.phone || settings.phone,
          email: data.email || settings.email,
          location: data.location || settings.location,
          socialLinks: socialLinks
        });
      }
    } catch (error) {
      console.error('Error loading contact settings:', error);
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      const result = await databaseService.createDocument(
        CONTACT_RESPONSES_COLLECTION,
        {
          name: formData.name,
          email: formData.email,
          phone: '',
          subject: formData.subject,
          message: formData.message,
          isRead: false
        }
      );

      if (result.success) {
        setSubmitSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setSubmitSuccess(false), 4000);
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getSocialIcon = (iconName) => {
    const IconComponent = socialIconMap[iconName] || ExternalLink;
    return <IconComponent className="w-4 h-4" />;
  };

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
            <div className="grid lg:grid-cols-5">
              {/* Left Side - Profile */}
              <div
                className="lg:col-span-2 p-8 lg:p-10 text-white relative"
                style={{ background: 'linear-gradient(160deg, #2596be 0%, #1d7a9a 50%, #3ba8d1 100%)' }}
              >
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                  {/* Profile Image */}
                  <div className="mb-6">
                    {settings.profileImage ? (
                      <img
                        src={settings.profileImage}
                        alt={settings.name}
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20 shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center border-2 border-white/20">
                        <span className="text-3xl font-bold">{settings.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>

                  {/* Name & Title */}
                  <h1 className="text-2xl font-bold mb-1">{settings.name}</h1>
                  <p className="text-white/60 text-sm mb-4">{settings.title}</p>

                  {/* Description */}
                  <p className="text-white/80 text-sm leading-relaxed mb-8">
                    Authoy Biswas Bidda is available for impactful research that promotes sustainability and addresses global <span className="font-bold">Climate Change and Environment</span>.
                  </p>

                  {/* Contact Info - Clickable */}
                  <div className="space-y-3">
                    {/* Email */}
                    <button
                      onClick={() => copyToClipboard(settings.email, 'email')}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-all group text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-white/50">Email</p>
                        <p className="text-sm truncate">{settings.email}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {copiedField === 'email' ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-white/40 group-hover:text-white/70" />
                        )}
                      </div>
                    </button>

                    {/* Phone */}
                    {settings.phone && (
                      <button
                        onClick={() => copyToClipboard(settings.phone, 'phone')}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-all group text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-[10px] uppercase tracking-wider text-white/50">Phone</p>
                          <p className="text-sm">{settings.phone}</p>
                        </div>
                        <div className="flex-shrink-0">
                          {copiedField === 'phone' ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-white/40 group-hover:text-white/70" />
                          )}
                        </div>
                      </button>
                    )}

                    {/* Location */}
                    {settings.location && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-white/50">Location</p>
                          <p className="text-sm">{settings.location}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Social Links */}
                  {settings.socialLinks.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-white/10">
                      <p className="text-[10px] uppercase tracking-wider text-white/50 mb-3">Connect</p>
                      <div className="flex gap-2 flex-wrap">
                        {settings.socialLinks.map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-105"
                            title={link.platform}
                          >
                            {getSocialIcon(link.icon)}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="lg:col-span-3 p-8 lg:p-10">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-1">Send me a message</h2>
                  <p className="text-gray-500 text-sm">I'll respond within 24 hours</p>
                </div>

                {submitSuccess && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    <span>Message sent! I'll get back to you soon.</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Your Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/10 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/10 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="What's this about?"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/10 outline-none transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="4"
                      placeholder="Tell me about your project or inquiry..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/10 outline-none transition-all text-sm resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all hover:shadow-lg disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #2596be, #3ba8d1)' }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Research & Social Links - Horizontal Bar */}
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
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 hover:bg-[#2596be] hover:text-white text-gray-700 text-sm font-medium transition-all"
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
