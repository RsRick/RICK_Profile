import { useState } from 'react';
import { Send } from 'lucide-react';
import { newsletterService } from '../../lib/appwrite';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ type: 'error', text: 'Invalid email' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await newsletterService.subscribe(email);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Subscribed!' });
        setEmail('');
      } else {
        setMessage({ type: 'error', text: result.error === 'Already subscribed' ? 'Already subscribed' : 'Failed to subscribe' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="w-full py-2.5 px-4 mt-auto backdrop-blur-md"
      style={{ 
        background: 'rgba(16, 86, 82, 0.75)',
        borderTop: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Copyright - Left Side */}
          <div className="text-white text-xs flex items-center gap-1">
            <span>© {currentYear}</span>
            <span className="mx-0.5">|</span>
            <span>All rights reserved to</span>
            <span className="font-semibold ml-0.5">Authoy Biswas Bidda</span>
          </div>

          {/* Newsletter - Right Side */}
          <div className="flex items-center gap-2">
            <span className="text-white text-xs hidden sm:block">Don't miss our future updates! Get Subscribed Today!</span>
            <form onSubmit={handleSubscribe} className="flex items-center">
              <div className="relative flex items-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-40 sm:w-48 px-3 py-1.5 text-xs rounded-l-full bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all backdrop-blur-sm"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3 py-1.5 bg-white/90 text-[#105652] font-medium text-xs rounded-r-full hover:bg-white transition-all disabled:opacity-70 flex items-center gap-1 backdrop-blur-sm"
                >
                  {isSubmitting ? (
                    <span className="w-3 h-3 border-2 border-[#105652] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="hidden sm:inline">Subscribe</span>
                      <Send className="w-3 h-3 sm:hidden" />
                    </>
                  )}
                </button>
              </div>
              {message.text && (
                <span className={`ml-2 text-[10px] ${message.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
                  {message.text}
                </span>
              )}
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
}
