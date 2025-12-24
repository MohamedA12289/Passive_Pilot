'use client'

import { ReactNode, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

interface MobilePerformanceWrapperProps {
  children: ReactNode
  loadingMessage?: string
}

/**
 * Wrapper component for heavy components to improve mobile performance
 * Uses Suspense for lazy loading
 */
export default function MobilePerformanceWrapper({
  children,
  loadingMessage = 'Loading...'
}: MobilePerformanceWrapperProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-amber-400 animate-spin" />
          <p className="text-gray-400 text-sm">{loadingMessage}</p>
        </div>
      </div>
    }>
      {children}
    </Suspense>
  )
}
