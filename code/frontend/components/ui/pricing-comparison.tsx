
'use client';

import { Check, X, Crown, DollarSign } from 'lucide-react';

interface ComparisonItem {
  label: string;
  traditional: string | boolean;
  withUs: string | boolean;
}

export default function PricingComparison() {
  const comparisonData: ComparisonItem[] = [
    { label: "Monthly Investment", traditional: "$500-2,000", withUs: "$20-500" },
    { label: "1-on-1 Coaching Calls", traditional: false, withUs: true },
    { label: "Weekly Live Q&A", traditional: false, withUs: true },
    { label: "County Lists (Weekly)", traditional: "$297/mo", withUs: "Free" },
    { label: "Deal Analysis Tools", traditional: "$99/mo", withUs: "Included" },
    { label: "Contract Templates", traditional: "$197 each", withUs: "All Free" },
    { label: "Training Library", traditional: "$997", withUs: "Full Access" },
    { label: "Community Support", traditional: false, withUs: "24/7" },
    { label: "Direct Access to Mentor", traditional: "$5,000+", withUs: "Included" },
    { label: "Money-Back Guarantee", traditional: false, withUs: "30 Days" },
  ];

  return (
    <div className="glass-card p-6 md:p-8 border-2 border-amber-500/30">
      <div className="text-center mb-8">
        <h3 className="text-3xl md:text-4xl font-black mb-3 text-white">
          Coaching <span className="gold-gradient-text">Value Comparison</span>
        </h3>
        <p className="text-gray-400">
          See how Passive Pilot compares to traditional coaching programs
        </p>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header */}
          <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-700">
            <div className="text-gray-400 font-semibold text-sm"></div>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700/50 rounded-lg">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="text-white font-bold text-sm">Traditional Coaching</span>
              </div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg">
                <Crown className="w-4 h-4 text-black" />
                <span className="text-black font-bold text-sm">Passive Pilot</span>
              </div>
            </div>
          </div>

          {/* Rows */}
          <div className="space-y-2">
            {comparisonData.map((item, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-4 items-center py-3 px-3 rounded-lg hover:bg-white/5 transition-colors">
                <div className="text-white font-medium text-sm">
                  {item.label}
                </div>
                <div className="text-center">
                  {typeof item.traditional === 'boolean' ? (
                    item.traditional ? (
                      <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-red-500 mx-auto" />
                    )
                  ) : (
                    <span className="text-gray-400 text-sm font-semibold">{item.traditional}</span>
                  )}
                </div>
                <div className="text-center">
                  {typeof item.withUs === 'boolean' ? (
                    item.withUs ? (
                      <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-red-500 mx-auto" />
                    )
                  ) : (
                    <span className="text-amber-400 font-bold text-sm">{item.withUs}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Total Value Footer */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t-2 border-amber-500/30">
            <div className="text-white font-bold">
              Total Annual Value
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-red-400">
                $15,000+
              </div>
              <div className="text-xs text-gray-500 mt-1">per year</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black gold-gradient-text">
                $600-6,000
              </div>
              <div className="text-xs text-amber-500 mt-1">90% savings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 p-6 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-xl text-center">
        <p className="text-white font-bold text-lg mb-2">
          🔥 The Same Results for 90% Less
        </p>
        <p className="text-gray-300 text-sm max-w-2xl mx-auto">
          Stop overpaying for coaching. Get the same results (or better) with Passive Pilot at a fraction of the cost.
        </p>
      </div>
    </div>
  );
}
