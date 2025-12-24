'use client';

import { useState, useEffect } from 'react';
import { Clock, Flame } from 'lucide-react';

interface CountdownTimerProps {
  endDate?: Date;
  title?: string;
  subtitle?: string;
}

export default function CountdownTimer({ 
  endDate = new Date('2025-12-17T23:59:59'),
  title = "Limited Time Offer Ends In:",
  subtitle = "Lock in $20/month FOREVER before price increases!"
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
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

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Main Container */}
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 animate-pulse"></div>
        
        {/* Content */}
        <div className="relative px-6 py-5 bg-gradient-to-br from-black via-gray-900 to-black border border-red-600/30 rounded-xl">
          {/* Title */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-red-500 animate-pulse" />
            <h3 className="text-lg font-bold text-center font-montserrat bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
              {title}
            </h3>
            <Flame className="w-5 h-5 text-red-500 animate-pulse" />
          </div>

          {/* Timer Display */}
          <div className="grid grid-cols-4 gap-3 mb-3">
            {[  
              { value: timeLeft.days, label: 'Days' },
              { value: timeLeft.hours, label: 'Hours' },
              { value: timeLeft.minutes, label: 'Mins' },
              { value: timeLeft.seconds, label: 'Secs' }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-full aspect-square flex items-center justify-center bg-gradient-to-br from-gray-900 to-black border border-amber-600/30 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-transparent"></div>
                  <span className="relative text-3xl md:text-4xl font-bold font-montserrat bg-gradient-to-br from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                    {String(item.value).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-xs text-gray-400 font-montserrat uppercase tracking-wider mt-2">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Subtitle */}
          <p className="text-center text-sm text-gray-300 font-medium">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Urgency Message */}
      <div className="mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-red-950/30 border border-red-600/30 rounded-lg">
        <Clock className="w-4 h-4 text-red-400" />
        <span className="text-sm text-red-400 font-montserrat font-medium">
          ⚠️ Only {Math.max(50 - (30 - timeLeft.days), 5)} spots remaining at this price!
        </span>
      </div>
    </div>
  );
}