
"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, Zap } from "lucide-react";

interface Activity {
  id: string;
  type: "analysis" | "member" | "deal";
  message: string;
  timestamp: Date;
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeUsers, setActiveUsers] = useState(12);

  const activityTemplates = [
    { type: "analysis" as const, messages: [
      "Sarah M. just analyzed a property in Dallas, TX",
      "Mike T. calculated MAO for a Phoenix deal",
      "Jessica R. exported a deal analysis PDF",
      "David K. analyzed 3 properties in the last hour",
      "Robert H. just discovered a profitable deal",
    ]},
    { type: "member" as const, messages: [
      "New VIP member joined from Atlanta, GA",
      "Premium member upgraded from Orlando, FL",
      "New Discord member from Houston, TX",
    ]},
    { type: "deal" as const, messages: [
      "Marcus J. closed a $18.5K assignment fee",
      "Premium member reported $22K profit",
      "VIP member closed deal using Profit Split Calculator",
    ]},
  ];

  useEffect(() => {
    // Generate random activity every 8-15 seconds
    const interval = setInterval(() => {
      const randomType = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
      const randomMessage = randomType.messages[Math.floor(Math.random() * randomType.messages.length)];
      
      const newActivity: Activity = {
        id: Date.now().toString(),
        type: randomType.type,
        message: randomMessage,
        timestamp: new Date(),
      };

      setActivities(prev => [newActivity, ...prev].slice(0, 5));
    }, Math.random() * 7000 + 8000); // Random between 8-15 seconds

    // Fluctuate active users count
    const userInterval = setInterval(() => {
      setActiveUsers(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(8, Math.min(25, prev + change));
      });
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(userInterval);
    };
  }, []);

  const getIcon = (type: Activity["type"]) => {
    switch (type) {
      case "analysis":
        return <Zap className="w-4 h-4 text-amber-500" />;
      case "member":
        return <Users className="w-4 h-4 text-purple-500" />;
      case "deal":
        return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const seconds = Math.floor((new Date().getTime() - timestamp.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <div className="flex items-center justify-center gap-6 text-xs sm:text-sm pointer-events-none">
      {/* Live Indicator */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
        </div>
        <span className="text-gray-400 font-medium">
          {activeUsers} online
        </span>
      </div>

      {/* Latest Activity */}
      {activities.length > 0 && (
        <div className="hidden sm:flex items-center gap-2 text-gray-500">
          {getIcon(activities[0].type)}
          <span className="truncate max-w-[200px] lg:max-w-[400px]">
            {activities[0].message}
          </span>
        </div>
      )}
    </div>
  );
}

export function AnimatedCounter({ target, label, sublabel }: { target: number; label: string; sublabel?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <div className="group hover:scale-110 transition-transform duration-300">
      <div className="text-3xl sm:text-4xl lg:text-5xl font-bold gold-gradient-text mb-2 font-serif">
        {count.toLocaleString()}+
      </div>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-poppins">
        {label}
      </p>
      {sublabel && (
        <p className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
          {sublabel}
        </p>
      )}
    </div>
  );
}
