"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ChevronLeft, ChevronRight, Copy, ExternalLink, BedDouble, Bath,
  Square, Check, Plus, Minus
} from "lucide-react";
import type { LeadProperty } from "@/lib/types";

interface LeadPropertyCardProps {
  property: LeadProperty;
  isSelected?: boolean;
  onSelect?: () => void;
  onCreateOffer?: () => void;
  onToggleDashboard?: () => void;
}

export default function LeadPropertyCard({
  property,
  isSelected,
  onSelect,
  onCreateOffer,
  onToggleDashboard
}: LeadPropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const images = property.images.length > 0 ? property.images : ["/placeholder-property.jpg"];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const copyAddress = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const fullAddress = `${property.address}, ${property.city}, ${property.state} ${property.zipCode}`;
    await navigator.clipboard.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openZillow = (e: React.MouseEvent) => {
    e.stopPropagation();
    const zillowUrl = property.zillowUrl || `https://www.zillow.com/homes/${encodeURIComponent(property.address + " " + property.city + " " + property.state)}`;
    window.open(zillowUrl, "_blank");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
  };

  const formatCurrencyDecimal = (value: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(value);
  };

  return (
    <div
      onClick={onSelect}
      className={`
        bg-gradient-to-br from-[#1a1a1a] to-[#141414] border rounded-xl overflow-hidden cursor-pointer
        transition-all duration-300 hover:shadow-xl
        ${isSelected
          ? "border-gold-500 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          : "border-[#262626] hover:border-[#333333]"
        }
      `}
    >
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="relative w-full md:w-[280px] h-[200px] md:h-[220px] flex-shrink-0">
          <Image
            src={images[currentImageIndex]}
            alt={property.address}
            fill
            className="object-cover"
          />

          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight size={18} />
              </button>

              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? "bg-white" : "bg-white/40"}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Status Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {property.onMarket && (
              <span className="px-2.5 py-1 text-xs font-semibold bg-green-500/90 text-white rounded-full">
                On Market
              </span>
            )}
          </div>
          <div className="absolute top-3 right-3">
            {property.mortgageTakeover && (
              <span className="px-2.5 py-1 text-xs font-semibold bg-orange-500/90 text-white rounded-full">
                Mortgage Takeover
              </span>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="flex-1 p-4">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">{property.address}</h3>
              <p className="text-sm text-gray-400">{property.city}, {property.state} {property.zipCode}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyAddress}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Copy address"
              >
                {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              </button>
              <button
                onClick={openZillow}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="View on Zillow"
              >
                <ExternalLink size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleDashboard?.(); }}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all
                  ${property.inDashboard
                    ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                    : "bg-[#262626] text-gray-400 border border-[#333333] hover:border-gold-500/30"
                  }
                `}
              >
                {property.inDashboard ? <Minus size={12} /> : <Plus size={12} />}
                In Dashboard
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
            <div className="flex items-center gap-1.5">
              <BedDouble size={16} />
              <span>{property.beds}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath size={16} />
              <span>{property.baths}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Square size={16} />
              <span>{property.sqft.toLocaleString()} sqft</span>
            </div>
          </div>

          {/* Financial Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">List Price:</span>
              <span className="text-sm font-semibold text-white">{formatCurrency(property.listPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">PITI:</span>
              <span className="text-sm font-semibold text-white">{formatCurrencyDecimal(property.piti)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Balance:</span>
              <span className="text-sm font-semibold text-white">{formatCurrency(property.balance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Rent:</span>
              <span className="text-sm font-semibold text-white">{formatCurrency(property.rent)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Offer Price:</span>
              <span className="text-sm font-semibold text-gold-400">{formatCurrency(property.offerPrice)}</span>
            </div>
          </div>

          {/* Mini Metrics + Create Offer */}
          <div className="flex items-center justify-between pt-3 border-t border-[#262626]">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500">Equity</p>
                <p className="text-sm font-semibold text-green-400">{property.equityPercent.toFixed(2)}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Int Rate</p>
                <p className="text-sm font-semibold text-green-400">{property.interestRate.toFixed(2)}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Cashflow</p>
                <p className={`text-sm font-semibold ${property.monthlyCashflow >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {formatCurrencyDecimal(property.monthlyCashflow)}
                </p>
              </div>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onCreateOffer?.(); }}
              className="px-5 py-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-black font-semibold text-sm rounded-lg transition-all duration-300 shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40"
            >
              Create Offer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
