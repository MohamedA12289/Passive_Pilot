import React from 'react';
import PropertyCard from './PropertyCard';
import type { Deal } from '@/lib/types';

interface PropertyGridProps {
  deals: Deal[];
}

export default function PropertyGrid({ deals }: PropertyGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Property Overview</h2>
      </div>
      <div className="space-y-4">
        {deals.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            No properties found. Start by adding deals.
          </div>
        ) : (
          deals.map((deal) => (
            <PropertyCard key={deal.id} property={deal.property} dealId={deal.id} />
          ))
        )}
      </div>
    </div>
  );
}
