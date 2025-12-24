
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Zap, TrendingUp, DollarSign, Users, ChevronRight, Play } from 'lucide-react';

interface AITool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  features: string[];
  demoLink?: string;
  comingSoon?: boolean;
}

export default function AIToolsShowcase() {
  const [selectedTool, setSelectedTool] = useState<string>('property-analyzer');

  const aiTools: AITool[] = [
    {
      id: 'property-analyzer',
      name: 'AI Property Analyzer',
      description: 'Get instant property valuations with AI-powered comps analysis and deal scoring',
      icon: <Sparkles className="w-6 h-6" />,
      image: '/ai-property-analyzer.png',
      features: [
        'Instant ARV calculations',
        'AI-suggested repair estimates',
        'Automated comps analysis',
        'Deal score rating (1-10)',
      ],
      demoLink: '/analyzer',
    },
    {
      id: 'smart-mode',
      name: 'Smart Mode Calculator',
      description: 'Auto-fill property details with 92% accuracy using AI-powered data extraction',
      icon: <Zap className="w-6 h-6" />,
      image: '/ai-smart-mode.png',
      features: [
        'One-click property lookup',
        'Auto-filled repair estimates',
        'Buyer recommendations',
        '92% accuracy confidence',
      ],
      demoLink: '/analyzer',
    },
    {
      id: 'buyer-matcher',
      name: 'AI Buyer Matcher',
      description: 'Match deals with 10,000+ verified cash buyers using intelligent algorithms',
      icon: <Users className="w-6 h-6" />,
      image: '/ai-buyer-matcher.png',
      features: [
        '10,000+ verified buyers',
        'AI match scoring',
        'Instant deal distribution',
        'Buyer preference tracking',
      ],
      comingSoon: true,
    },
    {
      id: 'cash-flow',
      name: 'Cash Flow Analyzer',
      description: 'Project monthly cash flow with AI-powered expense predictions and ROI calculations',
      icon: <TrendingUp className="w-6 h-6" />,
      image: '/ai-cash-flow.png',
      features: [
        '12-month projections',
        'Expense breakdown charts',
        'ROI tracking',
        'Cash-on-cash returns',
      ],
      demoLink: '/tools/cash-flow',
    },
    {
      id: 'deal-comparison',
      name: 'Deal Comparison Tool',
      description: 'Compare multiple deals side-by-side with AI recommendations',
      icon: <DollarSign className="w-6 h-6" />,
      image: '/ai-deal-comparison.png',
      features: [
        'Side-by-side analysis',
        'AI best deal recommendation',
        'Color-coded metrics',
        'Export comparison reports',
      ],
      demoLink: '/tools/deal-comparison',
    },
    {
      id: 'roi-calculator',
      name: 'ROI Calculator',
      description: 'Calculate returns with AI-suggested holding costs and profit timelines',
      icon: <Sparkles className="w-6 h-6" />,
      image: '/ai-roi-calculator.png',
      features: [
        'Annual ROI calculation',
        'Profitability timeline',
        'Holding cost estimates',
        'Cash-on-cash returns',
      ],
      demoLink: '/tools/roi-calculator',
    },
  ];

  const currentTool = aiTools.find(tool => tool.id === selectedTool) || aiTools[0];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 mb-4">
          <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
          <span className="text-sm font-semibold text-purple-300">Powered by AI</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Your <span className="bg-gradient-to-r from-amber-400 to-yellow-400 text-transparent bg-clip-text">AI-Powered</span> Toolkit
        </h2>
        <p className="text-xl text-white/70 max-w-2xl mx-auto">
          Analyze deals 10x faster with our suite of AI-powered tools. Close more deals with less effort.
        </p>
      </div>

      {/* Tool Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {aiTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setSelectedTool(tool.id)}
            className={`p-4 rounded-xl border transition-all ${
              selectedTool === tool.id
                ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border-amber-500/50 scale-105 shadow-lg shadow-amber-500/20'
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            <div className={`flex flex-col items-center gap-2 ${
              selectedTool === tool.id ? 'text-amber-400' : 'text-white/60'
            }`}>
              {tool.icon}
              <span className="text-xs font-semibold text-center">{tool.name}</span>
              {tool.comingSoon && (
                <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">
                  Soon
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Tool Display */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left: Info */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center text-black shadow-lg">
                {currentTool.icon}
              </div>
              {currentTool.comingSoon && (
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded-full border border-purple-500/30">
                  Coming Soon
                </span>
              )}
            </div>

            <h3 className="text-3xl font-bold text-white mb-4">
              {currentTool.name}
            </h3>

            <p className="text-lg text-white/70 mb-6">
              {currentTool.description}
            </p>

            {/* Features */}
            <div className="space-y-3 mb-8">
              {currentTool.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <ChevronRight className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/80 group-hover:text-white transition-colors">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            {currentTool.comingSoon ? (
              <div className="space-y-3">
                <div className="px-6 py-3 bg-purple-500/20 border border-purple-500/30 rounded-xl text-center">
                  <div className="text-sm text-purple-300 font-semibold">
                    🚀 Launching Soon for Passive Pilot Premium Members
                  </div>
                </div>
                <Link
                  href="https://whop.com/passive-pilot-wholesaling/passive-pilot-premium-vip/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold py-4 px-8 rounded-xl text-center shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  Get Early Access ($20/mo)
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  href={currentTool.demoLink || '/analyzer'}
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  <Play className="w-5 h-5" />
                  Try It Now (Free)
                </Link>
                <Link
                  href="https://whop.com/passive-pilot-wholesaling/passive-pilot-premium-vip/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full border-2 border-amber-500 hover:bg-amber-500/10 text-amber-400 font-semibold py-3 px-8 rounded-xl text-center transition-all"
                >
                  Unlock All Tools ($20/mo)
                </Link>
              </div>
            )}
          </div>

          {/* Right: Screenshot Preview */}
          <div className="relative bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-8 flex items-center justify-center">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-purple-500/5 animate-pulse" />
            
            {/* Screenshot */}
            <Link 
              href={currentTool.comingSoon ? '/pricing' : (currentTool.demoLink || '/analyzer')}
              className="relative w-full h-full flex items-center justify-center group cursor-pointer"
            >
              <div className="relative w-full max-w-2xl aspect-video rounded-lg overflow-hidden border-2 border-white/10 shadow-2xl group-hover:scale-[1.08] group-hover:shadow-amber-500/50 group-hover:shadow-3xl group-hover:border-amber-500/30 transition-all duration-500 ease-out">
                <Image
                  src={currentTool.image}
                  alt={currentTool.name}
                  fill
                  className="object-cover group-hover:brightness-110 transition-all duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {/* Hover Overlay with Animation */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center p-6">
                  <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="text-white font-semibold mb-3 text-lg">Click to explore</div>
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-lg text-sm text-black font-bold shadow-lg shadow-amber-500/50 group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-4 h-4" />
                      View Demo
                    </div>
                  </div>
                </div>
                {/* Animated Border Glow */}
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 rounded-lg blur-xl animate-pulse"></div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 text-center">
        <p className="text-white/60 mb-4">
          All tools included with <span className="text-amber-400 font-semibold">Premium VIP</span> membership
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/pricing"
            className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl transition-all"
          >
            View Pricing
          </Link>
          <Link
            href="/tools"
            className="px-8 py-3 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/30 text-amber-400 font-semibold rounded-xl transition-all"
          >
            See All Tools
          </Link>
        </div>
      </div>
    </div>
  );
}
