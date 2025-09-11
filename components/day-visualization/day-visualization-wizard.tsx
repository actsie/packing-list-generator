'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, ArrowRight, CalendarDays, Sun, Moon, Coffee, MapPin, Camera, CheckCircle, RotateCcw, Shirt } from 'lucide-react'
import { PackingItem, Trip } from '@/lib/types'

interface DayVisualizationWizardProps {
  trip: Trip
  items: PackingItem[]
  onComplete: (dayPlans: DayPlan[]) => void
  onBack: () => void
}

export interface OutfitPlan {
  top?: PackingItem
  bottom?: PackingItem
  shoes?: PackingItem
  outerwear?: PackingItem
  accessories: PackingItem[]
  notes?: string
}

export interface DayPlan {
  day: number
  date: string
  weather: 'sunny' | 'rainy' | 'cloudy' | 'cold' | 'hot'
  activities: string[]
  outfits: {
    morning: OutfitPlan
    afternoon?: OutfitPlan
    evening?: OutfitPlan
  }
  specialNotes?: string
}

const WEATHER_OPTIONS = [
  { value: 'sunny', label: 'Sunny', icon: '☀️' },
  { value: 'cloudy', label: 'Cloudy', icon: '☁️' },
  { value: 'rainy', label: 'Rainy', icon: '🌧️' },
  { value: 'cold', label: 'Cold', icon: '❄️' },
  { value: 'hot', label: 'Hot', icon: '🔥' }
]

const ACTIVITY_SUGGESTIONS = [
  'sightseeing', 'dining', 'business meeting', 'casual walk', 'beach/pool', 
  'hiking', 'shopping', 'museum', 'nightlife', 'travel day', 'conference',
  'wedding', 'formal event', 'outdoor activity', 'relaxation'
]

