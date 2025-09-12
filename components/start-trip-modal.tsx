'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { MasterList, Trip, TripSetupMode } from '@/lib/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Sparkles, List, Clock } from 'lucide-react'

interface StartTripModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  masterList: MasterList
  onCreateTrip: (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>, mode: TripSetupMode) => void
}

export function StartTripModal({ open, onOpenChange, masterList, onCreateTrip }: StartTripModalProps) {
  const [tripName, setTripName] = useState('')
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [destination, setDestination] = useState('')
  const [destinationType, setDestinationType] = useState<'city' | 'beach' | 'mountain' | 'rural' | ''>('')
  const [season, setSeason] = useState<'summer' | 'winter' | 'spring' | 'fall' | ''>('')
  const [luggage, setLuggage] = useState<'carryOn' | 'checked' | 'hybrid' | ''>('')
  const [laundry, setLaundry] = useState<boolean>(false)
  const [activities, setActivities] = useState<string[]>([])
  const [setupMode, setSetupMode] = useState<TripSetupMode>('smart')

  const handleSubmit = () => {
    if (!tripName || !startDate || !endDate || !destination) return

    const trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'> = {
      name: tripName,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      days: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      destination,
      destinationType: destinationType as 'city' | 'beach' | 'mountain' | 'rural',
      season: season as 'summer' | 'winter' | 'spring' | 'fall',
      luggage: luggage as 'carryOn' | 'checked' | 'hybrid',
      laundry,
      shoppingLikely: destinationType === 'city',
      activities,
      masterListId: masterList.id,
      masterListName: masterList.name,
      checklistItems: masterList.items.map(item => ({
        ...item,
        packed: false
      })), // Start with master list items
      suggestions: [],
      appliedSuggestions: [],
      setupMode
    }

    onCreateTrip(trip, setupMode)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a Trip from "{masterList.name}"</DialogTitle>
          <DialogDescription>
            Choose how you'd like to set up your packing list for this trip.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Setup Mode Selection */}
          <div className="space-y-3">
            <Label>Setup Mode</Label>
            <RadioGroup value={setupMode} onValueChange={(value) => setSetupMode(value as TripSetupMode)}>
              <Card 
                className={cn(
                  "p-4 cursor-pointer transition-all",
                  setupMode === 'smart' && "ring-2 ring-primary"
                )}
                onClick={() => setSetupMode('smart')}
              >
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="smart" id="smart" />
                  <div className="flex-1">
                    <Label htmlFor="smart" className="cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Smart Setup
                        <Badge variant="secondary" className="text-xs">Recommended</Badge>
                      </div>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Auto-calculate quantities from days, activities, luggage. Takes ~30s.
                    </p>
                  </div>
                </div>
              </Card>

              <Card 
                className={cn(
                  "p-4 cursor-pointer transition-all",
                  setupMode === 'checklist' && "ring-2 ring-primary"
                )}
                onClick={() => setSetupMode('checklist')}
              >
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="checklist" id="checklist" />
                  <div className="flex-1">
                    <Label htmlFor="checklist" className="cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <List className="h-4 w-4" />
                        Open Checklist Only
                      </div>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Skip suggestions; you can tweak manually.
                    </p>
                  </div>
                </div>
              </Card>
            </RadioGroup>
          </div>

          {/* Trip Details */}
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="trip-name">Trip Name</Label>
                <Input
                  id="trip-name"
                  placeholder="e.g., Weekend in Paris"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={(date) => startDate ? date < startDate : false}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  placeholder="e.g., Paris, France"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Destination Type</Label>
                  <Select value={destinationType} onValueChange={(value) => setDestinationType(value as 'city' | 'beach' | 'mountain' | 'rural' | '')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beach">Beach</SelectItem>
                      <SelectItem value="city">City</SelectItem>
                      <SelectItem value="mountain">Mountain</SelectItem>
                      <SelectItem value="rural">Rural</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Season</Label>
                  <Select value={season} onValueChange={(value) => setSeason(value as 'summer' | 'winter' | 'spring' | 'fall' | '')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select season" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summer">Summer</SelectItem>
                      <SelectItem value="winter">Winter</SelectItem>
                      <SelectItem value="spring">Spring</SelectItem>
                      <SelectItem value="fall">Fall</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Luggage Type</Label>
                  <Select value={luggage} onValueChange={(value) => setLuggage(value as 'carryOn' | 'checked' | 'hybrid' | '')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select luggage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="carryOn">Carry-on</SelectItem>
                      <SelectItem value="checked">Checked Bag</SelectItem>
                      <SelectItem value="hybrid">Hybrid (Carry-on + Checked)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Laundry Access</Label>
                  <Select value={laundry ? 'yes' : 'no'} onValueChange={(value) => setLaundry(value === 'yes')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select access" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Activities</Label>
                <div className="flex flex-wrap gap-2">
                  {['swimming', 'hiking', 'dining', 'business', 'photography', 'sports'].map(activity => (
                    <Badge
                      key={activity}
                      variant={activities.includes(activity) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (activities.includes(activity)) {
                          setActivities(activities.filter(a => a !== activity))
                        } else {
                          setActivities([...activities, activity])
                        }
                      }}
                    >
                      {activity}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {setupMode === 'smart' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
              <Clock className="h-4 w-4" />
              <span>Smart Setup will analyze your trip details and generate personalized suggestions.</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!tripName || !startDate || !endDate || !destination}
          >
            Create Trip & Generate List
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}