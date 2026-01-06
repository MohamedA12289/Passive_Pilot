'use client';

import React, { useState, useEffect } from 'react';
import PropertyListItem from '@/components/dashboard/PropertyListItem';
import MapPanel from '@/components/dashboard/MapPanel';
import { searchProperties } from '@/lib/api';
import type { Property, MapMarker } from '@/lib/types';
import { Search, SlidersHorizontal } from 'lucide-react';

const STEPS = ['Search', 'Select', 'Analyze', 'Contact', 'Connect'];

export default function PropertiesSearchPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeStep] = useState('Search');
  const [searchQuery, setSearchQuery] = useState('Orlando Absenteeism Owner(s)');

  useEffect(() => {
    async function loadProperties() {
      setLoading(true);
      try {
        const data = await searchProperties();
        setProperties(data);
        if (data.length > 0) {
          setSelectedProperty(data[0]);
        }
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, []);

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
  };

  // Convert properties to map markers
  const mapMarkers: MapMarker[] = properties
    .filter((prop) => prop.latitude && prop.longitude)
    .map((prop) => ({
      id: prop.id,
      latitude: prop.latitude!,
      longitude: prop.longitude!,
      property: prop,
    }));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Property Search</h1>
          <p className="text-gray-400">Find and analyze potential deals</p>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Steps */}
            <div className="flex items-center gap-2">
              {STEPS.map((step, index) => (
                <React.Fragment key={step}>
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      step === activeStep
                        ? 'bg-[#d4af37] text-black'
                        : 'bg-transparent border border-[#262626] text-gray-400 hover:border-[#d4af37] hover:text-[#d4af37]'
                    }`}
                  >
                    {step}
                  </button>
                  {index < STEPS.length - 1 && (
                    <div className="w-8 h-px bg-[#262626]"></div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Search Input */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search properties..."
                  className="w-full pl-10 pr-4 py-2 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white placeholder-gray-500 focus:border-[#d4af37] focus:outline-none"
                />
              </div>
            </div>

            {/* Filters Button */}
            <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-[#262626] text-gray-400 rounded-lg hover:border-[#d4af37] hover:text-[#d4af37] transition-colors">
              <SlidersHorizontal size={18} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Property List */}
          <div className="lg:col-span-4">
            <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Search Results ({properties.length})
                </h2>
                <span className="text-sm text-gray-400">
                  {searchQuery}
                </span>
              </div>

              {loading ? (
                <div className="text-center py-12 text-gray-400">
                  Loading properties...
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  No properties found. Try adjusting your search criteria.
                </div>
              ) : (
                <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                  {properties.map((property) => (
                    <PropertyListItem
                      key={property.id}
                      property={property}
                      selected={selectedProperty?.id === property.id}
                      onSelect={handlePropertySelect}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Map */}
          <div className="lg:col-span-8">
            <MapPanel
              markers={mapMarkers}
              selectedMarkerId={selectedProperty?.id}
              onMarkerClick={(marker) => {
                if (marker.property) {
                  handlePropertySelect(marker.property);
                }
              }}
              height="calc(100vh - 250px)"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
