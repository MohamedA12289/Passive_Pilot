'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  CheckCircle2,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Award
} from 'lucide-react';

interface UserStats {
  totalDeals: number;
  dealsInPipeline: number;
  dealsAnalyzed: number;
  closedDeals: number;
  totalPotentialProfit: number;
  averageDealProfit: number;
  dispoSubmissions: number;
  dealsByStage: { [key: string]: number };
  dealQualityBreakdown: {
    greatDeals: number;
    goodDeals: number;
    mediocreDeals: number;
    weakDeals: number;
  };
}

export default function UserStatsPanel() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullDashboard, setShowFullDashboard] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/user-stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    } else {
      return `$${amount.toFixed(0)}`;
    }
  };

  const getQualityPercentage = () => {
    if (!stats) return { great: 0, good: 0, mediocre: 0, weak: 0 };
    const total = stats.totalDeals || 1;
    return {
      great: Math.round((stats.dealQualityBreakdown.greatDeals / total) * 100),
      good: Math.round((stats.dealQualityBreakdown.goodDeals / total) * 100),
      mediocre: Math.round((stats.dealQualityBreakdown.mediocreDeals / total) * 100),
      weak: Math.round((stats.dealQualityBreakdown.weakDeals / total) * 100),
    };
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white/5 to-white/10 border-2 border-white/10 rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const stageLabels: { [key: string]: string } = {
    lead: '🎯 Lead',
    contacted: '📞 Contacted',
    contract: '📝 Contract',
    marketing: '💰 Marketing',
    closed: '✅ Closed',
  };

  const qualityPercent = getQualityPercentage();

  return (
    <div className="space-y-4">
      {/* Compact Stats Bar */}
      <div className="bg-gradient-to-br from-black to-gray-900 border-2 border-white/10 rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-xl font-black font-montserrat text-white tracking-tight">Your Performance</h3>
              <p className="text-white/50 text-xs font-poppins">Track your wholesale journey</p>
            </div>
          </div>
          <button
            onClick={() => setShowFullDashboard(!showFullDashboard)}
            className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 hover:border-amber-500/50 rounded-lg transition-all text-amber-400 text-sm font-montserrat font-bold"
          >
            {showFullDashboard ? 'Show Less' : 'View Details'}
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Deals */}
          <div className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-xl p-4 hover:border-amber-500/50 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-white/60 text-xs font-montserrat font-bold uppercase tracking-wider">Total Deals</span>
            </div>
            <div className="text-3xl font-black font-montserrat text-white">{stats.totalDeals}</div>
            <div className="text-xs text-white/40 font-poppins mt-1">In your pipeline</div>
          </div>

          {/* Deals Analyzed */}
          <div className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-xl p-4 hover:border-amber-500/50 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span className="text-white/60 text-xs font-montserrat font-bold uppercase tracking-wider">Analyzed</span>
            </div>
            <div className="text-3xl font-black font-montserrat text-white">{stats.dealsAnalyzed}</div>
            <div className="text-xs text-white/40 font-poppins mt-1">Properties studied</div>
          </div>

          {/* Total Potential Profit */}
          <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-xl p-4 hover:border-amber-500/60 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400/80 text-xs font-montserrat font-bold uppercase tracking-wider">Potential $</span>
            </div>
            <div className="text-3xl font-black font-montserrat bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
              {formatCurrency(stats.totalPotentialProfit)}
            </div>
            <div className="text-xs text-amber-400/60 font-poppins mt-1">Total pipeline value</div>
          </div>

          {/* Closed Deals */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-xl p-4 hover:border-emerald-500/60 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400/80 text-xs font-montserrat font-bold uppercase tracking-wider">Closed</span>
            </div>
            <div className="text-3xl font-black font-montserrat text-emerald-400">{stats.closedDeals}</div>
            <div className="text-xs text-emerald-400/60 font-poppins mt-1">Deals completed</div>
          </div>
        </div>
      </div>

      {/* Extended Dashboard */}
      {showFullDashboard && (
        <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
          {/* Deal Quality Breakdown */}
          <div className="bg-gradient-to-br from-black to-gray-900 border-2 border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-5 h-5 text-amber-400" />
              <h4 className="text-lg font-black font-montserrat text-white">Deal Quality Breakdown</h4>
            </div>
            <div className="space-y-3">
              {/* Great Deals */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-montserrat font-bold text-emerald-400">🔥 Great Deals ($30K+ spread)</span>
                  <span className="text-sm font-montserrat font-bold text-white">{stats.dealQualityBreakdown.greatDeals} ({qualityPercent.great}%)</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all duration-500"
                    style={{ width: `${qualityPercent.great}%` }}
                  />
                </div>
              </div>

              {/* Good Deals */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-montserrat font-bold text-blue-400">✨ Good Deals ($15-30K spread)</span>
                  <span className="text-sm font-montserrat font-bold text-white">{stats.dealQualityBreakdown.goodDeals} ({qualityPercent.good}%)</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full transition-all duration-500"
                    style={{ width: `${qualityPercent.good}%` }}
                  />
                </div>
              </div>

              {/* Mediocre Deals */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-montserrat font-bold text-yellow-400">⚡ Okay Deals ($5-15K spread)</span>
                  <span className="text-sm font-montserrat font-bold text-white">{stats.dealQualityBreakdown.mediocreDeals} ({qualityPercent.mediocre}%)</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full transition-all duration-500"
                    style={{ width: `${qualityPercent.mediocre}%` }}
                  />
                </div>
              </div>

              {/* Weak Deals */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-montserrat font-bold text-red-400">⚠️ Weak Deals (under $5K)</span>
                  <span className="text-sm font-montserrat font-bold text-white">{stats.dealQualityBreakdown.weakDeals} ({qualityPercent.weak}%)</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-orange-600 rounded-full transition-all duration-500"
                    style={{ width: `${qualityPercent.weak}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pipeline by Stage */}
          <div className="bg-gradient-to-br from-black to-gray-900 border-2 border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <PieChart className="w-5 h-5 text-amber-400" />
              <h4 className="text-lg font-black font-montserrat text-white">Pipeline by Stage</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(stats.dealsByStage).map(([stage, count]) => (
                <div key={stage} className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-xl p-4 text-center hover:border-amber-500/50 transition-colors">
                  <div className="text-2xl mb-2">{stageLabels[stage]?.split(' ')[0] || '📊'}</div>
                  <div className="text-2xl font-black font-montserrat text-white mb-1">{count}</div>
                  <div className="text-xs text-white/50 font-montserrat uppercase tracking-wider">{stage}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Average Deal Profit */}
            <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <span className="text-amber-400/80 text-sm font-montserrat font-bold uppercase tracking-wider">Avg Deal Value</span>
              </div>
              <div className="text-4xl font-black font-montserrat bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent mb-1">
                {formatCurrency(stats.averageDealProfit)}
              </div>
              <p className="text-amber-400/60 text-sm font-poppins">Average profit per deal</p>
            </div>

            {/* Dispo Submissions */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-5 h-5 text-purple-400" />
                <span className="text-purple-400/80 text-sm font-montserrat font-bold uppercase tracking-wider">Dispo Submissions</span>
              </div>
              <div className="text-4xl font-black font-montserrat text-purple-400 mb-1">
                {stats.dispoSubmissions}
              </div>
              <p className="text-purple-400/60 text-sm font-poppins">Deals submitted for disposition</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
