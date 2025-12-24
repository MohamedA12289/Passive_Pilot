'use client';

import { Check, Gift, Crown, Zap, Users, BookOpen, Video, FileText, Headphones, TrendingUp, Shield, Award } from 'lucide-react';

interface BonusItem {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
}

export default function BonusStack() {
  const bonuses: BonusItem[] = [
    {
      title: "17 AI-Powered Tools with Live Data",
      value: "$297/mo",
      description: "Deal Analyzer, Buyer Matcher, Message Generators, ROI Calculator, Cash Flow Analyzer, and 12 more tools",
      icon: <Zap className="w-6 h-6" />,
      badge: "CORE TOOLS"
    },
    {
      title: "10,000+ Verified Cash Buyers Database",
      value: "$197/mo",
      description: "Nationwide database of active cash buyers with buy boxes, contact info, and purchase history",
      icon: <Users className="w-6 h-6" />,
      badge: "EXCLUSIVE"
    },
    {
      title: "70+ Institutional Buyers Directory",
      value: "$97/mo",
      description: "Direct access to hedge funds, REITs, and institutional buyers actively seeking deals",
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      title: "30+ Hard Money Lenders Database",
      value: "$67/mo",
      description: "Pre-vetted lenders with rates, terms, and direct contact information for your deals",
      icon: <Shield className="w-6 h-6" />
    },
    {
      title: "Premium Discord Community (2,000+ Members)",
      value: "$97/mo",
      description: "24/7 access to active wholesalers, daily wins, deal reviews, and instant networking",
      icon: <Users className="w-6 h-6" />,
      badge: "VIP ACCESS"
    },
    {
      title: "Weekly Live Coaching Calls",
      value: "$497/mo",
      description: "Every week with Aryone - get your questions answered, deals reviewed, and strategies refined",
      icon: <Video className="w-6 h-6" />
    },
    {
      title: "Plug-and-Play Contract Templates",
      value: "$197",
      description: "Purchase agreements, assignment contracts, LOIs, and all legal docs you need",
      icon: <FileText className="w-6 h-6" />
    },
    {
      title: "Cold Calling Scripts & Message Templates",
      value: "$97",
      description: "Proven scripts for sellers, buyers, and agents that actually get responses",
      icon: <BookOpen className="w-6 h-6" />
    },
    {
      title: "Priority Support",
      value: "$47/mo",
      description: "Fast-track support from the Passive Pilot team for technical or strategy questions",
      icon: <Headphones className="w-6 h-6" />
    },
    {
      title: "Lifetime Updates & New Tools",
      value: "Priceless",
      description: "All future tools, features, and updates included - lock in $20/mo price forever",
      icon: <Award className="w-6 h-6" />,
      badge: "FOREVER LOCKED"
    }
  ];

  const totalValue = bonuses.reduce((sum, bonus) => {
    const numericValue = parseInt(bonus.value.replace(/[^0-9]/g, '')) || 0;
    return sum + numericValue;
  }, 0);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 mb-4">
          <Gift className="w-5 h-5 text-emerald-400" />
          <span className="text-emerald-400 font-bold text-sm uppercase tracking-wider">
            Full Bonus Stack Breakdown
          </span>
        </div>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black font-serif mb-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
          Everything You Get Inside
        </h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Over <span className="text-amber-400 font-black">${totalValue.toLocaleString()}/month</span> in value for just <span className="text-emerald-400 font-black">$20/month</span>
        </p>
      </div>

      {/* Bonus Items Stack */}
      <div className="space-y-4 max-w-4xl mx-auto">
        {bonuses.map((bonus, index) => (
          <div
            key={index}
            className="group relative"
          >
            {/* Glow effect on hover */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-xl blur opacity-0 group-hover:opacity-25 transition duration-300"></div>
            
            {/* Card Content */}
            <div className="relative flex items-start gap-4 p-6 bg-gradient-to-br from-black via-gray-900 to-black border-2 border-amber-500/20 group-hover:border-amber-500/40 rounded-xl transition-all duration-300">
              {/* Icon */}
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform duration-300">
                {bonus.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-lg font-bold text-white">
                        {bonus.title}
                      </h3>
                      {bonus.badge && (
                        <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
                          {bonus.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {bonus.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                      {bonus.value}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">
                      Value
                    </div>
                  </div>
                </div>
              </div>

              {/* Check Mark */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Check className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Value Summary */}
      <div className="mt-8 max-w-4xl mx-auto">
        <div className="relative group">
          {/* Animated glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition duration-1000 animate-pulse"></div>
          
          {/* Content */}
          <div className="relative px-8 py-8 bg-gradient-to-br from-emerald-950/80 via-black to-emerald-950/80 border-2 border-emerald-500/50 rounded-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm uppercase tracking-wider font-semibold mb-1">
                    Total Value
                  </p>
                  <p className="text-5xl font-black bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
                    ${totalValue.toLocaleString()}/mo
                  </p>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <p className="text-gray-400 text-sm uppercase tracking-wider font-semibold mb-1">
                  You Pay Only
                </p>
                <p className="text-5xl font-black text-white mb-2">
                  $20/mo
                </p>
                <p className="text-emerald-400 font-bold text-lg">
                  🎉 Save ${(totalValue - 20).toLocaleString()}/month!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-10 text-center">
        <p className="text-gray-400 text-lg mb-4">
          Lock in this price <span className="text-amber-400 font-bold">forever</span> before we raise it
        </p>
        <a
          href="https://whop.com/passive-pilot-wholesaling/passive-pilot-premium-vip/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-lg rounded-xl hover:from-amber-400 hover:to-yellow-400 transition-all duration-300 shadow-2xl shadow-amber-500/50 hover:shadow-amber-500/70 hover:scale-105"
        >
          Get Instant Access Now
          <Zap className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}