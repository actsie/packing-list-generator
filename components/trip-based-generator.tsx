'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Trip, MasterList, PackingItem, HeuristicConfig, DEFAULT_HEURISTICS, TripSuggestion } from '@/lib/types'
import { PackingHeuristics } from '@/lib/heuristics'
import { TripStorage } from '@/lib/trip-storage'
import { CalendarDays, MapPin, Luggage, Star, Settings, Wand2, Info, CheckCircle, AlertCircle, Plus } from 'lucide-react'
import CreateTripDialog from './create-trip-dialog'
import HeuristicsSettingsDialog from './heuristics-settings-dialog'
import { PackingListGenerator } from './packing-list/packing-list-generator'
import { SuggestionsPanel } from './suggestions-panel'
import { useToast } from '@/components/ui/use-toast'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { generateSmartSuggestions } from '@/lib/smart-suggestions'

interface TripBasedGeneratorProps {
  masterList?: MasterList
  onBackToLibrary?: () => void
  trip?: Trip
}

export function TripBasedGenerator({ masterList, onBackToLibrary = () => {}, trip: propTrip }: TripBasedGeneratorProps) {
  const [trip, setTrip] = useState<Trip | null>(propTrip || null)
  const [showTripDialog, setShowTripDialog] = useState(false)
  const [showHeuristicsDialog, setShowHeuristicsDialog] = useState(false)
  const [heuristicsConfig, setHeuristicsConfig] = useState<HeuristicConfig>(DEFAULT_HEURISTICS)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [showAddItem, setShowAddItem] = useState(false)
  const [newItemForm, setNewItemForm] = useState({
    name: '',
    category: 'misc',
    quantity: 1,
    essential: false
  })
  const { toast } = useToast()

  const heuristics = useMemo(() => new PackingHeuristics(heuristicsConfig), [heuristicsConfig])

  // Helper function to generate suggestions for a trip
  const generateSuggestionsForTrip = (tripData: Trip): TripSuggestion[] => {
    const suggestions: TripSuggestion[] = []
    
    // Generate additional item suggestions from smart-suggestions library
    const smartSuggestions = generateSmartSuggestions(tripData)
    
    // Add quantity update suggestions based on heuristics
    if (tripData.checklistItems) {
      const originalItems = tripData.checklistItems
      const updatedItems = heuristics.applyHeuristicsToItems(tripData, originalItems)
      
      originalItems.forEach((originalItem, index) => {
        const updatedItem = updatedItems[index]
        if (updatedItem && originalItem.quantity !== updatedItem.quantity) {
          // Check if there's already a smart suggestion for this item
          const hasSmartSuggestion = smartSuggestions.some(
            s => s.type === 'update' && s.targetItemId === originalItem.id
          )
          
          if (!hasSmartSuggestion) {
            suggestions.push({
              id: `suggestion-${Date.now()}-${Math.random()}`,
              type: 'update',
              targetItemId: updatedItem.id,
              item: { ...updatedItem },
              originalQuantity: originalItem.quantity,
              reason: heuristics.getHeuristicExplanation(tripData, updatedItem),
              category: updatedItem.category,
              applied: false
            })
          }
        }
      })
    }
    
    return [...smartSuggestions, ...suggestions]
  }

  // Load active trip on mount or use prop trip
  useEffect(() => {
    if (propTrip) {
      setTrip(propTrip)
      if (propTrip.heuristicsConfig) {
        setHeuristicsConfig(propTrip.heuristicsConfig)
      }
      
      // Generate suggestions if it's smart mode and suggestions don't exist
      if (propTrip.setupMode === 'smart' && (!propTrip.suggestions || propTrip.suggestions.length === 0)) {
        const suggestions = generateSuggestionsForTrip(propTrip)
        TripStorage.addSuggestions(propTrip.id, suggestions)
        setTrip({ ...propTrip, suggestions })
      }
    } else if (masterList) {
      const activeTrip = TripStorage.getActiveTrip()
      if (activeTrip && activeTrip.masterListId === masterList.id) {
        setTrip(activeTrip)
        if (activeTrip.heuristicsConfig) {
          setHeuristicsConfig(activeTrip.heuristicsConfig)
        }
        
        // Generate suggestions if it's smart mode and suggestions don't exist
        if (activeTrip.setupMode === 'smart' && (!activeTrip.suggestions || activeTrip.suggestions.length === 0)) {
          const suggestions = generateSuggestionsForTrip(activeTrip)
          TripStorage.addSuggestions(activeTrip.id, suggestions)
          setTrip({ ...activeTrip, suggestions })
        }
      }
    }
  }, [propTrip, masterList])

  const handleTripCreated = (tripData: Trip) => {
    if (!masterList) return
    
    // Initialize trip with master list items and generate suggestions
    const initialItems = masterList.items.map(item => ({ 
      ...item, 
      id: `item-${Date.now()}-${Math.random()}`,
      packed: false, 
      pinned: false 
    }))
    
    // Apply heuristics to calculate quantities
    const updatedItems = heuristics.applyHeuristicsToItems(tripData, initialItems)
    
    // Generate additional suggestions
    const additionalItems = heuristics.generateSuggestions(tripData)
    const existingNames = new Set(updatedItems.map(item => item.name.toLowerCase()))
    const newItems = additionalItems.filter(
      item => !existingNames.has(item.name.toLowerCase())
    )
    
    // Create suggestions for new items
    const suggestions: TripSuggestion[] = newItems.map(item => ({
      id: `suggestion-${Date.now()}-${Math.random()}`,
      type: 'add',
      item,
      reason: `Recommended for ${tripData.days}-day ${tripData.destinationType} trip`,
      category: item.category,
      applied: false
    }))
    
    // Look for quantity changes as suggestions
    initialItems.forEach((originalItem, index) => {
      const updatedItem = updatedItems[index]
      if (updatedItem && originalItem.quantity !== updatedItem.quantity) {
        suggestions.push({
          id: `suggestion-${Date.now()}-${Math.random()}`,
          type: 'update',
          targetItemId: updatedItem.id,
          item: { ...updatedItem },
          reason: heuristics.getHeuristicExplanation(tripData, updatedItem),
          category: updatedItem.category,
          applied: false
        })
      }
    })
    
    const newTrip: Trip = {
      ...tripData,
      masterListId: masterList?.id || trip?.masterListId || '',
      checklistItems: updatedItems,
      suggestions,
      heuristicsConfig,
      id: `trip-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Save trip and set as active
    TripStorage.saveTrip(newTrip)
    TripStorage.setActiveTrip(newTrip.id)
    
    setTrip(newTrip)
    setShowTripDialog(false)
    setShowSuggestions(true)
    
    toast({
      title: "Trip created successfully",
      description: `${newTrip.name} has been created with smart suggestions`
    })
  }

  const handleApplySuggestions = (suggestionsToApply: Array<TripSuggestion & { userQuantity?: number }>) => {
    if (!trip) return
    
    TripStorage.applySuggestions(trip.id, suggestionsToApply)
    
    // Force a fresh retrieval and state update
    setTimeout(() => {
      const updatedTrip = TripStorage.getTrip(trip.id)
      if (updatedTrip) {
        // Force a new object to ensure React detects the change
        setTrip({ ...updatedTrip })
        
        // Hide suggestions panel after applying
        setShowSuggestions(false)
        
        toast({
          title: "Suggestions applied ✓",
          description: `${suggestionsToApply.length} suggestions have been applied to your packing list`,
          action: (
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto"
              onClick={() => {
                // Scroll to packing list and highlight changed items
                const packingListElement = document.getElementById('packing-list')
                packingListElement?.scrollIntoView({ behavior: 'smooth' })
                
                // Add highlight effect to changed items
                setTimeout(() => {
                  suggestionsToApply.forEach(suggestion => {
                    let elementId = ''
                    if (suggestion.type === 'update' && suggestion.targetItemId) {
                      elementId = `item-${suggestion.targetItemId}`
                    } else if (suggestion.type === 'add' && suggestion.item) {
                      // Find the newly added item by name
                      const newItem = updatedTrip?.checklistItems.find(
                        item => item.name === suggestion.item!.name
                      )
                      if (newItem) elementId = `item-${newItem.id}`
                    }
                    
                    if (elementId) {
                      const element = document.getElementById(elementId)
                      if (element) {
                        element.classList.add('bg-green-50', 'transition-colors', 'duration-500')
                        setTimeout(() => {
                          element.classList.remove('bg-green-50')
                        }, 3000)
                      }
                    }
                  })
                }, 500)
              }}
            >
              View updated packing list
            </Button>
          )
        })
      }
    }, 100)
  }


  const handleAddItem = () => {
    if (!trip || !newItemForm.name.trim()) return
    
    const newItem: PackingItem = {
      id: `item-${Date.now()}-${Math.random()}`,
      name: newItemForm.name,
      category: newItemForm.category,
      quantity: newItemForm.quantity,
      essential: newItemForm.essential,
      packed: false
    }
    
    TripStorage.addItemToTrip(trip.id, newItem)
    const updatedTrip = TripStorage.getTrip(trip.id)
    if (updatedTrip) {
      setTrip({ ...updatedTrip })
    }
    
    // Reset form
    setNewItemForm({
      name: '',
      category: 'misc',
      quantity: 1,
      essential: false
    })
    setShowAddItem(false)
    
    toast({
      title: "Item added",
      description: `${newItem.name} has been added to your packing list`
    })
  }

  const handleItemUpdate = (itemId: string, updates: Partial<PackingItem>) => {
    if (!trip) return
    
    TripStorage.updateTripItem(trip.id, itemId, updates)
    const updatedTrip = TripStorage.getTrip(trip.id)
    if (updatedTrip) {
      setTrip({ ...updatedTrip })
    }
  }

  const handleItemDelete = (itemId: string) => {
    if (!trip) return
    
    TripStorage.deleteTripItem(trip.id, itemId)
    const updatedTrip = TripStorage.getTrip(trip.id)
    if (updatedTrip) {
      setTrip({ ...updatedTrip })
    }
  }

  const stats = useMemo(() => {
    if (!trip) return null
    
    const totalItems = trip.checklistItems.length
    const packedItems = trip.checklistItems.filter(item => item.packed).length
    const activeSuggestions = trip.suggestions?.filter(s => !s.applied && !s.dismissedAt).length || 0
    
    return {
      totalItems,
      packedItems,
      tripDays: trip.days,
      activities: trip.activities.length,
      activeSuggestions
    }
  }, [trip])

  if (!trip) {
    return (
      <>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Trip-Based Packing Generator</h2>
              <p className="text-muted-foreground">
                Create a trip to generate smart packing suggestions{masterList?.name ? ` from ${masterList.name}` : ''}
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
            <Button variant="outline" size="sm" onClick={() => {
              TripStorage.clearActiveTrip()
              setTrip(null)
            }}>
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
            onClick={() => setShowAddItem(!showAddItem)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
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

      {/* Add Item Form */}
      {showAddItem && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Item to Packing List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="item-name">Item Name</Label>
                <Input
                  id="item-name"
                  placeholder="e.g., Rain jacket"
                  value={newItemForm.name}
                  onChange={(e) => setNewItemForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="item-category">Category</Label>
                <Select
                  value={newItemForm.category}
                  onValueChange={(value) => setNewItemForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger id="item-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tops">Tops</SelectItem>
                    <SelectItem value="bottoms">Bottoms</SelectItem>
                    <SelectItem value="underwear">Underwear</SelectItem>
                    <SelectItem value="outerwear">Outerwear</SelectItem>
                    <SelectItem value="shoes">Shoes</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="toiletries">Toiletries</SelectItem>
                    <SelectItem value="tech">Tech</SelectItem>
                    <SelectItem value="documents">Documents</SelectItem>
                    <SelectItem value="meds">Medications</SelectItem>
                    <SelectItem value="misc">Miscellaneous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="item-quantity">Quantity</Label>
                <Input
                  id="item-quantity"
                  type="number"
                  min="1"
                  value={newItemForm.quantity}
                  onChange={(e) => setNewItemForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                />
              </div>
              
              <div className="flex items-end gap-2">
                <Button onClick={handleAddItem} disabled={!newItemForm.name.trim()}>
                  Add Item
                </Button>
                <Button variant="outline" onClick={() => setShowAddItem(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Suggestions Panel */}
      {showSuggestions && trip.suggestions && trip.suggestions.some(s => !s.applied && !s.dismissedAt) && (
        <SuggestionsPanel
          suggestions={trip.suggestions}
          onApplySuggestions={handleApplySuggestions}
        />
      )}

      {/* Packing Progress */}
      {stats && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-900">Packing Progress</div>
                  <div className="text-sm text-green-700">
                    {stats.packedItems} of {stats.totalItems} items packed
                    {stats.activeSuggestions > 0 && ` • ${stats.activeSuggestions} suggestions available`}
                  </div>
                </div>
              </div>
              {!showSuggestions && stats.activeSuggestions > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSuggestions(true)}
                  className="text-green-700 border-green-300"
                >
                  View Suggestions
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Packing List */}
      <div id="packing-list">
        {trip.checklistItems.length > 0 && (
          <PackingListGenerator 
            masterList={masterList ? {
              ...masterList,
              items: trip.checklistItems
            } : {
              id: 'trip-checklist',
              name: trip.name,
              description: `Checklist for ${trip.destination}`,
              category: 'Trip',
              items: trip.checklistItems,
              createdAt: new Date(),
              updatedAt: new Date(),
              isTemplate: false
            }}
            onBackToLibrary={onBackToLibrary || (() => {})}
            trip={trip}
            heuristicsConfig={heuristicsConfig}
            onItemUpdate={handleItemUpdate}
            onItemDelete={handleItemDelete}
          />
        )}
      </div>

      {/* Dialogs */}
      <HeuristicsSettingsDialog
        open={showHeuristicsDialog}
        onOpenChange={setShowHeuristicsDialog}
        config={heuristicsConfig}
        onConfigChange={(newConfig) => {
          setHeuristicsConfig(newConfig)
          if (trip) {
            trip.heuristicsConfig = newConfig
            TripStorage.saveTrip(trip)
          }
        }}
      />
    </div>
  )
}