"use client";

import React, { useState, useEffect } from "react";
import { X, Zap, Copy, RefreshCw, Check, Phone, Mail, User } from "lucide-react";
import type { LeadProperty } from "@/lib/types";

interface CreateOfferModalProps {
  property: LeadProperty;
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateOfferModal({ property, isOpen, onClose }: CreateOfferModalProps) {
  const [purchasePrice, setPurchasePrice] = useState(property.offerPrice);
  const [downPayment, setDownPayment] = useState(Math.round(property.offerPrice * 0.1));
  const [piti, setPiti] = useState(property.piti);
  const [emailText, setEmailText] = useState("");
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generateEmail();
    }
  }, [isOpen, purchasePrice, downPayment, piti]);

  const generateEmail = async () => {
    // Generate email template (stub - would call /ai/offer-email in production)
    const template = `Dear ${property.agentName || "Listing Agent"},

I hope this message finds you well. I am writing to express my strong interest in the property located at:

${property.address}
${property.city}, ${property.state} ${property.zipCode}

After careful consideration, I would like to submit the following offer:

• Purchase Price: $${purchasePrice.toLocaleString()}
• Down Payment: $${downPayment.toLocaleString()}
• Monthly PITI: $${piti.toLocaleString()}

I am a serious buyer and ready to move quickly on this transaction. I would appreciate the opportunity to discuss this offer with you and your client at your earliest convenience.

Please feel free to reach out if you have any questions or if there is any additional information you need from me.

Thank you for your time and consideration.

Best regards,
[Your Name]
[Your Phone]
[Your Email]`;

    setEmailText(template);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    await generateEmail();
    setTimeout(() => setRegenerating(false), 500);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(emailText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] mx-4 bg-gradient-to-br from-[#141414] to-[#0d0d0d] border border-[#262626] rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <Zap className="text-yellow-400 fill-yellow-400" size={24} />
            <h2 className="text-xl font-bold text-white">Lightning Leads</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
          {/* Left Column - My Offer */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">My Offer</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Purchase Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white focus:border-gold-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Down Payment</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={downPayment}
                      onChange={(e) => setDownPayment(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white focus:border-gold-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">PITI</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={piti}
                      onChange={(e) => setPiti(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white focus:border-gold-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Info Card */}
            <div className="relative p-[1px] rounded-xl bg-gradient-to-r from-gold-500/50 via-gold-600/30 to-gold-500/50">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold-500/20 via-transparent to-gold-500/20 blur-xl" />
              <div className="relative bg-[#1a1a1a] rounded-xl p-5">
                <h4 className="text-sm font-semibold text-gold-400 mb-4">Agent Info</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-300">
                    <User size={16} className="text-gray-500" />
                    <span>{property.agentName || "Agent Name Not Available"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Phone size={16} className="text-gray-500" />
                    <span>{property.agentPhone || "Phone Not Available"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Mail size={16} className="text-gray-500" />
                    <span>{property.agentEmail || "Email Not Available"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Email */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Email</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white bg-[#1a1a1a] hover:bg-[#262626] border border-[#333333] rounded-lg transition-all disabled:opacity-50"
                >
                  <RefreshCw size={14} className={regenerating ? "animate-spin" : ""} />
                  Regenerate
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-black rounded-lg transition-all"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <textarea
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              className="w-full h-[400px] p-4 bg-[#1a1a1a] border border-[#333333] rounded-lg text-gray-300 text-sm leading-relaxed resize-none focus:border-gold-500 focus:outline-none transition-colors"
              placeholder="AI-generated email will appear here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
