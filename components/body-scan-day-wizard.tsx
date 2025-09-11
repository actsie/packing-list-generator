'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Scan, CalendarDays, Sparkles, CheckCircle } from 'lucide-react'
import { MasterList, Trip, PackingItem } from '@/lib/types'
import { BodyScanWizard, BodyScanResult } from '@/components/body-scan-wizard/body-scan-wizard'
import { DayVisualizationWizard, DayPlan } from '@/components/day-visualization/day-visualization-wizard'

interface BodyScanDayWizardProps {
  masterList?: MasterList | null
  trip?: Trip
  onBack: () => void
  onComplete: (results: {
    bodyScannResults?: BodyScanResult[]
    dayPlans?: DayPlan[]
    optimizedItems: PackingItem[]
  }) => void
}

type WizardStep = 'intro' | 'body-scan' | 'day-visualization' | 'complete'

export function BodyScanDayWizard({ masterList, trip, onBack, onComplete }: BodyScanDayWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('intro')
  const [bodyScannResults, setBodyScanResults] = useState<BodyScanResult[]>([])
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([])
  const [activeTab, setActiveTab] = useState('body-scan')

  const items = masterList?.items || []
  const hasTrip = Boolean(trip)
  const hasMasterList = Boolean(masterList)

  const handleBodyScanComplete = (results: BodyScanResult[]) => {
    setBodyScanResults(results)
    if (hasTrip) {
      setActiveTab('day-visualization')
    } else {
      handleComplete()
    }
  }

  const handleDayVisualizationComplete = (plans: DayPlan[]) => {
    setDayPlans(plans)
    handleComplete()
  }

  const handleComplete = () => {
    // Create optimized packing list based on scan results and day plans
    const optimizedItems: PackingItem[] = []
    
    if (bodyScannResults.length > 0) {
      bodyScannResults.forEach(result => {
        if (result.hasInCloset && !result.needsReplacement) {
          optimizedItems.push({
            ...result.item,
            notes: `In closet - ${result.condition} condition`
          })
        } else if (result.needsReplacement) {
          optimizedItems.push({
            ...result.item,
            notes: `Need to buy - current item in ${result.condition} condition`
          })
        } else {
          optimizedItems.push({
            ...result.item,
            notes: 'Need to buy - not in closet'
          })
        }
      })
    } else {
      // If no body scan, use original items
      optimizedItems.push(...items)
    }

    onComplete({
      bodyScannResults: bodyScannResults.length > 0 ? bodyScannResults : undefined,
      dayPlans: dayPlans.length > 0 ? dayPlans : undefined,
      optimizedItems
    })
  }

  if (currentStep === 'intro') {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Body-Scan & Day Visualization Wizards</CardTitle>
          <CardDescription className="max-w-2xl mx-auto">
            Use these powerful tools to optimize your packing list and plan your daily outfits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 border-dashed">
              <CardHeader className="text-center">
                <Scan className="h-8 w-8 mx-auto text-primary mb-2" />
                <CardTitle className="text-lg">Body-Scan Wizard</CardTitle>
                <CardDescription>
                  Scan your closet to see what you already have and what needs replacing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Identify items you already own</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Assess condition of existing items</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Find items that need replacement</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Generate optimized shopping list</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed">
              <CardHeader className="text-center">
                <CalendarDays className="h-8 w-8 mx-auto text-primary mb-2" />
                <CardTitle className="text-lg">Day Visualization Wizard</CardTitle>
                <CardDescription>
                  Plan your outfits for each day of your trip
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Plan outfits by day and activity</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Consider weather and activities</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Avoid overpacking similar items</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Ensure you have outfits for each occasion</span>
                  </div>
                </div>
                {!hasTrip && (
                  <Badge variant="secondary" className="w-full justify-center">
                    Requires trip details
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {hasMasterList ? 
                `Working with ${items.length} items from "${masterList?.name}"` :
                'No master list selected'
              }
              {hasTrip && ` • ${trip?.days} day trip to ${trip?.destination}`}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="body-scan" 
                className="flex items-center gap-2"
                disabled={!hasMasterList}
              >
                <Scan className="h-4 w-4" />
                Body-Scan Wizard
              </TabsTrigger>
              <TabsTrigger 
                value="day-visualization" 
                className="flex items-center gap-2"
                disabled={!hasTrip || !hasMasterList}
              >
                <CalendarDays className="h-4 w-4" />
                Day Visualization
              </TabsTrigger>
            </TabsList>

            <TabsContent value="body-scan" className="mt-6">
              {hasMasterList ? (
                <div className="text-center space-y-4">
                  <p>Ready to scan your closet for items from your master list.</p>
                  <Button 
                    onClick={() => setCurrentStep('body-scan')}
                    className="flex items-center gap-2"
                    size="lg"
                  >
                    <Scan className="h-5 w-5" />
                    Start Body-Scan Wizard
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Please select a master list first to use the Body-Scan Wizard.
                </div>
              )}
            </TabsContent>

            <TabsContent value="day-visualization" className="mt-6">
              {hasTrip && hasMasterList ? (
                <div className="text-center space-y-4">
                  <p>Ready to plan your daily outfits for {trip?.name}.</p>
                  <Button 
                    onClick={() => setCurrentStep('day-visualization')}
                    className="flex items-center gap-2"
                    size="lg"
                  >
                    <CalendarDays className="h-5 w-5" />
                    Start Day Visualization
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  {!hasMasterList ? 
                    'Please select a master list first.' :
                    'Please create or select a trip first to use the Day Visualization Wizard.'
                  }
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between pt-6 border-t">
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            {(bodyScannResults.length > 0 || dayPlans.length > 0) && (
              <Button onClick={handleComplete} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Use Current Results
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (currentStep === 'body-scan') {
    return (
      <BodyScanWizard
        items={items}
        onComplete={handleBodyScanComplete}
        onBack={() => setCurrentStep('intro')}
      />
    )
  }

  if (currentStep === 'day-visualization' && trip) {
    return (
      <DayVisualizationWizard
        trip={trip}
        items={items}
        onComplete={handleDayVisualizationComplete}
        onBack={() => setCurrentStep('intro')}
      />
    )
  }

  return null
}