export function DayVisualizationWizard({ trip, items, onComplete, onBack }: DayVisualizationWizardProps) {
  const [currentDay, setCurrentDay] = useState(1)
  const [dayPlans, setDayPlans] = useState<Map<number, DayPlan>>(new Map())
  const [showSummary, setShowSummary] = useState(false)

  const totalDays = trip.days
  const progress = (currentDay / totalDays) * 100

  useEffect(() => {
    // Initialize day plans
    for (let day = 1; day <= totalDays; day++) {
      if (!dayPlans.has(day)) {
        const dayDate = new Date(trip.startDate)
        dayDate.setDate(dayDate.getDate() + day - 1)
        
        setDayPlans(prev => new Map(prev).set(day, {
          day,
          date: dayDate.toISOString().split('T')[0],
          weather: 'sunny',
          activities: [],
          outfits: {
            morning: { accessories: [] }
          }
        }))
      }
    }
  }, [totalDays, trip.startDate])

  const currentDayPlan = dayPlans.get(currentDay)
  
  const itemsByCategory = {
    tops: items.filter(item => item.category === 'tops'),
    bottoms: items.filter(item => item.category === 'bottoms'),
    shoes: items.filter(item => item.category === 'shoes'),
    outerwear: items.filter(item => item.category === 'outerwear'),
    accessories: items.filter(item => item.category === 'accessories')
  }

  const updateDayPlan = (day: number, updates: Partial<DayPlan>) => {
    setDayPlans(prev => {
      const newMap = new Map(prev)
      const existing = newMap.get(day)
      if (existing) {
        newMap.set(day, { ...existing, ...updates })
      }
      return newMap
    })
  }

  const updateOutfit = (day: number, period: 'morning' | 'afternoon' | 'evening', outfit: Partial<OutfitPlan>) => {
    const dayPlan = dayPlans.get(day)
    if (dayPlan) {
      const updatedOutfits = {
        ...dayPlan.outfits,
        [period]: { ...dayPlan.outfits[period], ...outfit }
      }
      updateDayPlan(day, { outfits: updatedOutfits })
    }
  }

  const handleNext = () => {
    if (currentDay < totalDays) {
      setCurrentDay(currentDay + 1)
    } else {
      setShowSummary(true)
    }
  }

  const handlePrevious = () => {
    if (currentDay > 1) {
      setCurrentDay(currentDay - 1)
    }
  }

  const handleComplete = () => {
    onComplete(Array.from(dayPlans.values()))
  }

  const handleRestart = () => {
    setCurrentDay(1)
    setShowSummary(false)
    setDayPlans(new Map())
  }

  const toggleActivity = (activity: string) => {
    if (currentDayPlan) {
      const activities = currentDayPlan.activities.includes(activity)
        ? currentDayPlan.activities.filter(a => a !== activity)
        : [...currentDayPlan.activities, activity]
      updateDayPlan(currentDay, { activities })
    }
  }

  if (showSummary) {
    const allPlans = Array.from(dayPlans.values()).sort((a, b) => a.day - b.day)
    
    return (
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Day Visualization Summary</CardTitle>
          <CardDescription>
            Your {totalDays}-day outfit plan for {trip.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {allPlans.map(plan => (
              <Card key={plan.day}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CalendarDays className="h-5 w-5" />
                      Day {plan.day} - {new Date(plan.date).toLocaleDateString()}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {WEATHER_OPTIONS.find(w => w.value === plan.weather)?.icon} {plan.weather}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {plan.activities.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Activities:</h5>
                      <div className="flex flex-wrap gap-1">
                        {plan.activities.map(activity => (
                          <Badge key={activity} variant="secondary" className="text-xs">
                            {activity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Tabs defaultValue="morning" className="w-full">
                    <TabsList>
                      <TabsTrigger value="morning" className="flex items-center gap-1">
                        <Sun className="h-4 w-4" />
                        Morning
                      </TabsTrigger>
                      {plan.outfits.afternoon && (
                        <TabsTrigger value="afternoon" className="flex items-center gap-1">
                          <Coffee className="h-4 w-4" />
                          Afternoon
                        </TabsTrigger>
                      )}
                      {plan.outfits.evening && (
                        <TabsTrigger value="evening" className="flex items-center gap-1">
                          <Moon className="h-4 w-4" />
                          Evening
                        </TabsTrigger>
                      )}
                    </TabsList>

                    {(['morning', 'afternoon', 'evening'] as const).map(period => {
                      const outfit = plan.outfits[period]
                      if (!outfit) return null

                      return (
                        <TabsContent key={period} value={period} className="mt-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="font-medium">Top:</span>
                              <div className="text-muted-foreground">
                                {outfit.top?.name || 'Not selected'}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">Bottom:</span>
                              <div className="text-muted-foreground">
                                {outfit.bottom?.name || 'Not selected'}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">Shoes:</span>
                              <div className="text-muted-foreground">
                                {outfit.shoes?.name || 'Not selected'}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">Outerwear:</span>
                              <div className="text-muted-foreground">
                                {outfit.outerwear?.name || 'Not selected'}
                              </div>
                            </div>
                          </div>
                          {outfit.accessories.length > 0 && (
                            <div className="mt-2">
                              <span className="font-medium text-sm">Accessories: </span>
                              <span className="text-sm text-muted-foreground">
                                {outfit.accessories.map(acc => acc.name).join(', ')}
                              </span>
                            </div>
                          )}
                        </TabsContent>
                      )
                    })}
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleRestart} className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Restart Planning
            </Button>
            <Button onClick={handleComplete} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Use These Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentDayPlan) {
    return null
  }

  // Handle case where no items are available
  if (!items || items.length === 0) {
    return (
      <Card className="w-full max-w-5xl mx-auto">
        <CardContent className="text-center py-12">
          <CalendarDays className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <CardTitle className="text-xl mb-2">No Items Available</CardTitle>
          <CardDescription className="max-w-md mx-auto mb-6">
            Please select a master list with items before planning your daily outfits.
          </CardDescription>
          <Button onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Master Lists
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Handle invalid trip data
  if (!trip || trip.days <= 0) {
    return (
      <Card className="w-full max-w-5xl mx-auto">
        <CardContent className="text-center py-12">
          <CalendarDays className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <CardTitle className="text-xl mb-2">Invalid Trip Data</CardTitle>
          <CardDescription className="max-w-md mx-auto mb-6">
            Please ensure your trip has valid dates and duration.
          </CardDescription>
          <Button onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-6 w-6" />
              Day Visualization Wizard
            </CardTitle>
            <CardDescription>
              Day {currentDay} of {totalDays}: {new Date(currentDayPlan.date).toLocaleDateString()}
            </CardDescription>
          </div>
          <Progress value={progress} className="w-32" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Day Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Expected Weather:</label>
                <Select 
                  value={currentDayPlan.weather} 
                  onValueChange={(value) => updateDayPlan(currentDay, { weather: value as any })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WEATHER_OPTIONS.map(weather => (
                      <SelectItem key={weather.value} value={weather.value}>
                        {weather.icon} {weather.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Planned Activities:</label>
                <div className="grid grid-cols-2 gap-2">
                  {ACTIVITY_SUGGESTIONS.map(activity => (
                    <Button
                      key={activity}
                      variant={currentDayPlan.activities.includes(activity) ? 'default' : 'outline'}
                      size="sm"
                      className="justify-start text-xs h-8"
                      onClick={() => toggleActivity(activity)}
                    >
                      {activity}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Outfit Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="morning" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="morning" className="text-xs">
                    <Sun className="h-3 w-3 mr-1" />
                    Morning
                  </TabsTrigger>
                  <TabsTrigger value="afternoon" className="text-xs">
                    <Coffee className="h-3 w-3 mr-1" />
                    Afternoon
                  </TabsTrigger>
                  <TabsTrigger value="evening" className="text-xs">
                    <Moon className="h-3 w-3 mr-1" />
                    Evening
                  </TabsTrigger>
                </TabsList>

                {(['morning', 'afternoon', 'evening'] as const).map(period => (
                  <TabsContent key={period} value={period} className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium">Top:</label>
                        <Select 
                          value={currentDayPlan.outfits[period]?.top?.id || ''} 
                          onValueChange={(value) => {
                            const top = itemsByCategory.tops.find(item => item.id === value)
                            updateOutfit(currentDay, period, { top })
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select top" />
                          </SelectTrigger>
                          <SelectContent>
                            {itemsByCategory.tops.map(item => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-xs font-medium">Bottom:</label>
                        <Select 
                          value={currentDayPlan.outfits[period]?.bottom?.id || ''} 
                          onValueChange={(value) => {
                            const bottom = itemsByCategory.bottoms.find(item => item.id === value)
                            updateOutfit(currentDay, period, { bottom })
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select bottom" />
                          </SelectTrigger>
                          <SelectContent>
                            {itemsByCategory.bottoms.map(item => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-xs font-medium">Shoes:</label>
                        <Select 
                          value={currentDayPlan.outfits[period]?.shoes?.id || ''} 
                          onValueChange={(value) => {
                            const shoes = itemsByCategory.shoes.find(item => item.id === value)
                            updateOutfit(currentDay, period, { shoes })
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select shoes" />
                          </SelectTrigger>
                          <SelectContent>
                            {itemsByCategory.shoes.map(item => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-xs font-medium">Outerwear:</label>
                        <Select 
                          value={currentDayPlan.outfits[period]?.outerwear?.id || ''} 
                          onValueChange={(value) => {
                            const outerwear = itemsByCategory.outerwear.find(item => item.id === value)
                            updateOutfit(currentDay, period, { outerwear })
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select outerwear" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None needed</SelectItem>
                            {itemsByCategory.outerwear.map(item => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {period === 'morning' && (
                      <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
                        💡 Tip: Plan your main outfit for the day. You can add afternoon/evening changes if needed.
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between pt-6 border-t">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex gap-2">
            {currentDay > 1 && (
              <Button variant="outline" onClick={handlePrevious}>
                Previous Day
              </Button>
            )}
            <Button onClick={handleNext} className="flex items-center gap-2">
              {currentDay < totalDays ? 'Next Day' : 'View Summary'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}