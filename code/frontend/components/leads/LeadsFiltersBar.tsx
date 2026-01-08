"use client";

import React from "react";
import { Search, ChevronDown } from "lucide-react";
import type { LeadsFilters } from "@/lib/types";

interface LeadsFiltersBarProps {
  filters: LeadsFilters;
  onFiltersChange: (filters: LeadsFilters) => void;
  onSearch: () => void;
}

export default function LeadsFiltersBar({ filters, onFiltersChange, onSearch }: LeadsFiltersBarProps) {
  const updateFilter = (key: keyof LeadsFilters, value: string | number | undefined) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

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
