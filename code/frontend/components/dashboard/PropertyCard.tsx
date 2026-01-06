import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BedDouble, Bath, MapPin } from 'lucide-react';
import type { Property } from '@/lib/types';

interface PropertyCardProps {
  property: Property;
  dealId?: string;
}

export default function PropertyCard({ property, dealId }: PropertyCardProps) {
  return (
    <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4 hover:border-[#d4af37] transition-colors">
      <div className="flex gap-4">
        {/* Property Image */}
        <div className="w-24 h-24 bg-[#262626] rounded-lg flex-shrink-0 overflow-hidden relative">
          {property.imageUrl ? (
            <Image
              src={property.imageUrl}
              alt={property.address}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              <MapPin size={32} />
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="flex-1">
          {property.ownerName && (
            <div className="text-sm text-gray-400 mb-1">{property.ownerName}</div>
          )}
          <div className="text-white font-semibold mb-2">{property.address}</div>
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
            <div className="flex items-center gap-1">
              <BedDouble size={16} />
              <span>{property.beds}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath size={16} />
              <span>{property.baths}</span>
            </div>
            <div>{property.sqft.toLocaleString()} sqft</div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-white">
                ${property.price.toLocaleString()}
              </span>
              {property.discount && (
                <span className="ml-2 text-[#d4af37] font-semibold">
                  -{property.discount}%
                </span>
              )}
            </div>
            {dealId && (
              <Link
                href={`/deals/analyze/${dealId}`}
                className="px-4 py-2 bg-transparent border border-[#d4af37] text-[#d4af37] rounded-lg hover:bg-[#d4af37] hover:text-black transition-colors text-sm"
              >
                Show More
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
