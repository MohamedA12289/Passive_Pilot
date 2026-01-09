"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, Coins, User, LogOut, Zap, LayoutDashboard, GraduationCap, UserCircle, Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";

interface NavTab {
  name: string;
  href: string;
  icon?: React.ElementType;
}

const navTabs: NavTab[] = [
  { name: "Dashboard", href: "/tools/deal-pipeline", icon: LayoutDashboard },
  { name: "Tutorials", href: "/free-training", icon: GraduationCap },
  { name: "Profile", href: "/settings", icon: UserCircle },
  { name: "Leads", href: "/dashboard/leads", icon: Zap },
];

export default function DashboardTopNav() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    // TODO: integrate with existing auth logout
    window.location.href = "/login";
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-gradient-to-r from-[#0a0a0a] via-[#111111] to-[#0a0a0a] border-b border-[#262626] backdrop-blur-xl">
        <div className="h-full max-w-[1920px] mx-auto px-3 md:px-4 flex items-center justify-between">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-3 group shrink-0">
            <div className="relative w-8 h-8 md:w-10 md:h-10">
              <Image
                src="/logo.png"
                alt="Passive Pilot"
                fill
                className="object-contain drop-shadow-lg group-hover:drop-shadow-[0_0_20px_rgba(212,175,55,0.6)] transition-all duration-500"
                priority
              />
            </div>
            <span className="hidden sm:block text-base md:text-lg font-bold bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent">
              Passive Pilot
            </span>
          </Link>

          {/* Center: Desktop Tabs */}
          {!isMobile && (
            <div className="flex items-center gap-1 bg-[#1a1a1a]/80 border border-[#333333] rounded-full px-2 py-1.5">
              {navTabs.map((tab) => {
                const isActive = pathname === tab.href || (tab.href === "/dashboard/leads" && pathname?.startsWith("/dashboard/leads"));
                const Icon = tab.icon;
                const isLeads = tab.name === "Leads";

                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className={`
                      relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                      ${isActive
                        ? "bg-gradient-to-r from-gold-500/20 to-gold-600/10 text-gold-400 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                      }
                      ${isLeads ? "pr-5" : ""}
                    `}
                  >
                    {Icon && <Icon size={16} className={isLeads && isActive ? "text-yellow-400" : ""} />}
                    <span>{tab.name}</span>
                    {isLeads && (
                      <Zap
                        size={14}
                        className={`absolute right-1.5 ${isActive ? "text-yellow-400 fill-yellow-400" : "text-gray-500"}`}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Center: Mobile Hamburger */}
          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {/* Bell */}
            <button className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <Bell size={18} className="md:w-5 md:h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Credits */}
            <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 bg-[#1a1a1a] border border-[#333333] rounded-full">
              <Coins size={14} className="md:w-4 md:h-4 text-gold-500" />
              <span className="text-xs md:text-sm font-medium text-gold-400">250</span>
            </div>

            {/* User Menu - Hidden on small mobile */}
            <button className="hidden sm:block p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <User size={18} className="md:w-5 md:h-5" />
            </button>

            {/* Log Out */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-[#1a1a1a] hover:bg-[#262626] border border-[#333333] rounded-lg transition-all"
            >
              <LogOut size={14} className="md:w-4 md:h-4" />
              <span className="hidden sm:inline text-xs md:text-sm">Log Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobile && mobileMenuOpen && (
        <div
          ref={menuRef}
          className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-b from-[#0a0a0a] to-[#111111] border-b border-[#262626] shadow-lg animate-in slide-in-from-top duration-200"
        >
          <div className="max-w-[1920px] mx-auto px-3 py-4 space-y-2">
            {navTabs.map((tab) => {
              const isActive = pathname === tab.href || (tab.href === "/dashboard/leads" && pathname?.startsWith("/dashboard/leads"));
              const Icon = tab.icon;
              const isLeads = tab.name === "Leads";

              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 min-h-[44px]
                    ${isActive
                      ? "bg-gradient-to-r from-gold-500/20 to-gold-600/10 text-gold-400 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  {Icon && <Icon size={20} className={isLeads && isActive ? "text-yellow-400" : ""} />}
                  <span>{tab.name}</span>
                  {isLeads && isActive && (
                    <Zap size={16} className="ml-auto text-yellow-400 fill-yellow-400" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
