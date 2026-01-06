import React from 'react';
import type { DashboardStats } from '@/lib/types';

interface DashboardStatsProps {
  stats: DashboardStats;
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
        <div className="text-sm text-gray-400 mb-1">Deal Count Verified</div>
        <div className="text-3xl font-bold text-white">{stats.dealCountVerified}</div>
      </div>
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
        <div className="text-sm text-gray-400 mb-1">Assignment Received</div>
        <div className="text-3xl font-bold text-white">{stats.assignmentReceived}</div>
      </div>
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
        <div className="text-sm text-gray-400 mb-1">Slip per Fixer</div>
        <div className="text-3xl font-bold text-white">{stats.slipPerFixer}</div>
      </div>
    </div>
  );
}
