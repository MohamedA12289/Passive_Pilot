'use client';

import { useState } from 'react';
import { X, Send, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { getCurrentUserId } from '@/lib/premiumAccess';

interface SubmitDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyData?: {
    address?: string;
    askingPrice?: number;
    arv?: number;
    repairs?: number;
    propertyType?: string;
    bedsBaths?: string;
  };
  source: 'buyer_marketplace' | 'institutional_buyers' | 'analyzer';
}

export default function SubmitDealModal({ isOpen, onClose, propertyData, source }: SubmitDealModalProps) {
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    propertyAddress: propertyData?.address || '',
    askingPrice: propertyData?.askingPrice || '',
    arv: propertyData?.arv || '',
    repairs: propertyData?.repairs || '',
    propertyType: propertyData?.propertyType || '',
    bedsBaths: propertyData?.bedsBaths || '',
    notes: '',
  });
  const [contractImage, setContractImage] = useState<File | null>(null);
  const [contractPreview, setContractPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be less than 10MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file (JPG, PNG, etc.)');
        return;
      }
      setContractImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setContractPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.userEmail || !formData.userName) {
      toast.error('Please provide your name and email');
      return;
    }
    if (!contractImage) {
      toast.error('Please upload a picture of the signed contract');
      return;
    }
    if (!formData.propertyAddress) {
      toast.error('Please provide the property address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert image to base64 for API submission
      const reader = new FileReader();
      reader.readAsDataURL(contractImage);
      reader.onloadend = async () => {
        const base64Image = reader.result as string;

        const userId = getCurrentUserId();
        
        const response = await fetch('/api/submit-deal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            contractImage: base64Image,
            submissionSource: source,
            userId: userId, // Include userId for tracking
          }),
        });

        const data = await response.json();

        if (data.success) {
          setIsSubmitted(true);
          toast.success('🎉 Deal submitted successfully!');
          setTimeout(() => {
            onClose();
            // Reset form
            setFormData({
              userName: '',
              userEmail: '',
              propertyAddress: propertyData?.address || '',
              askingPrice: propertyData?.askingPrice || '',
              arv: propertyData?.arv || '',
              repairs: propertyData?.repairs || '',
              propertyType: propertyData?.propertyType || '',
              bedsBaths: propertyData?.bedsBaths || '',
              notes: '',
            });
            setContractImage(null);
            setContractPreview(null);
            setIsSubmitted(false);
          }, 2000);
        } else {
          toast.error(data.message || 'Failed to submit deal');
        }
      };
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit deal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="relative bg-gradient-to-br from-black via-gray-900 to-black border-2 border-emerald-500/40 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto animate-bounce" />
          </div>
          <h3 className="text-3xl font-black text-emerald-400 mb-4 font-montserrat">Deal Submitted!</h3>
          <p className="text-gray-300 text-lg mb-6 font-poppins">
            We'll match you with the best buyers and contact you within 24 hours.
          </p>
          <div className="text-sm text-gray-400 font-poppins">
            Check your email for confirmation
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-black via-gray-900 to-black border-2 border-amber-500/40 rounded-2xl p-8 max-w-2xl w-full my-4 max-h-[90vh] overflow-y-auto">
        {/* Close Button - Sticky */}
        <button
          onClick={onClose}
          className="sticky top-0 float-right -mr-4 -mt-4 mb-2 z-10 text-gray-400 hover:text-amber-400 transition-colors bg-black/80 rounded-full p-2 border-2 border-amber-500/40 hover:border-amber-500"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-black text-amber-400 mb-2 font-montserrat">Submit Your Deal</h2>
          <p className="text-gray-300 font-poppins">
            Fill out the form below and we'll connect you with our best buyers within 24 hours.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-amber-400 font-montserrat flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Your Contact Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-poppins">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  className="w-full px-4 py-3 bg-black border-2 border-amber-500/30 rounded-lg text-white focus:border-amber-500 focus:outline-none font-poppins"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-poppins">Your Email *</label>
                <input
                  type="email"
                  required
                  value={formData.userEmail}
                  onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                  className="w-full px-4 py-3 bg-black border-2 border-amber-500/30 rounded-lg text-white focus:border-amber-500 focus:outline-none font-poppins"
                  placeholder="john@example.com"
                />
              </div>
            </div>
          </div>

          {/* Contract Upload */}
          <div>
            <h3 className="text-xl font-bold text-amber-400 font-montserrat flex items-center gap-2 mb-4">
              <Upload className="w-5 h-5" />
              Signed Contract *
            </h3>
            <div className="border-2 border-dashed border-amber-500/40 rounded-lg p-6 text-center hover:border-amber-500/60 transition-colors">
              {contractPreview ? (
                <div className="space-y-4">
                  <div className="relative w-full h-48 bg-black rounded-lg overflow-hidden">
                    <Image
                      src={contractPreview}
                      alt="Contract preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="text-sm text-emerald-400 font-poppins">✓ Contract uploaded: {contractImage?.name}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setContractImage(null);
                      setContractPreview(null);
                    }}
                    className="text-sm text-amber-400 hover:text-amber-300 font-poppins"
                  >
                    Change image
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <p className="text-gray-300 mb-2 font-poppins">Upload a picture of your signed contract</p>
                  <p className="text-sm text-gray-500 mb-4 font-poppins">JPG, PNG (Max 10MB)</p>
                  <label className="inline-block px-6 py-3 bg-gradient-to-r from-amber-500 to-gold-600 text-white font-bold rounded-lg cursor-pointer hover:from-amber-600 hover:to-gold-700 transition-all font-montserrat">
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Property Details */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-amber-400 font-montserrat">Property Details</h3>
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-poppins">Property Address *</label>
              <input
                type="text"
                required
                value={formData.propertyAddress}
                onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                className="w-full px-4 py-3 bg-black border-2 border-amber-500/30 rounded-lg text-white focus:border-amber-500 focus:outline-none font-poppins"
                placeholder="123 Main St, City, State, ZIP"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-poppins">Asking Price</label>
                <input
                  type="number"
                  value={formData.askingPrice}
                  onChange={(e) => setFormData({ ...formData, askingPrice: e.target.value })}
                  className="w-full px-4 py-3 bg-black border-2 border-amber-500/30 rounded-lg text-white focus:border-amber-500 focus:outline-none font-poppins"
                  placeholder="$150,000"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-poppins">ARV (After Repair Value)</label>
                <input
                  type="number"
                  value={formData.arv}
                  onChange={(e) => setFormData({ ...formData, arv: e.target.value })}
                  className="w-full px-4 py-3 bg-black border-2 border-amber-500/30 rounded-lg text-white focus:border-amber-500 focus:outline-none font-poppins"
                  placeholder="$250,000"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-poppins">Repair Costs</label>
                <input
                  type="number"
                  value={formData.repairs}
                  onChange={(e) => setFormData({ ...formData, repairs: e.target.value })}
                  className="w-full px-4 py-3 bg-black border-2 border-amber-500/30 rounded-lg text-white focus:border-amber-500 focus:outline-none font-poppins"
                  placeholder="$30,000"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-poppins">Beds/Baths</label>
                <input
                  type="text"
                  value={formData.bedsBaths}
                  onChange={(e) => setFormData({ ...formData, bedsBaths: e.target.value })}
                  className="w-full px-4 py-3 bg-black border-2 border-amber-500/30 rounded-lg text-white focus:border-amber-500 focus:outline-none font-poppins"
                  placeholder="3/2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-poppins">Property Type</label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                className="w-full px-4 py-3 bg-black border-2 border-amber-500/30 rounded-lg text-white focus:border-amber-500 focus:outline-none font-poppins"
              >
                <option value="">Select type</option>
                <option value="Single Family">Single Family</option>
                <option value="Multi-Family">Multi-Family</option>
                <option value="Condo">Condo</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Land">Land</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-poppins">Additional Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-black border-2 border-amber-500/30 rounded-lg text-white focus:border-amber-500 focus:outline-none font-poppins resize-none"
                placeholder="Any additional details about the property or deal..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-gold-600 hover:from-amber-600 hover:to-gold-700 text-white font-black text-lg rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 font-montserrat"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Deal for Disposition
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center font-poppins">
            By submitting, you agree to let Passive Pilot market this deal to our buyer network.
          </p>
        </form>
      </div>
    </div>
  );
}
