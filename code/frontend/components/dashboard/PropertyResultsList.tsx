"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { MapPin, TrendingUp } from "lucide-react";

type Property = {
  id: string;
  title: string;
  address: string;
  price: string;
  arv: string;
  repairs: string;
  cashFlow: string;
  capRate: string;
};

type PropertyResultsListProps = {
  properties: Property[];
  selectedId: string;
  onSelect: (property: Property) => void;
};

export function PropertyResultsList({ properties, selectedId, onSelect }: PropertyResultsListProps) {
  return (
    <div className="space-y-4">
      {properties.map((property) => (
        <button
          key={property.id}
          onClick={() => onSelect(property)}
          className={cn(
            "w-full rounded-2xl border border-amber-500/10 bg-black/40 p-3 text-left transition-all duration-200",
            "hover:border-amber-400/40 hover:shadow-[0_10px_40px_rgba(251,191,36,0.12)]",
            selectedId === property.id && "border-amber-400/70 bg-amber-500/10 shadow-[0_10px_40px_rgba(251,191,36,0.18)]"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="relative h-16 w-20 overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-neutral-800 to-neutral-900">
              <Image src="/logo.png" alt="Property thumbnail" fill className="object-contain opacity-70" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-amber-50">{property.title}</p>
                  <p className="text-xs text-amber-100/70 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {property.address}
                  </p>
                </div>
                <span className="rounded-full bg-amber-500/15 px-2 py-1 text-[11px] font-semibold text-amber-200">{property.capRate} Cap</span>
              </div>
              <div className="flex items-center justify-between text-[13px] text-amber-100/80">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-amber-200">{property.price}</span>
                  <span className="text-amber-100/60">ARV {property.arv}</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-200">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span className="font-semibold">{property.cashFlow}/mo</span>
                </div>
              </div>
              <p className="text-[12px] text-amber-100/70">Repairs {property.repairs}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

export default PropertyResultsList;
