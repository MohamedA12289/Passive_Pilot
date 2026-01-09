"use client";

import { useState, useEffect } from "react";

/**
 * useIsMobile Hook
 * 
 * Returns a boolean indicating whether the viewport is mobile-sized (≤768px).
 * SSR-safe: defaults to false until mounted client-side.
 * Automatically updates on window resize.
 * 
 * @returns {boolean} true if viewport width ≤ 768px, false otherwise
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side only)
    if (typeof window === "undefined") return;

    // Create media query
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    // Set initial value
    setIsMobile(mediaQuery.matches);

    // Handler for media query changes
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };

    // Add listener for changes
    // Use addEventListener if available (modern browsers), else use deprecated addListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange as any);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange as any);
      }
    };
  }, []);

  return isMobile;
}
