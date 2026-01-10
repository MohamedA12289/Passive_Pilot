
'use client';

import { useState, useEffect } from 'react';
import { X, Gift, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function HolidaySaleBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-expand on first load, then every 15 seconds for 5 seconds
  useEffect(() => {
    if (!isVisible) return;

    // Expand on initial load
    setIsExpanded(true);
    const initialTimer = setTimeout(() => {
      setIsExpanded(false);
    }, 5000);

    // Then auto-expand every 15 seconds
    const expandInterval = setInterval(() => {
      setIsExpanded(true);
      setTimeout(() => {
        setIsExpanded(false);
      }, 5000); // Collapse after 5 seconds
    }, 15000); // Expand every 15 seconds

    return () => {
      clearTimeout(initialTimer);
      clearInterval(expandInterval);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Side Sticky Notification - EXTREME MINIMAL - 95% OFF SCREEN */}
      <div 
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-20 transition-all duration-500 ease-in-out pointer-events-none ${
          isExpanded ? 'translate-x-[calc(100%-140px)]' : 'translate-x-[calc(100%-18px)]'
        }`}
        style={{ maxWidth: '140px', width: '140px' }}
      >
        <div 
          className="bg-gradient-to-br from-red-600 via-green-600 to-red-600 text-white shadow-lg rounded-l-lg overflow-hidden"
          style={{ pointerEvents: 'auto', position: 'relative' }}
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          <div className="flex items-center">
            {/* Peek Tab - TINY - Always visible */}
            <div className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 bg-black/20 cursor-pointer" style={{ width: '18px' }}>
              <Gift className="w-2.5 h-2.5 animate-bounce" />
              <div className="flex flex-col items-center gap-0">
                <span className="text-[7px] font-black">S</span>
                <span className="text-[7px] font-black">A</span>
                <span className="text-[7px] font-black">L</span>
                <span className="text-[7px] font-black">E</span>
              </div>
            </div>

            {/* Expanded Content - MINIMAL */}
            <div className={`transition-all duration-500 ${isExpanded ? 'w-[122px] opacity-100' : 'w-0 opacity-0'} overflow-hidden`}>
              <div className="p-1.5 pr-1 relative">
                <button
                  onClick={() => setIsVisible(false)}
                  className="absolute top-0 right-0 p-0.5 hover:bg-white/20 rounded-full transition-colors z-10"
                  aria-label="Close banner"
                  style={{ pointerEvents: 'auto' }}
                >
                  <X className="w-2 h-2" />
                </button>

                <div className="space-y-1">
                  <p className="text-[9px] font-black pr-3">
                    🎄 SALE! 🎄
                  </p>
                  
                  <p className="text-[8px] font-semibold">
                    <span className="bg-white text-red-600 px-1 py-0.5 rounded font-black text-[8px]">20% OFF</span>
                  </p>
                  
                  <p className="text-[9px] font-bold">
                    <span className="text-yellow-300 text-[10px]">$20/mo</span>
                  </p>

                  <Link
                    href="/mentorship"
                    className="flex items-center justify-center gap-0.5 px-1.5 py-0.5 bg-white text-red-600 font-bold text-[8px] rounded hover:bg-yellow-100 transition-all duration-200 shadow-sm hover:scale-105 mt-0.5"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <span>Join</span>
                    <ChevronRight className="w-2 h-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
