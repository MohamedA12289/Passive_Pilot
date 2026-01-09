"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Calculator, TrendingUp, Wrench, DollarSign, HelpCircle, GraduationCap, Sparkles, MessageCircle, Menu, X } from "lucide-react";

interface NavItem {
  name: string;
  url: string;
  icon: React.ElementType;
}

export default function Navigation() {
  const pathname = usePathname();
  const isDashboardExperience = pathname?.startsWith("/dashboard");
  const [activeTab, setActiveTab] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // CTA items that should have special coloring
  const ctaItems = ["Pricing", "Free Training", "Premium", "Join $20"];
  
  const items: NavItem[] = [
    { name: "Home", url: "/", icon: Home },
    { name: "Analyzer", url: "/analyzer", icon: Calculator },
    { name: "Dashboard", url: "/tools/deal-pipeline", icon: TrendingUp },
    { name: "Tools", url: "/tools", icon: Wrench },
    { name: "Pricing", url: "/pricing", icon: DollarSign },
    { name: "How It Works", url: "/how-it-works", icon: HelpCircle },
    { name: "Free Training", url: "/free-training", icon: GraduationCap },
    { name: "Premium", url: "/mentorship", icon: Sparkles },
    { name: "FAQ", url: "/faq", icon: MessageCircle },
    { name: "Join $20", url: "https://whop.com/passive-pilot-wholesaling/passive-pilot-premium-vip/", icon: Sparkles },
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Set active tab based on current pathname
    const currentItem = items.find(item => item.url === pathname);
    if (currentItem) {
      setActiveTab(currentItem.name);
    } else {
      setActiveTab(items[0].name);
    }
  }, [pathname, items]);

  if (isDashboardExperience) {
    return null;
  }

  return (
    <>
      {/* Logo - Fixed at top left - SMALLER */}
      <Link href="/" className="fixed top-3 left-3 sm:top-4 sm:left-4 z-50 flex items-center gap-2 group pointer-events-auto">
        <div className="relative w-8 h-8 sm:w-10 sm:h-10 transform transition-all duration-700 group-hover:scale-110">
          <Image 
            src="/logo.png" 
            alt="Passive Pilot" 
            fill
            className="object-contain drop-shadow-lg group-hover:drop-shadow-[0_0_25px_rgba(245,158,11,0.8)] transition-all duration-500"
            priority
          />
          {/* V3 Badge */}
          <div className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-gradient-to-r from-amber-500 to-gold-600 text-black text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded shadow-lg">
            V3
          </div>
        </div>
        
        <div className="hidden md:flex flex-col">
          <span className="text-xs sm:text-sm font-bold tracking-tight bg-gradient-to-r from-amber-600 via-gold-500 to-gold-600 bg-clip-text text-transparent">
            PASSIVE PILOT
          </span>
          <span className="text-[7px] sm:text-[8px] text-gold-700/80 dark:text-gold-600/80 tracking-wider">
            AUTOMATE WEALTH
          </span>
        </div>
      </Link>

      {/* Desktop Navigation Bar - Top right icon bar (hidden on mobile) */}
      <div className="hidden md:block fixed top-3 right-3 z-50 pointer-events-none">
        <div className="flex items-center gap-1 bg-black/70 dark:bg-black/80 border border-amber-500/30 backdrop-blur-md py-1 px-1 rounded-lg shadow-lg pointer-events-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            const isCTA = ctaItems.includes(item.name);

            // Define colors for CTA items
            let ctaColor = "";
            let ctaHoverColor = "";
            let ctaGlow = "";
            
            if (isCTA) {
              if (item.name === "Pricing") {
                ctaColor = "text-emerald-400";
                ctaHoverColor = "hover:text-emerald-300";
                ctaGlow = "hover:drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]";
              } else if (item.name === "Free Training") {
                ctaColor = "text-blue-400";
                ctaHoverColor = "hover:text-blue-300";
                ctaGlow = "hover:drop-shadow-[0_0_6px_rgba(96,165,250,0.5)]";
              } else if (item.name === "Premium") {
                ctaColor = "text-purple-400";
                ctaHoverColor = "hover:text-purple-300";
                ctaGlow = "hover:drop-shadow-[0_0_6px_rgba(192,132,252,0.5)]";
              } else if (item.name === "Join $20") {
                ctaColor = "text-amber-400 font-black";
                ctaHoverColor = "hover:text-amber-300";
                ctaGlow = "hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]";
              }
            }

            return (
              <motion.div
                key={item.name}
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link
                  href={item.url}
                  onClick={() => setActiveTab(item.name)}
                  className={`
                    relative cursor-pointer p-1.5 rounded transition-all duration-200 group flex items-center justify-center
                    ${isActive 
                      ? isCTA ? ctaColor : "text-amber-400" 
                      : isCTA 
                        ? `${ctaColor} ${ctaHoverColor} ${ctaGlow}` 
                        : "text-gray-300 hover:text-amber-400"
                    }
                  `}
                >
                {/* Small subtle notification badges */}
                {item.name === "Premium" && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center pointer-events-none">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                    </span>
                  </span>
                )}
                
                {item.name === "Free Training" && (
                  <span className="absolute -top-0.5 -right-0.5 px-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-[5px] font-black text-white rounded-full pointer-events-none">
                    FREE
                  </span>
                )}
                
                {item.name === "Join $20" && (
                  <span className="absolute -top-0.5 -right-0.5 px-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-[5px] font-black text-black rounded-full pointer-events-none animate-pulse">
                    HOT
                  </span>
                )}

                {/* Icon */}
                <Icon size={14} strokeWidth={2.5} />
                
                {/* Tooltip */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                  <div className="bg-black/95 text-amber-400 text-[10px] font-bold px-2 py-1 rounded border border-amber-500/30 shadow-lg">
                    {item.name === "Tools" ? "Premium Tools" : item.name}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-black/95 border-t border-l border-amber-500/30 rotate-45"></div>
                  </div>
                </div>
                
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="lamp"
                    className="absolute inset-0 w-full bg-amber-500/10 rounded -z-10"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}
              </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Mobile Hamburger Button - Bottom right */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden fixed bottom-4 right-4 z-50 w-14 h-14 bg-gradient-to-br from-amber-500 to-gold-600 rounded-full flex items-center justify-center shadow-2xl shadow-amber-500/50 hover:shadow-amber-500/70 transition-all duration-300 hover:scale-110 active:scale-95"
      >
        {isMenuOpen ? (
          <X className="w-6 h-6 text-black" strokeWidth={3} />
        ) : (
          <Menu className="w-6 h-6 text-black" strokeWidth={3} />
        )}
      </button>

      {/* Mobile Full-Screen Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden fixed inset-0 z-40 bg-black/95 backdrop-blur-lg"
          >
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
              {items.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeTab === item.name;
                const isCTA = ctaItems.includes(item.name);

                // Define colors for CTA items
                let textColor = "text-white";
                let borderColor = "border-amber-500/30";
                
                if (isCTA) {
                  if (item.name === "Pricing") {
                    textColor = "text-emerald-400";
                    borderColor = "border-emerald-500/50";
                  } else if (item.name === "Free Training") {
                    textColor = "text-blue-400";
                    borderColor = "border-blue-500/50";
                  } else if (item.name === "Premium") {
                    textColor = "text-purple-400";
                    borderColor = "border-purple-500/50";
                  } else if (item.name === "Join $20") {
                    textColor = "text-amber-400";
                    borderColor = "border-amber-500/70";
                  }
                }

                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="w-full max-w-sm"
                  >
                    <Link
                      href={item.url}
                      onClick={() => {
                        setActiveTab(item.name);
                        setIsMenuOpen(false);
                      }}
                      className={`
                        flex items-center gap-4 w-full px-6 py-4 rounded-xl border-2 ${borderColor} bg-black/50 backdrop-blur-md
                        ${isActive ? 'bg-amber-500/10' : 'hover:bg-white/5'}
                        transition-all duration-200 active:scale-95
                      `}
                    >
                      <Icon size={24} className={textColor} strokeWidth={2.5} />
                      <span className={`text-lg font-bold ${textColor}`}>
                        {item.name}
                      </span>
                      
                      {/* Badges */}
                      {item.name === "Free Training" && (
                        <span className="ml-auto px-2 py-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-[10px] font-black text-white rounded-full">
                          FREE
                        </span>
                      )}
                      
                      {item.name === "Join $20" && (
                        <span className="ml-auto px-2 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-[10px] font-black text-black rounded-full animate-pulse">
                          HOT
                        </span>
                      )}
                      
                      {item.name === "Premium" && (
                        <span className="ml-auto flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}