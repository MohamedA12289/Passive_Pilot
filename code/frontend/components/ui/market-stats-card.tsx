'use client';

import { TrendingUp, TrendingDown, Home, DollarSign, Calendar, MapPin, Target } from 'lucide-react';

interface MarketStatsCardProps {
  city: string;
  state: string;
  stats?: {
    medianPrice?: number;
    medianRent?: number;
    daysOnMarket?: number;
    priceChange?: number; // percentage
    inventory?: number;
  };
}

export default function MarketStatsCard({ city, state, stats }: MarketStatsCardProps) {
  if (!stats) {
    return null;
  }

  const isAppreciating = (stats.priceChange || 0) > 0;

  return (
    <div className="bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-blue-500/10 border-2 border-blue-500/40 rounded-2xl p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-serif font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Market Statistics
            </h3>
            <p className="text-sm text-gray-400 font-poppins flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {city}, {state}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Median Price */}
        {stats.medianPrice && (
          <div className="bg-black/40 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-4 h-4 text-blue-400" />
              <p className="text-xs text-gray-400 font-poppins">Median Price</p>
            </div>
            <p className="text-2xl font-montserrat font-bold text-white">
              ${(stats.medianPrice / 1000).toFixed(0)}K
            </p>
          </div>
        )}

        {/* Median Rent */}
        {stats.medianRent && (
          <div className="bg-black/40 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <p className="text-xs text-gray-400 font-poppins">Median Rent</p>
            </div>
            <p className="text-2xl font-montserrat font-bold text-emerald-400">
              ${stats.medianRent.toLocaleString()}/mo
            </p>
          </div>
        )}

        {/* Days on Market */}
        {stats.daysOnMarket && (
          <div className="bg-black/40 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <p className="text-xs text-gray-400 font-poppins">Avg Days on Market</p>
            </div>
            <p className="text-2xl font-montserrat font-bold text-purple-400">
              {stats.daysOnMarket} days
            </p>
          </div>
        )}

        {/* Price Change */}
        {stats.priceChange !== undefined && (
          <div className={`bg-black/40 border rounded-xl p-4 ${isAppreciating ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
            <div className="flex items-center gap-2 mb-2">
              {isAppreciating ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <p className="text-xs text-gray-400 font-poppins">12-Mo Change</p>
            </div>
            <p className={`text-2xl font-montserrat font-bold ${isAppreciating ? 'text-emerald-400' : 'text-red-400'}`}>
              {isAppreciating ? '+' : ''}{stats.priceChange.toFixed(1)}%
            </p>
          </div>
        )}

        {/* Inventory */}
        {stats.inventory && (
          <div className="bg-black/40 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-amber-400" />
              <p className="text-xs text-gray-400 font-poppins">Active Listings</p>
            </div>
            <p className="text-2xl font-montserrat font-bold text-amber-400">
              {stats.inventory.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Market Insights */}
      <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
        <p className="text-xs text-gray-300 font-poppins leading-relaxed">
          <span className="text-blue-400 font-semibold">📊 Market Insight:</span>{' '}
          {isAppreciating 
            ? `This market is appreciating at ${stats.priceChange?.toFixed(1)}% annually. Strong buyer demand and limited inventory create favorable conditions for wholesaling.`
            : `This market has seen ${Math.abs(stats.priceChange || 0).toFixed(1)}% depreciation. Focus on distressed properties and motivated sellers for better deals.`
          }
        </p>
      </div>
    </div>
  );
}
