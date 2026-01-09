"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Filter, X } from "lucide-react";
import type { LeadsFilters } from "@/lib/types";
import { useIsMobile } from "@/hooks/useIsMobile";

interface LeadsFiltersBarProps {
  filters: LeadsFilters;
  onFiltersChange: (filters: LeadsFilters) => void;
  onSearch: () => void;
}

export default function LeadsFiltersBar({ filters, onFiltersChange, onSearch }: LeadsFiltersBarProps) {
  const isMobile = useIsMobile();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const updateFilter = (key: keyof LeadsFilters, value: string | number | undefined) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileFiltersOpen(false);
      }
    };

    if (mobileFiltersOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [mobileFiltersOpen]);

  const handleMobileSearch = () => {
    setMobileFiltersOpen(false);
    onSearch();
  };

  // Count active filters
  const activeFilterCount = [
    filters.location,
    filters.onMarket,
    filters.propertyType,
    filters.dealType,
    filters.priceMin,
    filters.bedsMin,
    filters.bathsMin,
  ].filter(Boolean).length;

  // Desktop View
  if (!isMobile) {
    return (
      <div className="w-full px-4 py-4">
        <div className="flex flex-wrap items-center gap-2 bg-[#1a1a1a]/90 border border-[#333333] rounded-full px-4 py-2 backdrop-blur-sm">
          {/* Location Input */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#0d0d0d] border border-[#262626] rounded-full min-w-[200px] flex-1 max-w-xs">
            <Search size={16} className="text-gray-500" />
            <input
              type="text"
              placeholder="Enter City, State and County"
              value={filters.location || ""}
              onChange={(e) => updateFilter("location", e.target.value)}
              className="bg-transparent text-white text-sm placeholder-gray-500 outline-none flex-1"
            />
          </div>

          {/* Divider */}
          <div className="hidden md:block h-6 w-px bg-[#333333]" />

          {/* On Market Dropdown */}
          <div className="relative">
            <select
              value={filters.onMarket || ""}
              onChange={(e) => updateFilter("onMarket", e.target.value)}
              className="appearance-none bg-[#0d0d0d] border border-[#262626] text-gray-300 text-sm rounded-full px-4 py-2 pr-8 cursor-pointer hover:border-gold-500/50 transition-colors"
            >
              <option value="">On Market</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          {/* Property Type */}
          <div className="relative">
            <select
              value={filters.propertyType || ""}
              onChange={(e) => updateFilter("propertyType", e.target.value)}
              className="appearance-none bg-[#0d0d0d] border border-[#262626] text-gray-300 text-sm rounded-full px-4 py-2 pr-8 cursor-pointer hover:border-gold-500/50 transition-colors"
            >
              <option value="">Property Type</option>
              <option value="single_family">Single Family</option>
              <option value="multi_family">Multi Family</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          {/* Deal Type */}
          <div className="relative">
            <select
              value={filters.dealType || ""}
              onChange={(e) => updateFilter("dealType", e.target.value)}
              className="appearance-none bg-[#0d0d0d] border border-[#262626] text-gray-300 text-sm rounded-full px-4 py-2 pr-8 cursor-pointer hover:border-gold-500/50 transition-colors"
            >
              <option value="">Deal Type</option>
              <option value="wholesale">Wholesale</option>
              <option value="sub_to">Subject To</option>
              <option value="creative">Creative Finance</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          {/* Price Range */}
          <div className="relative">
            <select
              value={filters.priceMin !== undefined ? `${filters.priceMin}-${filters.priceMax || ""}` : ""}
              onChange={(e) => {
                const [min, max] = e.target.value.split("-").map(v => v ? parseInt(v) : undefined);
                onFiltersChange({ ...filters, priceMin: min, priceMax: max });
              }}
              className="appearance-none bg-[#0d0d0d] border border-[#262626] text-gray-300 text-sm rounded-full px-4 py-2 pr-8 cursor-pointer hover:border-gold-500/50 transition-colors"
            >
              <option value="">Price Range</option>
              <option value="0-200000">Under $200K</option>
              <option value="200000-400000">$200K - $400K</option>
              <option value="400000-600000">$400K - $600K</option>
              <option value="600000-1000000">$600K - $1M</option>
              <option value="1000000-">$1M+</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          {/* Bed Range */}
          <div className="relative">
            <select
              value={filters.bedsMin !== undefined ? `${filters.bedsMin}` : ""}
              onChange={(e) => updateFilter("bedsMin", e.target.value ? parseInt(e.target.value) : undefined)}
              className="appearance-none bg-[#0d0d0d] border border-[#262626] text-gray-300 text-sm rounded-full px-4 py-2 pr-8 cursor-pointer hover:border-gold-500/50 transition-colors"
            >
              <option value="">Beds</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          {/* Bath Range */}
          <div className="relative">
            <select
              value={filters.bathsMin !== undefined ? `${filters.bathsMin}` : ""}
              onChange={(e) => updateFilter("bathsMin", e.target.value ? parseInt(e.target.value) : undefined)}
              className="appearance-none bg-[#0d0d0d] border border-[#262626] text-gray-300 text-sm rounded-full px-4 py-2 pr-8 cursor-pointer hover:border-gold-500/50 transition-colors"
            >
              <option value="">Baths</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          {/* Search Button */}
          <button
            onClick={onSearch}
            className="ml-auto px-6 py-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-black font-semibold text-sm rounded-full transition-all duration-300 shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40"
          >
            Search
          </button>
        </div>
      </div>
    );
  }

  // Mobile View
  return (
    <>
      <div className="w-full px-3 py-3">
        <div className="flex items-center gap-2">
          {/* Location Input */}
          <div className="flex items-center gap-2 px-3 py-2.5 bg-[#1a1a1a]/90 border border-[#333333] rounded-full flex-1">
            <Search size={16} className="text-gray-500 shrink-0" />
            <input
              type="text"
              placeholder="Enter location..."
              value={filters.location || ""}
              onChange={(e) => updateFilter("location", e.target.value)}
              className="bg-transparent text-white text-sm placeholder-gray-500 outline-none flex-1 min-w-0"
            />
          </div>

          {/* Filters Button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a]/90 border border-[#333333] rounded-full text-sm font-medium text-gray-300 hover:text-white transition-colors min-h-[44px] shrink-0"
          >
            <Filter size={16} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Search Button */}
          <button
            onClick={onSearch}
            className="px-4 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-black font-semibold text-sm rounded-full transition-all duration-300 shadow-lg shadow-gold-500/20 min-h-[44px] shrink-0"
          >
            <Search size={16} />
          </button>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            ref={modalRef}
            className="w-full sm:max-w-lg bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] border-t sm:border border-[#333333] sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom sm:zoom-in duration-300 max-h-[80vh] sm:max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#333333]">
              <h3 className="text-lg font-bold text-white">Filters</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filters Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {/* On Market */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">On Market</label>
                <select
                  value={filters.onMarket || ""}
                  onChange={(e) => updateFilter("onMarket", e.target.value)}
                  className="w-full appearance-none bg-[#0d0d0d] border border-[#262626] text-gray-300 text-base rounded-lg px-4 py-3 cursor-pointer hover:border-gold-500/50 transition-colors min-h-[48px]"
                >
                  <option value="">Any</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Property Type</label>
                <select
                  value={filters.propertyType || ""}
                  onChange={(e) => updateFilter("propertyType", e.target.value)}
                  className="w-full appearance-none bg-[#0d0d0d] border border-[#262626] text-gray-300 text-base rounded-lg px-4 py-3 cursor-pointer hover:border-gold-500/50 transition-colors min-h-[48px]"
                >
                  <option value="">Any</option>
                  <option value="single_family">Single Family</option>
                  <option value="multi_family">Multi Family</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                </select>
              </div>

              {/* Deal Type */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Deal Type</label>
                <select
                  value={filters.dealType || ""}
                  onChange={(e) => updateFilter("dealType", e.target.value)}
                  className="w-full appearance-none bg-[#0d0d0d] border border-[#262626] text-gray-300 text-base rounded-lg px-4 py-3 cursor-pointer hover:border-gold-500/50 transition-colors min-h-[48px]"
                >
                  <option value="">Any</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="sub_to">Subject To</option>
                  <option value="creative">Creative Finance</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Price Range</label>
                <select
                  value={filters.priceMin !== undefined ? `${filters.priceMin}-${filters.priceMax || ""}` : ""}
                  onChange={(e) => {
                    const [min, max] = e.target.value.split("-").map(v => v ? parseInt(v) : undefined);
                    onFiltersChange({ ...filters, priceMin: min, priceMax: max });
                  }}
                  className="w-full appearance-none bg-[#0d0d0d] border border-[#262626] text-gray-300 text-base rounded-lg px-4 py-3 cursor-pointer hover:border-gold-500/50 transition-colors min-h-[48px]"
                >
                  <option value="">Any</option>
                  <option value="0-200000">Under $200K</option>
                  <option value="200000-400000">$200K - $400K</option>
                  <option value="400000-600000">$400K - $600K</option>
                  <option value="600000-1000000">$600K - $1M</option>
                  <option value="1000000-">$1M+</option>
                </select>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Bedrooms</label>
                <select
                  value={filters.bedsMin !== undefined ? `${filters.bedsMin}` : ""}
                  onChange={(e) => updateFilter("bedsMin", e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full appearance-none bg-[#0d0d0d] border border-[#262626] text-gray-300 text-base rounded-lg px-4 py-3 cursor-pointer hover:border-gold-500/50 transition-colors min-h-[48px]"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Bathrooms</label>
                <select
                  value={filters.bathsMin !== undefined ? `${filters.bathsMin}` : ""}
                  onChange={(e) => updateFilter("bathsMin", e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full appearance-none bg-[#0d0d0d] border border-[#262626] text-gray-300 text-base rounded-lg px-4 py-3 cursor-pointer hover:border-gold-500/50 transition-colors min-h-[48px]"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-3 px-4 py-4 border-t border-[#333333]">
              <button
                onClick={() => {
                  onFiltersChange({});
                  setMobileFiltersOpen(false);
                }}
                className="flex-1 px-4 py-3 bg-[#1a1a1a] hover:bg-[#262626] border border-[#333333] text-gray-300 hover:text-white font-medium text-base rounded-lg transition-all min-h-[48px]"
              >
                Clear All
              </button>
              <button
                onClick={handleMobileSearch}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-black font-semibold text-base rounded-lg transition-all duration-300 shadow-lg shadow-gold-500/20 min-h-[48px]"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
