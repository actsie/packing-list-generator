export interface PackingItem {
  id: string
  name: string
  category: string
  quantity: number
  packed: boolean
  essential: boolean
  pinned?: boolean
  notes?: string
}

export interface MasterListItem {
  id: string
  name: string
  category: string
  quantity: number
  essential: boolean
  notes?: string
}

export interface MasterList {
  id: string
  name: string
  description: string
  category: string
  items: MasterListItem[]
  createdAt: Date
  updatedAt: Date
  isTemplate: boolean
}

export type TripSetupMode = 'smart' | 'checklist'

export interface Trip {
  id: string
  name: string
  startDate: string
  endDate: string
  days: number
  destination: string
  destinationType: 'city' | 'beach' | 'mountain' | 'rural'
  season: 'spring' | 'summer' | 'fall' | 'winter'
  luggage: 'carryOn' | 'checked' | 'hybrid'
  laundry: boolean
  shoppingLikely: boolean
  activities: string[]
  createdAt: string
  updatedAt: string
  masterListId?: string
  masterListName?: string
  checklistItems: PackingItem[]
  suggestions?: TripSuggestion[]
  appliedSuggestions?: string[]
  heuristicsConfig?: HeuristicConfig
  setupMode?: TripSetupMode
}

export interface TripSuggestion {
  id: string
  type: 'add' | 'update' | 'remove'
  item?: PackingItem
  targetItemId?: string
  reason: string
  category: string
  applied: boolean
  dismissedAt?: string
}

export interface TripType {
  id: string
  name: string
  description: string
  categories: string[]
  duration: string[]
  climate: string[]
}

export interface PackingListFilters {
  category?: string
  essential?: boolean
  packed?: boolean
  searchQuery?: string
}

export type Category = 'tops' | 'bottoms' | 'underwear' | 'outerwear' | 'toiletries' | 'tech' | 'documents' | 'meds' | 'misc' | 'shoes' | 'accessories'
export type Priority = 'essential' | 'core' | 'optional'

export interface HeuristicConfig {
  tops: { withLaundry: number; withoutLaundry: number }
  bottoms: { ratio: number }
  underwear: { extra: number }
  sleepwear: { per: number }
  shoes: { default: number }
  swim: { minDays: number; qty: number }
  gym: { short: number; long: number; longThreshold: number }
}

export const DEFAULT_HEURISTICS: HeuristicConfig = {
  tops: { withLaundry: 5, withoutLaundry: 1 },
  bottoms: { ratio: 2 },
  underwear: { extra: 1 },
  sleepwear: { per: 4 },
  shoes: { default: 2 },
  swim: { minDays: 3, qty: 2 },
  gym: { short: 2, long: 4, longThreshold: 7 }
}

export interface PackingPhase {
  id: string
  name: string
  description: string
  order: number
  items: PackingItem[]
  isCompleted: boolean
  timeframe?: string
}

export interface PhasedPackingConfig {
  enabled: boolean
  phases: PackingPhase[]
  currentPhaseId?: string
}

export interface AlwaysPackedKit {
  id: string
  name: string
  description: string
  category: string
  items: PackingItem[]
  icon?: string
  color?: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export const DEFAULT_PHASED_PACKING_PHASES: Omit<PackingPhase, 'id' | 'items' | 'isCompleted'>[] = [
  {
    name: "Essential Documents & Valuables",
    description: "Pack your most critical items first - documents, passport, money, and irreplaceable items",
    order: 1,
    timeframe: "First - Never forget these"
  },
  {
    name: "Essential Clothes & Toiletries", 
    description: "Pack your absolute must-have clothing and personal care items",
    order: 2,
    timeframe: "1-2 days before departure"
  },
  {
    name: "Electronics & Chargers",
    description: "Pack your devices, chargers, and tech accessories before they're forgotten",
    order: 3,
    timeframe: "1 day before departure"
  },
  {
    name: "Remaining Clothes & Shoes",
    description: "Add the rest of your clothing, shoes, and accessories",
    order: 4,
    timeframe: "Day of departure"
  },
  {
    name: "Last Minute Items",
    description: "Final items like medications, snacks, and things you use until departure",
    order: 5,
    timeframe: "Right before leaving"
  }
]

export interface PostTripReview {
  id: string
  tripId: string
  tripName: string
  createdAt: Date
  updatedAt: Date
  overallRating: number
  packingEffectivenessRating: number
  itemReviews: PostTripItemReview[]
  regrets: RegretLogEntry[]
  insights: string
  wouldPackDifferently: boolean
  mostUsefulItems: string[]
  recommendations: string
}

export interface PostTripItemReview {
  itemId: string
  itemName: string
  category: string
  packedQuantity: number
  usedQuantity: number
  usageRating: number
  wasEssential: boolean
  notes?: string
  recommendation: 'pack-more' | 'pack-same' | 'pack-less' | 'skip-next-time'
}

export interface RegretLogEntry {
  id: string
  type: 'forgot-to-pack' | 'overpacked' | 'wrong-choice' | 'quality-issue'
  itemName: string
  category: string
  description: string
  impact: 'low' | 'medium' | 'high'
  solution?: string
  preventionTip: string
  createdAt: Date
}

export type PostTripInsightType = 
  | 'overpacking-pattern'
  | 'forgotten-essentials'
  | 'unused-category'
  | 'quantity-optimization'
  | 'seasonal-adjustment'
  | 'activity-specific'

export interface PostTripInsight {
  id: string
  type: PostTripInsightType
  title: string
  description: string
  affectedItems: string[]
  recommendation: string
  confidenceScore: number
}

export interface BuyThereItem extends PackingItem {
  buyThereReason?: string
  estimatedCost?: number
  buyAtDestination: boolean
  priority: 'high' | 'medium' | 'low'
  alternativeItem?: string
}

export interface BuyThereFilter {
  category?: string
  priority?: 'high' | 'medium' | 'low'
  maxCost?: number
  searchQuery?: string
}

export interface ArrivalListConfig {
  showCosts: boolean
  groupByCategory: boolean
  sortBy: 'priority' | 'cost' | 'alphabetical'
  includeAlternatives: boolean
}