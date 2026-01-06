import React from 'react';
import type { DealAnalysis } from '@/lib/types';

interface PropertyMetadataProps {
  analysis: DealAnalysis;
}

export default function PropertyMetadata({ analysis }: PropertyMetadataProps) {
  const metadata = analysis.propertyMetadata;
  const property = analysis.deal.property;

  return (
    <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6">
      {/* Owner Name */}
      {property.ownerName && (
        <div className="mb-6">
          <h4 className="text-sm text-gray-400 mb-2">Owner</h4>
          <p className="text-lg font-semibold text-white">{property.ownerName}</p>
        </div>
      )}

      {/* Property Details */}
      <div className="mb-6">
        <h4 className="text-sm text-gray-400 mb-3">Property Details</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500">Beds</div>
            <div className="text-white font-semibold">{property.beds}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Baths</div>
            <div className="text-white font-semibold">{property.baths}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Sqft</div>
            <div className="text-white font-semibold">{property.sqft.toLocaleString()}</div>
          </div>
          {metadata.yearBuilt && (
            <div>
              <div className="text-xs text-gray-500">Year Built</div>
              <div className="text-white font-semibold">{metadata.yearBuilt}</div>
            </div>
          )}
          {metadata.lotSize && (
            <div>
              <div className="text-xs text-gray-500">Lot Size</div>
              <div className="text-white font-semibold">{metadata.lotSize.toLocaleString()} sqft</div>
            </div>
          )}
          {metadata.county && (
            <div>
              <div className="text-xs text-gray-500">County</div>
              <div className="text-white font-semibold">{metadata.county}</div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t border-[#262626] pt-4">
        <div className="flex gap-4 mb-4">
          <button className="px-4 py-2 bg-[#d4af37] text-black rounded-lg font-semibold text-sm">
            Essentials
          </button>
          <button className="px-4 py-2 bg-transparent border border-[#262626] text-gray-400 rounded-lg text-sm hover:border-[#d4af37] hover:text-[#d4af37] transition-colors">
            Comestication
          </button>
          <button className="px-4 py-2 bg-transparent border border-[#262626] text-gray-400 rounded-lg text-sm hover:border-[#d4af37] hover:text-[#d4af37] transition-colors">
            O-Comestible
          </button>
        </div>

        {/* Estimations */}
        <div>
          <h5 className="text-sm text-gray-400 mb-3">Estimations</h5>
          <div className="space-y-2">
            {Object.entries(analysis.estimations).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-sm text-gray-400 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="text-white font-semibold">
                  ${value?.toLocaleString() || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
