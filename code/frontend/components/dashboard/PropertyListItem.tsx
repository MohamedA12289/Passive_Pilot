import React from 'react';
import Image from 'next/image';
import { BedDouble, Bath, MapPin } from 'lucide-react';
import type { Property } from '@/lib/types';

interface PropertyListItemProps {
  property: Property;
  selected?: boolean;
  onSelect?: (property: Property) => void;
}

export default function PropertyListItem({
  property,
  selected = false,
  onSelect,
}: PropertyListItemProps) {
  return (
    <div
      className={`bg-[#1a1a1a] border ${
        selected ? 'border-[#d4af37]' : 'border-[#262626]'
      } rounded-lg p-4 cursor-pointer hover:border-[#d4af37] transition-colors`}
      onClick={() => onSelect?.(property)}
    >
      <div className="flex gap-4">
        {/* Property Image */}
        <div className="w-20 h-20 bg-[#262626] rounded-lg flex-shrink-0 overflow-hidden relative">
          {property.imageUrl ? (
            <Image
              src={property.imageUrl}
              alt={property.address}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              <MapPin size={24} />
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="flex-1">
          <div className="text-white font-semibold mb-1">{property.address}</div>
          <div className="text-xl font-bold text-white mb-2">
            ${property.price.toLocaleString()}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <BedDouble size={14} />
              <span>{property.beds}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath size={14} />
              <span>{property.baths}</span>
            </div>
            <div>{property.sqft.toLocaleString()} sqft</div>
            {property.lotSize && <div>{property.lotSize.toLocaleString()} lot</div>}
          </div>
        </div>

        {/* Selection Indicator */}
        {selected && (
          <div className="flex items-center">
            <div className="w-6 h-6 bg-[#d4af37] rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-black"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
