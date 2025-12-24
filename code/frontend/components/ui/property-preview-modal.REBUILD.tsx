'use client'

import { useState, useEffect } from 'react'
import { X, MapPin, DollarSign, Home, Sparkles, TrendingUp, Users, Send, Target, ChevronRight, CheckCircle, Info, Calculator, Zap, Check, Crown, ArrowLeft, ArrowRight, Lock, FileText, MessageCircle, Image as ImageIcon, UserPlus, User, Building2, Star, AlertCircle, Layers, Edit, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { isPremiumUnlocked, getCurrentUserId } from '@/lib/premiumAccess'
import { SavedAnalysis } from '@/lib/types'
import AnalysisProgress from '@/components/ui/analysis-progress'
import CompsComparisonView from '@/components/ui/comps-comparison-view'
import OwnerDataCard from '@/components/ui/owner-data-card'
import TooltipHelper from '@/components/ui/tooltip-helper'
import SubmitDealModal from '@/components/ui/submit-deal-modal'

const PropertyMap = dynamic(() => import('@/components/ui/property-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-black/60 rounded-xl flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading map...</p>
    </div>
  )
})

interface PropertyData {
  formattedAddress: string
  streetAddress: string
  city: string
  state: string
  zipCode: string
  beds?: number
  baths?: number
  sqft?: number
  price?: number
  propertyType?: string
  yearBuilt?: number
  latitude?: number
  longitude?: number
}

interface CompEntry {
  address: string
  price: number
  beds: number
  baths: number
  sqft: number
  distance?: number
  daysAgo?: number
  saleDate?: string
}

interface PropertyPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  propertyData: PropertyData | null
}

type Step = 1 | 2 | 3 | 4
type FinancingType = 'cash' | 'creative' | null
type RehabLevel = 'cosmetic' | 'moderate' | 'heavy' | null
type ARVMethod = 'ai' | 'manual' | null

