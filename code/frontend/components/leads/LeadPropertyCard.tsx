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
        <div className="relative w-full md:w-[280px] h-[220px] md:h-[220px] flex-shrink-0">
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
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 md:w-8 md:h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors min-h-[40px] md:min-h-0"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} className="md:w-[18px] md:h-[18px]" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 md:w-8 md:h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors min-h-[40px] md:min-h-0"
                aria-label="Next image"
              >
                <ChevronRight size={20} className="md:w-[18px] md:h-[18px]" />
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
          <div className="absolute top-2 md:top-3 left-2 md:left-3 flex flex-wrap gap-2">
            {property.onMarket && (
              <span className="px-2 md:px-2.5 py-0.5 md:py-1 text-xs font-semibold bg-green-500/90 text-white rounded-full">
                On Market
              </span>
            )}
            {property.mortgageTakeover && (
              <span className="px-2 md:px-2.5 py-0.5 md:py-1 text-xs font-semibold bg-orange-500/90 text-white rounded-full">
                Mortgage Takeover
              </span>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="flex-1 p-3 md:p-4">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2 md:gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base md:text-lg font-bold text-white truncate">{property.address}</h3>
              <p className="text-xs md:text-sm text-gray-400 truncate">{property.city}, {property.state} {property.zipCode}</p>
            </div>

            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              <button
                onClick={copyAddress}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center md:min-h-0 md:min-w-0"
                title="Copy address"
                aria-label="Copy address"
              >
                {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              </button>
              <button
                onClick={openZillow}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center md:min-h-0 md:min-w-0"
                title="View on Zillow"
                aria-label="View on Zillow"
              >
                <ExternalLink size={16} />
              </button>
            </div>
          </div>

          {/* "In Dashboard" button - Full width on mobile, inline on desktop */}
          <div className="mb-3 md:mb-0 md:absolute md:top-4 md:right-4">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleDashboard?.(); }}
              className={`
                w-full md:w-auto flex items-center justify-center gap-1.5 px-3 py-2 md:py-1.5 text-xs font-medium rounded-full transition-all min-h-[44px] md:min-h-0
                ${property.inDashboard
                  ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                  : "bg-[#262626] text-gray-400 border border-[#333333] hover:border-gold-500/30"
                }
              `}
            >
              {property.inDashboard ? <Minus size={12} /> : <Plus size={12} />}
              <span>In Dashboard</span>
            </button>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4 text-sm text-gray-400">
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
              <span className="truncate">{property.sqft.toLocaleString()} sqft</span>
            </div>
          </div>

          {/* Financial Grid - Single column on mobile, two columns on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 md:gap-x-6 gap-y-2 mb-3 md:mb-4">
            <div className="flex justify-between">
              <span className="text-xs md:text-sm text-gray-500">List Price:</span>
              <span className="text-xs md:text-sm font-semibold text-white">{formatCurrency(property.listPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs md:text-sm text-gray-500">PITI:</span>
              <span className="text-xs md:text-sm font-semibold text-white">{formatCurrencyDecimal(property.piti)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs md:text-sm text-gray-500">Balance:</span>
              <span className="text-xs md:text-sm font-semibold text-white">{formatCurrency(property.balance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs md:text-sm text-gray-500">Rent:</span>
              <span className="text-xs md:text-sm font-semibold text-white">{formatCurrency(property.rent)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs md:text-sm text-gray-500">Offer Price:</span>
              <span className="text-xs md:text-sm font-semibold text-gold-400">{formatCurrency(property.offerPrice)}</span>
            </div>
          </div>

          {/* Mini Metrics + Create Offer - Stack on mobile, side-by-side on desktop */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-0 md:justify-between pt-3 border-t border-[#262626]">
            <div className="flex items-center justify-around md:justify-start md:gap-4">
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
              className="w-full md:w-auto px-4 md:px-5 py-3 md:py-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-black font-semibold text-sm rounded-lg transition-all duration-300 shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40 min-h-[48px] md:min-h-0"
            >
              Create Offer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
