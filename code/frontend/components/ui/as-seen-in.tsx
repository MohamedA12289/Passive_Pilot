
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function AsSeenIn() {
  const [_mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logos = [
    { name: "Forbes", src: "/forbes-logo.png", width: 140, height: 40 },
    { name: "Entrepreneur", src: "/entrepreneur-logo.png", width: 160, height: 40 },
    { name: "Inc.", src: "/inc-logo.png", width: 100, height: 40 },
    { name: "BiggerPockets", src: "/biggerpockets-logo.png", width: 180, height: 40 },
    { name: "Real Estate Investor", src: "/reinvestor-logo.png", width: 170, height: 40 },
  ];

  return (
    <div className="w-full py-12 bg-black border-y border-amber-500/20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header - SIMPLIFIED TO GOLD + WHITE */}
        <div className="text-center mb-8">
          <p className="text-sm font-bold tracking-wider text-amber-400 uppercase mb-2">
            Featured In
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-400 via-gold-300 to-amber-400 bg-clip-text text-transparent">
            As Seen In Leading Publications
          </h3>
        </div>

        {/* Logo Grid - BLACK CARDS WITH GOLD BORDERS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center justify-items-center">
          {logos.map((logo, index) => (
            <div
              key={index}
              className="group relative flex items-center justify-center h-20 w-full px-4"
            >
              {/* Black card with gold border */}
              <div className="absolute inset-0 bg-black rounded-lg border-2 border-amber-500/20 group-hover:border-amber-500/50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-amber-500/20" />
              
              {/* Logo image */}
              <div className="relative z-10 flex items-center justify-center w-full h-full py-3">
                <Image
                  src={logo.src}
                  alt={`${logo.name} logo`}
                  width={logo.width}
                  height={logo.height}
                  className="object-contain opacity-90 group-hover:opacity-100 transition-all duration-300 filter invert grayscale brightness-200"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Verified badge - GOLD + WHITE ONLY */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black border-2 border-amber-500/30 rounded-full">
            <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-bold text-white">
              Verified & Trusted by 2,350+ Wholesalers
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
