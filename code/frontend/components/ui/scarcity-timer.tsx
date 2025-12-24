
'use client';

import { useState, useEffect } from 'react';
import { Clock, Flame } from 'lucide-react';

interface ScarcityTimerProps {
  title?: string;
  subtitle?: string;
  endDate?: Date;
  variant?: 'default' | 'compact';
}

export default function ScarcityTimer({ 
  title = "Limited Spots Available",
  subtitle = "Only taking 5 new coaching students this month",
  endDate,
  variant = 'default'
}: ScarcityTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [spots, setSpots] = useState(3); // Simulated spots remaining

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Default: End of current month at midnight
      const now = new Date();
      const target = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const difference = target.getTime() - now.getTime();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  // Simulate spot decreasing (for demo purposes)
  useEffect(() => {
    const spotTimer = setInterval(() => {
      setSpots(prev => Math.max(1, prev - Math.random() > 0.95 ? 1 : 0));
    }, 30000); // Check every 30 seconds

    return () => clearInterval(spotTimer);
  }, []);

  if (variant === 'compact') {
    return (
      <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500 animate-pulse" />
            <div>
              <p className="text-sm font-bold text-white">⏰ Limited Availability</p>
              <p className="text-xs text-gray-300">{spots} spots left this month</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {[
              { value: timeLeft.days, label: 'D' },
              { value: timeLeft.hours, label: 'H' },
              { value: timeLeft.minutes, label: 'M' },
              { value: timeLeft.seconds, label: 'S' },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="text-xl font-black text-red-400 tabular-nums min-w-[32px] text-center">
                  {String(item.value).padStart(2, '0')}
                </div>
                <div className="text-[9px] text-gray-400 uppercase font-bold">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 md:p-8 border-2 border-red-500/30 bg-gradient-to-br from-red-500/5 to-orange-500/5">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/50 animate-pulse">
          <Clock className="w-4 h-4 text-red-400" />
          <span className="text-sm font-bold text-red-400 uppercase tracking-wider">
            {title}
          </span>
        </div>

        <h3 className="text-2xl md:text-3xl font-black text-white">
          <span className="text-red-400">{spots} Spots Left</span> for November Coaching
        </h3>

        <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto">
          {subtitle}
        </p>

        {/* Timer Display */}
        <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-lg mx-auto pt-4">
          {[
            { value: timeLeft.days, label: 'DAYS' },
            { value: timeLeft.hours, label: 'HOURS' },
            { value: timeLeft.minutes, label: 'MINS' },
            { value: timeLeft.seconds, label: 'SECS' },
          ].map((item, idx) => (
            <div key={idx} className="glass-card p-3 md:p-4 bg-black/40">
              <div className="text-3xl md:text-5xl font-black bg-gradient-to-br from-red-400 to-orange-400 text-transparent bg-clip-text tabular-nums">
                {String(item.value).padStart(2, '0')}
              </div>
              <div className="text-[10px] md:text-xs text-gray-400 uppercase font-bold mt-1">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Urgency Message */}
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400 font-semibold flex items-center justify-center gap-2">
            <Flame className="w-4 h-4" />
            Applications close when timer hits zero
          </p>
        </div>
      </div>
    </div>
  );
}
