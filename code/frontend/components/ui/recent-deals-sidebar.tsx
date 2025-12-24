
"use client";

import { useState, useEffect } from "react";
import { Clock, TrendingUp, X } from "lucide-react";

interface RecentDeal {
  id: string;
  address: string;
  arv: number;
  mao: number;
  profit: number;
  date: string;
  confidence: number;
}

interface RecentDealsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RecentDealsSidebar({ isOpen, onClose }: RecentDealsSidebarProps) {
  const [recentDeals, setRecentDeals] = useState<RecentDeal[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("passivePilotAnalyses");
    if (saved) {
      const parsed: RecentDeal[] = JSON.parse(saved);
      setRecentDeals(parsed.slice(0, 5)); // Show last 5
    }
  }, [isOpen]); // Refresh when sidebar opens

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-gradient-to-br from-black via-gray-900 to-black border-l-2 border-amber-500/30 shadow-2xl z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } overflow-y-auto`}>
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-black via-gray-900 to-black border-b-2 border-amber-500/30 p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Recent Deals
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-amber-500/10 border border-amber-500/30 hover:border-amber-500 rounded-full transition-all"
          >
            <X className="w-5 h-5 text-amber-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {recentDeals.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 mx-auto mb-4 text-amber-400/50 animate-pulse" />
              <p className="text-sm text-gray-400 font-poppins">
                No recent deals yet. Start analyzing properties!
              </p>
            </div>
          ) : (
            recentDeals.map((deal) => (
              <div 
                key={deal.id}
                className="p-4 rounded-xl bg-gradient-to-br from-black via-gray-900 to-black border-2 border-amber-500/30 hover:border-amber-500/60 hover:shadow-xl hover:shadow-amber-500/20 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-white line-clamp-2 mb-1 font-montserrat">
                      {deal.address}
                    </h3>
                    <p className="text-xs text-gray-400 font-poppins">
                      {new Date(deal.date).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full">
                    <TrendingUp className="w-3 h-3 text-amber-400" />
                    <span className="text-xs font-semibold text-amber-400">
                      {Math.round(deal.confidence)}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2">
                    <p className="text-xs text-gray-400 mb-1 font-poppins">ARV</p>
                    <p className="text-sm font-bold text-blue-400 font-montserrat">
                      ${(deal.arv / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded p-2">
                    <p className="text-xs text-gray-400 mb-1 font-poppins">MAO</p>
                    <p className="text-sm font-bold text-purple-400 font-montserrat">
                      ${(deal.mao / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-2">
                    <p className="text-xs text-gray-400 mb-1 font-poppins">Profit</p>
                    <p className="text-sm font-bold text-emerald-400 font-montserrat">
                      ${(deal.profit / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
