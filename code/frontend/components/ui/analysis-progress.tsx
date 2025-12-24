'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'

interface AnalysisProgressProps {
  isAnalyzing: boolean
  onComplete?: () => void
}

const ANALYSIS_STEPS = [
  { id: 1, label: 'Fetching Property Data', duration: 1000 },
  { id: 2, label: 'Analyzing Comps', duration: 1500 },
  { id: 3, label: 'Calculating ARV', duration: 1200 },
  { id: 4, label: 'Computing MAO', duration: 800 },
  { id: 5, label: 'Finalizing Results', duration: 500 },
]

export default function AnalysisProgress({ isAnalyzing, onComplete }: AnalysisProgressProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStep(0)
      setProgress(0)
      return
    }

    let stepIndex = 0
    let accumulatedTime = 0
    const totalDuration = ANALYSIS_STEPS.reduce((sum, step) => sum + step.duration, 0)

    const runSteps = () => {
      if (stepIndex >= ANALYSIS_STEPS.length) {
        setProgress(100)
        if (onComplete) setTimeout(onComplete, 300)
        return
      }

      setCurrentStep(stepIndex + 1)
      const step = ANALYSIS_STEPS[stepIndex]
      
      // Animate progress smoothly within this step
      const startProgress = (accumulatedTime / totalDuration) * 100
      const endProgress = ((accumulatedTime + step.duration) / totalDuration) * 100
      
      let elapsed = 0
      const interval = setInterval(() => {
        elapsed += 50
        const stepProgress = Math.min((elapsed / step.duration) * 100, 100)
        const currentProgress = startProgress + (stepProgress / 100) * (endProgress - startProgress)
        setProgress(currentProgress)
        
        if (elapsed >= step.duration) {
          clearInterval(interval)
          accumulatedTime += step.duration
          stepIndex++
          runSteps()
        }
      }, 50)
    }

    runSteps()
  }, [isAnalyzing, onComplete])

  if (!isAnalyzing && currentStep === 0) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 p-8 rounded-2xl bg-gradient-to-br from-black via-gray-900 to-black border-2 border-amber-500/20 shadow-2xl shadow-amber-500/20">
        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-amber-400 font-montserrat font-bold">Analyzing Property...</span>
            <span className="text-white font-mono font-bold text-lg">{Math.round(progress)}%</span>
          </div>
          
          <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              {/* Animated shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
        </div>

        {/* Current Step */}
        <div className="space-y-3">
          {ANALYSIS_STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-3 transition-all duration-300 ${
                index + 1 === currentStep
                  ? 'scale-105 opacity-100'
                  : index + 1 < currentStep
                  ? 'opacity-60'
                  : 'opacity-30'
              }`}
            >
              {index + 1 < currentStep ? (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              ) : index + 1 === currentStep ? (
                <Loader2 className="w-5 h-5 text-amber-400 animate-spin flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex-shrink-0"></div>
              )}
              
              <span
                className={`font-poppins text-sm ${
                  index + 1 === currentStep
                    ? 'text-white font-semibold'
                    : index + 1 < currentStep
                    ? 'text-green-400'
                    : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Pulsing indicator */}
        {currentStep > 0 && currentStep <= ANALYSIS_STEPS.length && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse [animation-delay:200ms]"></div>
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse [animation-delay:400ms]"></div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}
