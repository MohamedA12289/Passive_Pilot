"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { loadSettings } from "@/lib/storage";

/**
 * Brand mark shown in the app header.
 * - Matches passivepilot.io vibe: bold gradient wordmark + subtle tagline.
 * - Still respects the in-app settings (brandName/logoMode) if user changed it.
 */
export function Brand() {
  const [brandName, setBrandName] = useState("Passive Pilot");
  const [logoMode, setLogoMode] = useState<"letter" | "image">("letter");

  useEffect(() => {
    const s = loadSettings();
    setBrandName(s.brandName || "Passive Pilot");
    setLogoMode(s.logoMode || "letter");
  }, []);

  const words = brandName.split(" ");
  const top = words.length >= 2 ? words[0] : brandName;
  const bottom = words.length >= 2 ? words.slice(1).join(" ") : "";

  return (
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-950 flex items-center justify-center shadow-soft">
        {logoMode === "image" ? (
          <Image src="/logo.png" alt="logo" width={36} height={36} />
        ) : (
          <div className="h-full w-full grid place-items-center">
            <div className="h-6 w-6 rounded-xl bg-gradient-to-br from-zinc-50/90 to-zinc-400/60" />
          </div>
        )}
      </div>

      <div className="leading-tight">
        <div className="text-[13px] font-semibold tracking-[0.16em] uppercase">
          <span className="text-gradient">{top}</span>
          {bottom ? <span className="text-gradient"> {bottom}</span> : null}
        </div>
        <div className="text-[11px] text-zinc-400">Real Estate Deal Analyzer</div>
      </div>
    </div>
  );
}
