"use client";

import { Bed, Bath, Ruler, Car, Wand2, Info, PhoneCall, Sparkles } from "lucide-react";

type PropertyDetail = {
  title: string;
  address: string;
  price: string;
  arv: string;
  repairs: string;
  fees: string;
  score: string;
  beds: number;
  baths: number;
  sqft: number;
  parking: string;
};

type PropertyDetailPanelProps = {
  property: PropertyDetail;
};

export function PropertyDetailPanel({ property }: PropertyDetailPanelProps) {
  const { title, address, price, arv, repairs, fees, score, beds, baths, sqft, parking } = property;

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-neutral-950 via-black to-neutral-900 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-100/60">Selected property</p>
          <h3 className="mt-1 text-xl font-semibold text-amber-50">{title}</h3>
          <p className="text-sm text-amber-100/70">{address}</p>
        </div>
        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200">Deal Score {score}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-amber-500/20 bg-black/40 p-4 text-sm">
        <div>
          <p className="text-amber-100/70">Price</p>
          <p className="text-lg font-semibold text-amber-50">{price}</p>
        </div>
        <div>
          <p className="text-amber-100/70">After Repair Value (ARV)</p>
          <p className="text-lg font-semibold text-amber-50">{arv}</p>
        </div>
        <div>
          <p className="text-amber-100/70">Repairs</p>
          <p className="text-lg font-semibold text-amber-50">{repairs}</p>
        </div>
        <div>
          <p className="text-amber-100/70">Fees</p>
          <p className="text-lg font-semibold text-amber-50">{fees}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-3 text-xs text-amber-100/70">
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/15 bg-black/50 px-2 py-2">
          <Bed className="h-4 w-4 text-amber-200" />
          <span>{beds} beds</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/15 bg-black/50 px-2 py-2">
          <Bath className="h-4 w-4 text-amber-200" />
          <span>{baths} baths</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/15 bg-black/50 px-2 py-2">
          <Ruler className="h-4 w-4 text-amber-200" />
          <span>{sqft.toLocaleString()} sqft</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/15 bg-black/50 px-2 py-2">
          <Car className="h-4 w-4 text-amber-200" />
          <span>{parking}</span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3 text-sm">
        <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/20 px-4 py-2 font-semibold text-amber-50 shadow-[0_10px_30px_rgba(251,191,36,0.25)] transition hover:scale-[1.01] hover:border-amber-300">
          <Wand2 className="h-4 w-4" />
          Submit LOI and Obtain Signature
        </button>
        <button className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-black/60 px-4 py-2 font-semibold text-amber-100 transition hover:border-amber-300 hover:text-amber-50">
          <Info className="h-4 w-4" />
          Order Preliminary Title
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-amber-100/80">
        <div className="rounded-lg border border-amber-500/15 bg-black/40 p-3">
          <p className="text-amber-100/60">Send a text message</p>
          <div className="mt-2 flex items-center justify-between">
            <button className="rounded-full bg-amber-500/20 px-3 py-1 text-[11px] font-semibold text-amber-50 hover:bg-amber-400/30">Follow-up 1</button>
            <span className="text-[10px] text-amber-100/60">30 min ago</span>
          </div>
        </div>
        <div className="rounded-lg border border-amber-500/15 bg-black/40 p-3">
          <p className="text-amber-100/60">Automated email drip</p>
          <div className="mt-2 flex items-center justify-between">
            <button className="rounded-full bg-amber-500/20 px-3 py-1 text-[11px] font-semibold text-amber-50 hover:bg-amber-400/30">Nurture warm leads</button>
            <Sparkles className="h-4 w-4 text-amber-300" />
          </div>
        </div>
        <div className="rounded-lg border border-amber-500/15 bg-black/40 p-3">
          <p className="text-amber-100/60">Next action</p>
          <div className="mt-2 flex items-center justify-between">
            <button className="rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-semibold text-emerald-100 hover:bg-emerald-400/25">Send message</button>
            <PhoneCall className="h-4 w-4 text-emerald-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetailPanel;
