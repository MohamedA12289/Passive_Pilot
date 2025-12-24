'use client';

import { useState } from 'react';
import { Phone, Mail, MessageCircle, Copy, ExternalLink, User, MapPin, CheckCircle, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface EnhancedOwnerContactProps {
  ownerInfo: {
    name?: string;
    mailingAddress?: string;
    phones?: string[];
    emails?: string[];
  } | null;
  propertyAddress: string;
}

export default function EnhancedOwnerContact({ ownerInfo, propertyAddress }: EnhancedOwnerContactProps) {
  const router = useRouter();
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  if (!ownerInfo) {
    return (
      <div className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-red-500/30 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-white mb-2">No Owner Data Found</h3>
        <p className="text-gray-400 font-poppins">Owner contact information is not available in public records for this property.</p>
      </div>
    );
  }

  const copyToClipboard = async (text: string, type: 'phone' | 'email') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'phone') {
        setCopiedPhone(text);
        setTimeout(() => setCopiedPhone(null), 2000);
      } else {
        setCopiedEmail(text);
        setTimeout(() => setCopiedEmail(null), 2000);
      }
      toast.success(`${type === 'phone' ? 'Phone' : 'Email'} copied!`);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleCallClick = (phone: string) => {
    window.location.href = `tel:${phone.replace(/[^0-9]/g, '')}`;
  };

  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleSendMessage = () => {
    // Pre-fill offer message generator with property and owner info
    const sellerName = ownerInfo.name || 'Property Owner';
    const sellerPhone = ownerInfo.phones && ownerInfo.phones.length > 0 ? ownerInfo.phones[0] : '';
    const sellerEmail = ownerInfo.emails && ownerInfo.emails.length > 0 ? ownerInfo.emails[0] : '';
    
    router.push(`/tools/offer-message-generator?propertyAddress=${encodeURIComponent(propertyAddress)}&sellerName=${encodeURIComponent(sellerName)}&sellerPhone=${encodeURIComponent(sellerPhone)}&sellerEmail=${encodeURIComponent(sellerEmail)}`);
    toast.success('✉️ Opening message generator with owner details!', {
      icon: '✨'
    });
  };

  return (
    <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 border-2 border-purple-500/40 rounded-2xl p-6 md:p-8 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <User className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-serif font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Owner Contact Info
            </h3>
            <p className="text-sm text-gray-400 font-poppins">Direct contact details</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full">
          <Star className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-montserrat font-semibold text-purple-400">VERIFIED</span>
        </div>
      </div>

      {/* Owner Name */}
      {ownerInfo.name && (
        <div className="bg-black/40 border border-purple-500/30 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-purple-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-400 font-poppins mb-1">Owner Name</p>
              <p className="text-xl font-montserrat font-bold text-white">{ownerInfo.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Mailing Address */}
      {ownerInfo.mailingAddress && (
        <div className="bg-black/40 border border-purple-500/30 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-purple-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-400 font-poppins mb-1">Mailing Address</p>
              <p className="text-base font-poppins text-white">{ownerInfo.mailingAddress}</p>
            </div>
          </div>
        </div>
      )}

      {/* Phone Numbers */}
      {ownerInfo.phones && ownerInfo.phones.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-300 font-poppins mb-3 flex items-center gap-2">
            <Phone className="w-4 h-4 text-purple-400" />
            Phone Numbers
          </p>
          <div className="space-y-2">
            {ownerInfo.phones.map((phone, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-2xl font-montserrat font-bold text-white tracking-wide">{phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCallClick(phone)}
                      className="p-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2 touch-manipulation"
                      type="button"
                    >
                      <Phone className="w-5 h-5" />
                      <span className="hidden sm:inline text-sm font-montserrat font-semibold">Call</span>
                    </button>
                    <button
                      onClick={() => copyToClipboard(phone, 'phone')}
                      className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg touch-manipulation"
                      type="button"
                    >
                      {copiedPhone === phone ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email Addresses */}
      {ownerInfo.emails && ownerInfo.emails.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-300 font-poppins mb-3 flex items-center gap-2">
            <Mail className="w-4 h-4 text-purple-400" />
            Email Addresses
          </p>
          <div className="space-y-2">
            {ownerInfo.emails.map((email, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-montserrat font-bold text-white truncate">{email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEmailClick(email)}
                      className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2 touch-manipulation"
                      type="button"
                    >
                      <Mail className="w-5 h-5" />
                      <span className="hidden sm:inline text-sm font-montserrat font-semibold">Email</span>
                    </button>
                    <button
                      onClick={() => copyToClipboard(email, 'email')}
                      className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg touch-manipulation"
                      type="button"
                    >
                      {copiedEmail === email ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Action: Send Offer Message */}
      <button
        onClick={handleSendMessage}
        className="w-full p-5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-black font-bold text-lg rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-amber-500/30 flex items-center justify-center gap-3 touch-manipulation"
        type="button"
      >
        <MessageCircle className="w-6 h-6" />
        <span>Send Offer Message to Owner</span>
        <ExternalLink className="w-5 h-5" />
      </button>

      {/* Tips */}
      <div className="mt-6 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
        <p className="text-xs text-gray-400 font-poppins leading-relaxed">
          💡 <span className="text-purple-400 font-semibold">Pro Tip:</span> Call within 24-48 hours of finding the property for best response rates. Have your offer ready before reaching out.
        </p>
      </div>
    </div>
  );
}
