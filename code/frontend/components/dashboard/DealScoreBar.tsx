import React from 'react';

interface DealScoreBarProps {
  score: number; // 0-100
}

export default function DealScoreBar({ score }: DealScoreBarProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400">Deal Score %</span>
        <span className="text-white font-semibold">{score}%</span>
      </div>
      <div className="w-full h-3 bg-[#262626] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#d4af37] to-[#f59e0b] transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>0</span>
        <span>100</span>
      </div>
    </div>
  );
}
