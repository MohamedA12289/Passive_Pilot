'use client';

import { useState } from 'react';
import { HelpCircle, Info, X } from 'lucide-react';

interface TooltipHelperProps {
  title: string;
  description: string;
  tips?: string[];
  variant?: 'icon' | 'badge' | 'inline';
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function TooltipHelper({
  title,
  description,
  tips,
  variant = 'icon',
  position = 'top'
}: TooltipHelperProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (variant === 'icon') {
    return (
      <div className="relative inline-block">
        <button
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          onClick={() => setIsOpen(!isOpen)}
          className="text-amber-400/70 hover:text-amber-400 transition-colors cursor-help"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
        
        {isOpen && (
          <div className={`absolute z-50 w-80 ${
            position === 'top' ? 'bottom-full mb-2' :
            position === 'bottom' ? 'top-full mt-2' :
            position === 'left' ? 'right-full mr-2' :
            'left-full ml-2'
          } left-1/2 transform -translate-x-1/2 animate-fade-in`}>
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-amber-500/40 rounded-xl p-4 shadow-2xl">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-bold text-amber-400">{title}</h4>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed mb-2">{description}</p>
              {tips && tips.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-xs font-semibold text-amber-400 mb-2">💡 Pro Tips:</p>
                  <ul className="space-y-1">
                    {tips.map((tip, idx) => (
                      <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                        <span className="text-amber-400">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className="relative inline-block">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-400 text-xs font-semibold hover:bg-amber-500/30 transition-all cursor-help"
        >
          <Info className="w-3 h-3" />
          <span>What's this?</span>
        </button>
        
        {isOpen && (
          <div className="absolute z-50 w-80 bottom-full mb-2 left-1/2 transform -translate-x-1/2 animate-fade-in">
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-amber-500/40 rounded-xl p-4 shadow-2xl">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-bold text-amber-400">{title}</h4>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">{description}</p>
              {tips && tips.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-xs font-semibold text-amber-400 mb-2">💡 Pro Tips:</p>
                  <ul className="space-y-1">
                    {tips.map((tip, idx) => (
                      <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                        <span className="text-amber-400">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // inline variant
  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="bg-amber-500/20 p-2 rounded-lg flex-shrink-0">
          <Info className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-amber-400 mb-1">{title}</h4>
          <p className="text-xs text-gray-300 leading-relaxed">{description}</p>
          {tips && tips.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-semibold text-amber-400 mb-1">💡 Pro Tips:</p>
              <ul className="space-y-1">
                {tips.map((tip, idx) => (
                  <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
