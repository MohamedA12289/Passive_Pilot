"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { apiFetch } from "@/lib/api";

interface BuyerProfile {
  id?: number;
  buying_status: string | null;
  price_min: number | null;
  price_max: number | null;
  bedrooms_min: number | null;
  bathrooms_min: number | null;
  property_types: string[] | null;
  preferred_locations: string | null;
  investment_strategy: string | null;
  timeline: string | null;
  notes: string | null;
}

const PROPERTY_TYPE_OPTIONS = [
  "Single Family",
  "Multi-Family",
  "Condo",
  "Townhouse",
  "Land",
  "Commercial",
];

const BUYING_STATUS_OPTIONS = [
  { value: "cash", label: "Cash Buyer" },
  { value: "financing", label: "Financing" },
  { value: "either", label: "Either" },
];

const TIMELINE_OPTIONS = [
  { value: "immediate", label: "Immediate (0-30 days)" },
  { value: "short", label: "Short Term (1-3 months)" },
  { value: "medium", label: "Medium Term (3-6 months)" },
  { value: "flexible", label: "Flexible" },
];

const STRATEGY_OPTIONS = [
  { value: "fix_flip", label: "Fix & Flip" },
  { value: "buy_hold", label: "Buy & Hold" },
  { value: "wholesale", label: "Wholesale" },
  { value: "rental", label: "Rental Property" },
  { value: "other", label: "Other" },
];

export default function BuyerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<BuyerProfile>({
    buying_status: null,
    price_min: null,
    price_max: null,
    bedrooms_min: null,
    bathrooms_min: null,
    property_types: [],
    preferred_locations: null,
    investment_strategy: null,
    timeline: null,
    notes: null,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await apiFetch<BuyerProfile | null>("/buyer-profile/me", { auth: true });
      if (data) {
        setForm({
          ...data,
          property_types: data.property_types || [],
        });
      }
    } catch (err) {
      console.error("Failed to load buyer profile", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      await apiFetch("/buyer-profile/me", {
        method: "PUT",
        auth: true,
        json: form,
      });
      setMessage("Profile saved successfully!");
    } catch (err) {
      setError("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  function handlePropertyTypeToggle(type: string) {
    const current = form.property_types || [];
    if (current.includes(type)) {
      setForm({ ...form, property_types: current.filter((t) => t !== type) });
    } else {
      setForm({ ...form, property_types: [...current, type] });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Buyer Profile</h1>
        <p className="text-zinc-400 mb-6">Set your buying preferences to get matched with relevant deals.</p>

        {message && <div className="mb-4 p-3 rounded-lg bg-emerald-900/50 text-emerald-300">{message}</div>}
        {error && <div className="mb-4 p-3 rounded-lg bg-red-900/50 text-red-300">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Buying Status */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Buying Status</label>
            <select
              value={form.buying_status || ""}
              onChange={(e) => setForm({ ...form, buying_status: e.target.value || null })}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
            >
              <option value="">Select...</option>
              {BUYING_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Min Price ($)</label>
              <input
                type="number"
                value={form.price_min || ""}
                onChange={(e) => setForm({ ...form, price_min: e.target.value ? Number(e.target.value) : null })}
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Max Price ($)</label>
              <input
                type="number"
                value={form.price_max || ""}
                onChange={(e) => setForm({ ...form, price_max: e.target.value ? Number(e.target.value) : null })}
                placeholder="1000000"
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
              />
            </div>
          </div>

          {/* Bedrooms / Bathrooms */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Min Bedrooms</label>
              <input
                type="number"
                value={form.bedrooms_min || ""}
                onChange={(e) => setForm({ ...form, bedrooms_min: e.target.value ? Number(e.target.value) : null })}
                placeholder="1"
                min={0}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Min Bathrooms</label>
              <input
                type="number"
                value={form.bathrooms_min || ""}
                onChange={(e) => setForm({ ...form, bathrooms_min: e.target.value ? Number(e.target.value) : null })}
                placeholder="1"
                min={0}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
              />
            </div>
          </div>

          {/* Property Types */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Property Types</label>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPE_OPTIONS.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handlePropertyTypeToggle(type)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    (form.property_types || []).includes(type)
                      ? "bg-[#d4af37] text-black"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Locations */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Preferred Locations</label>
            <textarea
              value={form.preferred_locations || ""}
              onChange={(e) => setForm({ ...form, preferred_locations: e.target.value || null })}
              placeholder="e.g., Miami FL, Tampa FL, Orlando FL..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
            />
          </div>

          {/* Investment Strategy */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Investment Strategy</label>
            <select
              value={form.investment_strategy || ""}
              onChange={(e) => setForm({ ...form, investment_strategy: e.target.value || null })}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
            >
              <option value="">Select...</option>
              {STRATEGY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Timeline */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Timeline</label>
            <select
              value={form.timeline || ""}
              onChange={(e) => setForm({ ...form, timeline: e.target.value || null })}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
            >
              <option value="">Select...</option>
              {TIMELINE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Additional Notes</label>
            <textarea
              value={form.notes || ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value || null })}
              placeholder="Any additional preferences or requirements..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
            />
          </div>

          <Button variant="primary" type="submit" disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </div>
    </div>
  );
}
