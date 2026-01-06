'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DealAnalysisCard from '@/components/dashboard/DealAnalysisCard';
import PropertyMetadata from '@/components/dashboard/PropertyMetadata';
import MapPanel from '@/components/dashboard/MapPanel';
import { fetchDeal } from '@/lib/api';
import type { DealAnalysis, MapMarker } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DealAnalyzePage() {
  const params = useParams();
  const dealId = params.id as string;

  const [analysis, setAnalysis] = useState<DealAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDealAnalysis() {
      if (!dealId) return;

      setLoading(true);
      setError(null);

      try {
        const deal = await fetchDeal(dealId);

        // Convert Deal to DealAnalysis
        const dealAnalysis: DealAnalysis = {
          deal,
          arv: deal.arv,
          arvPerSqft: deal.property.sqft ? deal.arv / deal.property.sqft : undefined,
          assignmentFee: deal.assignmentFee || 10000,
          assignmentFeeToggle: true,
          disposeAgent: deal.disposeAgent || 'John Smith',
          disposeAgentToggle: true,
          dealScore: deal.dealScore || 85,
          estimations: {
            repairCost: 30000,
            holdingCost: 5000,
            closingCost: 3000,
          },
          propertyMetadata: {
            yearBuilt: deal.property.yearBuilt,
            lotSize: deal.property.lotSize,
            sqft: deal.property.sqft,
            beds: deal.property.beds,
            baths: deal.property.baths,
            county: 'Orange County',
            parcelNumber: 'PKL-' + deal.id.slice(0, 8),
          },
        };

        setAnalysis(dealAnalysis);
      } catch (err) {
        console.error('Error loading deal analysis:', err);
        setError('Failed to load deal analysis. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadDealAnalysis();
  }, [dealId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-xl">Loading deal analysis...</div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error || 'Deal not found'}</div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#d4af37] text-black rounded-lg font-semibold hover:bg-[#f59e0b] transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Create map marker for the property
  const mapMarkers: MapMarker[] = analysis.deal.property.latitude && analysis.deal.property.longitude
    ? [{
        id: analysis.deal.id,
        latitude: analysis.deal.property.latitude,
        longitude: analysis.deal.property.longitude,
        property: analysis.deal.property,
        deal: analysis.deal,
      }]
    : [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-transparent border border-[#262626] text-gray-400 rounded-lg hover:border-[#d4af37] hover:text-[#d4af37] transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Deal Analysis</h1>
            <p className="text-gray-400">{analysis.deal.property.address}</p>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Deal Analysis Card */}
          <div className="lg:col-span-4">
            <DealAnalysisCard analysis={analysis} />
          </div>

          {/* Middle Column - Property Details */}
          <div className="lg:col-span-5">
            <PropertyMetadata analysis={analysis} />
          </div>

          {/* Right Column - Map */}
          <div className="lg:col-span-3">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Location</h3>
              <MapPanel
                markers={mapMarkers}
                height="600px"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
