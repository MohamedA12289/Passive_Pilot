
'use client';

import { useState } from 'react';
import { Calculator, ArrowRight, DollarSign } from 'lucide-react';

export default function MiniMAOCalculator() {
  const [arv, setArv] = useState('');
  const [repairs, setRepairs] = useState('');
  const [assignmentFee, setAssignmentFee] = useState('');
  const [mao, setMAO] = useState<number | null>(null);

  const calculate = () => {
    const arvNum = parseFloat(arv) || 0;
    const repairsNum = parseFloat(repairs) || 0;
    const feeNum = parseFloat(assignmentFee) || 8000;
    
    // 70% rule: MAO = (ARV × 70%) - Repairs - Assignment Fee
    const calculatedMAO = (arvNum * 0.7) - repairsNum - feeNum;
    setMAO(calculatedMAO);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      calculate();
    }
  };

  return (
    <div className="glass-card p-6 backdrop-blur-xl col-span-2 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-black text-white">Quick MAO Calculator</h3>
      </div>
      
      <div className="space-y-3">
        <input
          type="number"
          placeholder="ARV ($)"
          value={arv}
          onChange={(e) => setArv(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-amber-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-all text-sm"
        />
        <input
          type="number"
          placeholder="Repairs ($)"
          value={repairs}
          onChange={(e) => setRepairs(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-amber-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-all text-sm"
        />
        <input
          type="number"
          placeholder="Assignment Fee ($8,000)"
          value={assignmentFee}
          onChange={(e) => setAssignmentFee(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-amber-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-all text-sm"
        />
        
        {mao !== null && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500/50 animate-in">
            <div className="text-xs text-emerald-300 font-bold mb-1">Maximum Allowable Offer:</div>
            <div className="text-3xl font-black gold-gradient-text">
              ${mao.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
          </div>
        )}
        
        <button
          onClick={calculate}
          className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-gold-600 hover:from-amber-600 hover:to-gold-700 text-white font-bold flex items-center justify-center gap-2 transition-all hover:scale-105"
        >
          Calculate MAO
          <ArrowRight className="w-4 h-4" />
        </button>
        
        <p className="text-xs text-gray-500 text-center">
          Formula: (ARV × 70%) - Repairs - Fee
        </p>
      </div>
    </div>
  );
}
