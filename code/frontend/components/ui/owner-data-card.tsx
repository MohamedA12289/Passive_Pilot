'use client';

import { User, Mail, MapPin, Phone, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface OwnerDataCardProps {
  ownerInfo: any;
  propertyAddress: string;
}

export default function OwnerDataCard({ ownerInfo, propertyAddress }: OwnerDataCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!ownerInfo) {
    return null;
  }

  // Get contact details from the new API structure
  const ownerName = ownerInfo.ownerName || 'Not available from provider';
  const mailingAddress = ownerInfo.mailingAddress === 'Not available from provider' ? null : ownerInfo.mailingAddress;
  const phone = ownerInfo.phone || null;
  const email = ownerInfo.email || null;
  const secondaryOwner = ownerInfo.owner2 || null;
  
  // Check if we have any actual data
  const hasName = ownerName && ownerName !== 'Not available from provider';
  const hasMailingAddress = mailingAddress !== null;
  const hasPhone = phone !== null;
  const hasEmail = email !== null;
  const hasAnyData = hasMailingAddress || hasPhone || hasEmail;

  return (
    <div className="w-full bg-gradient-to-br from-black via-gray-900 to-black border-2 border-amber-500/40 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-yellow-600 p-6">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center shadow-lg">
            <User className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h3 className="text-2xl font-montserrat font-bold text-black">Property Owner Data</h3>
            <p className="text-sm text-black/80 font-poppins">Off-Market Contact Information</p>
          </div>
        </div>
      </div>

      {/* Property Address */}
      <div className="px-6 py-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-b-2 border-amber-500/20">
        <p className="text-sm text-gray-400 font-poppins mb-1">Property Address:</p>
        <p className="text-lg font-montserrat font-bold text-white">{propertyAddress}</p>
      </div>

      {/* Owner Details */}
      <div className="p-6 space-y-4">
        {/* Owner Name */}
        <div className="bg-gradient-to-r from-black to-gray-900 border-2 border-amber-500/30 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-400 font-poppins mb-2">Owner Name</p>
              <p className="text-3xl font-montserrat font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                {ownerName}
              </p>
              {secondaryOwner && secondaryOwner.name && (
                <p className="text-xl font-montserrat font-semibold text-gray-300 mt-2">
                  & {secondaryOwner.name}
                </p>
              )}
            </div>
            <button
              onClick={() => copyToClipboard(ownerName, 'Owner Name')}
              className="p-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 rounded-xl transition-all"
              type="button"
            >
              {copiedField === 'Owner Name' ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5 text-amber-400" />
              )}
            </button>
          </div>
        </div>

        {/* Mailing Address */}
        {mailingAddress && (
          <div className="bg-gradient-to-r from-black to-gray-900 border-2 border-blue-500/30 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <p className="text-sm text-gray-400 font-poppins">Mailing Address</p>
                </div>
                <p className="text-xl font-montserrat font-semibold text-white leading-relaxed">
                  {mailingAddress}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(mailingAddress, 'Mailing Address')}
                className="p-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-xl transition-all"
                type="button"
              >
                {copiedField === 'Mailing Address' ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-blue-400" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Phone Number */}
        {phone && (
          <div className="bg-gradient-to-r from-black to-gray-900 border-2 border-emerald-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-5 h-5 text-emerald-400" />
                  <p className="text-sm text-gray-400 font-poppins">Phone Number</p>
                </div>
                <a 
                  href={`tel:${phone}`}
                  className="text-2xl font-montserrat font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  {phone}
                </a>
              </div>
              <button
                onClick={() => copyToClipboard(phone, 'Phone Number')}
                className="p-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 rounded-xl transition-all"
                type="button"
              >
                {copiedField === 'Phone Number' ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-emerald-400" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Email */}
        {email && (
          <div className="bg-gradient-to-r from-black to-gray-900 border-2 border-purple-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-5 h-5 text-purple-400" />
                  <p className="text-sm text-gray-400 font-poppins">Email Address</p>
                </div>
                <a 
                  href={`mailto:${email}`}
                  className="text-xl font-montserrat font-semibold text-purple-400 hover:text-purple-300 transition-colors break-all"
                >
                  {email}
                </a>
              </div>
              <button
                onClick={() => copyToClipboard(email, 'Email Address')}
                className="p-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-xl transition-all"
                type="button"
              >
                {copiedField === 'Email Address' ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-purple-400" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Data Availability Notice */}
        {!hasAnyData && (
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-2 border-red-500/30 rounded-xl p-5">
            <p className="text-sm text-red-400 font-montserrat font-semibold mb-2">ℹ️ Data Not Available</p>
            <p className="text-sm text-gray-300 font-poppins leading-relaxed">
              Phone, email, and mailing address not available from provider for this property. 
              This may mean the property owner data is not in the database or is protected.
            </p>
          </div>
        )}
        
        {/* Pro Tip */}
        {hasAnyData && (
          <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-2 border-amber-500/30 rounded-xl p-5">
            <p className="text-sm text-amber-400 font-montserrat font-semibold mb-2">💡 Pro Tip</p>
            <p className="text-sm text-gray-300 font-poppins leading-relaxed">
              This data is perfect for off-market outreach! Use the mailing address for direct mail campaigns, 
              call the owner to gauge interest, or send a personalized email. Always be respectful and professional.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