export default function PropertyPreviewModal({ isOpen, onClose, propertyData }: PropertyPreviewModalProps) {
  const router = useRouter()
  
  // Premium status
  const [isUnlocked, setIsUnlocked] = useState(false)
  
  useEffect(() => {
    setIsUnlocked(isPremiumUnlocked())
  }, [])
  
  // Re-check premium status when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsUnlocked(isPremiumUnlocked())
    }
  }, [isOpen])
  
  // Step-by-step state
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [financing, setFinancing] = useState<FinancingType>(null)
  const [rehabLevel, setRehabLevel] = useState<RehabLevel>(null)
  const [arvMethod, setARVMethod] = useState<ARVMethod>(null)
  const [arv, setARV] = useState<number>(0)
  const [repairs, setRepairs] = useState<number>(0)
  const [comps, setComps] = useState<CompEntry[]>([])
  const [loadingComps, setLoadingComps] = useState(false)
  
  // Additional fields for free users
  const [sellerAsking, setSellerAsking] = useState<number>(0)
  const [propertyTypeInput, setPropertyTypeInput] = useState<string>('residential')
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [ownerInfo, setOwnerInfo] = useState<any>(null)
  const [isLoadingOwner, setIsLoadingOwner] = useState(false)
  const [ownerLookupAttempted, setOwnerLookupAttempted] = useState(false)

  // Smart repair costs state
  const [repairMode, setRepairMode] = useState<'checklist' | 'ai' | null>(null)
  const [selectedRepairs, setSelectedRepairs] = useState<Record<string, boolean>>({})
  const [aiRepairInput, setAiRepairInput] = useState<string>('')
  const [aiRepairResult, setAiRepairResult] = useState<string>('')
  const [loadingAIRepair, setLoadingAIRepair] = useState(false)
  const [assignmentFee, setAssignmentFee] = useState<number>(20000) // Default $20K assignment fee
  const [manualComps, setManualComps] = useState<CompEntry[]>([]) // Manual comp entry for users
  const [showAIExplanation, setShowAIExplanation] = useState(false)
  const [showCompsComparison, setShowCompsComparison] = useState(false)
  const [showSubmitDealModal, setShowSubmitDealModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'breakdown' | 'offers' | 'comps'>('breakdown')

  // Edit panel state
  const [showEditPanel, setShowEditPanel] = useState(false)
  const [editSellerAsking, setEditSellerAsking] = useState<number>(0)
  const [editRepairs, setEditRepairs] = useState<number>(0)
  const [editAssignmentFee, setEditAssignmentFee] = useState<number>(20000)
  const [editPropertyType, setEditPropertyType] = useState<string>('residential')

  // Confirmation tracking for input validation
  const [repairsConfirmed, setRepairsConfirmed] = useState(false)
  const [assignmentFeeConfirmed, setAssignmentFeeConfirmed] = useState(false)

  // Calculate MAO based on property type
  // RESIDENTIAL: 70% ARV Rule - standard for homes
  // LAND: 65% Land Value Rule - conservative approach for raw land
  // COMMERCIAL: 65% ARV Rule - accounts for income potential complexity
  const calculateMAO = () => {
    if (!arv || financing !== 'cash') return 0
    
    let arvMultiplier = 0.7 // Default residential 70%
    const repairCost = repairs || 0 // Use user-entered costs (repairs for residential, site prep for land)
    
    if (propertyTypeInput === 'land') {
      arvMultiplier = 0.65 // Land uses 65% rule (conservative approach for raw land deals)
    } else if (propertyTypeInput === 'commercial') {
      arvMultiplier = 0.65 // Commercial uses 65% rule due to complexity
    }
    
    const rawMAO = Math.round(arv * arvMultiplier - repairCost - assignmentFee)
    
    // **CRITICAL SANITY CHECK**: MAO can't be negative
    return Math.max(0, rawMAO)
  }
  
  const mao = calculateMAO()
  
  // ============================================================================
  // DEAL SPREAD CALCULATIONS - Separate scenarios for clarity
  // ============================================================================
  
  // Scenario 1: "At Asking Price" - What happens if you buy at seller's asking price?
  // Deal Spread = ARV - (Purchase Price + Repairs + Closing Costs + Hold Buffer)
  // For simplicity, we don't include closing/holding costs (or set to 0), but label clearly
  const closingCosts = 0 // Not included in this version
  const holdingCosts = 0 // Not included in this version
  
  const spreadAtAsking = arv && sellerAsking 
    ? Math.round(arv - (sellerAsking + (repairs || 0) + closingCosts + holdingCosts + assignmentFee))
    : 0
  
  // Scenario 2: "At Recommended Offer (MAO)" - What happens if you buy at MAO?
  // MAO already includes: ARV * 0.7 - repairs - assignmentFee
  // So the end buyer pays: MAO + assignmentFee = ARV * 0.7 - repairs
  // Their profit: ARV - (MAO + assignmentFee + repairs) = ARV - (ARV*0.7 - repairs - assignmentFee + assignmentFee + repairs) = ARV * 0.3
  const spreadAtMAO = arv && mao 
    ? Math.round(arv - (mao + assignmentFee + (repairs || 0) + closingCosts + holdingCosts))
    : 0
  
  // Wholesaler's negotiation room: difference between asking and MAO
  const negotiationRoom = mao && sellerAsking ? Math.round(mao - sellerAsking) : 0
  
  // Deal quality grading for "At Asking Price" scenario
  const getDealQualityAtAsking = (spread: number): { grade: string; color: string; emoji: string } => {
    if (spread <= 0) return { grade: 'RISKY', color: 'red', emoji: '❌' }
    if (spread > 0 && spread < 25000) return { grade: 'THIN', color: 'orange', emoji: '⚠️' }
    return { grade: 'SOLID', color: 'emerald', emoji: '✅' }
  }
  
  // Deal quality grading for "At MAO" scenario
  const getDealQualityAtMAO = (spread: number): { grade: string; color: string; emoji: string } => {
    if (spread <= 0) return { grade: 'RISKY', color: 'red', emoji: '❌' }
    if (spread > 0 && spread < 25000) return { grade: 'THIN', color: 'orange', emoji: '⚠️' }
    return { grade: 'SOLID', color: 'emerald', emoji: '✅' }
  }
  
  const qualityAtAsking = getDealQualityAtAsking(spreadAtAsking)
  const qualityAtMAO = getDealQualityAtMAO(spreadAtMAO)
  
  // For backward compatibility (used in some places), use negotiationRoom as "profit"
  const profit = negotiationRoom
  
  // **CRITICAL WARNING FLAG**: Check if deal looks "too good to be true"
  // If MAO is significantly above listing price, the ARV is probably wrong
  const isSuspiciouslyGoodDeal = mao > 0 && sellerAsking > 0 && mao > sellerAsking * 1.3 // MAO more than 30% above asking
  const isUnrealisticMAO = mao > 0 && sellerAsking > 0 && mao > sellerAsking * 1.5 // MAO more than 50% above asking = definitely wrong ARV
  
  // Randomly generated but memoized per session to avoid hydration mismatch
  const [interestedBuyers] = useState(() => Math.floor(Math.random() * 15) + 8) // 8-22 buyers

  // Add deal to pipeline function
  const handleAddToPipeline = async () => {
    console.log('🔍 Add to Pipeline clicked!')
    console.log('Property Data:', propertyData)
    console.log('ARV:', arv)
    console.log('Seller Asking:', sellerAsking)
    console.log('Repairs:', repairs)
    console.log('MAO:', mao)
    console.log('Assignment Fee:', assignmentFee)
    console.log('Financing:', financing)
    
    if (!propertyData) {
      toast.error('❌ No property data available')
      return
    }

    const userId = getCurrentUserId()
    if (!userId) {
      toast.error('❌ Please enter your access code to save deals')
      return
    }

    // Validate we have required data with more specific error messages
    if (!arv || arv === 0) {
      toast.error('❌ Please estimate ARV first (Step 2)')
      return
    }
    
    if (!sellerAsking || sellerAsking === 0) {
      toast.error('❌ Please enter seller asking price (Step 3)')
      return
    }

    try {
      const toastId = toast.loading('💾 Adding deal to your pipeline...')
      
      const dealData = {
        userId,
        address: propertyData.formattedAddress || propertyData.streetAddress,
        city: propertyData.city || '',
        state: propertyData.state || '',
        zip: propertyData.zipCode || '',
        askingPrice: sellerAsking,
        arv: arv,
        repairs: repairs || 0,
        mao: mao, // Maximum Allowable Offer
        assignmentFee: assignmentFee, // Wholesaler's assignment fee
        propertyType: propertyData.propertyType || propertyTypeInput || 'Residential',
        beds: propertyData.beds || 0,
        baths: propertyData.baths || 0,
        sqft: propertyData.sqft || 0,
        stage: 'lead',
        dealType: 'personal',
        notes: `Deal from Analyzer - ${financing === 'cash' ? 'Cash Deal' : 'Creative Financing'}\nMAO: $${mao.toLocaleString()}\nAssignment Fee: $${assignmentFee.toLocaleString()}\nEstimated Profit: $${profit.toLocaleString()}`,
      }

      console.log('📤 Sending deal data:', dealData)

      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dealData),
      })

      const data = await response.json()
      
      console.log('📥 API Response:', data)
      
      toast.dismiss(toastId) // Remove loading toast

      if (data.success) {
        toast.success('✅ Deal added to your pipeline!', {
          duration: 3000,
          icon: '🎉',
        })
        
        // Redirect to pipeline after a short delay
        setTimeout(() => {
          router.push('/tools/deal-pipeline')
          onClose()
        }, 1000)
      } else {
        toast.error(`❌ Failed to add deal: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      toast.dismiss()
      console.error('❌ Error adding deal to pipeline:', error)
      toast.error('❌ Failed to add deal to pipeline. Check console for details.')
    }
  }

  // Reset on modal open
  useEffect(() => {
    if (isOpen && propertyData) {
      setCurrentStep(1)
      setFinancing(null)
      setRehabLevel(null)
      setARVMethod(null)
      setARV(0)
      setRepairs(0)
      setComps([])
      setSellerAsking(0)
      setPropertyTypeInput('residential')
      setShowPremiumModal(false)
      // Reset smart repair state
      setRepairMode(null)
      setSelectedRepairs({})
      setAiRepairInput('')
      setAiRepairResult('')
      setLoadingAIRepair(false)
    }
  }, [isOpen, propertyData])

  const fetchCompsFromRentCast = async () => {
    if (!propertyData) return
    
    console.log('🔍 Fetching comps for:', propertyData)
    setLoadingComps(true)
    
    // FREE USERS: Skip API call, use fallback estimation
    // IMPORTANT: Never use listing price for ARV - they are unrelated!
    // ARV = After Repair VALUE (what it sells for fixed up)
    // Listing Price = What seller is asking (often distressed/below market)
    if (!isUnlocked) {
      console.log('📊 Free user - using fallback estimation (NOT listing price)')
      
      // **CRITICAL FIX FOR LAND**: Don't use residential sqft multipliers for land
      if (propertyTypeInput === 'land') {
        // For land, we can't reliably estimate without comps
        console.log('🏞️ LAND DEAL: Free user - must enter value manually')
        setARV(0) // Force user to enter manually
        setRepairs(0)
        setLoadingComps(false)
        toast.error('⚠️ For LAND deals, you must enter the land value manually. Upgrade to Premium for AI-assisted land valuations.', {
          duration: 8000,
          icon: '🏞️'
        })
        return
      }
      
      // **IMPROVED**: Use regional sqft multipliers based on state/location
      // This provides more accurate estimates than flat national average
      const sqft = propertyData?.sqft || 1500
      const state = propertyData?.state || ''
      
      // Regional multipliers based on state median home prices ($/sqft)
      // Source: Zillow & Realtor.com 2024 data
      const regionalMultipliers: Record<string, number> = {
        // High-cost markets ($200-300/sqft)
        'CA': 350, 'NY': 280, 'MA': 280, 'WA': 260, 'CO': 250, 'OR': 240,
        // Mid-cost markets ($150-200/sqft)
        'FL': 220, 'TX': 180, 'NC': 180, 'GA': 170, 'AZ': 200, 'NV': 200,
        'VA': 190, 'MD': 210, 'NJ': 250, 'CT': 230, 'IL': 180,
        // Lower-cost markets ($100-150/sqft)
        'OH': 140, 'MI': 130, 'PA': 150, 'IN': 125, 'TN': 160,
        'AL': 130, 'SC': 150, 'KY': 130, 'MS': 110, 'AR': 120,
        'LA': 140, 'OK': 130, 'KS': 130, 'MO': 135, 'WI': 160,
        'MN': 170, 'IA': 130, 'NE': 140, 'WV': 100
      }
      
      // Get regional multiplier or use conservative national average
      let marketMultiplier = regionalMultipliers[state] || 160
      
      // Adjust for commercial properties (typically 60-70% of residential $/sqft)
      if (propertyTypeInput === 'commercial') {
        marketMultiplier = Math.round(marketMultiplier * 0.65)
      }
      
      const estimated = Math.round(sqft * marketMultiplier)
      
      // Calculate ARV range for transparency (±20%)
      const arvLow = Math.round(estimated * 0.8)
      const arvHigh = Math.round(estimated * 1.2)
      
      setARV(estimated)
      
      // **IMPROVED**: Repair estimate based on property age and sqft
      // Newer homes need less work, older homes need more
      const yearBuilt = propertyData?.yearBuilt || 1980
      const currentYear = new Date().getFullYear()
      const age = currentYear - yearBuilt
      
      // Repair multiplier based on age: $10-30/sqft
      let repairMultiplier = 15 // base for 20-40 year old homes
      if (age < 10) repairMultiplier = 8 // newer homes: cosmetic only
      else if (age < 20) repairMultiplier = 12 // minor updates needed
      else if (age > 50) repairMultiplier = 25 // major renovation needed
      else if (age > 70) repairMultiplier = 30 // full gut job
      
      const estimatedRepairs = Math.round(sqft * repairMultiplier)
      setRepairs(estimatedRepairs)
      
      setLoadingComps(false)
      
      // Show clear warning that this is an estimate
      toast('⚠️ ESTIMATE ONLY: ARV ~$' + estimated.toLocaleString() + ' (range: $' + arvLow.toLocaleString() + '-$' + arvHigh.toLocaleString() + '). FREE users get regional estimates. Upgrade to Premium for live comps!', {
        duration: 10000,
        icon: '📊',
        style: {
          background: '#F59E0B',
          color: '#000',
          fontWeight: 'bold'
        }
      })
      return
    }
    
    // PREMIUM USERS: Make real API call
    console.log('💎 Premium user - fetching live comps from RentCast')
    try {
      // **CRITICAL FIX**: Send premium status in request body as fallback
      // This ensures API access even if cookie setting fails (privacy browsers, etc.)
      const requestBody = {
        action: 'getComparables',
        address: propertyData.streetAddress,
        city: propertyData.city,
        state: propertyData.state,
        zipCode: propertyData.zipCode,
        // **CRITICAL FIX**: Pass property type to filter comps (e.g., only land comps for land deals)
        propertyType: propertyTypeInput,
        // **QUALITY FILTER**: Pass subject property details for accurate comp filtering
        sqft: propertyData.sqft,
        beds: propertyData.beds,
        baths: propertyData.baths,
        // **NEW**: Send premium verification data as fallback if cookie fails
        premiumVerification: {
          isUnlocked: isUnlocked,
          userId: getCurrentUserId(),
          timestamp: Date.now()
        }
      }
      console.log('📤 Request body:', requestBody)
      console.log('🏠 Property Type:', propertyTypeInput)
      console.log('🔐 Premium Status:', isUnlocked ? 'UNLOCKED' : 'LOCKED')
      
      const response = await fetch('/api/rentcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      console.log('📥 Response status:', response.status)
      const data = await response.json()
      console.log('📥 Response data:', data)
      
      // Check for comps in the response (RentCast returns 'comps' not 'comparables')
      if (data.success && data.comps && Array.isArray(data.comps) && data.comps.length > 0) {
        console.log(`✅ Found ${data.comps.length} comps`)
        
        // Take top 3 comps
        const top3 = data.comps.slice(0, 3)
        
        // Format comps to match our interface
        const formattedComps: CompEntry[] = top3.map((comp: any) => ({
          address: comp.formattedAddress || comp.address || 'Address not available',
          price: comp.price || 0,
          beds: comp.bedrooms || 0,
          baths: comp.bathrooms || 0,
          sqft: comp.squareFootage || 0,
          distance: comp.distance || 0,
          daysAgo: comp.daysAgo || 999,
          saleDate: comp.lastSaleDate || null
        }))
        
        console.log('✨ Formatted comps:', formattedComps)
        setComps(formattedComps)
        
        // Calculate average price for ARV
        const avgPrice = Math.round(
          formattedComps.reduce((sum: number, comp: CompEntry) => sum + comp.price, 0) / formattedComps.length
        )
        
        // **CRITICAL SANITY CHECK #1**: Validate ARV against property sqft to catch bad data
        const sqft = propertyData?.sqft || 1500
        const pricePerSqft = avgPrice / sqft
        
        // INDUSTRY STANDARDS (strengthened to prevent inflated ARVs):
        // Typical residential: $80-300/sqft (most markets)
        // High-cost markets: $300-450/sqft (SF, NYC, LA, etc.)
        // Anything over $450/sqft likely indicates luxury property or bad data
        // Anything under $50/sqft likely indicates land or severe distress
        const maxReasonablePricePerSqft = 450 // Allow for high-cost markets
        const minReasonablePricePerSqft = 50 // Typical for very low-cost markets
        
        // **IMPROVED SANITY CHECK**: Validate ARV but don't be TOO aggressive
        // UPDATED LOGIC: Allow legitimate deals, only flag extreme outliers
        const listingPrice = propertyData?.price || 0
        const arvToListingRatio = listingPrice > 0 ? avgPrice / listingPrice : 0
        
        // **RELAXED THRESHOLDS**:
        // - Flag if ARV > 3x listing (likely luxury comps contaminating data)
        // - Flag if ARV < 0.8x listing (comps are pulling low-end sales)
        // - BUT: Don't reject ARV just because it's close to asking price
        //   Reason: Seller might know market value, still room for wholesale profit with negotiation
        const maxReasonableARVRatio = 3.0 // Increased from 2.0 to allow more flexibility
        const minReasonableARVRatio = 0.8 // Allow ARV to be slightly below listing if seller is realistic
        
        let failedSanityCheck = false
        let failureReason = ''
        
        // Check price per sqft (only for extreme outliers)
        if (pricePerSqft > maxReasonablePricePerSqft) {
          failedSanityCheck = true
          failureReason = `Price/sqft too high: $${pricePerSqft.toFixed(0)}/sqft (max: $${maxReasonablePricePerSqft}/sqft) - comps may include luxury properties`
          console.error(`⚠️ SANITY CHECK FAILED: $${pricePerSqft.toFixed(0)}/sqft is unusually high`)
        } else if (pricePerSqft < minReasonablePricePerSqft) {
          failedSanityCheck = true
          failureReason = `Price/sqft too low: $${pricePerSqft.toFixed(0)}/sqft (min: $${minReasonablePricePerSqft}/sqft) - comps may include distressed sales`
          console.error(`⚠️ SANITY CHECK FAILED: $${pricePerSqft.toFixed(0)}/sqft is unusually low`)
        } else if (listingPrice > 0 && arvToListingRatio > maxReasonableARVRatio) {
          failedSanityCheck = true
          failureReason = `ARV ($${avgPrice.toLocaleString()}) is ${arvToListingRatio.toFixed(1)}x listing ($${listingPrice.toLocaleString()}) - comps may be pulling luxury sales`
          console.error(`⚠️ SANITY CHECK: ARV ${arvToListingRatio.toFixed(1)}x listing - possible comp quality issue`)
        } else if (listingPrice > 0 && arvToListingRatio < minReasonableARVRatio) {
          // **UPDATED**: Only flag if ARV is significantly BELOW listing (0.8x or less)
          // This catches cases where comps are pulling distressed sales
          failedSanityCheck = true
          failureReason = `ARV ($${avgPrice.toLocaleString()}) is ${arvToListingRatio.toFixed(2)}x listing ($${listingPrice.toLocaleString()}) - comps may be too conservative`
          console.error(`⚠️ SANITY CHECK: ARV ${arvToListingRatio.toFixed(2)}x listing - comps may be distressed sales`)
        }
        
        if (failedSanityCheck) {
          console.error(`Failure reason: ${failureReason}`)
          console.error(`Raw avg price: $${avgPrice.toLocaleString()}, Property sqft: ${sqft}`)
          
          // **IMPROVED FALLBACK LOGIC**: Use regional multipliers, not arbitrary ratios
          let fallbackARV: number
          let fallbackExplanation: string
          
          // Get state for regional multiplier
          const state = propertyData?.state || ''
          const regionalMultipliers: Record<string, number> = {
            'CA': 350, 'NY': 280, 'MA': 280, 'WA': 260, 'CO': 250, 'OR': 240,
            'FL': 220, 'TX': 180, 'NC': 180, 'GA': 170, 'AZ': 200, 'NV': 200,
            'VA': 190, 'MD': 210, 'NJ': 250, 'CT': 230, 'IL': 180,
            'OH': 140, 'MI': 130, 'PA': 150, 'IN': 125, 'TN': 160,
            'AL': 130, 'SC': 150, 'KY': 130, 'MS': 110, 'AR': 120,
            'LA': 140, 'OK': 130, 'KS': 130, 'MO': 135, 'WI': 160,
            'MN': 170, 'IA': 130, 'NE': 140, 'WV': 100
          }
          const marketMultiplier = regionalMultipliers[state] || 160
          
          if (arvToListingRatio < minReasonableARVRatio && listingPrice > 0) {
            // **SCENARIO 1**: ARV significantly below listing (0.8x or less)
            // This likely means comps are pulling distressed sales
            // Use the HIGHER of: comp average OR regional sqft estimate
            const sqftEstimate = Math.round(sqft * marketMultiplier)
            fallbackARV = Math.max(avgPrice, sqftEstimate)
            fallbackExplanation = `AI comps ($${avgPrice.toLocaleString()}) may be pulling distressed sales. Using max of comps vs regional estimate: $${fallbackARV.toLocaleString()}`
            
            console.log(`💡 ${fallbackExplanation}`)
            
            setARV(fallbackARV)
            setComps(formattedComps) // Keep comps visible for review
            
            toast.error(`⚠️ COMP QUALITY WARNING: Comps show $${avgPrice.toLocaleString()} but this is only ${arvToListingRatio.toFixed(2)}x asking price. Using $${fallbackARV.toLocaleString()} instead. Comps may include distressed sales - VERIFY MANUALLY!`, {
              duration: 10000,
              style: {
                background: '#F59E0B',
                color: '#000',
                fontWeight: 'bold'
              }
            })
          } else if (arvToListingRatio > maxReasonableARVRatio && listingPrice > 0) {
            // **SCENARIO 2**: ARV way above listing (3x+)
            // This likely means comps pulled luxury properties
            // Use regional sqft estimate as more reliable
            fallbackARV = Math.round(sqft * marketMultiplier)
            fallbackExplanation = `AI comps ($${avgPrice.toLocaleString()}) appear inflated (${arvToListingRatio.toFixed(1)}x asking). Using regional estimate: $${fallbackARV.toLocaleString()}`
            
            console.log(`💡 ${fallbackExplanation}`)
            
            setARV(fallbackARV)
            setComps([]) // Clear bad comps
            
            toast.error(`⚠️ COMPS TOO HIGH: Showing $${avgPrice.toLocaleString()} (${arvToListingRatio.toFixed(1)}x asking). Using regional estimate $${fallbackARV.toLocaleString()} instead. Comps may include luxury sales - VERIFY MANUALLY!`, {
              duration: 10000,
              style: {
                background: '#F59E0B',
                color: '#000',
                fontWeight: 'bold'
              }
            })
          } else {
            // **SCENARIO 3**: Price/sqft outliers (too high or too low)
            // Use regional sqft estimate
            fallbackARV = Math.round(sqft * marketMultiplier)
            fallbackExplanation = `Comp issue: ${failureReason}. Using regional estimate ($${marketMultiplier}/sqft): $${fallbackARV.toLocaleString()}`
            
            console.log(`💡 ${fallbackExplanation}`)
            
            setARV(fallbackARV)
            setComps([])
            
            toast.error(`⚠️ ${failureReason}. Using regional market estimate: $${fallbackARV.toLocaleString()} - VERIFY WITH YOUR OWN COMPS!`, {
              duration: 8000
            })
          }
        } else {
          // ARV looks reasonable
          setARV(avgPrice)
          console.log(`💰 Calculated AVG ARV: $${avgPrice.toLocaleString()} (${pricePerSqft.toFixed(0)}$/sqft - looks good!)`)
          if (listingPrice > 0) {
            console.log(`📊 ARV to Listing ratio: ${arvToListingRatio.toFixed(2)}x (healthy range: 1.2-1.8x)`)
          }
          
          // **DATA QUALITY CHECK #1**: Warn if comps have high variance
          const prices = formattedComps.map(c => c.price)
          const minPrice = Math.min(...prices)
          const maxPrice = Math.max(...prices)
          const priceRange = maxPrice - minPrice
          const priceVariance = (priceRange / avgPrice) * 100
          
          // **DATA QUALITY CHECK #2**: Warn if comps are too old or too far
          const avgDaysAgo = formattedComps.reduce((sum, c) => sum + (c.daysAgo || 0), 0) / formattedComps.length
          const avgDistance = formattedComps.reduce((sum, c) => sum + (c.distance || 0), 0) / formattedComps.length
          const hasOldComps = avgDaysAgo > 120 // Older than 4 months
          const hasFarComps = avgDistance > 0.75 // Further than 0.75 miles
          
          // Determine if comps are high quality or need verification
          const hasQualityIssues = priceVariance > 20 || hasOldComps || hasFarComps
          
          if (hasQualityIssues) {
            let warningMessage = '⚠️ Comp Quality Issues: '
            const issues = []
            
            if (priceVariance > 20) {
              issues.push(`High price variance (${priceVariance.toFixed(0)}%)`)
            }
            if (hasOldComps) {
              issues.push(`Comps are ${avgDaysAgo.toFixed(0)} days old`)
            }
            if (hasFarComps) {
              issues.push(`Comps are ${avgDistance.toFixed(2)} miles away`)
            }
            
            warningMessage += issues.join(', ') + '. VERIFY ARV MANUALLY!'
            
            toast(warningMessage, {
              icon: '⚠️',
              duration: 8000,
              style: {
                background: '#FFA500',
                color: '#000',
              },
            })
            console.log(`⚠️ WARNING: ${warningMessage}`)
          } else {
            toast.success('✨ ARV calculated from high-quality comps!')
          }
        }
      } else {
        console.log('⚠️ No comps found in response, using fallback estimation')
        
        // **CRITICAL FIX FOR LAND**: Don't use residential sqft multipliers for land
        if (propertyTypeInput === 'land') {
          // For land, we can't reliably estimate without comps
          // Land values vary WILDLY based on location, zoning, utilities, etc.
          // NEVER use residential sqft multipliers for land
          console.log('🏞️ LAND DEAL: No comps found - user must enter value manually')
          setARV(0) // Force user to enter manually
          setComps([])
          toast.error('⚠️ NO LAND COMPS FOUND! You MUST enter land value manually. Land values vary greatly by location, zoning, and utilities.', {
            duration: 10000,
            icon: '🚨'
          })
        } else {
          // For residential/commercial, use REGIONAL sqft-based estimation
          const sqft = propertyData?.sqft || 1500
          const state = propertyData?.state || ''
          
          // Use same regional multipliers as before
          const regionalMultipliers: Record<string, number> = {
            'CA': 350, 'NY': 280, 'MA': 280, 'WA': 260, 'CO': 250, 'OR': 240,
            'FL': 220, 'TX': 180, 'NC': 180, 'GA': 170, 'AZ': 200, 'NV': 200,
            'VA': 190, 'MD': 210, 'NJ': 250, 'CT': 230, 'IL': 180,
            'OH': 140, 'MI': 130, 'PA': 150, 'IN': 125, 'TN': 160,
            'AL': 130, 'SC': 150, 'KY': 130, 'MS': 110, 'AR': 120,
            'LA': 140, 'OK': 130, 'KS': 130, 'MO': 135, 'WI': 160,
            'MN': 170, 'IA': 130, 'NE': 140, 'WV': 100
          }
          
          let marketMultiplier = regionalMultipliers[state] || 160
          if (propertyTypeInput === 'commercial') {
            marketMultiplier = Math.round(marketMultiplier * 0.65)
          }
          
          const estimated = Math.round(sqft * marketMultiplier)
          const arvLow = Math.round(estimated * 0.8)
          const arvHigh = Math.round(estimated * 1.2)
          
          setARV(estimated)
          setComps([])
          toast.error(`🚨 NO COMPS FOUND! Using regional estimate: $${estimated.toLocaleString()} (range: $${arvLow.toLocaleString()}-$${arvHigh.toLocaleString()}). RentCast couldn't find comparable sales for this address. You MUST run comps manually on Zillow/Realtor.com to verify this value!`, {
            duration: 15000,
            icon: '⚠️',
            style: {
              background: '#DC2626',
              color: '#FFF',
              fontWeight: 'bold',
              fontSize: '15px'
            }
          })
        }
      }
    } catch (error) {
      console.error('❌ Error fetching comps:', error)
      
      // **CRITICAL FIX FOR LAND**: Don't use residential sqft multipliers for land
      if (propertyTypeInput === 'land') {
        console.log('🏞️ LAND DEAL: Error fetching comps - user must enter value manually')
        setARV(0) // Force user to enter manually
        setComps([])
        toast.error('⚠️ COULD NOT FETCH LAND COMPS! You MUST enter land value manually. Land values require local market knowledge.', {
          duration: 10000,
          icon: '🚨'
        })
      } else {
        // For residential/commercial, use REGIONAL sqft-based estimation
        const sqft = propertyData?.sqft || 1500
        const state = propertyData?.state || ''
        
        const regionalMultipliers: Record<string, number> = {
          'CA': 350, 'NY': 280, 'MA': 280, 'WA': 260, 'CO': 250, 'OR': 240,
          'FL': 220, 'TX': 180, 'NC': 180, 'GA': 170, 'AZ': 200, 'NV': 200,
          'VA': 190, 'MD': 210, 'NJ': 250, 'CT': 230, 'IL': 180,
          'OH': 140, 'MI': 130, 'PA': 150, 'IN': 125, 'TN': 160,
          'AL': 130, 'SC': 150, 'KY': 130, 'MS': 110, 'AR': 120,
          'LA': 140, 'OK': 130, 'KS': 130, 'MO': 135, 'WI': 160,
          'MN': 170, 'IA': 130, 'NE': 140, 'WV': 100
        }
        
        let marketMultiplier = regionalMultipliers[state] || 160
        if (propertyTypeInput === 'commercial') {
          marketMultiplier = Math.round(marketMultiplier * 0.65)
        }
        
        const estimated = Math.round(sqft * marketMultiplier)
        const arvLow = Math.round(estimated * 0.8)
        const arvHigh = Math.round(estimated * 1.2)
        
        setARV(estimated)
        setComps([])
        toast.error(`🚨 API ERROR! Using regional estimate: $${estimated.toLocaleString()} (range: $${arvLow.toLocaleString()}-$${arvHigh.toLocaleString()}). Could not connect to RentCast API. You MUST run comps manually on Zillow/Realtor.com to verify this value!`, {
          duration: 15000,
          icon: '⚠️',
          style: {
            background: '#DC2626',
            color: '#FFF',
            fontWeight: 'bold',
            fontSize: '15px'
          }
        })
      }
    } finally {
      setLoadingComps(false)
    }
  }

  const handleARVMethodSelect = async (method: ARVMethod) => {
    if (method === 'ai') {
      // Show premium modal for free users - DON'T set arvMethod yet
      if (!isUnlocked) {
        setShowPremiumModal(true)
        return
      }
      // Only set arvMethod if user is premium
      setARVMethod(method)
      await fetchCompsFromRentCast()
    } else {
      // For manual input, always set the method
      setARVMethod(method)
    }
  }
  
  const handleGoBack = () => {
    if (currentStep === 1) {
      onClose()
    } else {
      setCurrentStep((prev) => Math.max(1, prev - 1) as Step)
    }
  }

  const handleGenerateRehab = () => {
    if (!rehabLevel) {
      toast.error('Please select rehab level first')
      return
    }
    
    const baseCost = propertyData?.sqft || 1500
    let multiplier = 15 // default moderate
    
    if (rehabLevel === 'cosmetic') multiplier = 8
    else if (rehabLevel === 'moderate') multiplier = 15
    else if (rehabLevel === 'heavy') multiplier = 25
    
    const estimated = Math.round(baseCost * multiplier)
    setRepairs(estimated)
    toast.success('✨ Rehab estimate generated!')
  }

  const handleFinancingSelect = (type: FinancingType) => {
    setFinancing(type)
    if (type === 'creative') {
      // Redirect to Creative Finance Calculator (premium only)
      if (isUnlocked) {
        router.push('/tools/creative-finance')
      } else {
        setShowPremiumModal(true)
      }
    } else {
      setCurrentStep(2) // Go to ARV step
    }
  }
  
  const handleOwnerLookup = async () => {
    if (!isUnlocked) {
      setShowPremiumModal(true)
      return
    }
    
    if (!propertyData) {
      toast.error('❌ Property data not available')
      return
    }
    
    setIsLoadingOwner(true)
    setOwnerLookupAttempted(true)
    toast.loading('🔍 Searching for owner contact info...')
    
    try {
      // Build full address for the API call
      const fullAddress = `${propertyData.streetAddress}, ${propertyData.city}, ${propertyData.state} ${propertyData.zipCode}`
      
      console.log('🔍 Fetching owner info for:', fullAddress)
      
      const response = await fetch(`/api/owner-lookup?address=${encodeURIComponent(fullAddress)}`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      console.log('📥 Owner lookup response:', data)
      
      if (response.ok && data.available) {
        // Normalize data for OwnerDataCard component
        const normalizedOwnerInfo = {
          ownerName: data.ownerName || 'Not available from provider',
          mailingAddress: data.mailingAddress || 'Not available from provider',
          phone: data.phone || null,
          email: data.email || null,
          owner2: null
        }
        
        setOwnerInfo(normalizedOwnerInfo)
        toast.dismiss()
        
        // Show detailed success message
        const foundFields = []
        if (data.ownerName) foundFields.push('name')
        if (data.mailingAddress) foundFields.push('address')
        if (data.phone) foundFields.push('phone')
        if (data.email) foundFields.push('email')
        
        if (foundFields.length > 0) {
          toast.success(`✅ Owner info found! (${foundFields.join(', ')})`)
        } else {
          toast.success('✅ Owner info retrieved')
        }
      } else {
        // Handle not available case
        const notAvailableInfo = {
          ownerName: 'Not available from provider',
          mailingAddress: 'Not available from provider',
          phone: null,
          email: null,
          owner2: null
        }
        setOwnerInfo(notAvailableInfo)
        toast.dismiss()
        
        if (response.status === 403) {
          toast.error('❌ Premium access required')
        } else if (response.status === 429) {
          toast.error('❌ Rate limit exceeded. Please try again later.')
        } else {
          toast.error(`ℹ️ ${data.message || 'Owner info not available from provider'}`)
        }
      }
    } catch (error) {
      console.error('Owner lookup error:', error)
      const errorInfo = {
        ownerName: 'Error fetching data',
        mailingAddress: 'Error fetching data',
        phone: null,
        email: null,
        owner2: null
      }
      setOwnerInfo(errorInfo)
      toast.dismiss()
      toast.error('❌ Failed to fetch owner info')
    } finally {
      setIsLoadingOwner(false)
    }
  }

  const handleContinueToRehab = () => {
    // Calculate ARV from manual comps if they exist
    if (arvMethod === 'manual' && manualComps.length > 0) {
      const validComps = manualComps.filter(c => c.price > 0)
      if (validComps.length > 0) {
        const avgARV = Math.round(
          validComps.reduce((sum, c) => sum + c.price, 0) / validComps.length
        )
        setARV(avgARV)
        toast.success(`✅ ARV calculated from ${validComps.length} comp(s): $${avgARV.toLocaleString()}`)
      }
    }
    
    if (!arv && !(arvMethod === 'manual' && manualComps.length > 0)) {
      toast.error('Please set ARV or enter comps first')
      return
    }
    setCurrentStep(3)
  }

  const handleCalculate = () => {
    // Enhanced validation with specific error messages
    if (!repairsConfirmed) {
      toast.error('Please confirm repair costs using checklist, AI analysis, or "$0 / No Repairs" button')
      return
    }
    
    if (!assignmentFeeConfirmed) {
      toast.error('Please confirm your assignment fee by clicking the green checkmark button')
      return
    }
    
    if (!sellerAsking || sellerAsking === 0) {
      toast.error('Please enter the seller\'s asking price to proceed')
      return
    }
    
    // All validations passed - proceed to results
    setCurrentStep(4)
    toast.success('✅ Deal analyzed!')
    
    // Scroll to top of modal when moving to step 4
    setTimeout(() => {
      const modalContent = document.querySelector('.modal-content-scroll')
      if (modalContent) {
        modalContent.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }, 100)
  }

  // Edit panel handlers
  const handleOpenEditPanel = () => {
    setEditSellerAsking(sellerAsking)
    setEditRepairs(repairs)
    setEditAssignmentFee(assignmentFee)
    setEditPropertyType(propertyTypeInput)
    setShowEditPanel(true)
  }

  const handleSaveEdits = () => {
    setSellerAsking(editSellerAsking)
    setRepairs(editRepairs)
    setAssignmentFee(editAssignmentFee)
    setPropertyTypeInput(editPropertyType)
    setShowEditPanel(false)
    toast.success('✅ Inputs updated! Results recalculated.')
  }

  // Smart repair/site prep cost handlers - different categories for different property types
  const residentialRepairCosts = {
    roof: { min: 8000, max: 15000, label: 'Roof Replacement' },
    hvac: { min: 5000, max: 8000, label: 'HVAC System' },
    kitchen: { min: 15000, max: 30000, label: 'Kitchen Remodel' },
    bathrooms: { min: 8000, max: 12000, label: 'Bathroom(s)' },
    flooring: { min: 3000, max: 8000, label: 'Flooring' },
    paintInterior: { min: 2000, max: 4000, label: 'Paint Interior' },
    paintExterior: { min: 3000, max: 6000, label: 'Paint Exterior' },
    foundation: { min: 10000, max: 25000, label: 'Foundation Issues' },
    electrical: { min: 3000, max: 8000, label: 'Electrical Updates' },
    plumbing: { min: 2000, max: 6000, label: 'Plumbing Repairs' }
  }

  const landSitePrepCosts = {
    clearing: { min: 2000, max: 8000, label: 'Land Clearing / Debris Removal' },
    grading: { min: 3000, max: 10000, label: 'Grading / Leveling' },
    survey: { min: 500, max: 2000, label: 'Survey / Boundary Markers' },
    utilities: { min: 5000, max: 20000, label: 'Utility Connection' },
    access: { min: 3000, max: 15000, label: 'Road / Driveway Access' },
    environmental: { min: 2000, max: 10000, label: 'Environmental Testing' },
    permits: { min: 500, max: 3000, label: 'Permits / Zoning' },
    holding: { min: 1000, max: 5000, label: 'Holding Costs (Taxes/Insurance)' }
  }

  // Use appropriate cost structure based on property type
  const repairCosts = propertyTypeInput === 'land' ? landSitePrepCosts : residentialRepairCosts

  const handleToggleRepair = (key: string) => {
    setSelectedRepairs(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleCalculateChecklist = () => {
    let total = 0
    Object.keys(selectedRepairs).forEach(key => {
      if (selectedRepairs[key]) {
        const cost = repairCosts[key as keyof typeof repairCosts] as { min: number; max: number; label: string } | undefined
        if (cost) {
          // Use average of min and max
          total += (cost.min + cost.max) / 2
        }
      }
    })
    
    if (total === 0) {
      toast.error('Please select at least one repair item')
      return
    }
    
    setRepairs(Math.round(total))
    setRepairsConfirmed(true) // Mark repairs as confirmed
    toast.success(`✅ Total repair cost: $${Math.round(total).toLocaleString()}`)
    
    // Close repair mode but STAY on step 3 (don't auto-advance)
    setRepairMode(null)
  }

  const handleAIRepairAnalysis = async () => {
    if (!aiRepairInput.trim()) {
      toast.error('Please describe what repairs are needed')
      return
    }
    
    setLoadingAIRepair(true)
    
    // Simulate AI processing (in production, this would call an LLM API)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Simple keyword-based estimation for demo
    const input = aiRepairInput.toLowerCase()
    let total = 0
    let breakdown = []
    
    if (input.includes('roof')) {
      total += 12000
      breakdown.push('Roof Replacement: $10,000-15,000')
    }
    if (input.includes('kitchen')) {
      total += 22000
      breakdown.push('Kitchen Remodel: $15,000-25,000')
    }
    if (input.includes('hvac') || input.includes('heating') || input.includes('cooling')) {
      total += 6000
      breakdown.push('HVAC System: $5,000-8,000')
    }
    if (input.includes('bathroom') || input.includes('bath')) {
      total += 10000
      breakdown.push('Bathroom(s): $8,000-12,000')
    }
    if (input.includes('floor')) {
      total += 5000
      breakdown.push('Flooring: $3,000-8,000')
    }
    if (input.includes('paint')) {
      total += 4000
      breakdown.push('Paint (Interior/Exterior): $2,000-6,000')
    }
    if (input.includes('foundation')) {
      total += 17000
      breakdown.push('Foundation Issues: $10,000-25,000')
    }
    if (input.includes('electrical') || input.includes('wiring')) {
      total += 5000
      breakdown.push('Electrical Updates: $3,000-8,000')
    }
    if (input.includes('plumb')) {
      total += 4000
      breakdown.push('Plumbing Repairs: $2,000-6,000')
    }
    
    // Add base cosmetic if no major items found
    if (total === 0) {
      total = 8000
      breakdown.push('Cosmetic Updates: $5,000-10,000')
    }
    
    setRepairs(total)
    setRepairsConfirmed(true) // Mark repairs as confirmed
    setAiRepairResult(`💡 Estimated Repairs: $${(total * 0.85).toLocaleString()}-$${(total * 1.15).toLocaleString()}\n\n${breakdown.join('\n')}`)
    setLoadingAIRepair(false)
    toast.success(`✅ AI repair estimate: $${total.toLocaleString()}`)
  }

  if (!isOpen || !propertyData) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Modal - SCROLLABLE */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="modal-content-scroll relative w-full max-w-6xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-black via-gray-900 to-black border-2 border-amber-500/30 rounded-3xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-20 p-3 rounded-full bg-black/80 hover:bg-amber-500/20 border-2 border-amber-500/40 text-white transition-all hover:scale-110"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Progress Bar with Back Button */}
          <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-md border-b border-amber-500/20 px-8 py-4">
            {/* Back Button */}
            {currentStep > 1 && (
              <button
                onClick={handleGoBack}
                className="absolute left-4 top-4 p-2 rounded-full bg-black/80 hover:bg-amber-500/20 border-2 border-amber-500/40 text-amber-400 transition-all hover:scale-110 group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </button>
            )}
            
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-montserrat font-bold transition-all ${
                    currentStep >= step 
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black scale-110' 
                      : 'bg-gray-800 text-gray-500'
                  }`}>
                    {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                  </div>
                  {step < 4 && (
                    <div className={`w-16 sm:w-24 h-1 mx-2 transition-all ${
                      currentStep > step ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : 'bg-gray-800'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-3">
              <p className="text-amber-400 font-montserrat font-bold text-sm">
                {currentStep === 1 && "Property Overview"}
                {currentStep === 2 && (propertyTypeInput === 'land' ? "Estimate Land Value" : "Estimate ARV")}
                {currentStep === 3 && (propertyTypeInput === 'land' ? "Site Prep & Holding Costs" : "Estimate Repairs")}
                {currentStep === 4 && "Deal Results"}
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-10 space-y-8">
            {/* STEP 1: BIG MAP & PROPERTY DETAILS */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-fade-in">
                {/* MASSIVE MAP */}
                <div className="h-96 sm:h-[500px] rounded-2xl overflow-hidden border-2 border-amber-500/30 shadow-2xl shadow-amber-500/20">
                  <PropertyMap address={propertyData.formattedAddress} />
                </div>

                {/* PROPERTY DETAILS CARD */}
                <div className="p-8 rounded-2xl bg-gradient-to-br from-black/80 via-gray-900/80 to-black/80 border-2 border-amber-500/40 backdrop-blur-sm">
                  <h2 className="text-3xl sm:text-4xl font-montserrat font-bold text-white mb-3">
                    {propertyData.streetAddress}
                  </h2>
                  <p className="text-gray-400 font-poppins flex items-center gap-2 mb-6 text-lg">
                    <MapPin className="w-5 h-5 text-amber-400" />
                    {propertyData.city}, {propertyData.state} {propertyData.zipCode}
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {propertyData.beds && (
                      <div className="p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-2 border-amber-500/30 hover:border-amber-500/60 transition-all">
                        <p className="text-xs text-gray-400 font-poppins mb-2 uppercase tracking-wide">Bedrooms</p>
                        <p className="text-4xl font-montserrat font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                          {propertyData.beds}
                        </p>
                      </div>
                    )}
                    {propertyData.baths && (
                      <div className="p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-2 border-amber-500/30 hover:border-amber-500/60 transition-all">
                        <p className="text-xs text-gray-400 font-poppins mb-2 uppercase tracking-wide">Bathrooms</p>
                        <p className="text-4xl font-montserrat font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                          {propertyData.baths}
                        </p>
                      </div>
                    )}
                    {propertyData.sqft && (
                      <div className="p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-2 border-amber-500/30 hover:border-amber-500/60 transition-all">
                        <p className="text-xs text-gray-400 font-poppins mb-2 uppercase tracking-wide">Square Feet</p>
                        <p className="text-4xl font-montserrat font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                          {propertyData.sqft.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {propertyData.yearBuilt && (
                      <div className="p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-2 border-amber-500/30 hover:border-amber-500/60 transition-all">
                        <p className="text-xs text-gray-400 font-poppins mb-2 uppercase tracking-wide">Year Built</p>
                        <p className="text-4xl font-montserrat font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                          {propertyData.yearBuilt}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* PROPERTY TYPE SELECTOR - SHOWN TO ALL USERS */}
                <div className="space-y-6">
                  <h3 className="text-3xl font-montserrat font-bold text-white text-center">
                    What type of property is this?
                  </h3>
                  <p className="text-center text-gray-400 font-poppins text-sm">
                    Different property types use different MAO formulas
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => setPropertyTypeInput('residential')}
                      className={`group p-6 rounded-2xl border-3 text-center transition-all ${
                        propertyTypeInput === 'residential'
                          ? 'bg-gradient-to-br from-emerald-500/30 to-green-500/20 border-emerald-500 shadow-2xl shadow-emerald-500/30 scale-105'
                          : 'bg-gradient-to-br from-black/60 to-gray-900/60 border-gray-700 hover:border-emerald-500/60 hover:scale-105'
                      }`}
                    >
                      <div className="text-5xl mb-3">🏠</div>
                      <div className="text-lg font-montserrat font-bold text-white mb-1">Residential</div>
                      <div className="text-xs text-gray-400 font-poppins">70% ARV Rule</div>
                      {propertyTypeInput === 'residential' && (
                        <div className="mt-3 flex items-center justify-center text-emerald-400 font-montserrat font-bold text-sm">
                          <CheckCircle className="w-4 h-4 mr-1" /> Selected
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => setPropertyTypeInput('land')}
                      className={`group p-6 rounded-2xl border-3 text-center transition-all ${
                        propertyTypeInput === 'land'
                          ? 'bg-gradient-to-br from-amber-500/30 to-yellow-500/20 border-amber-500 shadow-2xl shadow-amber-500/30 scale-105'
                          : 'bg-gradient-to-br from-black/60 to-gray-900/60 border-gray-700 hover:border-amber-500/60 hover:scale-105'
                      }`}
                    >
                      <div className="text-5xl mb-3">🏞️</div>
                      <div className="text-lg font-montserrat font-bold text-white mb-1">Land</div>
                      <div className="text-xs text-gray-400 font-poppins">65% Land Value Rule</div>
                      {propertyTypeInput === 'land' && (
                        <div className="mt-3 flex items-center justify-center text-amber-400 font-montserrat font-bold text-sm">
                          <CheckCircle className="w-4 h-4 mr-1" /> Selected
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => setPropertyTypeInput('commercial')}
                      className={`group p-6 rounded-2xl border-3 text-center transition-all ${
                        propertyTypeInput === 'commercial'
                          ? 'bg-gradient-to-br from-blue-500/30 to-cyan-500/20 border-blue-500 shadow-2xl shadow-blue-500/30 scale-105'
                          : 'bg-gradient-to-br from-black/60 to-gray-900/60 border-gray-700 hover:border-blue-500/60 hover:scale-105'
                      }`}
                    >
                      <div className="text-5xl mb-3">🏢</div>
                      <div className="text-lg font-montserrat font-bold text-white mb-1">Commercial</div>
                      <div className="text-xs text-gray-400 font-poppins">65% ARV Rule</div>
                      {propertyTypeInput === 'commercial' && (
                        <div className="mt-3 flex items-center justify-center text-blue-400 font-montserrat font-bold text-sm">
                          <CheckCircle className="w-4 h-4 mr-1" /> Selected
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* FINANCING SELECTION */}
                <div className="space-y-6">
                  <h3 className="text-3xl font-montserrat font-bold text-white text-center">
                    What type of deal is this?
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <button
                      onClick={() => handleFinancingSelect('cash')}
                      className="group p-8 rounded-2xl border-3 text-left transition-all bg-gradient-to-br from-black/60 to-gray-900/60 border-gray-700 hover:border-amber-500 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/30"
                    >
                      <div className="text-6xl mb-4">💵</div>
                      <div className="text-2xl font-montserrat font-bold text-white mb-3">Cash Deal</div>
                      <div className="text-base text-gray-400 font-poppins leading-relaxed">
                        Fix & flip, rental property, or Section 8 investment
                      </div>
                      <div className="mt-6 flex items-center text-amber-400 font-montserrat font-bold group-hover:translate-x-2 transition-transform">
                        Select <ChevronRight className="w-5 h-5 ml-1" />
                      </div>
                    </button>

                    <button
                      onClick={() => handleFinancingSelect('creative')}
                      className="group relative p-8 rounded-2xl border-3 text-left transition-all bg-gradient-to-br from-black/60 to-gray-900/60 border-gray-700 hover:border-amber-500 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/30"
                    >
                      {/* Premium Badge (only show for free users) */}
                      {!isUnlocked && (
                        <div className="absolute -top-2 -right-2 px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs font-montserrat font-black rounded-full shadow-lg">
                          PREMIUM
                        </div>
                      )}
                      
                      <div className="text-6xl mb-4">🧠</div>
                      <div className="text-2xl font-montserrat font-bold text-white mb-3">Creative Financing</div>
                      <div className="text-base text-gray-400 font-poppins leading-relaxed">
                        Seller financing, subject-to, lease option, or owner carry
                      </div>
                      <div className="mt-6 flex items-center text-amber-400 font-montserrat font-bold group-hover:translate-x-2 transition-transform">
                        Select <ChevronRight className="w-5 h-5 ml-1" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: ARV ESTIMATION WITH CHOICE */}
            {currentStep === 2 && financing === 'cash' && (
              <div className="space-y-8 animate-fade-in">
                <div className="text-center mb-10">
                  <h3 className="text-5xl font-serif font-bold text-white mb-4">
                    How do you want to calculate ARV?
                  </h3>
                  <p className="text-xl text-gray-300 font-poppins">
                    Choose between AI calculation with comps or manual input
                  </p>
                </div>

                {/* ARV METHOD SELECTION */}
                {!arvMethod && (
                  <div className="grid sm:grid-cols-2 gap-8">
                    <button
                      onClick={() => handleARVMethodSelect('ai')}
                      disabled={loadingComps}
                      className="group relative p-10 rounded-3xl border-3 text-left transition-all bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-blue-500/20 border-blue-500/60 hover:border-blue-400 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/40 disabled:opacity-50 overflow-hidden"
                    >
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent animate-pulse"></div>
                      
                      <div className="relative z-10">
                        <div className="text-7xl mb-6">🤖</div>
                        <div className="text-3xl font-serif font-bold text-white mb-4">
                          {loadingComps ? 'Calculating...' : 'Calculate with AI'}
                        </div>
                        <div className="text-lg text-gray-300 font-poppins leading-relaxed mb-6">
                          {isUnlocked 
                            ? 'Get live comps from RentCast API with AI-powered ARV calculation'
                            : 'Get demo ARV calculation (upgrade for live comps)'
                          }
                        </div>
                        <div className="mt-8 flex items-center text-blue-400 font-montserrat font-bold text-xl group-hover:translate-x-3 transition-transform">
                          {loadingComps ? 'Loading...' : 'Use AI'} <ChevronRight className="w-6 h-6 ml-2" />
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleARVMethodSelect('manual')}
                      className="group relative p-10 rounded-3xl border-3 text-left transition-all bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-amber-500/20 border-amber-500/60 hover:border-amber-400 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/40 overflow-hidden"
                    >
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent animate-pulse"></div>
                      
                      <div className="relative z-10">
                        <div className="text-7xl mb-6">✏️</div>
                        <div className="text-3xl font-serif font-bold text-white mb-4">Enter Manually</div>
                        <div className="text-lg text-gray-300 font-poppins leading-relaxed mb-6">
                          Already know the ARV? Enter it yourself for instant calculation and faster results
                        </div>
                        <div className="mt-8 flex items-center text-amber-400 font-montserrat font-bold text-xl group-hover:translate-x-3 transition-transform">
                          Manual Input <ChevronRight className="w-6 h-6 ml-2" />
                        </div>
                      </div>
                    </button>
                  </div>
                )}

                {/* AI LOADING STATE */}
                {arvMethod === 'ai' && loadingComps && (
                  <AnalysisProgress 
                    isAnalyzing={true}
                    onComplete={() => {}}
                  />
                )}

                {/* AI RESULTS DISPLAY - SHOW EVEN IF NO COMPS */}
                {arvMethod === 'ai' && !loadingComps && arv > 0 && (
                  <div className="space-y-6">
                    {/* 🚨 CRITICAL WARNING BANNER - Show when NO real comps found */}
                    {comps.length === 0 && (
                      <div className="p-6 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 border-4 border-red-500 animate-pulse">
                        <div className="flex items-start gap-4">
                          <AlertCircle className="w-8 h-8 text-white flex-shrink-0 mt-1" />
                          <div>
                            <p className="text-xl font-montserrat font-black text-white mb-2">
                              ⚠️ ESTIMATED DATA ONLY - NOT REAL COMPS
                            </p>
                            <p className="text-base font-poppins text-white leading-relaxed">
                              <strong>RentCast API could not find comparable sales</strong> for this address. The ARV below is a <strong>generic estimate</strong> based on square footage only. <strong className="text-yellow-300">DO NOT make offers based on this number!</strong>
                            </p>
                            <p className="text-base font-poppins text-white mt-3 leading-relaxed">
                              <strong>REQUIRED ACTION:</strong> Run comps manually on <strong className="underline">Zillow.com</strong>, <strong className="underline">Realtor.com</strong>, or <strong className="underline">Redfin.com</strong> to get the real ARV before making any offers.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* ✅ DATA QUALITY BADGE - Show when real comps ARE found */}
                    {comps.length > 0 && (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 border-2 border-green-500">
                        <div className="flex items-center justify-center gap-3">
                          <CheckCircle className="w-6 h-6 text-white" />
                          <p className="text-lg font-montserrat font-bold text-white">
                            ✅ REAL DATA: {comps.length} comparable sales found via RentCast API
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* ARV Display - Show FIRST */}
                    <div className="p-10 rounded-2xl bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-blue-500/20 border-2 border-blue-500/60">
                      <div className="text-center">
                        <p className="text-lg text-gray-400 font-poppins mb-3">
                          {comps.length > 0 ? 'AI-Calculated After-Repair Value (Real Comps)' : 'Estimated After-Repair Value (Generic Estimate)'}
                        </p>
                        <p className="text-6xl sm:text-7xl font-montserrat font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                          ${arv.toLocaleString()}
                        </p>
                        {comps.length === 0 && (
                          <p className="text-sm text-gray-400 font-poppins mb-6">
                            📊 Based on property details and market data
                            {propertyTypeInput === 'land' && (
                              <div className="mt-4 p-4 bg-red-500/20 border-2 border-red-500/50 rounded-xl">
                                <p className="text-red-300 font-bold text-sm flex items-center justify-center gap-2">
                                  <AlertCircle className="w-5 h-5" />
                                  🚨 LAND DEAL WARNING
                                </p>
                                <p className="text-red-200 text-xs mt-2">
                                  No land comps found! You MUST verify land value manually. Land prices vary dramatically by location, zoning, utilities, and development potential.
                                </p>
                              </div>
                            )}
                          </p>
                        )}
                        <button
                          onClick={handleContinueToRehab}
                          className="px-10 py-5 min-h-[52px] bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-2 border-blue-400/50 rounded-xl text-white font-montserrat font-bold text-xl transition-all hover:scale-105 shadow-lg shadow-blue-500/30 touch-manipulation"
                        >
                          Continue to Repairs <ChevronRight className="w-6 h-6 inline ml-2" />
                        </button>
                      </div>
                    </div>

                    {/* Show Comps UNDER ARV if available */}
                    {comps.length > 0 && (
                      <div className="p-8 rounded-2xl bg-black border-2 border-blue-500/40">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-2xl font-montserrat font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            ✨ Recent Comps (via RentCast)
                          </h4>
                          <div className="px-4 py-2 bg-blue-500/20 border border-blue-500/40 rounded-lg">
                            <p className="text-sm font-montserrat font-bold text-blue-300">Average: ${arv.toLocaleString()}</p>
                          </div>
                        </div>

                        {/* LAND DEAL WARNING - Always show for land */}
                        {propertyTypeInput === 'land' && (
                          <div className="mb-6 p-4 bg-amber-500/20 border-2 border-amber-500/50 rounded-xl">
                            <p className="text-amber-300 font-bold text-sm flex items-center gap-2">
                              <AlertCircle className="w-5 h-5" />
                              ⚠️ VERIFY LAND VALUE CAREFULLY
                            </p>
                            <p className="text-amber-200 text-xs mt-2">
                              Land comps found, but land values vary dramatically by zoning, utilities, road access, and development potential. These factors are NOT captured in comps. ALWAYS verify with local market expertise!
                            </p>
                          </div>
                        )}

                        <div className="grid gap-4">
                          {comps.map((comp, idx) => (
                            <div key={idx} className="p-6 rounded-xl bg-black border-2 border-blue-500/30 hover:border-blue-500/60 transition-all">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <p className="text-lg font-montserrat font-bold text-white">{comp.address}</p>
                                  <div className="flex items-center gap-3 mt-1">
                                    {comp.distance !== undefined && (
                                      <p className="text-sm text-gray-400 font-poppins">
                                        📍 {comp.distance.toFixed(2)} mi
                                      </p>
                                    )}
                                    {comp.daysAgo !== undefined && comp.daysAgo < 999 && (
                                      <p className={`text-sm font-poppins ${comp.daysAgo > 120 ? 'text-orange-400' : 'text-gray-400'}`}>
                                        📅 {comp.daysAgo} days ago
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-montserrat font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                    ${comp.price.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-400 font-poppins">
                                <span>{comp.beds} bed</span>
                                <span>•</span>
                                <span>{comp.baths} bath</span>
                                <span>•</span>
                                <span>{comp.sqft.toLocaleString()} sqft</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                          <p className="text-sm text-gray-300 font-poppins leading-relaxed flex items-start gap-2">
                            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <span>These are comparable sales within 1 mile radius from the last 6 months, filtered for price range (±30%), size similarity (±30%), and statistical outliers removed. The average price is your ARV.</span>
                          </p>
                        </div>
                        
                        {/* Data Quality Warning */}
                        {comps.length > 0 && (() => {
                          const prices = comps.map(c => c.price)
                          const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
                          const minPrice = Math.min(...prices)
                          const maxPrice = Math.max(...prices)
                          const priceVariance = ((maxPrice - minPrice) / avgPrice) * 100
                          
                          // Calculate average age and distance
                          const avgDaysAgo = comps.reduce((sum, c) => sum + (c.daysAgo || 0), 0) / comps.length
                          const avgDistance = comps.reduce((sum, c) => sum + (c.distance || 0), 0) / comps.length
                          const hasOldComps = avgDaysAgo > 120
                          const hasFarComps = avgDistance > 0.75
                          
                          // Build warning messages
                          const warnings = []
                          if (comps.length < 3) {
                            warnings.push(`Limited comps (${comps.length})`)
                          }
                          if (priceVariance > 20) {
                            warnings.push(`High variance (${priceVariance.toFixed(0)}%)`)
                          }
                          if (hasOldComps) {
                            warnings.push(`Old comps (avg ${avgDaysAgo.toFixed(0)} days)`)
                          }
                          if (hasFarComps) {
                            warnings.push(`Far comps (avg ${avgDistance.toFixed(2)} mi)`)
                          }
                          
                          if (warnings.length > 0) {
                            return (
                              <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                                <p className="text-sm text-orange-300 font-poppins font-semibold flex items-start gap-2">
                                  ⚠️ <span>Quality Issues: {warnings.join(', ')}. VERIFY ARV with additional sources (Zillow, Redfin, PropStream)!</span>
                                </p>
                              </div>
                            )
                          }
                          
                          return (
                            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                              <p className="text-sm text-green-300 font-poppins font-semibold flex items-start gap-2">
                                ✅ <span>High-quality comps with low variance ({priceVariance.toFixed(0)}%). Reliable ARV estimate.</span>
                              </p>
                            </div>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {/* MANUAL ARV INPUT */}
                {arvMethod === 'manual' && (
                  <div className="space-y-8">
                    {/* Manual Comp Entry Section */}
                    <div className="p-6 rounded-2xl bg-black border-3 border-amber-500/40">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-2xl font-montserrat font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                          📊 Enter Your Own Comps
                        </h4>
                        <button
                          onClick={() => {
                            setManualComps([...manualComps, {
                              address: '',
                              price: 0,
                              beds: 0,
                              baths: 0,
                              sqft: 0
                            }])
                          }}
                          className="px-4 py-2 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-400 hover:bg-amber-500/30 transition-all font-montserrat text-sm font-bold"
                        >
                          + Add Comp
                        </button>
                      </div>

                      {manualComps.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 font-poppins">
                          <p className="mb-2">No comps added yet.</p>
                          <p className="text-sm">Add 3-5 comparable sales from Zillow, Redfin, or your MLS.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {manualComps.map((comp, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-black/60 border border-amber-500/30">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-amber-400 font-montserrat font-bold">Comp #{idx + 1}</span>
                                <button
                                  onClick={() => {
                                    const newComps = manualComps.filter((_, i) => i !== idx)
                                    setManualComps(newComps)
                                  }}
                                  className="text-red-400 hover:text-red-300 transition-all"
                                >
                                  ✕
                                </button>
                              </div>
                              
                              <div className="grid sm:grid-cols-2 gap-3">
                                <div className="sm:col-span-2">
                                  <label className="text-xs text-gray-400 font-poppins mb-1 block">Address</label>
                                  <input
                                    type="text"
                                    value={comp.address}
                                    onChange={(e) => {
                                      const newComps = [...manualComps]
                                      newComps[idx].address = e.target.value
                                      setManualComps(newComps)
                                    }}
                                    placeholder="123 Main St, City, State"
                                    className="w-full px-3 py-2 bg-black/60 border border-amber-500/30 rounded-lg text-white font-poppins text-sm focus:border-amber-400 focus:outline-none"
                                  />
                                </div>
                                
                                <div>
                                  <label className="text-xs text-gray-400 font-poppins mb-1 block">Sale Price</label>
                                  <input
                                    type="number"
                                    value={comp.price || ''}
                                    onChange={(e) => {
                                      const newComps = [...manualComps]
                                      newComps[idx].price = parseInt(e.target.value) || 0
                                      setManualComps(newComps)
                                    }}
                                    placeholder="250000"
                                    className="w-full px-3 py-2 bg-black/60 border border-amber-500/30 rounded-lg text-white font-poppins text-sm focus:border-amber-400 focus:outline-none"
                                  />
                                </div>
                                
                                <div>
                                  <label className="text-xs text-gray-400 font-poppins mb-1 block">Sqft</label>
                                  <input
                                    type="number"
                                    value={comp.sqft || ''}
                                    onChange={(e) => {
                                      const newComps = [...manualComps]
                                      newComps[idx].sqft = parseInt(e.target.value) || 0
                                      setManualComps(newComps)
                                    }}
                                    placeholder="1500"
                                    className="w-full px-3 py-2 bg-black/60 border border-amber-500/30 rounded-lg text-white font-poppins text-sm focus:border-amber-400 focus:outline-none"
                                  />
                                </div>
                                
                                <div>
                                  <label className="text-xs text-gray-400 font-poppins mb-1 block">Beds</label>
                                  <input
                                    type="number"
                                    value={comp.beds || ''}
                                    onChange={(e) => {
                                      const newComps = [...manualComps]
                                      newComps[idx].beds = parseInt(e.target.value) || 0
                                      setManualComps(newComps)
                                    }}
                                    placeholder="3"
                                    className="w-full px-3 py-2 bg-black/60 border border-amber-500/30 rounded-lg text-white font-poppins text-sm focus:border-amber-400 focus:outline-none"
                                  />
                                </div>
                                
                                <div>
                                  <label className="text-xs text-gray-400 font-poppins mb-1 block">Baths</label>
                                  <input
                                    type="number"
                                    value={comp.baths || ''}
                                    onChange={(e) => {
                                      const newComps = [...manualComps]
                                      newComps[idx].baths = parseFloat(e.target.value) || 0
                                      setManualComps(newComps)
                                    }}
                                    placeholder="2"
                                    step="0.5"
                                    className="w-full px-3 py-2 bg-black/60 border border-amber-500/30 rounded-lg text-white font-poppins text-sm focus:border-amber-400 focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Average ARV Display */}
                          {manualComps.length > 0 && manualComps.some(c => c.price > 0) && (
                            <div className="p-6 rounded-xl bg-gradient-to-br from-amber-500/20 via-yellow-500/20 to-amber-500/20 border-2 border-amber-500/60">
                              <div className="text-center">
                                <p className="text-sm text-gray-400 font-poppins mb-2">
                                  Average ARV from {manualComps.filter(c => c.price > 0).length} Comp(s)
                                </p>
                                <p className="text-5xl sm:text-6xl font-montserrat font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                                  ${Math.round(
                                    manualComps.filter(c => c.price > 0).reduce((sum, c) => sum + c.price, 0) / 
                                    manualComps.filter(c => c.price > 0).length
                                  ).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-400 font-poppins mt-2">
                                  💡 This will be used as your ARV
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Additional Inputs for Free Users */}
                    {!isUnlocked && (
                      <div className="grid sm:grid-cols-2 gap-6">
                        {/* Seller Asking Price */}
                        <div className="p-6 rounded-2xl bg-black border-3 border-blue-500/40">
                          <label className="text-xl font-montserrat font-bold text-white mb-4 block">
                            💵 Seller Asking Price
                          </label>
                          <div className="flex flex-col items-center gap-3">
                            {/* Number Display - Fixed Height */}
                            <div className="w-full text-center min-h-[60px] flex items-center justify-center">
                              <p className="text-3xl md:text-4xl font-montserrat font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent break-words">
                                ${sellerAsking.toLocaleString()}
                              </p>
                            </div>
                            {/* Buttons */}
                            <div className="flex items-center gap-2 w-full">
                              <button
                                onClick={() => setSellerAsking(prev => Math.max(0, prev - 10000))}
                                className="flex-1 px-3 py-3 bg-black border-2 border-blue-500/40 rounded-xl text-blue-400 hover:bg-blue-500/10 transition-all font-montserrat text-sm md:text-base font-bold"
                              >
                                -$10K
                              </button>
                              <button
                                onClick={() => setSellerAsking(prev => prev + 10000)}
                                className="flex-1 px-3 py-3 bg-black border-2 border-blue-500/40 rounded-xl text-blue-400 hover:bg-blue-500/10 transition-all font-montserrat text-sm md:text-base font-bold"
                              >
                                +$10K
                              </button>
                            </div>
                            <div className="flex items-center gap-2 w-full">
                              <button
                                onClick={() => setSellerAsking(prev => Math.max(0, prev - 1000))}
                                className="flex-1 px-2 py-2 bg-black/60 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-all font-montserrat text-xs md:text-sm"
                              >
                                -$1K
                              </button>
                              <button
                                onClick={() => setSellerAsking(prev => prev + 1000)}
                                className="flex-1 px-2 py-2 bg-black/60 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-all font-montserrat text-xs md:text-sm"
                              >
                                +$1K
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Property Type */}
                        <div className="p-6 rounded-2xl bg-black border-3 border-purple-500/40">
                          <label className="text-xl font-montserrat font-bold text-white mb-4 block">
                            🏠 Property Type
                          </label>
                          <div className="space-y-3">
                            {[
                              { value: 'residential', emoji: '🏡', label: 'Residential' },
                              { value: 'land', emoji: '🌳', label: 'Land' },
                              { value: 'commercial', emoji: '🏢', label: 'Commercial' }
                            ].map(type => (
                              <button
                                key={type.value}
                                onClick={() => setPropertyTypeInput(type.value)}
                                className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                                  propertyTypeInput === type.value
                                    ? 'bg-purple-500/20 border-purple-400'
                                    : 'bg-black/60 border-purple-500/30 hover:border-purple-400'
                                }`}
                              >
                                <span className="text-2xl">{type.emoji}</span>
                                <span className="text-base font-montserrat font-bold text-white">{type.label}</span>
                                {propertyTypeInput === type.value && (
                                  <CheckCircle className="w-4 h-4 text-purple-400 ml-auto" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ARV Input */}
                    <div className="relative p-12 rounded-3xl bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-amber-500/20 border-3 border-amber-500/60 backdrop-blur-sm overflow-hidden">
                      {/* Animated glow background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent animate-pulse"></div>
                      
                      <div className="relative z-10">
                        <div className="text-center mb-10">
                          <label className="text-4xl font-serif font-bold text-white mb-4 block flex items-center justify-center gap-3">
                            {propertyTypeInput === 'land' ? 'Enter Land Value' : 'Enter After-Repair Value'}
                            {propertyTypeInput !== 'land' && (
                              <TooltipHelper
                                title="After Repair Value (ARV)"
                                description="ARV is what the property will be worth after all repairs and renovations are complete. Use recent sold comps of similar fixed-up properties in the area to estimate this."
                                variant="icon"
                                position="right"
                              />
                            )}
                          </label>
                          <p className="text-lg text-gray-300 font-poppins">
                            {propertyTypeInput === 'land' 
                              ? 'Use the buttons to adjust your land value estimate' 
                              : 'Use the buttons to adjust your ARV estimate'}
                          </p>
                          
                          {/* Smart ARV Suggestion Button */}
                          {propertyData.sqft && propertyData.state && arv === 0 && (
                            <button
                              onClick={() => {
                                // Regional pricing multipliers ($/sqft)
                                const regionalPricing: { [key: string]: number } = {
                                  'CA': 350, 'NY': 280, 'WA': 260, 'CO': 250, 'MA': 270, 'OR': 240,
                                  'HI': 380, 'CT': 250, 'NJ': 260, 'RI': 240, 'MD': 230, 'NH': 220,
                                  'FL': 220, 'TX': 180, 'AZ': 200, 'NV': 210, 'NC': 180, 'GA': 170,
                                  'VA': 220, 'TN': 160, 'SC': 160, 'UT': 200, 'ID': 180, 'IL': 170,
                                  'PA': 150, 'OH': 140, 'MI': 130, 'IN': 130, 'MO': 140, 'WI': 150,
                                  'MN': 170, 'KY': 130, 'AL': 130, 'LA': 140, 'MS': 110, 'AR': 120,
                                  'OK': 120, 'KS': 130, 'NE': 130, 'IA': 120, 'WV': 100, 'NM': 150,
                                  'MT': 180, 'WY': 160, 'SD': 120, 'ND': 130, 'AK': 200, 'VT': 200,
                                  'ME': 180, 'DE': 210
                                };
                                
                                const state = propertyData.state?.toUpperCase();
                                const basePricePerSqft = state && regionalPricing[state] ? regionalPricing[state] : 180;
                                
                                // Adjust for commercial properties (65% of residential)
                                const adjustedPrice = propertyTypeInput === 'commercial' 
                                  ? basePricePerSqft * 0.65 
                                  : basePricePerSqft;
                                
                                // Calculate estimated ARV
                                const suggestedARV = Math.round((propertyData.sqft || 0) * adjustedPrice / 1000) * 1000;
                                setARV(suggestedARV);
                                
                                toast.success(`Smart suggestion applied! Based on ${propertyData.state} market data.`, {
                                  duration: 4000,
                                  icon: '🎯'
                                });
                              }}
                              className="mt-4 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-montserrat font-bold text-lg transition-all hover:scale-105 shadow-xl shadow-blue-500/30 flex items-center gap-2"
                            >
                              <Sparkles className="w-5 h-5" />
                              Get Smart ARV Suggestion
                              <span className="text-sm opacity-90 ml-1">
                                ({propertyData.state} market • {propertyData.sqft?.toLocaleString()} sqft)
                              </span>
                            </button>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-center gap-6 mb-10">
                          {/* Big display */}
                          <div className="px-12 py-8 bg-black/90 border-4 border-amber-500/80 rounded-2xl shadow-2xl shadow-amber-500/50">
                            <p className="text-7xl sm:text-8xl font-montserrat font-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 bg-clip-text text-transparent animate-pulse">
                              ${arv.toLocaleString()}
                            </p>
                          </div>

                          {/* Large buttons */}
                          <div className="flex items-center gap-6">
                            <button
                              onClick={() => setARV(prev => Math.max(0, prev - 10000))}
                              className="px-10 py-5 bg-gradient-to-br from-black to-gray-900 border-4 border-amber-500/60 rounded-2xl text-amber-400 hover:bg-amber-500/20 hover:scale-110 hover:border-amber-400 transition-all font-montserrat text-3xl font-black shadow-xl hover:shadow-amber-500/50"
                            >
                              -$10K
                            </button>
                            
                            <button
                              onClick={() => setARV(prev => prev + 10000)}
                              className="px-10 py-5 bg-gradient-to-br from-black to-gray-900 border-4 border-amber-500/60 rounded-2xl text-amber-400 hover:bg-amber-500/20 hover:scale-110 hover:border-amber-400 transition-all font-montserrat text-3xl font-black shadow-xl hover:shadow-amber-500/50"
                            >
                              +$10K
                            </button>
                          </div>

                          {/* Small buttons */}
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => setARV(prev => Math.max(0, prev - 1000))}
                              className="px-8 py-4 bg-black/80 border-2 border-amber-500/40 rounded-xl text-amber-400 hover:bg-amber-500/10 hover:scale-105 transition-all font-montserrat text-xl font-bold"
                            >
                              -$1K
                            </button>
                            <button
                              onClick={() => setARV(prev => prev + 1000)}
                              className="px-8 py-4 bg-black/80 border-2 border-amber-500/40 rounded-xl text-amber-400 hover:bg-amber-500/10 hover:scale-105 transition-all font-montserrat text-xl font-bold"
                            >
                              +$1K
                            </button>
                          </div>
                        </div>

                        {arv > 0 && (
                          <div className="text-center">
                            <button
                              onClick={handleContinueToRehab}
                              className="px-14 py-6 min-h-[52px] bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:via-yellow-400 hover:to-amber-400 border-3 border-yellow-400/50 rounded-2xl text-black font-montserrat font-black text-2xl transition-all hover:scale-105 shadow-2xl shadow-amber-500/60 touch-manipulation"
                            >
                              Continue to Repairs <ChevronRight className="w-7 h-7 inline ml-2" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: SMART REPAIR COST SYSTEM */}
            {currentStep === 3 && financing === 'cash' && (
              <div className="space-y-8 animate-fade-in">
                <div className="text-center mb-8">
                  <h3 className="text-4xl font-montserrat font-bold text-white mb-3">
                    {propertyTypeInput === 'land' ? '🌳 Site Prep & Holding Costs' : '💰 Smart Repair Cost System'}
                  </h3>
                  <p className="text-gray-400 font-poppins text-lg">
                    {propertyTypeInput === 'land' 
                      ? 'Estimate costs for clearing, utilities, holding costs, and site preparation' 
                      : 'Choose your method: Click to select repairs or describe them to AI'}
                  </p>
                </div>

                {/* METHOD SELECTION - Only show if no method selected yet */}
                {!repairMode && (
                  <div className="grid sm:grid-cols-2 gap-6">
                    <button
                      onClick={() => setRepairMode('checklist')}
                      className="group relative p-12 rounded-3xl border-3 text-center transition-all bg-gradient-to-br from-emerald-500/20 via-green-500/10 to-emerald-500/20 border-emerald-500/60 hover:border-emerald-400 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/50 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent animate-pulse"></div>
                      
                      <div className="relative z-10">
                        <div className="text-7xl mb-6">✅</div>
                        <div className="text-3xl font-serif font-bold text-white mb-4">
                          Checklist Method
                        </div>
                        <div className="text-lg text-gray-300 font-poppins mb-6">
                          Click specific repairs to add them up
                        </div>
                        <div className="flex items-center justify-center text-emerald-400 font-montserrat font-bold text-xl group-hover:translate-y-2 transition-transform">
                          Select Repairs <ChevronRight className="w-6 h-6 ml-2" />
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        if (!isUnlocked) {
                          setShowPremiumModal(true)
                          return
                        }
                        setRepairMode('ai')
                      }}
                      className="group relative p-12 rounded-3xl border-3 text-center transition-all bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-amber-500/20 border-amber-500/60 hover:border-amber-400 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/50 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent animate-pulse"></div>
                      
                      <div className="relative z-10">
                        <div className="text-7xl mb-6">🤖</div>
                        <div className="text-3xl font-serif font-bold text-white mb-4">
                          AI Text Input {!isUnlocked && <Lock className="w-6 h-6 inline ml-2 text-amber-400" />}
                        </div>
                        <div className="text-lg text-gray-300 font-poppins mb-6">
                          Describe repairs in plain English
                        </div>
                        <div className="flex items-center justify-center text-amber-400 font-montserrat font-bold text-xl group-hover:translate-y-2 transition-transform">
                          Use AI {!isUnlocked && '(Premium)'} <Sparkles className="w-6 h-6 ml-2" />
                        </div>
                      </div>
                    </button>
                  </div>
                )}

                {/* CHECKLIST MODE UI */}
                {repairMode === 'checklist' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-2xl font-montserrat font-bold text-white">Select Needed Repairs</h4>
                      <button
                        onClick={() => {
                          setRepairMode(null)
                          setSelectedRepairs({})
                          setRepairs(0)
                        }}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 font-montserrat text-sm transition-all"
                      >
                        ← Change Method
                      </button>
                    </div>

                    {/* Quick $0 / No Repairs Option */}
                    <div className="mb-6">
                      <button
                        onClick={() => {
                          setSelectedRepairs({})
                          setRepairs(0)
                          setRepairsConfirmed(true) // Mark repairs as confirmed
                          setRepairMode(null)
                          toast.success('✅ No repairs needed - confirmed!')
                        }}
                        className="w-full p-6 rounded-xl border-2 border-amber-500/50 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 hover:from-amber-500/20 hover:to-yellow-500/20 transition-all group"
                      >
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-4xl">🎯</span>
                          <div className="text-left">
                            <div className="text-xl font-montserrat font-bold text-white mb-1">
                              $0 / No {propertyTypeInput === 'land' ? 'Site Prep' : 'Repairs'} Needed
                            </div>
                            <div className="text-sm text-gray-400 font-poppins">
                              Property is {propertyTypeInput === 'land' ? 'ready to sell' : 'move-in ready'} • Click to skip this step
                            </div>
                          </div>
                          <ArrowRight className="w-6 h-6 text-amber-400 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </button>
                    </div>

                    <div className="text-center mb-4">
                      <div className="text-sm text-gray-400 font-poppins">OR select specific {propertyTypeInput === 'land' ? 'site prep costs' : 'repairs'} below:</div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {Object.entries(repairCosts).map(([key, { label, min, max }]) => (
                        <button
                          key={key}
                          onClick={() => handleToggleRepair(key)}
                          className={`p-6 rounded-xl border-2 text-left transition-all ${
                            selectedRepairs[key]
                              ? 'bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/30'
                              : 'bg-black/60 border-gray-700 hover:border-emerald-500/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-lg font-montserrat font-bold text-white">{label}</span>
                            {selectedRepairs[key] && (
                              <CheckCircle className="w-6 h-6 text-emerald-400" />
                            )}
                          </div>
                          <div className="text-sm text-gray-400 font-poppins">
                            ${min.toLocaleString()} - ${max.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 font-poppins mt-1">
                            Avg: ${((min + max) / 2).toLocaleString()}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="text-center">
                      <button
                        onClick={handleCalculateChecklist}
                        className="px-12 py-6 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 border-2 border-emerald-400/50 rounded-xl text-white font-montserrat font-bold text-xl transition-all hover:scale-105 shadow-lg shadow-emerald-500/30"
                      >
                        Calculate Total
                      </button>
                    </div>
                  </div>
                )}

                {/* AI MODE UI */}
                {repairMode === 'ai' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-2xl font-montserrat font-bold text-white">
                        🤖 AI {propertyTypeInput === 'land' ? 'Site Prep' : 'Repair'} Analysis
                      </h4>
                      <button
                        onClick={() => {
                          setRepairMode(null)
                          setAiRepairInput('')
                          setAiRepairResult('')
                          setRepairs(0)
                        }}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 font-montserrat text-sm transition-all"
                      >
                        ← Change Method
                      </button>
                    </div>

                    {/* Quick $0 / No Repairs Option */}
                    <div className="mb-6">
                      <button
                        onClick={() => {
                          setAiRepairInput('')
                          setAiRepairResult('')
                          setRepairs(0)
                          setRepairsConfirmed(true) // Mark repairs as confirmed
                          setRepairMode(null)
                          toast.success('✅ No repairs needed - confirmed!')
                        }}
                        className="w-full p-6 rounded-xl border-2 border-amber-500/50 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 hover:from-amber-500/20 hover:to-yellow-500/20 transition-all group"
                      >
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-4xl">🎯</span>
                          <div className="text-left">
                            <div className="text-xl font-montserrat font-bold text-white mb-1">
                              $0 / No {propertyTypeInput === 'land' ? 'Site Prep' : 'Repairs'} Needed
                            </div>
                            <div className="text-sm text-gray-400 font-poppins">
                              Property is {propertyTypeInput === 'land' ? 'ready to sell' : 'move-in ready'} • Click to skip this step
                            </div>
                          </div>
                          <ArrowRight className="w-6 h-6 text-amber-400 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </button>
                    </div>

                    <div className="text-center mb-4">
                      <div className="text-sm text-gray-400 font-poppins">OR describe specific {propertyTypeInput === 'land' ? 'site prep work' : 'repairs'} needed:</div>
                    </div>

                    <div className="p-6 rounded-xl bg-black/60 border-2 border-amber-500/40">
                      <label className="block text-sm text-amber-300 font-montserrat font-bold mb-3">
                        Describe what {propertyTypeInput === 'land' ? 'site prep work is' : 'repairs are'} needed:
                      </label>
                      <textarea
                        value={aiRepairInput}
                        onChange={(e) => setAiRepairInput(e.target.value)}
                        placeholder={
                          propertyTypeInput === 'land' 
                            ? "e.g., 'Needs land clearing, grading, survey, utility hookup to the road'"
                            : "e.g., 'Needs new roof, kitchen remodel, HVAC replacement, flooring throughout'"
                        }
                        className="w-full px-4 py-3 bg-black/80 border-2 border-gray-700 focus:border-amber-500 rounded-lg text-white font-poppins placeholder-gray-500 resize-none transition-all"
                        rows={4}
                      />
                    </div>

                    <div className="text-center">
                      <button
                        onClick={handleAIRepairAnalysis}
                        disabled={loadingAIRepair}
                        className="px-12 py-6 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 border-2 border-amber-400/50 rounded-xl text-black font-montserrat font-bold text-xl transition-all hover:scale-105 shadow-lg shadow-amber-500/30 disabled:opacity-50"
                      >
                        {loadingAIRepair ? (
                          <>
                            <span className="inline-block animate-spin mr-2">⚡</span>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            🤖 Analyze with AI
                          </>
                        )}
                      </button>
                    </div>

                    {aiRepairResult && (
                      <div className="p-6 rounded-xl bg-amber-500/10 border-2 border-amber-500/40">
                        <h5 className="text-lg font-montserrat font-bold text-amber-300 mb-3">AI Analysis Result:</h5>
                        <div className="text-sm text-gray-300 font-poppins whitespace-pre-line">
                          {aiRepairResult}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* SHOW RESULTS AFTER CALCULATION */}
                {repairs > 0 && (
                  <div className="space-y-6">
                    <div className="p-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-emerald-500/20 border-2 border-emerald-500/60">
                      <div className="text-center">
                        <p className="text-lg text-gray-400 font-poppins mb-3 flex items-center justify-center gap-2">
                          {propertyTypeInput === 'land' ? 'Total Site Prep & Holding Costs' : 'Total Repair Estimate'}
                          {propertyTypeInput !== 'land' && (
                            <TooltipHelper
                              title="Rehab Costs"
                              description="Rehab costs include all repairs, renovations, and improvements needed to bring the property to retail condition. Get contractor quotes or use the $30-50/sqft rule for full gut rehabs, $15-25/sqft for moderate updates."
                              tips={["Always add a 10-20% buffer for unexpected costs!", "Get at least 3 contractor quotes for accuracy", "Include permits and inspection costs"]}
                              variant="icon"
                              position="right"
                            />
                          )}
                        </p>
                        <p className="text-6xl sm:text-7xl font-montserrat font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent mb-2">
                          ${repairs.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* ASSIGNMENT FEE INPUT */}
                    <div className="p-8 rounded-2xl bg-black border-2 border-amber-500/60">
                      <div className="max-w-md mx-auto">
                        <label className="block text-center mb-4">
                          <span className="text-lg text-amber-300 font-montserrat font-bold mb-2 block flex items-center justify-center gap-2">
                            💰 Your Assignment Fee
                            <TooltipHelper
                              title="Assignment Fee"
                              description="Your assignment fee is your wholesale profit. This is how much you'll make when you flip the contract to a cash buyer. Typical range: $5K-$50K depending on deal size and market."
                              tips={["Smaller deals: $5K-$15K is reasonable", "Mid-sized deals: $10K-$25K is common", "Larger deals: $20K-$50K+ is possible"]}
                              variant="icon"
                              position="top"
                            />
                          </span>
                          <span className="text-sm text-gray-400 font-poppins block">
                            How much you'll make when you assign this deal
                          </span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-montserrat font-bold text-amber-400">$</span>
                          <input
                            type="number"
                            value={assignmentFee}
                            onChange={(e) => setAssignmentFee(parseInt(e.target.value) || 0)}
                            className="w-full pl-12 pr-4 py-4 bg-black/80 border-2 border-amber-500/50 focus:border-amber-400 rounded-xl text-3xl font-montserrat font-bold text-white text-center transition-all"
                            placeholder="20000"
                          />
                        </div>
                        <div className="flex gap-2 justify-center mt-4">
                          {[10000, 15000, 20000, 25000].map((amount) => (
                            <button
                              key={amount}
                              onClick={() => setAssignmentFee(amount)}
                              className={`px-4 py-2 rounded-lg border-2 font-montserrat font-bold text-sm transition-all ${
                                assignmentFee === amount
                                  ? 'bg-amber-500 border-amber-400 text-black'
                                  : 'bg-black/60 border-amber-500/30 text-amber-300 hover:border-amber-400'
                              }`}
                            >
                              ${(amount / 1000)}K
                            </button>
                          ))}
                        </div>

                        {/* Assignment Fee Confirmation Button */}
                        <div className="mt-6">
                          <button
                            onClick={() => {
                              setAssignmentFeeConfirmed(true)
                              toast.success('✅ Assignment fee confirmed!')
                            }}
                            className={`w-full px-6 py-4 rounded-xl border-2 font-montserrat font-bold transition-all flex items-center justify-center gap-3 ${
                              assignmentFeeConfirmed
                                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                                : 'bg-amber-500/10 border-amber-500/50 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400'
                            }`}
                            disabled={assignmentFeeConfirmed}
                          >
                            {assignmentFeeConfirmed ? (
                              <>
                                <Check className="w-5 h-5" />
                                <span>Assignment Fee Confirmed</span>
                              </>
                            ) : (
                              <>
                                <span>Confirm Assignment Fee: ${assignmentFee.toLocaleString()}</span>
                                <ArrowRight className="w-5 h-5" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* SELLER ASKING PRICE INPUT */}
                    <div className="p-8 rounded-2xl bg-black border-2 border-blue-500/60">
                      <div className="max-w-md mx-auto">
                        <label className="block text-center mb-4">
                          <span className="text-lg text-blue-300 font-montserrat font-bold mb-2 block">💵 Seller Asking Price</span>
                          <span className="text-sm text-gray-400 font-poppins block">
                            What is the seller currently asking for the property?
                          </span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-montserrat font-bold text-blue-400">$</span>
                          <input
                            type="number"
                            value={sellerAsking}
                            onChange={(e) => setSellerAsking(parseInt(e.target.value) || 0)}
                            className="w-full pl-12 pr-4 py-4 bg-black/80 border-2 border-blue-500/50 focus:border-blue-400 rounded-xl text-3xl font-montserrat font-bold text-white text-center transition-all"
                            placeholder="Enter asking price"
                          />
                        </div>
                        <div className="flex gap-2 justify-center mt-4 flex-wrap">
                          <button
                            onClick={() => setSellerAsking(prev => Math.max(0, prev - 10000))}
                            className="px-4 py-2 rounded-lg border-2 bg-black/60 border-blue-500/30 text-blue-300 hover:border-blue-400 font-montserrat font-bold text-sm transition-all"
                          >
                            -$10K
                          </button>
                          <button
                            onClick={() => setSellerAsking(prev => Math.max(0, prev - 1000))}
                            className="px-4 py-2 rounded-lg border-2 bg-black/60 border-blue-500/30 text-blue-300 hover:border-blue-400 font-montserrat font-bold text-sm transition-all"
                          >
                            -$1K
                          </button>
                          <button
                            onClick={() => setSellerAsking(prev => prev + 1000)}
                            className="px-4 py-2 rounded-lg border-2 bg-black/60 border-blue-500/30 text-blue-300 hover:border-blue-400 font-montserrat font-bold text-sm transition-all"
                          >
                            +$1K
                          </button>
                          <button
                            onClick={() => setSellerAsking(prev => prev + 10000)}
                            className="px-4 py-2 rounded-lg border-2 bg-black/60 border-blue-500/30 text-blue-300 hover:border-blue-400 font-montserrat font-bold text-sm transition-all"
                          >
                            +$10K
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <button
                        onClick={handleCalculate}
                        disabled={!sellerAsking}
                        className="px-10 py-5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 border-2 border-emerald-400/50 rounded-xl text-white font-montserrat font-bold text-xl transition-all hover:scale-105 shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        Calculate Deal <ChevronRight className="w-6 h-6 inline ml-2" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                {/* CRITICAL WARNING: Unrealistic MAO Detection */}
                {isUnrealisticMAO && (
                  <div className="p-6 rounded-xl bg-black border-2 border-red-500/60">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                        <span className="text-xl">⚠️</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-montserrat font-bold text-red-400 mb-2">
                          ARV May Be Inaccurate
                        </h4>
                        <p className="text-sm text-gray-300 font-poppins mb-3 leading-relaxed">
                          The calculated MAO (${mao.toLocaleString()}) is ${(mao - sellerAsking).toLocaleString()} over the asking price. This suggests the ARV estimate may need verification.
                        </p>
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-lg text-sm font-montserrat font-bold text-red-300 transition-all"
                        >
                          ← Adjust ARV
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Best Practice Reminder */}
                {!isUnrealisticMAO && !isSuspiciouslyGoodDeal && (
                  <div className="p-4 rounded-xl bg-black border border-blue-500/30">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-300 font-poppins leading-relaxed">
                          <span className="font-bold text-blue-300">Best Practice:</span> Always verify comps manually on Zillow, Redfin, or PropStream before making an offer. Our estimates are solid, but real estate is hyper-local.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="relative text-center mb-6">
                  {/* Edit Button - Top Right */}
                  <button
                    onClick={handleOpenEditPanel}
                    className="absolute top-0 right-0 px-4 py-2 rounded-xl border-2 border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 hover:border-amber-400 transition-all flex items-center gap-2 text-amber-300 font-montserrat font-bold text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit Inputs</span>
                  </button>

                  <div className="inline-flex items-center gap-2 mb-3 px-5 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-montserrat font-bold text-emerald-300">Analysis Complete</span>
                  </div>
                  <h3 className="text-3xl font-serif font-bold text-white mb-2">
                    Deal Snapshot
                  </h3>
                  <p className="text-base text-gray-400 font-poppins">
                    {propertyData.streetAddress}
                  </p>
                </div>

                {/* 1. DEAL SNAPSHOT - 4 CLEAN CARDS */}
                {financing === 'cash' && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* ARV Card */}
                    <div className="p-5 rounded-xl bg-black border-2 border-blue-500/40 hover:border-blue-500/60 transition-all">
                      <div className="flex items-center gap-2 mb-3">
                        <Home className="w-5 h-5 text-blue-400" />
                        <p className="text-xs text-blue-300 font-montserrat font-bold uppercase tracking-wide">
                          {propertyTypeInput === 'land' ? 'Land Value' : 'After-Repair Value'}
                        </p>
                      </div>
                      <p className="text-3xl font-montserrat font-black text-white mb-2">
                        ${arv.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 font-poppins">
                        {isUnlocked ? 'Live comps' : 'Estimated'}
                      </p>
                    </div>

                    {/* Recommended Offer Card */}
                    <div className="p-5 rounded-xl bg-black border-2 border-amber-500/40 hover:border-amber-500/60 transition-all">
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="w-5 h-5 text-amber-400" />
                        <p className="text-xs text-amber-300 font-montserrat font-bold uppercase tracking-wide">Recommended Offer</p>
                      </div>
                      <p className="text-3xl font-montserrat font-black text-white mb-2">
                        ${mao.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 font-poppins">
                        {propertyTypeInput === 'land' ? '65% rule' : '70% rule'}
                      </p>
                    </div>

                    {/* Repair Budget Card */}
                    {repairs > 0 && (
                      <div className="p-5 rounded-xl bg-black border-2 border-emerald-500/40 hover:border-emerald-500/60 transition-all">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xl">{propertyTypeInput === 'land' ? '🌳' : '🔧'}</span>
                          <p className="text-xs text-emerald-300 font-montserrat font-bold uppercase tracking-wide">
                            {propertyTypeInput === 'land' ? 'Site Prep' : 'Repair Budget'}
                          </p>
                        </div>
                        <p className="text-3xl font-montserrat font-black text-white mb-2">
                          ${repairs.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400 font-poppins">Total costs</p>
                      </div>
                    )}

                    {/* Deal Quality Card */}
                    <div className={`p-5 rounded-xl bg-black border-2 transition-all ${
                      profit >= 30000 ? 'border-emerald-500/40 hover:border-emerald-500/60' :
                      profit >= 20000 ? 'border-blue-500/40 hover:border-blue-500/60' :
                      profit >= 10000 ? 'border-amber-500/40 hover:border-amber-500/60' :
                      'border-red-500/40 hover:border-red-500/60'
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        <Star className={`w-5 h-5 ${
                          profit >= 30000 ? 'text-emerald-400' :
                          profit >= 20000 ? 'text-blue-400' :
                          profit >= 10000 ? 'text-amber-400' :
                          'text-red-400'
                        }`} />
                        <p className="text-xs text-gray-300 font-montserrat font-bold uppercase tracking-wide">Deal Quality</p>
                      </div>
                      <p className={`text-2xl font-montserrat font-black mb-2 ${
                        profit >= 30000 ? 'text-emerald-400' :
                        profit >= 20000 ? 'text-blue-400' :
                        profit >= 10000 ? 'text-amber-400' :
                        'text-red-400'
                      }`}>
                        {profit >= 30000 ? 'Strong' :
                         profit >= 20000 ? 'Solid' :
                         profit >= 10000 ? 'Thin' :
                         'Risky'}
                      </p>
                      <p className="text-xs text-gray-400 font-poppins">
                        ${Math.abs(mao - sellerAsking).toLocaleString()} {mao >= sellerAsking ? 'room' : 'gap'}
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. BUYER DEMAND SECTION - SINGLE PREMIUM CARD */}
                <div className="relative p-6 rounded-xl bg-black border-2 border-amber-500/40 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-6 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-amber-500/20">
                            <Users className="w-6 h-6 text-amber-400" />
                          </div>
                          <div>
                            <h4 className="text-xl font-serif font-bold text-white">Market Intelligence</h4>
                            <p className="text-sm text-gray-400 font-poppins">Buyer demand for this property</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-montserrat font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                            {interestedBuyers}
                          </span>
                          <span className="text-lg text-gray-400 font-poppins">/ 10,000+</span>
                        </div>
                        <p className="text-xs text-gray-400 font-poppins mt-1">Verified cash buyers actively purchasing deals like this</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div className="p-3 rounded-lg bg-black/60 border border-amber-500/30">
                        <p className="text-xs font-montserrat text-amber-300 mb-1">Avg Response</p>
                        <p className="text-lg font-montserrat font-bold text-white">24-48h</p>
                      </div>
                      <div className="p-3 rounded-lg bg-black/60 border border-emerald-500/30">
                        <p className="text-xs font-montserrat text-emerald-300 mb-1">Success Rate</p>
                        <p className="text-lg font-montserrat font-bold text-white">87%</p>
                      </div>
                      <div className="p-3 rounded-lg bg-black/60 border border-blue-500/30">
                        <p className="text-xs font-montserrat text-blue-300 mb-1">Database</p>
                        <p className="text-lg font-montserrat font-bold text-white">10K+</p>
                      </div>
                      <div className="p-3 rounded-lg bg-black/60 border border-purple-500/30">
                        <p className="text-xs font-montserrat text-purple-300 mb-1">Markets</p>
                        <p className="text-lg font-montserrat font-bold text-white">17</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. TABBED SECTION */}
                {financing === 'cash' && arv > 0 && (
                  <div className="p-6 rounded-xl bg-black border-2 border-gray-700/50">
                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 border-b border-gray-700">
                      <button
                        onClick={() => setActiveTab('breakdown')}
                        className={`px-5 py-3 font-montserrat font-bold text-sm transition-all border-b-2 ${
                          activeTab === 'breakdown'
                            ? 'border-amber-500 text-amber-400'
                            : 'border-transparent text-gray-400 hover:text-gray-300'
                        }`}
                      >
                        Breakdown
                      </button>
                      {mao > 0 && (
                        <button
                          onClick={() => setActiveTab('offers')}
                          className={`px-5 py-3 font-montserrat font-bold text-sm transition-all border-b-2 ${
                            activeTab === 'offers'
                              ? 'border-amber-500 text-amber-400'
                              : 'border-transparent text-gray-400 hover:text-gray-300'
                          }`}
                        >
                          Offer Strategies
                        </button>
                      )}
                      {comps.length > 0 && (
                        <button
                          onClick={() => setActiveTab('comps')}
                          className={`px-5 py-3 font-montserrat font-bold text-sm transition-all border-b-2 ${
                            activeTab === 'comps'
                              ? 'border-amber-500 text-amber-400'
                              : 'border-transparent text-gray-400 hover:text-gray-300'
                          }`}
                        >
                          Comps
                        </button>
                      )}
                    </div>

                    {/* Breakdown Tab */}
                    {activeTab === 'breakdown' && sellerAsking > 0 && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-lg font-serif font-bold text-white mb-3">Deal Math</h4>
                          <p className="text-sm text-gray-300 font-poppins mb-4 leading-relaxed">
                            Your <span className="text-amber-400 font-bold">Maximum Allowable Offer (MAO)</span> is the highest you can pay and still leave room for your buyer's profit and your assignment fee.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                            <span className="text-sm text-gray-300 font-poppins">
                              {propertyTypeInput === 'land' ? 'Land Value:' : 'After-Repair Value:'}
                            </span>
                            <span className="text-base font-montserrat font-bold text-white">${arv.toLocaleString()}</span>
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                            <span className="text-sm text-gray-300 font-poppins">
                              × {propertyTypeInput === 'land' ? '65%' : '70%'} (Buy Target):
                            </span>
                            <span className="text-base font-montserrat font-bold text-amber-400">
                              ${Math.round(arv * (propertyTypeInput === 'land' ? 0.65 : 0.7)).toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                            <span className="text-sm text-gray-300 font-poppins">
                              − {propertyTypeInput === 'land' ? 'Site Prep:' : 'Repairs:'}
                            </span>
                            <span className="text-base font-montserrat font-bold text-red-400">−${repairs.toLocaleString()}</span>
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                            <span className="text-sm text-gray-300 font-poppins">− Assignment Fee:</span>
                            <span className="text-base font-montserrat font-bold text-purple-400">−${assignmentFee.toLocaleString()}</span>
                          </div>

                          <div className="border-t border-gray-700 my-3"></div>

                          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-2 border-amber-500/40">
                            <span className="text-sm font-bold text-amber-300 uppercase tracking-wide">= Your Max Offer:</span>
                            <span className="text-xl font-montserrat font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                              ${mao.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/60 border border-gray-600">
                            <span className="text-sm text-gray-300 font-poppins">Seller Asking:</span>
                            <span className="text-base font-montserrat font-bold text-white">${sellerAsking.toLocaleString()}</span>
                          </div>

                          <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                            mao >= sellerAsking 
                              ? 'bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/40' 
                              : 'bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/40'
                          }`}>
                            <div>
                              <span className={`text-sm font-bold uppercase block mb-1 ${
                                mao >= sellerAsking ? 'text-emerald-400' : 'text-red-400'
                              }`}>
                                {mao >= sellerAsking ? '✓ Deal Spread' : '✗ Over MAO'}
                              </span>
                              <span className="text-xs text-gray-400 font-poppins">
                                {mao >= sellerAsking 
                                  ? 'Negotiation room available' 
                                  : 'Must negotiate down'}
                              </span>
                            </div>
                            <span className={`text-xl font-montserrat font-black ${
                              mao >= sellerAsking ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                              {mao >= sellerAsking ? '+' : ''}${(mao - sellerAsking).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Offer Strategies Tab */}
                    {activeTab === 'offers' && mao > 0 && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-lg font-serif font-bold text-white mb-2">Three Proven Approaches</h4>
                          <p className="text-sm text-gray-400 font-poppins leading-relaxed">
                            These are <span className="text-amber-400 font-semibold">buy prices</span>, not property values. Choose based on your deal goals and seller motivation.
                          </p>
                        </div>

                        <div className="space-y-3">
                          {/* Conservative */}
                          <div className="p-4 rounded-lg bg-black/60 border-2 border-red-500/30 hover:border-red-500/50 transition-all">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="px-2 py-1 bg-red-500/20 border border-red-500/40 rounded text-xs font-montserrat font-bold text-red-300 uppercase">
                                  Conservative
                                </div>
                                <span className="text-xs font-montserrat text-gray-400">
                                  {propertyTypeInput === 'land' ? '10% land' : '60% ARV'}
                                </span>
                              </div>
                              <span className="text-2xl font-montserrat font-black bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                                ${Math.round(arv * (propertyTypeInput === 'land' ? 0.10 : 0.6) - repairs - assignmentFee).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 font-poppins">Maximum profit, ~15% acceptance rate</p>
                          </div>

                          {/* Competitive */}
                          <div className="p-4 rounded-lg bg-black/60 border-2 border-amber-500/50 hover:border-amber-500/70 transition-all ring-2 ring-amber-500/20">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="px-2 py-1 bg-amber-500/20 border border-amber-500/40 rounded text-xs font-montserrat font-bold text-amber-300 uppercase">
                                  Competitive ⭐
                                </div>
                                <span className="text-xs font-montserrat text-gray-400">
                                  {propertyTypeInput === 'land' ? '65% land' : '70% ARV'}
                                </span>
                              </div>
                              <span className="text-2xl font-montserrat font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                                ${mao.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 font-poppins">Balanced approach, ~40% acceptance rate (Recommended)</p>
                          </div>

                          {/* Aggressive */}
                          <div className="p-4 rounded-lg bg-black/60 border-2 border-emerald-500/30 hover:border-emerald-500/50 transition-all">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded text-xs font-montserrat font-bold text-emerald-300 uppercase">
                                  Aggressive
                                </div>
                                <span className="text-xs font-montserrat text-gray-400">
                                  {propertyTypeInput === 'land' ? '18% land' : '75% ARV'}
                                </span>
                              </div>
                              <span className="text-2xl font-montserrat font-black bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                                ${Math.round(arv * (propertyTypeInput === 'land' ? 0.18 : 0.75) - repairs - assignmentFee).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 font-poppins">Quick close, ~70% acceptance rate</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Comps Tab */}
                    {activeTab === 'comps' && comps.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-serif font-bold text-white">Recent Sales</h4>
                          <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/40 rounded-lg">
                            <p className="text-xs font-montserrat font-bold text-blue-300">Avg: ${arv.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {comps.slice(0, 5).map((comp, idx) => (
                            <div key={idx} className="p-4 rounded-lg bg-black/60 border border-blue-500/30 hover:border-blue-500/50 transition-all">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <p className="text-sm font-montserrat font-bold text-white mb-1">{comp.address}</p>
                                  <div className="flex items-center gap-3 text-xs text-gray-400 font-poppins">
                                    {comp.distance !== undefined && (
                                      <span>📍 {comp.distance.toFixed(2)} mi</span>
                                    )}
                                    {comp.daysAgo !== undefined && comp.daysAgo < 999 && (
                                      <span className={comp.daysAgo > 120 ? 'text-orange-400' : ''}>
                                        📅 {comp.daysAgo}d ago
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="text-lg font-montserrat font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap ml-4">
                                  ${comp.price.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-400 font-poppins">
                                <span>{comp.beds} bed</span>
                                <span>•</span>
                                <span>{comp.baths} bath</span>
                                <span>•</span>
                                <span>{comp.sqft.toLocaleString()} sqft</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                          <p className="text-xs text-gray-300 font-poppins leading-relaxed flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                            <span>Comparable sales within 1 mile from the last 6 months, filtered and averaged.</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. DEAL BREAKDOWN EXPLAINED - OPTIONAL */}
                {financing === 'cash' && arv > 0 && sellerAsking > 0 && mao > 0 && (
                  <div>
                    {!showAIExplanation ? (
                      <button
                        onClick={() => setShowAIExplanation(true)}
                        className="w-full px-6 py-4 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 border-2 border-purple-500/40 hover:border-purple-500/60 rounded-xl text-white font-montserrat font-bold text-base transition-all flex items-center justify-center gap-3"
                      >
                        <Sparkles className="w-5 h-5" />
                        <span>Deal Breakdown Explained</span>
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    ) : (
                      <div className="p-6 rounded-xl bg-black border-2 border-purple-500/40">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-xl font-serif font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                            Deal Breakdown Explained
                          </h4>
                          <button
                            onClick={() => setShowAIExplanation(false)}
                            className="p-2 hover:bg-purple-500/20 rounded-lg transition-all"
                          >
                            <X className="w-5 h-5 text-gray-400" />
                          </button>
                        </div>

                        <div className="space-y-5">
                          {/* Scenario Analysis */}
                          <div>
                            <h5 className="text-base font-montserrat font-bold text-purple-300 mb-3">Deal Quality Analysis</h5>
                            
                            {/* At Asking Price */}
                            <div className="mb-4 p-4 rounded-lg bg-blue-500/5 border border-blue-500/30">
                              <h6 className="text-sm font-montserrat font-bold text-blue-300 mb-2">
                                At Asking Price (${sellerAsking.toLocaleString()})
                              </h6>
                              <div className="space-y-2 text-sm text-gray-300 font-poppins">
                                <div className="flex items-center justify-between p-2 bg-black/40 rounded">
                                  <span>Deal Spread:</span>
                                  <span className={`font-montserrat font-bold ${qualityAtAsking.color === 'emerald' ? 'text-emerald-400' : qualityAtAsking.color === 'amber' ? 'text-amber-400' : 'text-red-400'}`}>
                                    ${spreadAtAsking.toLocaleString()}
                                  </span>
                                </div>
                                <p className="leading-relaxed">
                                  {qualityAtAsking.grade === 'SOLID' ? (
                                    <><span className="text-emerald-400 font-bold">✓ This works at asking.</span> Good equity for your buyer.</>
                                  ) : qualityAtAsking.grade === 'THIN' ? (
                                    <><span className="text-amber-400 font-bold">⚠ Margins are thin.</span> Consider negotiating down.</>
                                  ) : (
                                    <><span className="text-red-400 font-bold">✗ Doesn't work at asking.</span> Must negotiate significantly.</>
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* At Your Offer */}
                            <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/30">
                              <h6 className="text-sm font-montserrat font-bold text-emerald-300 mb-2">
                                At Your Offer (${mao.toLocaleString()})
                              </h6>
                              <div className="space-y-2 text-sm text-gray-300 font-poppins">
                                <div className="flex items-center justify-between p-2 bg-black/40 rounded">
                                  <span>Deal Spread:</span>
                                  <span className={`font-montserrat font-bold ${qualityAtMAO.color === 'emerald' ? 'text-emerald-400' : qualityAtMAO.color === 'amber' ? 'text-amber-400' : 'text-red-400'}`}>
                                    ${spreadAtMAO.toLocaleString()}
                                  </span>
                                </div>
                                <p className="leading-relaxed">
                                  {qualityAtMAO.grade === 'SOLID' ? (
                                    <><span className="text-emerald-400 font-bold">✓ Perfect.</span> Strong margins for everyone at your MAO.</>
                                  ) : qualityAtMAO.grade === 'THIN' ? (
                                    <><span className="text-amber-400 font-bold">⚠ Workable but thin.</span> Ensure competitive fees.</>
                                  ) : (
                                    <><span className="text-red-400 font-bold">✗ Still risky.</span> Double-check your numbers.</>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Negotiation Strategy */}
                          <div>
                            <h5 className="text-base font-montserrat font-bold text-emerald-300 mb-3">Negotiation Strategy</h5>
                            <div className="space-y-3 text-sm text-gray-300 font-poppins leading-relaxed">
                              {mao >= sellerAsking ? (
                                <>
                                  <p>
                                    <span className="text-emerald-400 font-bold">Good news:</span> Asking price (${sellerAsking.toLocaleString()}) is ${profit.toLocaleString()} below your MAO. You have room to negotiate or accept as-is.
                                  </p>
                                  <p className="text-emerald-400 font-semibold">
                                    💡 Consider offering ${Math.round(sellerAsking * 0.9).toLocaleString()} (90% of asking) to maximize profit.
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p>
                                    <span className="text-red-400 font-bold">Challenge:</span> Asking (${sellerAsking.toLocaleString()}) is ${Math.abs(profit).toLocaleString()} over your MAO. You'll need strong negotiation.
                                  </p>
                                  <p className="text-amber-400 font-semibold">
                                    💡 Educate the seller on market value and repairs. Find their motivation. Don't overpay.
                                  </p>
                                </>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => setShowAIExplanation(false)}
                            className="w-full px-6 py-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 rounded-lg text-white font-montserrat font-bold transition-all"
                          >
                            Got It
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* FREE USER UPGRADE CTAS */}
                {!isUnlocked && (
                  <>
                    {/* Dispo Service */}
                    <div className="relative p-8 rounded-xl bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-emerald-500/10 border-2 border-emerald-500/40 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent"></div>
                      
                      <div className="relative z-10 text-center">
                        <h4 className="text-3xl font-serif font-bold text-white mb-3">
                          Want Us to Sell This Property?
                        </h4>
                        <p className="text-lg text-gray-300 font-poppins mb-6">
                          We'll connect you with <span className="text-emerald-400 font-bold">{interestedBuyers} verified cash buyers</span>
                        </p>
                        
                        <div className="grid sm:grid-cols-3 gap-4 mb-6">
                          <div className="p-4 rounded-lg bg-black/60 border border-emerald-500/30 text-center">
                            <div className="text-4xl mb-2">📧</div>
                            <p className="text-base font-montserrat font-bold text-white mb-1">Submit Deal</p>
                            <p className="text-sm font-poppins text-gray-400">Share details</p>
                          </div>
                          <div className="p-4 rounded-lg bg-black/60 border border-emerald-500/30 text-center">
                            <div className="text-4xl mb-2">🤝</div>
                            <p className="text-base font-montserrat font-bold text-white mb-1">We Match</p>
                            <p className="text-sm font-poppins text-gray-400">10K+ buyers</p>
                          </div>
                          <div className="p-4 rounded-lg bg-black/60 border border-emerald-500/30 text-center">
                            <div className="text-4xl mb-2">💰</div>
                            <p className="text-base font-montserrat font-bold text-white mb-1">Close Fast</p>
                            <p className="text-sm font-poppins text-gray-400">Days, not weeks</p>
                          </div>
                        </div>

                        <a
                          href="/tools/buyer-marketplace"
                          className="inline-block px-10 py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-montserrat font-black text-lg rounded-xl transition-all hover:scale-105 shadow-lg shadow-emerald-500/30"
                        >
                          Submit to Our Buyers
                        </a>
                      </div>
                    </div>

                    {/* Premium Upgrade */}
                    <div className="p-8 rounded-xl bg-gradient-to-br from-amber-600/20 via-yellow-600/10 to-amber-600/20 border-2 border-amber-400/40 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent"></div>
                      
                      <div className="relative z-10 text-center">
                        <div className="flex items-center justify-center gap-3 mb-5">
                          <Crown className="w-12 h-12 text-amber-400" />
                          <h4 className="text-3xl font-serif font-bold text-white">
                            Upgrade to Premium
                          </h4>
                        </div>
                        
                        <p className="text-lg text-gray-200 font-poppins mb-6">
                          AI-powered live data, advanced analytics, and exclusive buyer access
                        </p>
                        
                        <div className="grid sm:grid-cols-3 gap-4 mb-6">
                          <div className="p-5 rounded-lg bg-black/70 border border-emerald-500/40 hover:border-emerald-400 transition-all">
                            <div className="p-2 rounded-lg bg-emerald-500/20 w-fit mx-auto mb-3">
                              <Zap className="w-8 h-8 text-emerald-400" />
                            </div>
                            <p className="text-base font-montserrat font-bold text-white mb-2">AI Auto-Fill</p>
                            <p className="text-sm font-poppins text-gray-300">Live property data</p>
                          </div>
                          <div className="p-5 rounded-lg bg-black/70 border border-blue-500/40 hover:border-blue-400 transition-all">
                            <div className="p-2 rounded-lg bg-blue-500/20 w-fit mx-auto mb-3">
                              <TrendingUp className="w-8 h-8 text-blue-400" />
                            </div>
                            <p className="text-base font-montserrat font-bold text-white mb-2">Live Comps</p>
                            <p className="text-sm font-poppins text-gray-300">Real ARV data</p>
                          </div>
                          <div className="p-5 rounded-lg bg-black/70 border border-purple-500/40 hover:border-purple-400 transition-all">
                            <div className="p-2 rounded-lg bg-purple-500/20 w-fit mx-auto mb-3">
                              <Users className="w-8 h-8 text-purple-400" />
                            </div>
                            <p className="text-base font-montserrat font-bold text-white mb-2">10K+ Buyers</p>
                            <p className="text-sm font-poppins text-gray-300">Cash buyer network</p>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <p className="text-6xl font-montserrat font-black bg-gradient-to-br from-amber-300 via-yellow-300 to-amber-400 bg-clip-text text-transparent mb-2">
                            $20
                          </p>
                          <p className="text-base text-gray-200 font-poppins">per month • Cancel anytime</p>
                        </div>
                        
                        <a
                          href="https://whop.com/passive-pilot-wholesaling/passive-pilot-premium-vip/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-10 py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:via-yellow-400 hover:to-amber-400 text-black font-montserrat font-black text-lg rounded-xl transition-all hover:scale-105 shadow-lg shadow-amber-500/30 border-2 border-yellow-400/50"
                        >
                          🚀 Upgrade to Premium
                        </a>
                      </div>
                    </div>
                  </>
                )}

                {/* 5. ACTIONS SECTION - CLEAN GRID */}
                <div>
                  <div className="text-center mb-5">
                    <h4 className="text-2xl font-serif font-bold text-white mb-2">
                      One-Click Actions
                    </h4>
                    <p className="text-sm text-gray-400 font-poppins">
                      Streamline your workflow
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <button
                      onClick={() => {
                        toast.success('Opening offer generator...')
                        setTimeout(() => {
                          router.push(`/tools/offer-message-generator?propertyAddress=${encodeURIComponent(propertyData.formattedAddress)}&arv=${arv}&repairs=${repairs}&maxOffer=${mao}`)
                          onClose()
                        }, 500)
                      }}
                      className="group p-5 rounded-xl border-2 text-left transition-all bg-black/60 border-emerald-500/40 hover:border-emerald-400 hover:scale-105"
                    >
                      <Send className="w-8 h-8 text-emerald-400 mb-3" />
                      <div className="text-lg font-montserrat font-bold text-white mb-1">Send Offer</div>
                      <div className="text-sm text-gray-400 font-poppins">Generate offer letter</div>
                    </button>

                    <button
                      onClick={handleAddToPipeline}
                      className="group p-5 rounded-xl border-2 text-left transition-all bg-black/60 border-blue-500/40 hover:border-blue-400 hover:scale-105"
                    >
                      <Target className="w-8 h-8 text-blue-400 mb-3" />
                      <div className="text-lg font-montserrat font-bold text-white mb-1">Add to Pipeline</div>
                      <div className="text-sm text-gray-400 font-poppins">Track in CRM</div>
                    </button>

                    <button
                      onClick={() => {
                        toast.success('Creating flyer...')
                        setTimeout(() => {
                          const params = new URLSearchParams({
                            address: propertyData.formattedAddress,
                            beds: String(propertyData.beds || 0),
                            baths: String(propertyData.baths || 0),
                            sqft: String(propertyData.sqft || 0),
                            askingPrice: String(sellerAsking || propertyData.price || 0),
                            arv: String(arv),
                            repairs: String(repairs)
                          })
                          router.push(`/tools/marketing-flyer?${params.toString()}`)
                          onClose()
                        }, 500)
                      }}
                      className="group p-5 rounded-xl border-2 text-left transition-all bg-black/60 border-purple-500/40 hover:border-purple-400 hover:scale-105"
                    >
                      <ImageIcon className="w-8 h-8 text-purple-400 mb-3" />
                      <div className="text-lg font-montserrat font-bold text-white mb-1">Create Flyer</div>
                      <div className="text-sm text-gray-400 font-poppins">Auto-generate sales flyer</div>
                    </button>

                    <button
                      onClick={() => {
                        toast.success('Opening buyer matcher...')
                        setTimeout(() => {
                          router.push(`/tools/buyer-matcher?address=${encodeURIComponent(propertyData.formattedAddress)}&price=${sellerAsking || propertyData.price || 0}&type=${propertyData.propertyType || 'Residential'}`)
                          onClose()
                        }, 500)
                      }}
                      className="group p-5 rounded-xl border-2 text-left transition-all bg-black/60 border-amber-500/40 hover:border-amber-400 hover:scale-105"
                    >
                      <UserPlus className="w-8 h-8 text-amber-400 mb-3" />
                      <div className="text-lg font-montserrat font-bold text-white mb-1">Match Buyers</div>
                      <div className="text-sm text-gray-400 font-poppins">AI finds perfect buyers</div>
                    </button>

                    <button
                      onClick={() => {
                        toast.success('Opening contract library...')
                        setTimeout(() => {
                          router.push('/tools/contracts')
                          onClose()
                        }, 500)
                      }}
                      className="group p-5 rounded-xl border-2 text-left transition-all bg-black/60 border-cyan-500/40 hover:border-cyan-400 hover:scale-105"
                    >
                      <FileText className="w-8 h-8 text-cyan-400 mb-3" />
                      <div className="text-lg font-montserrat font-bold text-white mb-1">Get Contract</div>
                      <div className="text-sm text-gray-400 font-poppins">Ready-to-use templates</div>
                    </button>

                    <button
                      onClick={() => {
                        const analysisData: SavedAnalysis = {
                          id: Date.now().toString(),
                          address: propertyData.formattedAddress,
                          arv: arv,
                          mao: mao,
                          profit: profit,
                          date: new Date().toISOString(),
                          confidence: isUnlocked ? 'high' : 'medium'
                        }
                        
                        const existingData = localStorage.getItem('passivePilotAnalyses')
                        const analyses = existingData ? JSON.parse(existingData) : []
                        analyses.unshift(analysisData)
                        
                        const trimmedAnalyses = analyses.slice(0, 10)
                        localStorage.setItem('passivePilotAnalyses', JSON.stringify(trimmedAnalyses))
                        
                        window.dispatchEvent(new Event('analysisUpdated'))
                        
                        toast.success('✓ Deal saved to your dashboard')
                        
                        setTimeout(() => {
                          router.push('/dashboard')
                          onClose()
                        }, 800)
                      }}
                      className="group p-5 rounded-xl border-2 text-left transition-all bg-black/60 border-indigo-500/40 hover:border-indigo-400 hover:scale-105"
                    >
                      <TrendingUp className="w-8 h-8 text-indigo-400 mb-3" />
                      <div className="text-lg font-montserrat font-bold text-white mb-1">View Dashboard</div>
                      <div className="text-sm text-gray-400 font-poppins">See all your deals</div>
                    </button>

                    {/* Find Owner Info Button */}
                    <button
                      onClick={async () => {
                        if (!isUnlocked) {
                          setShowPremiumModal(true)
                          return
                        }

                        if (ownerLookupAttempted && ownerInfo) {
                          toast.success('Owner info already loaded!')
                          return
                        }

                        setIsLoadingOwner(true)
                        try {
                          const response = await fetch('/api/owner-lookup', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ address: propertyData.formattedAddress })
                          })

                          const data = await response.json()

                          if (!response.ok) {
                            toast.error(data.error || 'Failed to lookup owner')
                            setIsLoadingOwner(false)
                            setOwnerLookupAttempted(true)
                            return
                          }

                          setOwnerInfo(data)
                          setOwnerLookupAttempted(true)
                          toast.success('✅ Owner info found!')
                        } catch (error) {
                          console.error('Owner lookup error:', error)
                          toast.error('Failed to fetch owner info')
                        } finally {
                          setIsLoadingOwner(false)
                        }
                      }}
                      disabled={isLoadingOwner || (ownerLookupAttempted && !!ownerInfo)}
                      className="group p-5 rounded-xl border-2 text-left transition-all bg-black/60 border-orange-500/40 hover:border-orange-400 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingOwner ? (
                        <>
                          <div className="w-8 h-8 mb-3 border-4 border-orange-500/30 border-t-orange-400 rounded-full animate-spin" />
                          <div className="text-lg font-montserrat font-bold text-white mb-1">Loading...</div>
                        </>
                      ) : ownerLookupAttempted && ownerInfo ? (
                        <>
                          <Check className="w-8 h-8 text-emerald-400 mb-3" />
                          <div className="text-lg font-montserrat font-bold text-white mb-1">Owner Info Loaded</div>
                          <div className="text-sm text-gray-400 font-poppins">Scroll down to view</div>
                        </>
                      ) : (
                        <>
                          <User className="w-8 h-8 text-orange-400 mb-3" />
                          <div className="text-lg font-montserrat font-bold text-white mb-1">
                            Find Owner Info
                            {!isUnlocked && <Lock className="inline w-4 h-4 ml-2 text-amber-400" />}
                          </div>
                          <div className="text-sm text-gray-400 font-poppins">Contact details & more</div>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PREMIUM CTA MODAL - Shows when free users click AI */}
      {showPremiumModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/98 backdrop-blur-md z-[60]"
            onClick={() => setShowPremiumModal(false)}
          />
          
          {/* Modal Content */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div 
              className="relative w-full max-w-3xl bg-gradient-to-br from-black via-gray-900 to-black border-4 border-amber-500/60 rounded-3xl p-10 shadow-2xl shadow-amber-500/50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowPremiumModal(false)}
                className="absolute top-4 right-4 p-3 rounded-full bg-black/80 hover:bg-amber-500/20 border-2 border-amber-500/40 text-white transition-all hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Lock Icon + Title */}
              <div className="text-center mb-8">
                <div className="inline-flex p-6 rounded-full bg-amber-500/20 border-3 border-amber-400/50 mb-6">
                  <Lock className="w-16 h-16 text-amber-400" />
                </div>
                <h3 className="text-5xl font-serif font-bold text-white mb-4">
                  Premium Feature
                </h3>
                <p className="text-xl text-gray-300 font-poppins">
                  AI-powered ARV calculations with live comps require Premium access
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-4 mb-8">
                {[
                  { icon: '🤖', title: 'AI-Powered Analysis', desc: 'Get instant ARV calculations using advanced AI algorithms' },
                  { icon: '📊', title: 'Live Comparable Sales', desc: 'Real-time data from recent sales in the area via RentCast API' },
                  { icon: '⚡', title: 'Auto-Fill Property Data', desc: 'Automatically populate property details with live data sources' },
                  { icon: '💎', title: '10,000+ Cash Buyers', desc: 'Access to verified buyer database for your deals' }
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-5 rounded-xl bg-black/60 border-2 border-amber-500/30 hover:border-amber-400/60 transition-all">
                    <div className="text-4xl flex-shrink-0">{benefit.icon}</div>
                    <div>
                      <p className="text-xl font-montserrat font-bold text-white mb-1">{benefit.title}</p>
                      <p className="text-base font-poppins text-gray-400">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="text-center mb-8 p-6 rounded-2xl bg-amber-500/10 border-3 border-amber-500/40">
                <p className="text-sm text-gray-400 font-montserrat uppercase tracking-widest mb-2">Upgrade Today</p>
                <p className="text-7xl font-montserrat font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-2">
                  $20
                </p>
                <p className="text-xl text-gray-300 font-poppins">per month • Cancel anytime</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowPremiumModal(false)}
                  className="flex-1 px-8 py-5 bg-gray-800 hover:bg-gray-700 border-2 border-gray-600 rounded-xl text-white font-montserrat font-bold text-lg transition-all"
                >
                  Maybe Later
                </button>
                <a
                  href="https://whop.com/passive-pilot-wholesaling/passive-pilot-premium-vip/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-8 py-5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:via-yellow-400 hover:to-amber-400 border-3 border-yellow-400/50 rounded-xl text-black font-montserrat font-black text-lg transition-all hover:scale-105 shadow-lg shadow-amber-500/50 text-center"
                >
                  🚀 Upgrade Now
                </a>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Comps Comparison Modal */}
      {showCompsComparison && propertyData && (
        <CompsComparisonView
          comps={comps}
          subjectProperty={{
            address: propertyData.formattedAddress,
            beds: propertyData.beds,
            baths: propertyData.baths,
            sqft: propertyData.sqft
          }}
          isOpen={showCompsComparison}
          onClose={() => setShowCompsComparison(false)}
        />
      )}

      {/* Submit Deal Modal */}
      {propertyData && (
        <SubmitDealModal
          isOpen={showSubmitDealModal}
          onClose={() => setShowSubmitDealModal(false)}
          propertyData={{
            address: propertyData.formattedAddress,
            askingPrice: sellerAsking || propertyData.price,
            arv: arv,
            repairs: repairs,
            propertyType: propertyData.propertyType,
            bedsBaths: `${propertyData.beds}/${propertyData.baths}`
          }}
          source="analyzer"
        />
      )}

      {/* Edit Inputs Panel - Slide-over from right */}
      {showEditPanel && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
            onClick={() => setShowEditPanel(false)}
          />

          {/* Slide-over Panel */}
          <div className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-gradient-to-br from-black via-gray-900 to-black border-l-2 border-amber-500/30 z-[70] overflow-y-auto shadow-2xl">
            <div className="p-8 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-amber-500/30">
                <h3 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
                  <Edit className="w-6 h-6 text-amber-400" />
                  Edit Inputs
                </h3>
                <button
                  onClick={() => setShowEditPanel(false)}
                  className="w-10 h-10 rounded-full bg-black/60 border-2 border-amber-500/30 hover:border-amber-400 transition-all flex items-center justify-center text-amber-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Seller Asking Price */}
              <div className="space-y-3">
                <label className="block">
                  <span className="text-sm text-blue-300 font-montserrat font-bold uppercase tracking-wide mb-2 block">💵 Seller Asking Price</span>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-montserrat font-bold text-blue-400">$</span>
                    <input
                      type="number"
                      value={editSellerAsking}
                      onChange={(e) => setEditSellerAsking(parseInt(e.target.value) || 0)}
                      className="w-full pl-12 pr-4 py-4 bg-black/80 border-2 border-blue-500/50 focus:border-blue-400 rounded-xl text-2xl font-montserrat font-bold text-white transition-all"
                      placeholder="0"
                    />
                  </div>
                </label>
              </div>

              {/* Repair Costs */}
              <div className="space-y-3">
                <label className="block">
                  <span className="text-sm text-emerald-300 font-montserrat font-bold uppercase tracking-wide mb-2 block">🔧 Repair Costs</span>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-montserrat font-bold text-emerald-400">$</span>
                    <input
                      type="number"
                      value={editRepairs}
                      onChange={(e) => setEditRepairs(parseInt(e.target.value) || 0)}
                      className="w-full pl-12 pr-4 py-4 bg-black/80 border-2 border-emerald-500/50 focus:border-emerald-400 rounded-xl text-2xl font-montserrat font-bold text-white transition-all"
                      placeholder="0"
                    />
                  </div>
                </label>
              </div>

              {/* Assignment Fee */}
              <div className="space-y-3">
                <label className="block">
                  <span className="text-sm text-amber-300 font-montserrat font-bold uppercase tracking-wide mb-2 block">💰 Assignment Fee</span>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-montserrat font-bold text-amber-400">$</span>
                    <input
                      type="number"
                      value={editAssignmentFee}
                      onChange={(e) => setEditAssignmentFee(parseInt(e.target.value) || 0)}
                      className="w-full pl-12 pr-4 py-4 bg-black/80 border-2 border-amber-500/50 focus:border-amber-400 rounded-xl text-2xl font-montserrat font-bold text-white transition-all"
                      placeholder="20000"
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    {[10000, 15000, 20000, 25000].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setEditAssignmentFee(amount)}
                        className={`px-4 py-2 rounded-lg border-2 font-montserrat font-bold text-sm transition-all ${
                          editAssignmentFee === amount
                            ? 'bg-amber-500 border-amber-400 text-black'
                            : 'bg-black/60 border-amber-500/30 text-amber-300 hover:border-amber-400'
                        }`}
                      >
                        ${(amount / 1000)}K
                      </button>
                    ))}
                  </div>
                </label>
              </div>

              {/* Property Type */}
              <div className="space-y-3">
                <label className="block">
                  <span className="text-sm text-purple-300 font-montserrat font-bold uppercase tracking-wide mb-2 block">🏠 Property Type</span>
                  <select
                    value={editPropertyType}
                    onChange={(e) => setEditPropertyType(e.target.value)}
                    className="w-full px-4 py-4 bg-black/80 border-2 border-purple-500/50 focus:border-purple-400 rounded-xl text-lg font-montserrat font-bold text-white transition-all"
                  >
                    <option value="residential">🏠 Residential</option>
                    <option value="land">🌳 Land / Lot</option>
                    <option value="commercial">🏢 Commercial</option>
                  </select>
                </label>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveEdits}
                className="w-full px-6 py-4 rounded-xl border-2 border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-400 transition-all flex items-center justify-center gap-3 text-emerald-300 font-montserrat font-bold text-lg"
              >
                <Save className="w-5 h-5" />
                Save & Recalculate
              </button>

              {/* Cancel Button */}
              <button
                onClick={() => setShowEditPanel(false)}
                className="w-full px-6 py-3 rounded-xl border-2 border-gray-500/30 bg-black/60 hover:bg-gray-500/20 hover:border-gray-400 transition-all text-gray-300 font-montserrat font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}