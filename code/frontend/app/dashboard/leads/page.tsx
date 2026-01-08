"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import DashboardTopNav from "@/components/leads/DashboardTopNav";
import LeadsFiltersBar from "@/components/leads/LeadsFiltersBar";
import LeadsMapPanel from "@/components/leads/LeadsMapPanel";
import LeadPropertyCard from "@/components/leads/LeadPropertyCard";
import CreateOfferModal from "@/components/leads/CreateOfferModal";
import type { LeadProperty, LeadsFilters } from "@/lib/types";

// Mock data for demo
const MOCK_PROPERTIES: LeadProperty[] = [
  {
    id: "1",
    address: "1815 E La Salle Rd",
    city: "Phoenix",
    state: "AZ",
    zipCode: "85086",
    beds: 3,
    baths: 2,
    sqft: 2160,
    listPrice: 550000,
    balance: 368000,
    offerPrice: 397440,
    piti: 2754.58,
    rent: 3248,
    equityPercent: 20.0,
    interestRate: 7.1,
    monthlyCashflow: -2114.58,
    latitude: 33.7126,
    longitude: -112.0851,
    images: [],
    onMarket: true,
    mortgageTakeover: true,
    propertyType: "single_family",
    dealType: "sub_to",
    inDashboard: false,
    agentName: "John Smith",
    agentPhone: "(555) 123-4567",
    agentEmail: "john.smith@realty.com",
  },
  {
    id: "2",
    address: "4521 W Desert Hills Dr",
    city: "Glendale",
    state: "AZ",
    zipCode: "85304",
    beds: 4,
    baths: 3,
    sqft: 2850,
    listPrice: 625000,
    balance: 412000,
    offerPrice: 468750,
    piti: 3125.00,
    rent: 3800,
    equityPercent: 25.0,
    interestRate: 6.5,
    monthlyCashflow: 675.00,
    latitude: 33.5387,
    longitude: -112.1860,
    images: [],
    onMarket: true,
    mortgageTakeover: false,
    propertyType: "single_family",
    dealType: "wholesale",
    inDashboard: true,
    agentName: "Sarah Johnson",
    agentPhone: "(555) 987-6543",
    agentEmail: "sarah.j@homes.com",
  },
  {
    id: "3",
    address: "789 N Scottsdale Rd",
    city: "Scottsdale",
    state: "AZ",
    zipCode: "85257",
    beds: 2,
    baths: 2,
    sqft: 1450,
    listPrice: 385000,
    balance: 290000,
    offerPrice: 308000,
    piti: 2100.00,
    rent: 2400,
    equityPercent: 18.5,
    interestRate: 7.25,
    monthlyCashflow: 300.00,
    latitude: 33.4942,
    longitude: -111.9261,
    images: [],
    onMarket: false,
    mortgageTakeover: true,
    propertyType: "condo",
    dealType: "creative",
    inDashboard: false,
    agentName: "Mike Davis",
    agentPhone: "(555) 456-7890",
    agentEmail: "mike.d@azrealty.com",
  },
];

