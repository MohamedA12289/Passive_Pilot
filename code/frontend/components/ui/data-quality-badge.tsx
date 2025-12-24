'use client'

import { Shield, AlertTriangle, Info, CheckCircle2, Database } from 'lucide-react'

interface DataQualityBadgeProps {
  quality: 'REAL_RENTCAST' | 'HIGH' | 'MEDIUM' | 'LOW' | 'ESTIMATED'
  confidence?: number
  compCount?: number
  dataSource?: string
  className?: string
}

export default function DataQualityBadge({
  quality,
  confidence,
  compCount,
  dataSource,
  className = ''
}: DataQualityBadgeProps) {
  
  const badges = {
    REAL_RENTCAST: {
      icon: Database,
      label: 'RentCast Data',
      color: 'from-emerald-500 to-green-500',
      textColor: 'text-emerald-100',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/50',
      description: 'Real property data from RentCast API'
    },
    HIGH: {
      icon: CheckCircle2,
      label: 'High Confidence',
      color: 'from-green-500 to-emerald-500',
      textColor: 'text-green-100',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/50',
      description: `${compCount || 6}+ comps, recent sales, tight clustering`
    },
    MEDIUM: {
      icon: Info,
      label: 'Medium Confidence',
      color: 'from-amber-500 to-yellow-500',
      textColor: 'text-amber-100',
      bgColor: 'bg-amber-500/20',
      borderColor: 'border-amber-500/50',
      description: `${compCount || 3-5} comps, verify with local realtor`
    },
    LOW: {
      icon: AlertTriangle,
      label: 'Low Confidence',
      color: 'from-orange-500 to-red-500',
      textColor: 'text-orange-100',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/50',
      description: 'Limited data - verify manually'
    },
    ESTIMATED: {
      icon: AlertTriangle,
      label: 'Estimated Data',
      color: 'from-gray-500 to-gray-600',
      textColor: 'text-gray-100',
      bgColor: 'bg-gray-500/20',
      borderColor: 'border-gray-500/50',
      description: 'Based on market averages - verify with appraiser'
    }
  }

  const badge = badges[quality]
  const Icon = badge.icon

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Main Badge */}
      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${badge.bgColor} border ${badge.borderColor} backdrop-blur-sm`}>
        <Icon size={18} className={badge.textColor} />
        <span className={`text-sm font-semibold ${badge.textColor}`}>
          {badge.label}
        </span>
        {confidence && (
          <span className={`text-sm font-bold ${badge.textColor}`}>
            {confidence}%
          </span>
        )}
      </div>

      {/* Tooltip/Description */}
      <div className="group relative">
        <Info size={16} className="text-gray-400 cursor-help" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-lg bg-black/95 border border-white/20 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          <p className="font-semibold mb-1">{badge.label}</p>
          <p className="text-gray-300">{badge.description}</p>
          {dataSource && (
            <p className="text-gray-400 mt-2 text-[10px]">
              Source: {dataSource}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
