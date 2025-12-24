
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
