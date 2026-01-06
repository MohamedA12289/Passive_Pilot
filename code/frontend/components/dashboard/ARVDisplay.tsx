import React from 'react';

interface ARVDisplayProps {
  arv: number;
  arvPerSqft?: number;
}

export default function ARVDisplay({ arv, arvPerSqft }: ARVDisplayProps) {
  return (
    <div className="mb-6">
      <div className="text-sm text-gray-400 mb-2">ARV</div>
      <div className="text-4xl font-bold text-[#d4af37] mb-1">
        ${arv.toLocaleString()}
      </div>
      {arvPerSqft && (
        <div className="text-sm text-gray-400">
          ${arvPerSqft.toFixed(2)} per sqft
        </div>
      )}
    </div>
  );
}
