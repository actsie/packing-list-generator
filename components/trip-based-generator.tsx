'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Trip, MasterList, PackingItem, HeuristicConfig, DEFAULT_HEURISTICS } from '@/lib/types'
import { PackingHeuristics } from '@/lib/heuristics'
import { CalendarDays, MapPin, Luggage, Star, Settings, Wand2, Info, CheckCircle, AlertCircle } from 'lucide-react'
import CreateTripDialog from './create-trip-dialog'
import HeuristicsSettingsDialog from './heuristics-settings-dialog'
import { PackingListGenerator } from './packing-list/packing-list-generator'

interface TripBasedGeneratorProps {
  masterList: MasterList
  onBackToLibrary: () => void
}

export function TripBasedGenerator({ masterList, onBackToLibrary }: TripBasedGeneratorProps) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [showTripDialog, setShowTripDialog] = useState(false)
  const [showHeuristicsDialog, setShowHeuristicsDialog] = useState(false)
  const [heuristicsConfig, setHeuristicsConfig] = useState<HeuristicConfig>(DEFAULT_HEURISTICS)
  const [packingItems, setPackingItems] = useState<PackingItem[]>([])
  const [heuristicsApplied, setHeuristicsApplied] = useState(false)

  const heuristics = useMemo(() => new PackingHeuristics(heuristicsConfig), [heuristicsConfig])

  const handleTripCreated = (tripData: Trip) => {
    setTrip(tripData)
    setShowTripDialog(false)
    
    // Initialize packing items from master list
    const initialItems = masterList.items.map(item => ({ ...item, packed: false, pinned: false }))
    setPackingItems(initialItems)
    setHeuristicsApplied(false)
  }

  const applyHeuristics = () => {
    if (!trip) return

    try {
      // Apply heuristics to existing items and add trip-specific suggestions
      const updatedItems = heuristics.applyHeuristicsToItems(trip, packingItems)
      const tripSuggestions = heuristics.generateSuggestions(trip)
      
      // Merge suggestions with existing items (avoid duplicates)
      const existingNames = new Set(updatedItems.map(item => item.name.toLowerCase()))
      const newSuggestions = tripSuggestions.filter(
        suggestion => !existingNames.has(suggestion.name.toLowerCase())
      )
      
      const finalItems = [...updatedItems, ...newSuggestions].filter(item => {
        // Ensure all items have valid quantities
        return item.quantity && item.quantity > 0 && item.name && item.name.trim() !== ''
      })
      
      setPackingItems(finalItems)
      setHeuristicsApplied(true)
    } catch (error) {
      console.error('Error applying heuristics:', error)
      // Fallback: just update quantities of existing items
      const updatedItems = packingItems.map(item => ({
        ...item,
        quantity: Math.max(1, item.quantity || 1)
      }))
      setPackingItems(updatedItems)
      setHeuristicsApplied(true)
    }
  }

  const stats = useMemo(() => {
    if (!trip) return null
    
    const totalItems = packingItems.length
    const heuristicItems = packingItems.filter(item => 
      heuristics.calculateQuantityForItem(trip, item) !== (item.quantity || 1)
    ).length
    
    return {
      totalItems,
      heuristicItems,
      tripDays: trip.days,
      activities: trip.activities.length
    }
  }, [trip, packingItems, heuristics])

  if (!trip) {
    return (
      <>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Trip-Based Packing Generator</h2>
              <p className="text-muted-foreground">
                Create a trip to generate smart packing suggestions from {masterList.name}
              </p>
            </div>
            <Button variant="outline" onClick={onBackToLibrary}>
              Back to Library
            </Button>
          </div>

          <Card className="text-center py-12">
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Wand2 className="h-16 w-16 mx-auto text-primary" />
                <div>
                  <CardTitle className="text-xl mb-2">Smart Per-Trip Packing</CardTitle>
                  <CardDescription className="max-w-md mx-auto">
                    Tell us about your trip and we'll automatically calculate the right quantities 
                    and suggest additional items based on your destination, activities, and preferences.
                  </CardDescription>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg">
                  <CalendarDays className="h-8 w-8 text-blue-500" />
                  <div className="text-center">
                    <div className="font-medium">Trip Duration</div>
                    <div className="text-sm text-muted-foreground">Auto-calculate quantities</div>
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg">
                  <MapPin className="h-8 w-8 text-green-500" />
                  <div className="text-center">
                    <div className="font-medium">Destination</div>
                    <div className="text-sm text-muted-foreground">Climate-specific items</div>
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg">
                  <Star className="h-8 w-8 text-orange-500" />
                  <div className="text-center">
                    <div className="font-medium">Activities</div>
                    <div className="text-sm text-muted-foreground">Activity-based gear</div>
                  </div>
                </div>
              </div>

              <Button 
                size="lg" 
                onClick={() => setShowTripDialog(true)}
                className="mx-auto"
              >
                Create Trip & Generate Smart List
              </Button>
            </CardContent>
          </Card>
        </div>

        <CreateTripDialog
          open={showTripDialog}
          onOpenChange={setShowTripDialog}
          onTripCreated={handleTripCreated}
        />
      </>
    )
  }

  return (
    <div className="space-y-6">
      {/* Trip Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onBackToLibrary}>
              Back to Library
            </Button>
            <Button variant="outline" size="sm" onClick={() => setTrip(null)}>
              Change Trip
            </Button>
          </div>
          <h2 className="text-2xl font-bold">{trip.name}</h2>
          <p className="text-muted-foreground">
            {trip.days} days • {trip.destination} • {trip.season}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline" 
            size="sm"
            onClick={() => setShowHeuristicsDialog(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Heuristics Settings
          </Button>
        </div>
      </div>

      {/* Trip Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Trip Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-medium">{trip.days} days</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">{trip.destinationType === 'city' ? '🏙️' : trip.destinationType === 'beach' ? '🏖️' : trip.destinationType === 'mountain' ? '🏔️' : '🌾'} {trip.destinationType}</div>
                <div className="text-sm text-muted-foreground">{trip.destination}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Luggage className="h-5 w-5 text-purple-500" />
              <div>
                <div className="font-medium">{trip.luggage === 'carryOn' ? '🎒 Carry-on' : trip.luggage === 'checked' ? '🧳 Checked' : '🎒🧳 Hybrid'}</div>
                <div className="text-sm text-muted-foreground">
                  {trip.laundry && 'Laundry available'} {trip.shoppingLikely && 'Shopping likely'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-orange-500" />
              <div>
                <div className="font-medium">{trip.activities.length} activities</div>
                <div className="text-sm text-muted-foreground">
                  <div className="flex flex-wrap gap-1 mt-1">
                    {trip.activities.slice(0, 2).map(activity => (
                      <Badge key={activity} variant="secondary" className="text-xs px-1">
                        {activity}
                      </Badge>
                    ))}
                    {trip.activities.length > 2 && (
                      <Badge variant="outline" className="text-xs px-1">
                        +{trip.activities.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Heuristics Status */}
      {!heuristicsApplied && packingItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="font-medium text-orange-900">Smart Heuristics Available</div>
                  <div className="text-sm text-orange-700">
                    Apply trip-based quantity calculations and get personalized suggestions
                  </div>
                </div>
              </div>
              <Button onClick={applyHeuristics} className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Apply Smart Heuristics
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {heuristicsApplied && stats && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-green-900">Smart Heuristics Applied</div>
                <div className="text-sm text-green-700">
                  {stats.heuristicItems} items optimized for your {stats.tripDays}-day trip with {stats.activities} activities
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Packing List */}
      {packingItems.length > 0 && (
        <PackingListGenerator 
          masterList={{
            ...masterList,
            items: packingItems
          }}
          onBackToLibrary={() => {}}
          trip={trip}
          heuristicsConfig={heuristicsConfig}
        />
      )}

      {/* Dialogs */}
      <HeuristicsSettingsDialog
        open={showHeuristicsDialog}
        onOpenChange={setShowHeuristicsDialog}
        config={heuristicsConfig}
        onConfigChange={setHeuristicsConfig}
      />
    </div>
  )
}