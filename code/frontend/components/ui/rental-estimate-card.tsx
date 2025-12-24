'use client';

import { DollarSign, Home, TrendingUp, Calculator, Info, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface RentalEstimateCardProps {
  address: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  estimatedRent?: number;
}

export default function RentalEstimateCard({ address, beds, baths, sqft, estimatedRent }: RentalEstimateCardProps) {
  const [showCalculations, setShowCalculations] = useState(false);

  if (!estimatedRent) {
    return null;
  }

  // Calculate investment metrics
  const annualRent = estimatedRent * 12;
  const monthlyExpenses = estimatedRent * 0.5; // 50% rule (taxes, insurance, maintenance, vacancy)
  const monthlyNetIncome = estimatedRent - monthlyExpenses;
  const annualNetIncome = monthlyNetIncome * 12;
  
  // Example purchase price (could be passed as prop)
  const examplePurchasePrice = estimatedRent * 100; // 1% rule as example
  const capRate = (annualNetIncome / examplePurchasePrice) * 100;
  const cashOnCashReturn = ((annualNetIncome / (examplePurchasePrice * 0.25)) * 100); // Assuming 25% down

  return (
    <div className="bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-emerald-500/10 border-2 border-emerald-500/40 rounded-2xl p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <Home className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-serif font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              Rental Value Estimate
            </h3>
            <p className="text-sm text-gray-400 font-poppins">Based on similar rentals in the area</p>
          </div>
        </div>
        <button
          onClick={() => setShowCalculations(!showCalculations)}
          className="p-2 rounded-xl hover:bg-emerald-500/10 transition-all text-emerald-400"
          type="button"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* Main Rental Estimate */}
      <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-2 border-emerald-500/50 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-300 font-poppins mb-2">Estimated Monthly Rent</p>
            <div className="flex items-baseline gap-2">
              <p className="text-5xl md:text-6xl font-montserrat font-black bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                ${estimatedRent.toLocaleString()}
              </p>
              <p className="text-xl text-gray-400 font-poppins">/month</p>
            </div>
          </div>
          <DollarSign className="w-16 h-16 text-emerald-400 opacity-20" />
        </div>
        
        {/* Property Specs */}
        {(beds || baths || sqft) && (
          <div className="mt-4 pt-4 border-t border-emerald-500/20 flex items-center gap-4 text-sm text-gray-300 font-poppins">
            {beds && <span>{beds} beds</span>}
            {baths && <span>• {baths} baths</span>}
            {sqft && <span>• {sqft.toLocaleString()} sqft</span>}
          </div>
        )}
      </div>

      {/* Investment Metrics */}
      {showCalculations && (
        <div className="space-y-4 mb-6 animate-fade-in">
          <h4 className="text-lg font-montserrat font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            Investment Analysis
          </h4>
          
          {/* Annual Rent */}
          <div className="bg-black/40 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400 font-poppins">Annual Gross Rent</p>
              <p className="text-xl font-montserrat font-bold text-emerald-400">
                ${annualRent.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Monthly Expenses */}
          <div className="bg-black/40 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-poppins">Est. Monthly Expenses</p>
                <p className="text-xs text-gray-500 font-poppins">50% Rule (taxes, insurance, maintenance, vacancy)</p>
              </div>
              <p className="text-xl font-montserrat font-bold text-red-400">
                -${monthlyExpenses.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Net Income */}
          <div className="bg-black/40 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400 font-poppins">Monthly Net Income</p>
              <p className="text-xl font-montserrat font-bold text-emerald-400">
                ${monthlyNetIncome.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Cap Rate */}
          <div className="bg-black/40 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-poppins">Estimated Cap Rate</p>
                <p className="text-xs text-gray-500 font-poppins">Based on ${examplePurchasePrice.toLocaleString()} purchase (1% rule)</p>
              </div>
              <p className="text-xl font-montserrat font-bold text-blue-400">
                {capRate.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Cash on Cash Return */}
          <div className="bg-black/40 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-poppins">Cash-on-Cash Return</p>
                <p className="text-xs text-gray-500 font-poppins">Assuming 25% down payment</p>
              </div>
              <p className="text-xl font-montserrat font-bold text-purple-400">
                {cashOnCashReturn.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rental Strategies */}
      <div className="space-y-3">
        <h4 className="text-sm font-montserrat font-bold text-gray-300 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Rental Strategies to Consider:
        </h4>
        
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-xs text-gray-400 font-poppins">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span><strong className="text-emerald-400">Buy & Hold:</strong> Purchase, rent out, collect cash flow</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-400 font-poppins">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span><strong className="text-emerald-400">BRRRR:</strong> Buy, Rehab, Rent, Refinance, Repeat</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-400 font-poppins">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span><strong className="text-emerald-400">STR/Airbnb:</strong> Short-term rental for 2-3x traditional rent</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-400 font-poppins">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span><strong className="text-emerald-400">Seller Finance:</strong> Offer rental income to seller as mortgage payment</span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
        <p className="text-[10px] text-gray-400 font-poppins leading-relaxed">
          ⚠️ <span className="text-emerald-400 font-semibold">Disclaimer:</span> Estimates are based on similar rentals and market data. Actual rental rates may vary based on property condition, location, amenities, and market conditions. Always verify with local property managers.
        </p>
      </div>
    </div>
  );
}
