'use client';

import { Check, X, Crown, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';

export default function FreeVsPremiumTable() {
  const features = [
    { name: 'Basic Deal Analyzer', free: true, premium: true },
    { name: 'Manual Property Entry', free: true, premium: true },
    { name: 'ARV & MAO Calculations', free: true, premium: true },
    { name: 'Deal Quality Assessment', free: true, premium: true },
    { name: 'AI Address Autocomplete', free: false, premium: true },
    { name: 'Auto-Fill Property Data', free: false, premium: true },
    { name: 'Live Comps from RentCast API', free: false, premium: true },
    { name: 'Owner Lookup Tool', free: false, premium: true },
    { name: '17 AI-Powered Tools', free: false, premium: true },
    { name: '10,000+ Cash Buyer Database', free: false, premium: true },
    { name: '70+ Institutional Buyers', free: false, premium: true },
    { name: '30+ Hard Money Lenders', free: false, premium: true },
    { name: 'Deal Pipeline Tracker', free: false, premium: true },
    { name: 'Contract Templates Library', free: false, premium: true },
    { name: 'Marketing Flyer Generator', free: false, premium: true },
    { name: 'VIP Discord Community', free: false, premium: true },
    { name: 'Deal Disposition Service', free: false, premium: true },
  ];

  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Animated background glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 via-gold-600/20 to-amber-500/20 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
      
      <div className="relative bg-black border-2 border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-amber-500/30 p-6">
          <h3 className="text-3xl font-black text-center bg-gradient-to-r from-amber-400 via-gold-300 to-amber-400 bg-clip-text text-transparent mb-2">
            Free vs Premium
          </h3>
          <p className="text-gray-400 text-center text-sm">
            Start free, upgrade anytime to unlock full power
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/50 border-b border-amber-500/20">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Feature
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400 uppercase tracking-wider w-32">
                  Free
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-amber-400 uppercase tracking-wider w-32">
                  <div className="flex items-center justify-center gap-2">
                    <Crown className="w-4 h-4" />
                    <span>Premium</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/10">
              {features.map((feature, index) => (
                <tr
                  key={index}
                  className="hover:bg-amber-500/5 transition-colors"
                >
                  <td className="px-6 py-4 text-white font-medium text-sm">
                    {feature.name}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {feature.free ? (
                      <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-600 mx-auto" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {feature.premium ? (
                      <Check className="w-5 h-5 text-amber-400 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-600 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-black via-gray-900 to-black border-t border-amber-500/30 p-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="text-center">
              <div className="text-3xl font-black text-white mb-2">$0</div>
              <div className="text-gray-400 text-sm mb-4">Forever free</div>
              <Link
                href="/free-analyzer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                <Zap className="w-4 h-4" />
                <span>Start Free</span>
              </Link>
            </div>

            {/* Premium */}
            <div className="text-center relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 to-gold-600/20 rounded-2xl blur-lg"></div>
              <div className="relative">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl font-black text-white">$20</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <div className="text-gray-400 text-sm mb-4">
                  <span className="line-through text-gray-600">$29</span> Launch special
                </div>
                <Link
                  href="https://whop.com/passive-pilot-wholesaling/passive-pilot-premium-vip/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-gold-600 hover:from-amber-600 hover:to-gold-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50"
                >
                  <Crown className="w-5 h-5" />
                  <span>Upgrade to Premium</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
