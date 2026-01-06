import React from 'react';
import Image from 'next/image';
import ARVDisplay from './ARVDisplay';
import DealScoreBar from './DealScoreBar';
import type { DealAnalysis } from '@/lib/types';

interface DealAnalysisCardProps {
  analysis: DealAnalysis;
}

export default function DealAnalysisCard({ analysis }: DealAnalysisCardProps) {
  return (
    <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6">
      {/* Property Photo */}
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 rounded-full bg-[#262626] overflow-hidden border-4 border-[#d4af37] relative">
          {analysis.deal.property.imageUrl ? (
            <Image
              src={analysis.deal.property.imageUrl}
              alt={analysis.deal.property.address}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              <svg
                className="w-12 h-12"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-1">
          {analysis.deal.property.address}
        </h3>
        <p className="text-sm text-gray-400">
          {analysis.deal.property.city}, {analysis.deal.property.state} {analysis.deal.property.zipCode}
        </p>
      </div>

      {/* ARV */}
      <ARVDisplay arv={analysis.arv} arvPerSqft={analysis.arvPerSqft} />

      {/* Assignment Fee */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400">Assignment Fee</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked={analysis.assignmentFeeToggle} />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4af37]"></div>
          </label>
        </div>
        <div className="text-2xl font-bold text-white">
          ${analysis.assignmentFee.toLocaleString()}
        </div>
      </div>

      {/* Dispose Agent */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400">Dispose Agent</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked={analysis.disposeAgentToggle} />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4af37]"></div>
          </label>
        </div>
        <div className="text-lg font-semibold text-white">
          ${analysis.disposeAgent}
        </div>
      </div>

      {/* Deal Score */}
      <DealScoreBar score={analysis.dealScore} />

      {/* Labels */}
      <div className="flex gap-2 mt-6">
        <span className="px-3 py-1 bg-[#d4af37] bg-opacity-20 text-[#d4af37] rounded-full text-xs font-semibold">
          Essentials
        </span>
        <span className="px-3 py-1 bg-green-500 bg-opacity-20 text-green-400 rounded-full text-xs font-semibold">
          Estimated
        </span>
      </div>
    </div>
  );
}
