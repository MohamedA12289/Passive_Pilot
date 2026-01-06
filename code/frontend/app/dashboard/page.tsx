'use client';

import React, { useEffect, useState } from 'react';
import DashboardStats from '@/components/dashboard/DashboardStats';
import PropertyGrid from '@/components/dashboard/PropertyGrid';
import Sidebar from '@/components/dashboard/Sidebar';
import MapPanel from '@/components/dashboard/MapPanel';
import { fetchDeals, fetchDashboardStats } from '@/lib/api';
import type { Deal, DashboardStats as DashboardStatsType, MapMarker } from '@/lib/types';

export default function DashboardPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stats, setStats] = useState<DashboardStatsType>({
    dealCountVerified: 0,
    assignmentReceived: 0,
    slipPerFixer: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [dealsData, statsData] = await Promise.all([
          fetchDeals(),
          fetchDashboardStats(),
        ]);
        setDeals(dealsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Convert deals to map markers
  const mapMarkers: MapMarker[] = deals
    .filter((deal) => deal.property.latitude && deal.property.longitude)
    .map((deal) => ({
      id: deal.id,
      latitude: deal.property.latitude!,
      longitude: deal.property.longitude!,
      property: deal.property,
      deal,
    }));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Real Estate Wholesaling Command Center</p>
        </div>

        {/* Stats */}
        <DashboardStats stats={stats} />

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Property Overview */}
          <div className="lg:col-span-7">
            <PropertyGrid deals={deals} />
          </div>

          {/* Right Column - Map and Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            {/* Map */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Property Locations</h3>
              <MapPanel markers={mapMarkers} height="400px" />
            </div>

            {/* Sidebar Tools */}
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
