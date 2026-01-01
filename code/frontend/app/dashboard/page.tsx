"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Bell, ChevronRight, Home, MapPin, Shield, SlidersHorizontal, Users } from "lucide-react";

import FlowStepper from "@/components/dashboard/FlowStepper";
import MapPanel from "@/components/dashboard/MapPanel";
import PropertyDetailPanel from "@/components/dashboard/PropertyDetailPanel";
import PropertyResultsList from "@/components/dashboard/PropertyResultsList";

const steps = ["Search", "Select", "Analyze", "Contact", "Contract"];

const mockProperties = [
  {
    id: "1",
    title: "1256 Lakeshore Blvd",
    address: "Atlanta, GA 30032",
    price: "$215,000",
    arv: "$350,000",
    repairs: "$30,000",
    fees: "$10,000",
    score: "92",
    cashFlow: "$3,104",
    capRate: "9.2%",
    beds: 4,
    baths: 2,
    sqft: 2010,
    parking: "Garage + Driveway",
  },
  {
    id: "2",
    title: "945 Glenwood Ave",
    address: "Atlanta, GA 30316",
    price: "$198,000",
    arv: "$320,000",
    repairs: "$25,000",
    fees: "$8,000",
    score: "88",
    cashFlow: "$2,780",
    capRate: "8.6%",
    beds: 3,
    baths: 2,
    sqft: 1860,
    parking: "Driveway",
  },
  {
    id: "3",
    title: "782 Marietta St",
    address: "Atlanta, GA 30318",
    price: "$235,000",
    arv: "$365,000",
    repairs: "$35,000",
    fees: "$12,000",
    score: "95",
    cashFlow: "$3,340",
    capRate: "9.6%",
    beds: 5,
    baths: 3,
    sqft: 2240,
    parking: "Carport",
  },
];

const mapPoints = [
  { id: "1", x: 35, y: 30, label: "Lakeviews" },
  { id: "2", x: 60, y: 55, label: "Downtown" },
  { id: "3", x: 48, y: 72, label: "Suburban" },
  { id: "4", x: 75, y: 28, label: "East Point" },
  { id: "5", x: 22, y: 60, label: "College Park" },
];

export default function Page() {
  const [activeStep, setActiveStep] = useState<string>("Contact");
  const [selectedId, setSelectedId] = useState<string>(mockProperties[0].id);

  const selectedProperty = useMemo(() => {
    return mockProperties.find((property) => property.id === selectedId) ?? mockProperties[0];
  }, [selectedId]);

  return (
    <RequireAuth>
      <div className="relative min-h-screen bg-gradient-to-b from-neutral-950 via-black to-neutral-950 text-amber-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.15),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(251,191,36,0.08),transparent_30%),radial-gradient(circle_at_30%_70%,rgba(251,191,36,0.12),transparent_40%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02)_40%,rgba(0,0,0,0.2))]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-10 md:px-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 rounded-full border border-amber-500/30 bg-black/60 px-3 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-amber-500/20">
              <Image src="/logo.png" alt="Passive Pilot logo" fill className="object-contain" priority />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-amber-100/80">Passive Pilot</p>
              <p className="text-sm font-semibold text-amber-50">Investor Command Center</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-amber-100/70">
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200">Active</span>
            <button className="flex items-center gap-2 rounded-full border border-amber-500/20 bg-black/50 px-3 py-2 font-semibold hover:border-amber-400/50 hover:text-amber-50">
              <Shield className="h-4 w-4 text-amber-300" />
              Secure mode
            </button>
            <button className="flex items-center gap-2 rounded-full border border-amber-500/20 bg-black/50 px-3 py-2 font-semibold hover:border-amber-400/50 hover:text-amber-50">
              <Bell className="h-4 w-4" />
              Alerts
            </button>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="rounded-2xl border border-amber-500/15 bg-black/40 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            <nav className="space-y-2 text-sm font-semibold text-amber-100/80">
              {["Dashboard", "Campaigns", "Buyers", "Properties", "Admin"].map((item) => (
                <div
                  key={item}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-transparent px-3 py-2 transition hover:border-amber-500/40 hover:bg-amber-500/10"
                >
                  <span>{item}</span>
                  <ChevronRight className="h-4 w-4 text-amber-300" />
                </div>
              ))}
            </nav>
          </aside>

          <div className="space-y-4">
            <div className="flex flex-col gap-4 rounded-2xl border border-amber-500/20 bg-black/50 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-amber-100/80">
                <div className="flex items-center gap-3">
                  <Home className="h-5 w-5 text-amber-300" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-amber-100/60">Campaign Flow</p>
                    <p className="text-lg font-semibold text-amber-50">Last investor action: Search for asset + opps</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveStep("Contact")}
                    className="rounded-full border border-amber-500/30 bg-black/60 px-3 py-1.5 text-xs font-semibold text-amber-100 hover:border-amber-300"
                  >
                    Set reminder
                  </button>
                  <button className="rounded-full border border-amber-500/30 bg-black/60 px-3 py-1.5 text-xs font-semibold text-amber-100 hover:border-amber-300">
                    Share campaign
                  </button>
                </div>
              </div>
              <FlowStepper steps={steps} activeStep={activeStep} />
            </div>

            <div className="grid gap-4 xl:grid-cols-12">
              <section className="xl:col-span-3 space-y-3">
                <div className="flex items-center justify-between text-sm text-amber-100/80">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-amber-100/60">Search results</p>
                    <p className="text-lg font-semibold text-amber-50">Deals in Georgia</p>
                  </div>
                  <button className="flex items-center gap-2 rounded-full border border-amber-500/20 bg-black/60 px-3 py-1.5 text-xs font-semibold text-amber-100 hover:border-amber-400/60">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </button>
                </div>
                <div className="rounded-2xl border border-amber-500/15 bg-black/50 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                  <div className="mb-3 flex items-center gap-2 text-xs text-amber-100/70">
                    <div className="flex items-center gap-2 rounded-full border border-amber-500/20 bg-black/60 px-3 py-1.5">
                      <MapPin className="h-4 w-4 text-amber-300" />
                      <span className="font-semibold text-amber-50">Georgia</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-amber-500/20 bg-black/60 px-3 py-1.5">
                      <Users className="h-4 w-4 text-amber-300" />
                      <span>Teams: 9</span>
                    </div>
                  </div>
                  <div className="max-h-[430px] space-y-3 overflow-y-auto pr-1">
                    <PropertyResultsList
                      properties={mockProperties}
                      selectedId={selectedId}
                      onSelect={(property) => setSelectedId(property.id)}
                    />
                  </div>
                </div>
              </section>

              <section className="xl:col-span-5">
                <MapPanel points={mapPoints} />
              </section>

              <section className="xl:col-span-4">
                <PropertyDetailPanel property={selectedProperty} />
              </section>
            </div>
          </div>
        </div>
      </div>
      </div>
    </RequireAuth>
  );
}
