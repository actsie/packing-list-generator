import { Trip, TripSuggestion, PackingItem } from './types'

const TRIPS_STORAGE_KEY = 'packing-trips'
const ACTIVE_TRIP_KEY = 'active-trip-id'
const LAST_OPEN_TRIP_KEY = 'last-open-trip-id'

export class TripStorage {
  static getAllTrips(): Trip[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(TRIPS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  }

  static getTrip(id: string): Trip | null {
    const trips = this.getAllTrips()
    return trips.find(trip => trip.id === id) || null
  }

  static saveTrip(trip: Trip): void {
    const trips = this.getAllTrips()
    const index = trips.findIndex(t => t.id === trip.id)
    
    if (index >= 0) {
      trips[index] = { ...trip, updatedAt: new Date().toISOString() }
    } else {
      trips.push({ ...trip, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    }
    
    localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips))
  }

  static deleteTrip(id: string): void {
    const trips = this.getAllTrips()
    const filtered = trips.filter(trip => trip.id !== id)
    localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(filtered))
    
    // Clear active trip if it was deleted
    if (this.getActiveTripId() === id) {
      this.clearActiveTrip()
    }
  }

  static updateTripChecklist(tripId: string, items: PackingItem[]): void {
    const trip = this.getTrip(tripId)
    if (!trip) return
    
    trip.checklistItems = items
    this.saveTrip(trip)
  }

  static addSuggestions(tripId: string, suggestions: TripSuggestion[]): void {
    const trip = this.getTrip(tripId)
    if (!trip) return
    
    // Replace suggestions instead of appending to avoid duplicates
    trip.suggestions = suggestions
    this.saveTrip(trip)
  }

  static applySuggestions(tripId: string, suggestionsToApply: Array<TripSuggestion & { userQuantity?: number }>): void {
    const trip = this.getTrip(tripId)
    if (!trip) return
    
    // Apply each suggestion
    suggestionsToApply.forEach(suggestion => {
      // Check if already applied to make it idempotent
      if (suggestion.applied) return
      
      if (suggestion.type === 'add' && suggestion.item) {
        // Check if item already exists (idempotent check)
        const existingItem = trip.checklistItems.find(item => 
          item.name.toLowerCase() === suggestion.item!.name.toLowerCase()
        )
        
        if (!existingItem) {
          // Add new item
          const qty = suggestion.userQuantity || suggestion.item.quantity
          trip.checklistItems.push({
            ...suggestion.item,
            id: `item-${Date.now()}-${Math.random()}`,
            quantity: qty,
            computed_qty: suggestion.item.quantity,
            override_qty: suggestion.userQuantity ? qty : undefined
          })
        }
      } else if (suggestion.type === 'update' && suggestion.targetItemId) {
        // Update existing item
        const itemIndex = trip.checklistItems.findIndex(item => item.id === suggestion.targetItemId)
        if (itemIndex >= 0 && suggestion.item) {
          const currentItem = trip.checklistItems[itemIndex]
          const qty = suggestion.userQuantity || suggestion.item.quantity
          
          // Preserve user overrides if they exist and we're not explicitly overriding
          trip.checklistItems[itemIndex] = {
            ...currentItem,
            quantity: qty,
            computed_qty: suggestion.item.quantity,
            override_qty: suggestion.userQuantity ? qty : currentItem.override_qty
          }
        }
      } else if (suggestion.type === 'remove' && suggestion.targetItemId) {
        // Remove item
        trip.checklistItems = trip.checklistItems.filter(item => item.id !== suggestion.targetItemId)
      }
      
      // Mark suggestion as applied in the original suggestions array
      const suggestionInTrip = trip.suggestions?.find(s => s.id === suggestion.id)
      if (suggestionInTrip) {
        suggestionInTrip.applied = true
      }
    })
    
    // Track applied suggestions (idempotent - use Set to avoid duplicates)
    const appliedSet = new Set(trip.appliedSuggestions || [])
    suggestionsToApply.forEach(s => appliedSet.add(s.id))
    trip.appliedSuggestions = Array.from(appliedSet)
    
    this.saveTrip(trip)
  }

  static dismissSuggestion(tripId: string, suggestionId: string): void {
    const trip = this.getTrip(tripId)
    if (!trip || !trip.suggestions) return
    
    const suggestion = trip.suggestions.find(s => s.id === suggestionId)
    if (suggestion) {
      suggestion.dismissedAt = new Date().toISOString()
    }
    
    this.saveTrip(trip)
  }

  static setActiveTrip(tripId: string): void {
    localStorage.setItem(ACTIVE_TRIP_KEY, tripId)
    localStorage.setItem(LAST_OPEN_TRIP_KEY, tripId)
  }

  static getActiveTripId(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(ACTIVE_TRIP_KEY)
  }

  static getActiveTrip(): Trip | null {
    const tripId = this.getActiveTripId()
    return tripId ? this.getTrip(tripId) : null
  }

  static clearActiveTrip(): void {
    localStorage.removeItem(ACTIVE_TRIP_KEY)
  }

  static addItemToTrip(tripId: string, item: PackingItem): void {
    const trip = this.getTrip(tripId)
    if (!trip) return
    
    trip.checklistItems.push({
      ...item,
      id: item.id || `item-${Date.now()}-${Math.random()}`
    })
    
    this.saveTrip(trip)
  }

  static updateTripItem(tripId: string, itemId: string, updates: Partial<PackingItem>): void {
    const trip = this.getTrip(tripId)
    if (!trip) return
    
    const itemIndex = trip.checklistItems.findIndex(item => item.id === itemId)
    if (itemIndex >= 0) {
      const currentItem = trip.checklistItems[itemIndex]
      
      // If quantity is being updated, set it as an override
      if (updates.quantity !== undefined && updates.quantity !== currentItem.computed_qty) {
        updates.override_qty = updates.quantity
      }
      
      trip.checklistItems[itemIndex] = {
        ...currentItem,
        ...updates
      }
      this.saveTrip(trip)
    }
  }

  static deleteTripItem(tripId: string, itemId: string): void {
    const trip = this.getTrip(tripId)
    if (!trip) return
    
    trip.checklistItems = trip.checklistItems.filter(item => item.id !== itemId)
    this.saveTrip(trip)
  }

  static getLastOpenTripId(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(LAST_OPEN_TRIP_KEY)
  }

  static getRecentTrips(limit: number = 5): Trip[] {
    const trips = this.getAllTrips()
    return trips
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit)
  }
}