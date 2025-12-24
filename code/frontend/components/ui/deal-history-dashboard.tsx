
"use client";

import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Home, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

interface SavedAnalysis {
  id: string;
  address: string;
  arv: number;
  mao: number;
  desiredProfit: number;
  confidenceScore: number;
  createdAt: string;
}

export default function DealHistoryDashboard() {
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [stats, setStats] = useState({
    totalDeals: 0,
    avgARV: 0,
    avgProfit: 0,
    bestDeal: 0
  });

  useEffect(() => {
    // Load from localStorage - synced with analyzer page
    const saved = localStorage.getItem("passivePilotAnalyses");
    if (saved) {
      const rawAnalyses = JSON.parse(saved);
      
      // Map analyzer data structure to dashboard structure
      const parsedAnalyses: SavedAnalysis[] = rawAnalyses.map((a: any) => ({
        id: a.id,
        address: a.address,
        arv: a.arv,
        mao: a.mao,
        desiredProfit: a.profit || a.desiredProfit || 0,
        confidenceScore: a.confidence || a.confidenceScore || 0,
        createdAt: a.date || a.createdAt
      }));
      
      setAnalyses(parsedAnalyses.slice(0, 10)); // Show last 10

      // Calculate stats
      if (parsedAnalyses.length > 0) {
        const totalARV = parsedAnalyses.reduce((sum, a) => sum + a.arv, 0);
        const totalProfit = parsedAnalyses.reduce((sum, a) => sum + a.desiredProfit, 0);
        const maxProfit = Math.max(...parsedAnalyses.map(a => a.desiredProfit));

        setStats({
          totalDeals: parsedAnalyses.length,
          avgARV: totalARV / parsedAnalyses.length,
          avgProfit: totalProfit / parsedAnalyses.length,
          bestDeal: maxProfit
        });
      }
    }
    
    // Listen for storage changes AND custom events (when analyzer saves new deals)
    const handleStorageChange = () => {
      const saved = localStorage.getItem("passivePilotAnalyses");
      if (saved) {
        const rawAnalyses = JSON.parse(saved);
        const parsedAnalyses: SavedAnalysis[] = rawAnalyses.map((a: any) => ({
          id: a.id,
          address: a.address,
          arv: a.arv,
          mao: a.mao,
          desiredProfit: a.profit || a.desiredProfit || 0,
          confidenceScore: a.confidence || a.confidenceScore || 0,
          createdAt: a.date || a.createdAt
        }));
        setAnalyses(parsedAnalyses.slice(0, 10));
        
        if (parsedAnalyses.length > 0) {
          const totalARV = parsedAnalyses.reduce((sum, a) => sum + a.arv, 0);
          const totalProfit = parsedAnalyses.reduce((sum, a) => sum + a.desiredProfit, 0);
          const maxProfit = Math.max(...parsedAnalyses.map(a => a.desiredProfit));
          setStats({
            totalDeals: parsedAnalyses.length,
            avgARV: totalARV / parsedAnalyses.length,
            avgProfit: totalProfit / parsedAnalyses.length,
            bestDeal: maxProfit
          });
        }
      }
    };
    
    // Listen for both storage events (cross-tab) AND custom events (same tab)
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('analysisUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('analysisUpdated', handleStorageChange);
    };
  }, []);

  if (analyses.length === 0) {
    return (
      <div className="glass-card p-6 sm:p-8 text-center">
        <Home className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gold-500 dark:text-gold-400 opacity-50" />
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-2">No Deals Yet</h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6">
          Start analyzing properties to see your deal history here.
        </p>
        <Link 
          href="/analyzer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-gold-600 text-white rounded-lg hover:from-amber-600 hover:to-gold-700 transition-all text-sm sm:text-base font-medium"
        >
          Analyze First Deal <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <Home className="w-5 h-5 sm:w-6 sm:h-6 text-gold-500 dark:text-gold-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{stats.totalDeals}</p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Total Deals</p>
        </div>

        <div className="glass-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-gold-500 dark:text-gold-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            ${(stats.avgARV / 1000).toFixed(0)}K
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Avg ARV</p>
        </div>

        <div className="glass-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-gold-500 dark:text-gold-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            ${(stats.avgProfit / 1000).toFixed(0)}K
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Avg Profit</p>
        </div>

        <div className="glass-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            ${(stats.bestDeal / 1000).toFixed(0)}K
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Best Deal</p>
        </div>
      </div>

      {/* Recent Deals List */}
      <div className="glass-card p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gold-500 dark:text-gold-400" />
          Recent Deals
        </h3>
        <div className="space-y-3">
          {analyses.map((analysis) => (
            <div 
              key={analysis.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-lg hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors gap-2 sm:gap-0"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-800 dark:text-white text-sm sm:text-base line-clamp-1">
                  {analysis.address}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {new Date(analysis.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="text-right">
                  <p className="text-gray-600 dark:text-gray-400">ARV</p>
                  <p className="font-semibold text-gray-800 dark:text-white">
                    ${(analysis.arv / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600 dark:text-gray-400">Profit</p>
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    ${(analysis.desiredProfit / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600 dark:text-gray-400">Confidence</p>
                  <p className="font-semibold text-amber-600 dark:text-amber-400">
                    {analysis.confidenceScore}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
