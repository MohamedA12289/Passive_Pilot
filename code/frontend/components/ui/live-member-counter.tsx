'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingUp } from 'lucide-react';

export default function LiveMemberCounter() {
  const [memberCount, setMemberCount] = useState(3300);
  const [isIncrementing, setIsIncrementing] = useState(false);

  useEffect(() => {
    // Simulate live member count incrementing
    const interval = setInterval(() => {
      // Random chance to increment (30% chance every 5 seconds)
      if (Math.random() > 0.7) {
        setIsIncrementing(true);
        setTimeout(() => {
          setMemberCount(prev => prev + 1);
          setTimeout(() => setIsIncrementing(false), 500);
        }, 300);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center gap-4 py-4">
      {/* Member Count Display */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-yellow-500 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative px-6 py-3 bg-black/90 border border-amber-600/30 rounded-lg flex items-center gap-3">
          <Users className={`w-5 h-5 text-amber-500 ${
            isIncrementing ? 'animate-bounce' : ''
          }`} />
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-montserrat uppercase tracking-wider">
              Active Members
            </span>
            <span className={`text-2xl font-bold font-montserrat bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent ${
              isIncrementing ? 'animate-pulse' : ''
            }`}>
              {memberCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Live Indicator */}
      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950/30 border border-emerald-600/30 rounded-lg">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
        </div>
        <span className="text-sm text-emerald-400 font-montserrat font-medium">
          LIVE
        </span>
      </div>

      {/* Growth Indicator */}
      <div className="flex items-center gap-2 px-4 py-2 bg-blue-950/30 border border-blue-600/30 rounded-lg">
        <TrendingUp className="w-4 h-4 text-blue-400" />
        <span className="text-sm text-blue-400 font-montserrat font-medium">
          +125 this week
        </span>
      </div>
    </div>
  );
}