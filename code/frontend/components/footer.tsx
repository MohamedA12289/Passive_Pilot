
"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-amber-900/20 dark:border-amber-900/20 bg-white dark:bg-black/90 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center gap-3 group mb-4">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 transition-transform group-hover:scale-105">
                <Image 
                  src="/logo.png" 
                  alt="Passive Pilot Footer" 
                  fill
                  className="object-contain"
                />
                {/* V2 Badge */}
                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-gold-600 text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow-lg">
                  V2
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-bold text-gold-600 dark:text-gold-500 tracking-tight">PASSIVE PILOT</span>
                <span className="text-[10px] sm:text-xs text-gold-700/80 dark:text-gold-600/80 tracking-wider">AUTOMATE WEALTH</span>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center md:text-left max-w-sm">
              VIP Discord Community Tool - Automating wholesale real estate analysis with AI-powered precision.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-sm sm:text-base font-semibold text-gold-700 dark:text-gold-500 mb-4">Quick Links</h3>
            <div className="flex flex-col gap-2 sm:gap-3">
              <Link 
                href="/analyzer" 
                className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-center md:text-left"
              >
                Deal Analyzer
              </Link>
              <Link 
                href="/tools" 
                className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-center md:text-left"
              >
                Premium Tools
              </Link>
              <Link 
                href="/how-it-works" 
                className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-center md:text-left"
              >
                How It Works
              </Link>
              <Link 
                href="/faq" 
                className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-center md:text-left"
              >
                FAQ
              </Link>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-sm sm:text-base font-semibold text-gold-700 dark:text-gold-500 mb-4">Follow Aryone</h3>
            <div className="flex flex-col gap-2 sm:gap-3">
              <a 
                href="https://tiktok.com/@aryonewholesales" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-center md:text-left flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                @AryoneWholesales
              </a>
              <a 
                href="https://instagram.com/aryonethomas" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-center md:text-left flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                @aryonethomas
              </a>
              <a 
                href="https://instagram.com/aryonewholesales" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-center md:text-left flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                @aryonewholesales
              </a>
              <Link 
                href="https://whop.com/passive-pilot-wholesaling/passive-pilot-premium-vip/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors text-center md:text-left font-semibold flex items-center gap-2"
              >
                👑 Join Passive Pilot Premium
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-amber-900/10 dark:border-amber-900/20">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">
            © {currentYear} Passive Pilot. All rights reserved. Built by Aryone Thomas
          </p>
        </div>
      </div>
    </footer>
  );
}
