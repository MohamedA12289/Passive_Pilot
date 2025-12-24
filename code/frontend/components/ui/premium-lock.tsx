
'use client';

import { useState, useEffect } from 'react';
import { Lock, Sparkles, Crown, ArrowRight } from 'lucide-react';
import { isPremiumUnlocked, unlockPremium, getPremiumStatus } from '@/lib/premiumAccess';

interface PremiumLockProps {
  children: React.ReactNode;
  toolName: string;
}

export default function PremiumLock({ children, toolName }: PremiumLockProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showCodeEntry, setShowCodeEntry] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [premiumStatus, setPremiumStatus] = useState<{ unlocked: boolean; daysLeft?: number }>({ unlocked: false });

  useEffect(() => {
    // Check premium status on mount
    const checkPremiumStatus = () => {
      const unlocked = isPremiumUnlocked();
      console.log('🔐 Premium Lock Check:', unlocked);
      setIsUnlocked(unlocked);
      setPremiumStatus(getPremiumStatus());
    };
    
    checkPremiumStatus();
    
    // Re-check when window regains focus (handles users entering code in another tab)
    const handleFocus = () => {
      console.log('🔄 Window focus - rechecking premium status');
      checkPremiumStatus();
    };
    
    // Re-check when localStorage changes (handles cross-tab synchronization)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'passivePilotPremium') {
        console.log('💾 Storage event - rechecking premium status');
        checkPremiumStatus();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleUnlock = () => {
    if (!code.trim()) {
      setError('Please enter an access code');
      return;
    }

    const success = unlockPremium(code);
    
    if (success) {
      setIsUnlocked(true);
      setShowCodeEntry(false);
      setError('');
      setPremiumStatus(getPremiumStatus());
      
      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in';
      successDiv.innerHTML = '✨ Premium Unlocked! Redirecting...';
      document.body.appendChild(successDiv);
      
      // Reload page after short delay to show tool
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      setError('Invalid or expired code. Get the latest code from the Premium Discord.');
    }
  };

  if (isUnlocked) {
    return (
      <>
        {premiumStatus.daysLeft && premiumStatus.daysLeft <= 7 && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-sm text-amber-400">
              <Crown className="inline w-4 h-4 mr-1" />
              Premium access expires in {premiumStatus.daysLeft} day{premiumStatus.daysLeft !== 1 ? 's' : ''}
            </p>
          </div>
        )}
        {children}
      </>
    );
  }

  return (
    <div className="min-h-[600px] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Lock Screen */}
        {!showCodeEntry ? (
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 text-center shadow-2xl">
            <div className="mb-6 relative">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center animate-pulse">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <div className="absolute inset-0 w-20 h-20 mx-auto bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full blur-xl opacity-50"></div>
            </div>

            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
              Premium Tool Locked
            </h2>
            
            <p className="text-slate-300 mb-2 text-lg font-semibold">{toolName}</p>
            <p className="text-slate-400 mb-6">
              This exclusive tool is available to Premium Discord members only.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3 text-left">
                <Sparkles className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold">Instant Calculations</p>
                  <p className="text-slate-400 text-sm">Get accurate results in seconds</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left">
                <Sparkles className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold">Professional Results</p>
                  <p className="text-slate-400 text-sm">Industry-standard formulas and outputs</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left">
                <Sparkles className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold">Save Time & Money</p>
                  <p className="text-slate-400 text-sm">Make better deals faster</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowCodeEntry(true)}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                I Have an Access Code
              </button>
              
              <a
                href="https://whop.com/passive-pilot-wholesaling/passive-pilot-premium-vip/"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 border border-slate-600 group"
              >
                <span className="flex items-center justify-center gap-2">
                  <Crown className="w-5 h-5" />
                  Join Premium Discord
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
            </div>

            <p className="text-slate-500 text-xs mt-4">
              Access code is shared monthly in the Premium Discord
            </p>
          </div>
        ) : (
          // Code Entry Screen
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            <button
              onClick={() => {
                setShowCodeEntry(false);
                setError('');
                setCode('');
              }}
              className="text-slate-400 hover:text-white mb-4 flex items-center gap-2"
            >
              ← Back
            </button>

            <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">
              Enter Access Code
            </h2>
            <p className="text-slate-400 mb-6">
              Get your monthly code from the Premium Discord
            </p>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  placeholder="PILOT-XXX-XXXX"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase tracking-wider font-mono"
                  onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleUnlock}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Unlock Premium Tools
              </button>

              <div className="text-center pt-4 border-t border-slate-700">
                <p className="text-slate-400 text-sm mb-3">Don't have access yet?</p>
                <a
                  href="https://whop.com/passive-pilot-wholesaling/passive-pilot-premium-vip/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold"
                >
                  <Crown className="w-4 h-4" />
                  Join Premium Discord
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
