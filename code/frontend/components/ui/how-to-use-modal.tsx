
'use client'

import { useState } from 'react'
import { X, Play, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react'
import Image from 'next/image'

interface Step {
  number: number
  title: string
  description: string
  image?: string
  tips?: string[]
}

interface HowToUseModalProps {
  toolName: string
  steps: Step[]
  videoUrl?: string
}

export default function HowToUseModal({ toolName, steps, videoUrl }: HowToUseModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold font-montserrat shadow-lg hover:shadow-amber-500/50 transition-all transform hover:scale-[1.02]"
      >
        <HelpCircle size={20} />
        <span>How to Use This Tool</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          {/* Modal Content */}
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-black border-2 border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-black via-gray-900 to-black border-b-2 border-amber-500/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                    How to Use
                  </h2>
                  <p className="text-lg font-semibold text-white mt-1 font-montserrat">{toolName}</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-6">
              {/* Video Tutorial (if provided) */}
              {videoUrl && (
                <div className="mb-8 rounded-xl overflow-hidden border-2 border-purple-500/30">
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 border-b border-purple-500/30">
                    <div className="flex items-center gap-2">
                      <Play size={20} className="text-purple-400" />
                      <span className="text-lg font-bold text-white font-montserrat">Video Tutorial</span>
                    </div>
                  </div>
                  <div className="aspect-video bg-black">
                    <iframe
                      src={videoUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Steps */}
              <div className="space-y-8">
                {steps.map((step, index) => (
                  <div key={index} className="relative">
                    {/* Step Number Circle */}
                    <div className="flex gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center font-black text-black text-xl font-montserrat shadow-lg">
                          {step.number}
                        </div>
                        {index < steps.length - 1 && (
                          <div className="w-0.5 h-full bg-gradient-to-b from-amber-500/50 to-transparent mx-auto mt-2" />
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 pb-8">
                        <h3 className="text-2xl font-bold text-white mb-3 font-serif">
                          {step.title}
                        </h3>
                        <p className="text-gray-300 text-lg leading-relaxed mb-4 font-poppins">
                          {step.description}
                        </p>

                        {/* Step Image */}
                        {step.image && (
                          <div className="my-4 rounded-xl overflow-hidden border-2 border-white/10">
                            <Image
                              src={step.image}
                              alt={`Step ${step.number}`}
                              width={800}
                              height={450}
                              className="w-full h-auto"
                            />
                          </div>
                        )}

                        {/* Tips */}
                        {step.tips && step.tips.length > 0 && (
                          <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30">
                            <div className="flex items-center gap-2 mb-3">
                              <AlertCircle size={18} className="text-emerald-400" />
                              <span className="text-sm font-bold text-emerald-400 uppercase tracking-wide font-montserrat">
                                Pro Tips
                              </span>
                            </div>
                            <ul className="space-y-2">
                              {step.tips.map((tip, tipIndex) => (
                                <li key={tipIndex} className="flex items-start gap-2">
                                  <CheckCircle size={16} className="text-emerald-400 flex-shrink-0 mt-1" />
                                  <span className="text-gray-300 text-sm font-poppins">{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Summary Card */}
              <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-2 border-amber-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                    <CheckCircle size={24} className="text-black" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white font-serif">You're All Set!</h3>
                    <p className="text-sm text-amber-400 font-montserrat">Follow these steps and you'll be a pro</p>
                  </div>
                </div>
                <p className="text-gray-300 font-poppins">
                  Need more help? Join our <span className="text-amber-400 font-semibold">Premium Discord Community</span> where 2,000+ wholesalers are ready to help you succeed!
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gradient-to-r from-black via-gray-900 to-black border-t-2 border-amber-500/30 p-4">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold font-montserrat shadow-lg transition-all"
              >
                Got It! Let's Start
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
