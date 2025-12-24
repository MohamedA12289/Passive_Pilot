
'use client';

import { useState } from 'react';
import { Mail, ArrowRight, Sparkles, X } from 'lucide-react';

interface EmailCaptureProps {
  variant?: 'inline' | 'popup';
  title?: string;
  description?: string;
  buttonText?: string;
  onClose?: () => void;
}

export default function EmailCapture({ 
  variant = 'inline',
  title = "Get Free Wholesaling Deals Direct To Your Inbox",
  description = "Join 2,800+ wholesalers getting weekly deal alerts, market insights, and exclusive strategies.",
  buttonText = "Get Free Access",
  onClose
}: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Subscription error:', data.error);
        setError(data.error || 'Failed to subscribe. Please try again.');
        setLoading(false);
        return;
      }

      // Show success message only on actual success
      console.log('Subscription successful:', data);
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to subscribe:', error);
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={`${variant === 'popup' ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4' : ''}`}>
        <div className={`relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-8 ${variant === 'popup' ? 'max-w-md w-full' : ''}`}>
          {variant === 'popup' && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-amber-500/50 animate-pulse">
              <Mail className="w-10 h-10 text-black" />
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-3">
              Check Your Email! 📬✨
            </h3>
            <p className="text-gray-200 text-lg mb-4 font-medium">
              I just sent you the <span className="text-amber-400 font-bold text-xl">FREE Wholesaling Starter Pack</span> 🎁
            </p>
            <p className="text-gray-300 mb-6 text-sm">
              Everything you need to start closing deals this week 👇
            </p>
            <ul className="text-left space-y-3 text-base text-white mb-6 bg-white/5 border border-amber-500/20 rounded-xl p-6">
              <li className="flex items-start gap-3">
                <span className="text-2xl">📞</span>
                <span><span className="font-bold text-amber-400">Cold Calling Scripts</span> - Word-for-word scripts I use to get deals</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">🏆</span>
                <span><span className="font-bold text-amber-400">My Personal Buyers List</span> - Exact template & strategies to build yours</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">📚</span>
                <span><span className="font-bold text-amber-400">100+ Page Ebook</span> - Complete wholesaling guide from $0 to $100k</span>
              </li>
            </ul>
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 mb-4">
              <p className="text-green-400 font-semibold text-sm">
                ✅ Check your email inbox (and spam folder) right now!
              </p>
            </div>
            {variant === 'popup' && (
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold py-3 px-6 rounded-xl hover:from-amber-400 hover:to-yellow-400 transition-all"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${variant === 'popup' ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4' : ''}`}>
      <div className={`relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-8 ${variant === 'popup' ? 'max-w-md w-full' : ''}`}>
        {/* Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-xl opacity-20 animate-pulse" />
        
        {variant === 'popup' && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="relative">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-full px-4 py-1.5 mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                FREE INSTANT ACCESS
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-300 text-sm">{description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First Name"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
              />
            </div>

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold py-4 px-6 rounded-xl hover:from-amber-400 hover:to-yellow-400 transition-all duration-300 shadow-lg hover:shadow-amber-500/50 disabled:opacity-50 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  {buttonText}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400">
              🔒 Your info is 100% secure. Unsubscribe anytime.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