export default function LeadsPage() {
  const [filters, setFilters] = useState<LeadsFilters>({});
  const [properties, setProperties] = useState<LeadProperty[]>(MOCK_PROPERTIES);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState("default");
  const [offerModalProperty, setOfferModalProperty] = useState<LeadProperty | null>(null);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleSearch = async () => {
    // TODO: Call GET /leads with filters
    // For now, filter mock data
    let filtered = [...MOCK_PROPERTIES];

    if (filters.location) {
      const loc = filters.location.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.city.toLowerCase().includes(loc) ||
          p.state.toLowerCase().includes(loc) ||
          p.zipCode.includes(loc)
      );
    }

    if (filters.onMarket === "yes") {
      filtered = filtered.filter((p) => p.onMarket);
    } else if (filters.onMarket === "no") {
      filtered = filtered.filter((p) => !p.onMarket);
    }

    if (filters.propertyType) {
      filtered = filtered.filter((p) => p.propertyType === filters.propertyType);
    }

    if (filters.dealType) {
      filtered = filtered.filter((p) => p.dealType === filters.dealType);
    }

    if (filters.priceMin !== undefined) {
      filtered = filtered.filter((p) => p.listPrice >= (filters.priceMin || 0));
    }
    if (filters.priceMax !== undefined) {
      filtered = filtered.filter((p) => p.listPrice <= (filters.priceMax || Infinity));
    }

    if (filters.bedsMin !== undefined) {
      filtered = filtered.filter((p) => p.beds >= (filters.bedsMin || 0));
    }

    if (filters.bathsMin !== undefined) {
      filtered = filtered.filter((p) => p.baths >= (filters.bathsMin || 0));
    }

    setProperties(filtered);
  };

  const handlePropertySelect = (property: LeadProperty) => {
    setSelectedPropertyId(property.id);
    // Scroll to card
    const cardEl = cardRefs.current[property.id];
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleToggleDashboard = (propertyId: string) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === propertyId ? { ...p, inDashboard: !p.inDashboard } : p
      )
    );
  };

  const sortedProperties = [...properties].sort((a, b) => {
    switch (sortBy) {
      case "price_asc":
        return a.listPrice - b.listPrice;
      case "price_desc":
        return b.listPrice - a.listPrice;
      case "cashflow":
        return b.monthlyCashflow - a.monthlyCashflow;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a]">
      {/* Starry background effect */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.3), transparent),
                           radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.2), transparent),
                           radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.3), transparent),
                           radial-gradient(2px 2px at 130px 80px, rgba(255,255,255,0.2), transparent),
                           radial-gradient(1px 1px at 160px 30px, rgba(255,255,255,0.4), transparent)`,
          backgroundSize: '200px 100px',
        }} />
      </div>

      <DashboardTopNav />

      <main className="pt-16">
        <LeadsFiltersBar
          filters={filters}
          onFiltersChange={setFilters}
          onSearch={handleSearch}
        />

        {/* Main Split View */}
        <div className="flex flex-col lg:flex-row gap-4 px-4 pb-4 h-[calc(100vh-180px)]">
          {/* Left: Map */}
          <div className="w-full lg:w-[40%] h-[300px] lg:h-full">
            <LeadsMapPanel
              properties={properties}
              selectedPropertyId={selectedPropertyId}
              onPropertySelect={handlePropertySelect}
              className="w-full h-full"
            />
          </div>

          {/* Right: Results */}
          <div className="w-full lg:w-[60%] flex flex-col h-full">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4 px-2">
              <div>
                <span className="text-lg font-semibold text-white">{properties.length} Results</span>
                <span className="text-sm text-gray-400 ml-2">
                  Showing 1-{Math.min(10, properties.length)} of {properties.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Sort by</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-[#1a1a1a] border border-[#333333] text-gray-300 text-sm rounded-lg px-4 py-2 pr-8 cursor-pointer hover:border-gold-500/50 transition-colors"
                  >
                    <option value="default">Default</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="cashflow">Best Cashflow</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Property Cards */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {sortedProperties.map((property) => (
                <div
                  key={property.id}
                  ref={(el) => { cardRefs.current[property.id] = el; }}
                >
                  <LeadPropertyCard
                    property={property}
                    isSelected={selectedPropertyId === property.id}
                    onSelect={() => setSelectedPropertyId(property.id)}
                    onCreateOffer={() => setOfferModalProperty(property)}
                    onToggleDashboard={() => handleToggleDashboard(property.id)}
                  />
                </div>
              ))}

              {sortedProperties.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <p className="text-lg text-gray-400">No properties found</p>
                  <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Create Offer Modal */}
      {offerModalProperty && (
        <CreateOfferModal
          property={offerModalProperty}
          isOpen={!!offerModalProperty}
          onClose={() => setOfferModalProperty(null)}
        />
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333333;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #444444;
        }
      `}</style>
    </div>
  );
}
