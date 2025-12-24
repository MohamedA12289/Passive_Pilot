'use client';

import { useState, useEffect } from 'react';
import { Flame, Users, TrendingDown, Clock } from 'lucide-react';

interface SpotsRemainingBadgeProps {
  totalSpots?: number;
  currentFilled?: number;
  variant?: 'default' | 'urgent' | 'critical';
  showPercentage?: boolean;
}

export default function SpotsRemainingBadge({ 
  totalSpots = 100,
  currentFilled = 73,
  variant = 'default',
  showPercentage = true
}: SpotsRemainingBadgeProps) {
  const [spotsRemaining, setSpotsRemaining] = useState(totalSpots - currentFilled);
  const [isDecrementing, setIsDecrementing] = useState(false);

  useEffect(() => {
    // Simulate spots being taken
    const interval = setInterval(() => {
      // Random chance to decrement (20% chance every 8 seconds)
      if (Math.random() > 0.8 && spotsRemaining > 5) {
        setIsDecrementing(true);
        setTimeout(() => {
          setSpotsRemaining(prev => Math.max(5, prev - 1));
          setTimeout(() => setIsDecrementing(false), 500);
        }, 300);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [spotsRemaining]);

  const percentageRemaining = Math.round((spotsRemaining / totalSpots) * 100);
  
  // Auto-determine variant based on spots remaining
  let finalVariant = variant;
  if (variant === 'default') {
    if (spotsRemaining <= 10) {
      finalVariant = 'critical';
    } else if (spotsRemaining <= 25) {
      finalVariant = 'urgent';
    }
  }

  const variantStyles = {
    default: {
      container: 'from-blue-600 to-blue-500 border-blue-400',
      glow: 'bg-blue-600',
      icon: 'text-blue-400',
      text: 'from-blue-300 to-blue-100'
    },
    urgent: {
      container: 'from-orange-600 to-amber-600 border-orange-400',
      glow: 'bg-orange-600',
      icon: 'text-orange-400',
      text: 'from-orange-300 to-amber-200'
    },
    critical: {
      container: 'from-red-600 to-rose-600 border-red-400',
      glow: 'bg-red-600',
      icon: 'text-red-400',
      text: 'from-red-300 to-rose-200'
    }
  };

  const style = variantStyles[finalVariant];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Main Badge */}
      <div className="relative group">
        {/* Glow effect */}
        <div className={`absolute -inset-1 bg-gradient-to-r ${style.glow} ${style.glow} rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000 ${isDecrementing ? 'animate-pulse' : ''}`}></div>
        
        {/* Content */}
        <div className={`relative px-6 py-4 bg-gradient-to-r ${style.container} rounded-xl border-2 shadow-2xl`}>
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Icon & Message */}
            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                {finalVariant === 'critical' && (
                  <div className="absolute -inset-1 bg-red-500 rounded-full animate-ping opacity-75"></div>
                )}
                <div className={`relative w-10 h-10 rounded-full bg-black/30 border border-white/20 flex items-center justify-center ${
                  isDecrementing ? 'animate-bounce' : ''
                }`}>
                  {finalVariant === 'critical' ? (
                    <Flame className={`w-5 h-5 ${style.icon} animate-pulse`} />
                  ) : (
                    <Users className={`w-5 h-5 ${style.icon}`} />
                  )}
                </div>
              </div>
              
              <div className="flex flex-col">
                <span className="text-white/90 text-xs font-semibold uppercase tracking-wide">
                  {finalVariant === 'critical' ? '🔥 URGENT' : finalVariant === 'urgent' ? '⚡ Filling Fast' : 'Limited Availability'}
                </span>
                <span className={`text-lg font-black font-montserrat bg-gradient-to-r ${style.text} bg-clip-text text-transparent`}>
                  Only {spotsRemaining} Spots Remaining
                </span>
              </div>
            </div>

            {/* Right side - Percentage */}
            {showPercentage && (
              <div className="flex flex-col items-end">
                <div className={`text-3xl font-black font-montserrat bg-gradient-to-br ${style.text} bg-clip-text text-transparent ${
                  isDecrementing ? 'animate-pulse' : ''
                }`}>
                  {percentageRemaining}%
                </div>
                <span className="text-white/70 text-xs font-medium uppercase tracking-wider">
                  Available
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-3 h-2 bg-black/30 rounded-full overflow-hidden border border-white/10">
            <div 
              className={`h-full bg-gradient-to-r from-white/90 to-white/70 transition-all duration-500 ${
                isDecrementing ? 'animate-pulse' : ''
              }`}
              style={{ width: `${percentageRemaining}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Secondary Message */}
      {finalVariant === 'critical' && (
        <div className="mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-red-950/30 border border-red-600/30 rounded-lg animate-pulse">
          <Clock className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-400 font-montserrat font-bold">
            ⚠️ Spots selling out! Secure yours now before it's too late!
          </span>
        </div>
      )}

      {finalVariant === 'urgent' && (
        <div className="mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-orange-950/30 border border-orange-600/30 rounded-lg">
          <TrendingDown className="w-4 h-4 text-orange-400" />
          <span className="text-sm text-orange-400 font-montserrat font-medium">
            📊 Filling up quickly - Don't miss out!
          </span>
        </div>
      )}
    </div>
  );
}