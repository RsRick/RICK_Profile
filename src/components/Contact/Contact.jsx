import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, Linkedin, Github, Twitter, Facebook, Instagram, Youtube, Globe, ExternalLink } from 'lucide-react';
import { databaseService } from '../../lib/appwrite';

const CONTACT_SETTINGS_COLLECTION = 'contact_settings';
const CONTACT_RESPONSES_COLLECTION = 'contact_responses';

const iconMap = {
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

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Contact settings from database
  const [settings, setSettings] = useState({
    profileImage: '',
    name: 'Parvej Hossain',
    title: 'GIS & Remote Sensing Specialist',
    description: 'I am available for impactful research that promotes sustainability and addresses global climate change and environment.',
    phone: '+880 1714 594091',
    email: 'official.parvej.hossain@gmail.com',
    location: 'Bangladesh',
    socialLinks: []
  });

  useEffect(() => {
    loadSettings();
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
          phone: formData.phone || '',
          subject: formData.subject,
          message: formData.message,
          isRead: false
        }
      );

      if (result.success) {
        setSubmitSuccess(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setTimeout(() => setSubmitSuccess(false), 5000);
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

  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || ExternalLink;
    return <IconComponent className="w-5 h-5 text-white" />;
  };

  return (
    <section id="contact" className="py-16 relative overflow-hidden scroll-mt-20">
      {/* Gradient Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full blur-3xl" style={{ background: '#105652', width: '400px', height: '400px', top: '20%', right: '-100px', animation: 'float 22s ease-in-out infinite', opacity: 0.1 }} />
        <div className="absolute rounded-full blur-3xl" style={{ background: '#1E8479', width: '300px', height: '300px', bottom: '10%', left: '-50px', animation: 'float 18s ease-in-out infinite reverse', opacity: 0.08 }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#105652' }}>Get In Touch</h2>
          <p className="text-gray-500 text-sm">Have a project in mind? Let's work together</p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-8">
          {/* Left Column - Info Card */}
          <div className="lg:col-span-2">
            <div className="h-full rounded-lg p-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #105652 0%, #1E8479 100%)', boxShadow: '8px 8px 0px #0a3533' }}>
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <svg viewBox="0 0 100 100" className="w-full h-full"><circle cx="80" cy="20" r="40" fill="white" /></svg>
              </div>
              <div className="absolute bottom-0 left-0 w-24 h-24 opacity-10">
                <svg viewBox="0 0 100 100" className="w-full h-full"><circle cx="20" cy="80" r="30" fill="white" /></svg>
              </div>

              <div className="relative z-10">
                {settings.profileImage ? (
                  <img src={settings.profileImage} alt={settings.name} className="w-20 h-20 rounded-full object-cover mb-6 border-2 border-white/30" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 border-2 border-white/30">
                    <span className="text-3xl font-bold text-white">{settings.name.charAt(0)}</span>
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-white mb-1">{settings.name}</h3>
                <p className="text-white/70 text-sm mb-6">{settings.title}</p>
                <p className="text-white/80 text-sm leading-relaxed mb-8">{settings.description}</p>

                <div className="space-y-4 mb-8">
                  {settings.phone && (
                    <div className="flex items-center gap-3 text-white/90">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center"><Phone className="w-5 h-5" /></div>
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-wider">Phone</p>
                        <p className="text-sm font-medium">{settings.phone}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-white/90">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center"><Mail className="w-5 h-5" /></div>
                    <div>
                      <p className="text-xs text-white/60 uppercase tracking-wider">Email</p>
                      <p className="text-sm font-medium">{settings.email}</p>
                    </div>
                  </div>
                  {settings.location && (
                    <div className="flex items-center gap-3 text-white/90">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center"><MapPin className="w-5 h-5" /></div>
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-wider">Location</p>
                        <p className="text-sm font-medium">{settings.location}</p>
                      </div>
                    </div>
                  )}
                </div>

                {settings.socialLinks.length > 0 && (
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-wider mb-3">Find me on</p>
                    <div className="flex gap-3 flex-wrap">
                      {settings.socialLinks.map((link, index) => (
                        <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-1" title={link.platform}>
                          {getIcon(link.icon)}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 relative" style={{ border: '2px solid #105652', boxShadow: '6px 6px 0px #105652' }}>
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-1" style={{ color: '#105652' }}>Send a Message</h3>
                <p className="text-gray-500 text-sm">Fill out the form below and I'll get back to you soon</p>
              </div>

              {submitSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  ✓ Message sent successfully! I'll get back to you soon.
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-5 mb-5">
                <div className="relative">
                  <label className={`absolute left-3 transition-all duration-300 pointer-events-none ${focusedField === 'name' || formData.name ? '-top-2.5 text-xs bg-white px-1 text-[#105652] font-medium' : 'top-3 text-gray-400 text-sm'}`}>Your Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} required className="w-full px-4 py-3 rounded-md border-2 border-gray-200 focus:border-[#105652] outline-none transition-all duration-300" style={{ boxShadow: focusedField === 'name' ? '3px 3px 0px #105652' : 'none' }} />
                </div>
                <div className="relative">
                  <label className={`absolute left-3 transition-all duration-300 pointer-events-none ${focusedField === 'phone' || formData.phone ? '-top-2.5 text-xs bg-white px-1 text-[#105652] font-medium' : 'top-3 text-gray-400 text-sm'}`}>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)} className="w-full px-4 py-3 rounded-md border-2 border-gray-200 focus:border-[#105652] outline-none transition-all duration-300" style={{ boxShadow: focusedField === 'phone' ? '3px 3px 0px #105652' : 'none' }} />
                </div>
              </div>

              <div className="relative mb-5">
                <label className={`absolute left-3 transition-all duration-300 pointer-events-none ${focusedField === 'email' || formData.email ? '-top-2.5 text-xs bg-white px-1 text-[#105652] font-medium' : 'top-3 text-gray-400 text-sm'}`}>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} required className="w-full px-4 py-3 rounded-md border-2 border-gray-200 focus:border-[#105652] outline-none transition-all duration-300" style={{ boxShadow: focusedField === 'email' ? '3px 3px 0px #105652' : 'none' }} />
              </div>

              <div className="relative mb-5">
                <label className={`absolute left-3 transition-all duration-300 pointer-events-none ${focusedField === 'subject' || formData.subject ? '-top-2.5 text-xs bg-white px-1 text-[#105652] font-medium' : 'top-3 text-gray-400 text-sm'}`}>Subject</label>
                <input type="text" name="subject" value={formData.subject} onChange={handleChange} onFocus={() => setFocusedField('subject')} onBlur={() => setFocusedField(null)} required className="w-full px-4 py-3 rounded-md border-2 border-gray-200 focus:border-[#105652] outline-none transition-all duration-300" style={{ boxShadow: focusedField === 'subject' ? '3px 3px 0px #105652' : 'none' }} />
              </div>

              <div className="relative mb-6">
                <label className={`absolute left-3 transition-all duration-300 pointer-events-none ${focusedField === 'message' || formData.message ? '-top-2.5 text-xs bg-white px-1 text-[#105652] font-medium' : 'top-3 text-gray-400 text-sm'}`}>Your Message</label>
                <textarea name="message" value={formData.message} onChange={handleChange} onFocus={() => setFocusedField('message')} onBlur={() => setFocusedField(null)} required rows="4" className="w-full px-4 py-3 rounded-md border-2 border-gray-200 focus:border-[#105652] outline-none transition-all duration-300 resize-none" style={{ boxShadow: focusedField === 'message' ? '3px 3px 0px #105652' : 'none' }} />
              </div>

              <button type="submit" disabled={isSubmitting} className="group w-full py-3 px-6 rounded-md font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 hover:translate-x-[-3px] hover:translate-y-[-3px] active:translate-x-0 active:translate-y-0 disabled:opacity-70" style={{ backgroundColor: '#105652', boxShadow: '4px 4px 0px #0a3533' }}>
                {isSubmitting ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Sending...</>) : (<>Send Message<Send className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" /></>)}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
