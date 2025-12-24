
'use client';

import { useState } from 'react';
import { Check, DollarSign, Sparkles, TrendingUp } from 'lucide-react';

interface StackItem {
  name: string;
  value: number | string;
  description: string;
  included: boolean;
}

export default function ValueStackCalculator() {
  const [selectedTier, setSelectedTier] = useState<'entry' | 'premium'>('premium');

  const entryItems: StackItem[] = [
    { name: 'Private Discord Access', value: 497, description: 'Exclusive community of active wholesalers', included: true },
    { name: 'Weekly Group Coaching Calls', value: 297, description: 'Live Q&A and deal reviews every week', included: true },
    { name: 'Deal Analysis Templates', value: 97, description: 'Pre-built spreadsheets and checklists', included: true },
    { name: 'Cold Calling Scripts Library', value: 147, description: '50+ proven scripts for every situation', included: true },
  ];

  const premiumItems: StackItem[] = [
    ...entryItems,
    { name: '6 Premium AI Calculators', value: 1497, description: 'ROI, Cash Flow, Assignment Fee, Profit Split, Closing Costs, Deal Comparison', included: true },
    { name: 'Smart Mode AI Analyzer', value: 997, description: 'AI-powered property analysis with auto-fill', included: true },
    { name: '10,000+ Cash Buyer Database', value: 2997, description: 'Verified buyers in every major market', included: true },
    { name: 'Contract Templates & Legal Docs', value: 497, description: 'Attorney-reviewed wholesale contracts', included: true },
    { name: 'Marketing Campaign Builder', value: 697, description: 'Pre-built funnels and email sequences', included: true },
    { name: 'Personal Mentorship from Aryone', value: 5000, description: 'Direct access to someone who closed $750K+', included: true },
    { name: 'Lifetime Updates & New Tools', value: 'PRICELESS', description: 'All future AI tools and features included', included: true },
  ];

  const currentItems = selectedTier === 'premium' ? premiumItems : entryItems;
  const totalValue = currentItems
    .filter(item => item.included && typeof item.value === 'number')
    .reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0);

  const monthlyPrice = selectedTier === 'premium' ? 20 : 15;
  const savings = totalValue - monthlyPrice;
  const savingsPercent = Math.round((savings / totalValue) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Tier Selector */}
      <div className="flex gap-4 mb-8 justify-center">
        <button
          onClick={() => setSelectedTier('entry')}
          className={`px-8 py-3 rounded-xl font-semibold transition-all ${
            selectedTier === 'entry'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          Entry Level ($15/mo)
        </button>
        <button
          onClick={() => setSelectedTier('premium')}
          className={`px-8 py-3 rounded-xl font-semibold transition-all ${
            selectedTier === 'premium'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg scale-105'
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          Passive Pilot Premium ($20/mo)
        </button>
      </div>

      {/* Value Stack Items */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-b border-white/10">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-amber-400" />
            What You Get
          </h3>
        </div>

        <div className="divide-y divide-white/10">
          {currentItems.map((item, index) => (
            <div
              key={index}
              className="p-4 hover:bg-white/5 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
                      {item.name}
                    </h4>
                    <span className={`text-lg font-bold ${
                      typeof item.value === 'number'
                        ? 'text-emerald-400'
                        : 'bg-gradient-to-r from-amber-400 to-yellow-400 text-transparent bg-clip-text'
                    }`}>
                      {typeof item.value === 'number' ? `$${item.value.toLocaleString()}` : item.value}
                    </span>
                  </div>
                  <p className="text-sm text-white/60">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Value */}
        <div className="p-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xl font-semibold text-white">Total Value:</span>
            <span className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 text-transparent bg-clip-text">
              ${totalValue.toLocaleString()}+
            </span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xl font-semibold text-white">You Pay:</span>
            <span className="text-3xl font-bold text-white">
              ${monthlyPrice}/month
            </span>
          </div>
          <div className="pt-4 border-t border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
                <span className="text-xl font-bold text-white">You Save:</span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-emerald-400">
                  ${savings.toLocaleString()}
                </div>
                <div className="text-sm text-emerald-400/80">
                  ({savingsPercent}% OFF)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="p-6 bg-gradient-to-r from-amber-500/10 to-yellow-500/10">
          <a
            href={selectedTier === 'premium' 
              ? 'https://whop.com/passive-pilot-wholesaling/passive-pilot-premium-vip/' 
              : 'https://whop.com/passive-pilot-wholesaling/passive-pilot-prem-entry-lvl/'}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold py-4 px-8 rounded-xl text-center text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            🔥 Get {selectedTier === 'premium' ? 'Premium VIP' : 'Entry Level'} Access Now
          </a>
          <p className="text-center text-sm text-white/60 mt-3">
            Join 2,847+ members closing deals every day
          </p>
        </div>
      </div>
    </div>
  );
}
