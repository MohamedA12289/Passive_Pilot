
export interface CompEntry {
  id: string
  address: string
  beds: number
  baths: number
  sqft: number
  soldPrice: number
  soldDate: string
}

export interface PropertyInputs {
  address: string
  beds: number
  baths: number
  sqft: number
  repairEstimate: number
  assignmentFee: number
  sellerAskingPrice: number
  notes: string
}

export interface MAOCalculations {
  rehab: number
  assignmentFee: number
  acquisitionCost: number
  financingCost: number
  holdingCost: number
  sellingCost: number
  requiredProfit: number
  totalCosts: number
}

export interface AnalysisResults {
  arv: number
  arvPerSqft: number
  mao: number
  maoPercentOfArv: number
  caseUsed: 1 | 2
  t: number
  calculations: MAOCalculations
  locationQuickTake: string
  shareToken?: string
}

export interface Analysis {
  id: string
  toolType: string
  address: string
  inputsJSON: PropertyInputs
  compsJSON: CompEntry[]
  outputsJSON: AnalysisResults
  shareToken: string
  createdAt: Date
  updatedAt: Date
}

export interface SavedAnalysis {
  id: string
  address: string
  arv: number
  mao: number
  profit: number
  date: string
  confidence: 'high' | 'medium' | 'low'
}

// Dashboard types
export interface Property {
  id: string
  address: string
  city?: string
  state?: string
  zipCode?: string
  ownerName?: string
  price: number
  beds: number
  baths: number
  sqft: number
  lotSize?: number
  yearBuilt?: number
  imageUrl?: string
  latitude?: number
  longitude?: number
  discount?: number
  status?: 'active' | 'pending' | 'sold'
}

export interface Deal {
  id: string
  property: Property
  arv: number
  discount: number
  dealScore?: number
  assignmentFee?: number
  disposeAgent?: string
  estimationDate?: string
  createdAt: string
  updatedAt: string
}

export interface DealAnalysis {
  deal: Deal
  arv: number
  arvPerSqft?: number
  assignmentFee: number
  assignmentFeeToggle?: boolean
  disposeAgent: string
  disposeAgentToggle?: boolean
  dealScore: number
  estimations: {
    repairCost?: number
    holdingCost?: number
    closingCost?: number
    [key: string]: number | undefined
  }
  propertyMetadata: {
    yearBuilt?: number
    lotSize?: number
    sqft?: number
    beds?: number
    baths?: number
    county?: string
    parcelNumber?: string
    [key: string]: string | number | undefined
  }
}

export interface Campaign {
  id: string
  name: string
  status: 'active' | 'paused' | 'completed'
  targetCount: number
  sentCount: number
  responseRate?: number
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  dealCountVerified: number
  assignmentReceived: number
  slipPerFixer: number
}

export interface MapMarker {
  id: string
  latitude: number
  longitude: number
  property?: Property
  deal?: Deal
}

export interface PropertySearchFilters {
  minPrice?: number
  maxPrice?: number
  minBeds?: number
  minBaths?: number
  minSqft?: number
  maxSqft?: number
  city?: string
  state?: string
  zipCode?: string
}

export interface ToolLink {
  id: string
  name: string
  route: string
  icon?: string
}
