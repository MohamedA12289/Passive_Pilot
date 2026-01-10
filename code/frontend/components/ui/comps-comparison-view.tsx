'use client';

import { useState } from 'react';
import { Home, DollarSign, Bed, Bath, Ruler, Calendar, MapPin, TrendingUp, X, AlertCircle, Star, ArrowRight } from 'lucide-react';

interface CompEntry {
  address: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  distance?: number;
  daysAgo?: number;
  saleDate?: string;
}

interface CompsComparisonViewProps {
  comps: CompEntry[];
  subjectProperty: {
    address: string;
    beds?: number;
    baths?: number;
    sqft?: number;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function CompsComparisonView({ comps, subjectProperty, isOpen, onClose }: CompsComparisonViewProps) {
  const [_selectedComps, _setSelectedComps] = useState<number[]>([0, 1, 2]); // Show first 3 by default
  const [showAll, setShowAll] = useState(false);

  if (!isOpen) return null;

  const displayedComps = showAll ? comps : comps.slice(0, 3);
  const avgPrice = comps.length > 0 ? Math.round(comps.reduce((sum, comp) => sum + comp.price, 0) / comps.length) : 0;
  const avgPricePerSqft = comps.length > 0 ? Math.round(comps.reduce((sum, comp) => sum + (comp.price / comp.sqft), 0) / comps.length) : 0;

  const calculateSimilarity = (comp: CompEntry): number => {
    if (!subjectProperty.beds || !subjectProperty.baths || !subjectProperty.sqft) return 0;
    
    const bedsDiff = Math.abs((comp.beds - subjectProperty.beds) / subjectProperty.beds);
    const bathsDiff = Math.abs((comp.baths - subjectProperty.baths) / subjectProperty.baths);
    const sqftDiff = Math.abs((comp.sqft - subjectProperty.sqft) / subjectProperty.sqft);
    
    const avgDiff = (bedsDiff + bathsDiff + sqftDiff) / 3;
    return Math.round((1 - Math.min(avgDiff, 1)) * 100);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-7xl max-h-[90vh] flex flex-col bg-gradient-to-br from-black via-gray-900 to-black border-2 border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-b-2 border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
              <Home className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                Comparable Properties Analysis
              </h2>
              <p className="text-sm text-gray-400 font-poppins">Side-by-side comparison of recent sales</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 transition-all text-amber-400 hover:text-amber-300"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-3 bg-black/40 border-b border-amber-500/20">
          <div className="p-3 bg-gradient-to-br from-black to-gray-900 border border-amber-500/30 rounded-xl">
            <p className="text-xs text-gray-400 font-poppins mb-1">Total Comps</p>
            <p className="text-2xl font-montserrat font-bold text-amber-400">{comps.length}</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-black to-gray-900 border border-emerald-500/30 rounded-xl">
            <p className="text-xs text-gray-400 font-poppins mb-1">Average Price</p>
            <p className="text-2xl font-montserrat font-bold text-emerald-400">${(avgPrice / 1000).toFixed(0)}K</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-black to-gray-900 border border-blue-500/30 rounded-xl">
            <p className="text-xs text-gray-400 font-poppins mb-1">Price/Sqft</p>
            <p className="text-2xl font-montserrat font-bold text-blue-400">${avgPricePerSqft}</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-black to-gray-900 border border-purple-500/30 rounded-xl">
            <p className="text-xs text-gray-400 font-poppins mb-1">Recommended ARV</p>
            <p className="text-2xl font-montserrat font-bold text-purple-400">${(avgPrice / 1000).toFixed(0)}K</p>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Subject Property Card */}
          <div className="mb-6">
            <h3 className="text-lg font-montserrat font-bold text-amber-400 mb-3 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Subject Property
            </h3>
            <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-2 border-amber-500/50 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xl font-montserrat font-bold text-white mb-2">{subjectProperty.address}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-300 font-poppins">
                    {subjectProperty.beds && (
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4 text-amber-400" />
                        {subjectProperty.beds} beds
                      </div>
                    )}
                    {subjectProperty.baths && (
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4 text-amber-400" />
                        {subjectProperty.baths} baths
                      </div>
                    )}
                    {subjectProperty.sqft && (
                      <div className="flex items-center gap-1">
                        <Ruler className="w-4 h-4 text-amber-400" />
                        {subjectProperty.sqft.toLocaleString()} sqft
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comparables Grid */}
          <h3 className="text-lg font-montserrat font-bold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            Recent Comparable Sales
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {displayedComps.map((comp, idx) => {
              const similarity = calculateSimilarity(comp);
              const pricePerSqft = Math.round(comp.price / comp.sqft);
              const isRecent = comp.daysAgo && comp.daysAgo < 90;
              const isNearby = comp.distance && comp.distance < 1;
              
              return (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-gray-700/30 hover:border-amber-500/50 rounded-2xl p-5 transition-all transform hover:scale-105 shadow-xl"
                >
                  {/* Comp Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center">
                        <span className="text-lg font-bold text-black">#{idx + 1}</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-poppins">Comp #{idx + 1}</p>
                        {similarity > 0 && (
                          <p className="text-xs font-semibold text-emerald-400 font-montserrat">
                            {similarity}% similar
                          </p>
                        )}
                      </div>
                    </div>
                    {(isRecent || isNearby) && (
                      <div className="flex flex-col gap-1">
                        {isRecent && (
                          <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[10px] font-montserrat font-semibold text-emerald-400">
                            RECENT
                          </span>
                        )}
                        {isNearby && (
                          <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-[10px] font-montserrat font-semibold text-blue-400">
                            NEARBY
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div className="mb-4">
                    <div className="flex items-start gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-1" />
                      <p className="text-sm font-poppins text-gray-300 line-clamp-2">{comp.address}</p>
                    </div>
                    {comp.distance && (
                      <p className="text-xs text-gray-500 font-poppins ml-6">
                        {comp.distance.toFixed(1)} miles away
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="bg-black/40 border border-emerald-500/30 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-poppins mb-1">Sale Price</p>
                        <p className="text-3xl font-montserrat font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                          ${(comp.price / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-emerald-400 opacity-20" />
                    </div>
                    <div className="mt-2 pt-2 border-t border-emerald-500/20">
                      <p className="text-xs text-gray-400 font-poppins">Price per sqft:</p>
                      <p className="text-lg font-montserrat font-bold text-emerald-400">${pricePerSqft}/sqft</p>
                    </div>
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-black/40 border border-gray-700/30 rounded-lg p-2">
                      <Bed className="w-4 h-4 text-amber-400 mb-1" />
                      <p className="text-lg font-montserrat font-bold text-white">{comp.beds}</p>
                      <p className="text-[10px] text-gray-500 font-poppins">beds</p>
                    </div>
                    <div className="bg-black/40 border border-gray-700/30 rounded-lg p-2">
                      <Bath className="w-4 h-4 text-amber-400 mb-1" />
                      <p className="text-lg font-montserrat font-bold text-white">{comp.baths}</p>
                      <p className="text-[10px] text-gray-500 font-poppins">baths</p>
                    </div>
                    <div className="bg-black/40 border border-gray-700/30 rounded-lg p-2">
                      <Ruler className="w-4 h-4 text-amber-400 mb-1" />
                      <p className="text-lg font-montserrat font-bold text-white">{(comp.sqft / 1000).toFixed(1)}K</p>
                      <p className="text-[10px] text-gray-500 font-poppins">sqft</p>
                    </div>
                  </div>

                  {/* Sale Date */}
                  {comp.daysAgo && (
                    <div className="flex items-center justify-between text-xs text-gray-400 font-poppins">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Sold {comp.daysAgo} days ago
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Show More/Less Button */}
          {comps.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full p-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-2 border-amber-500/30 hover:border-amber-500/50 text-amber-400 font-montserrat font-bold rounded-xl transition-all flex items-center justify-center gap-2 touch-manipulation"
              type="button"
            >
              {showAll ? 'Show Less' : `Show All ${comps.length} Comps`}
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Footer with Tips */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-t-2 border-amber-500/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-xs text-gray-300 font-poppins leading-relaxed">
                <span className="text-amber-400 font-semibold">💡 Pro Tip:</span> Look for comps with similar bed/bath counts, sqft, and within 1 mile. Recent sales (under 90 days) are most accurate. Exclude outliers that are 20%+ above or below the average.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
