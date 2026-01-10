'use client';

import { useState } from 'react';
import { Copy, Check, Save } from 'lucide-react';

interface ToolActionsProps {
  resultText: string;
  toolName?: string;
  onSave?: () => void;
}

export function ToolActions({ resultText, toolName: _toolName, onSave }: ToolActionsProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSave = () => {
    if (onSave) onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 hover:border-amber-500/50 rounded-lg transition-all text-sm font-medium text-slate-200 hover:text-amber-400"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            <span>Copy Results</span>
          </>
        )}
      </button>

      {onSave && (
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 rounded-lg transition-all text-sm font-medium text-amber-400"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save to Dashboard</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

// Animated Number Component
interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0, className = '' }: AnimatedNumberProps) {
  return (
    <span className={`inline-block transition-all duration-300 ${className}`}>
      {prefix}{value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  );
}
