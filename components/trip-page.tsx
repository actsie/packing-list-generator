'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trip } from '@/lib/types'
import { TripStorage } from '@/lib/trip-storage'
import { TripBasedGenerator } from './trip-based-generator'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { ChecklistHeader } from './checklist-header'
import { SaveAsTemplateModal } from './save-as-template-modal'
import { MasterListStorage } from '@/lib/master-list-storage'
import { generateSmartSuggestions } from '@/lib/smart-suggestions'
import { BodyScanDayWizard } from './body-scan-day-wizard'
import { BuyThereManager } from './buy-there/buy-there-manager'

interface TripPageProps {
  tripId: string
}

export function TripPage({ tripId }: TripPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showNextStepBar, setShowNextStepBar] = useState(false)
  const [suggestionsApplied, setSuggestionsApplied] = useState(false)
  const [showSaveAsTemplateModal, setShowSaveAsTemplateModal] = useState(false)
  const [showBodyScanWizard, setShowBodyScanWizard] = useState(false)
  const [showArrivalList, setShowArrivalList] = useState(false)

  useEffect(() => {
    const loadTrip = () => {
      const tripData = TripStorage.getTrip(tripId)
      if (tripData) {
        setTrip(tripData)
        
        // Show next step bar if it's smart setup and suggestions haven't been applied
        if (tripData.setupMode === 'smart' && (!tripData.appliedSuggestions || tripData.appliedSuggestions.length === 0)) {
          setShowNextStepBar(true)
          
        }
      } else {
        router.push('/')
      }
      setIsLoading(false)
    }

    loadTrip()
  }, [tripId, router])


  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading trip...</p>
        </div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>
            Trip not found. <Button variant="link" onClick={() => router.push('/')}>Return to library</Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Next Step Bar */}
      {showNextStepBar && trip.setupMode === 'smart' && (
        <div className="sticky top-0 z-50 bg-primary text-primary-foreground p-4 shadow-lg">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5" />
              <span className="font-medium">Next: Apply suggestions</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const suggestionsElement = document.getElementById('suggestions-panel')
                suggestionsElement?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="flex items-center gap-2"
            >
              View Suggestions
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="container mx-auto p-6">

        {/* Success message after applying suggestions */}
        {suggestionsApplied && (
          <Card className="mb-6 p-4 bg-green-50 border-green-200">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">Suggestions applied successfully!</p>
                <p className="text-sm text-green-700 mt-1">
                  Your packing list has been optimized. You can now review items, adjust quantities, and start packing.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      const checklistElement = document.getElementById('packing-checklist')
                      checklistElement?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    Review Checklist
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setSuggestionsApplied(false)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Checklist-only mode: Show coach mark */}
        {trip.setupMode === 'checklist' && !trip.suggestions?.length && (
          <Card className="mb-6 p-4 bg-muted/50">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Need help?</p>
                <p className="text-sm text-muted-foreground">
                  Open Smart Setup in Tools to get personalized suggestions for your trip.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Main Checklist */}
        <div id="packing-checklist">
          <ChecklistHeader 
            trip={trip}
            onOpenSmartSetup={() => {
              // Generate suggestions if they don't exist
              if (!trip.suggestions || trip.suggestions.length === 0) {
                const suggestions = generateSmartSuggestions(trip)
                TripStorage.addSuggestions(tripId, suggestions)
                const updatedTrip = TripStorage.getTrip(tripId)
                if (updatedTrip) {
                  setTrip(updatedTrip)
                  toast({
                    title: "Smart suggestions generated",
                    description: "Scroll down to view your personalized packing suggestions.",
                  })
                }
              }
              
              // Scroll to the trip-based-generator section which contains suggestions
              setTimeout(() => {
                const packingListElement = document.getElementById('packing-list')
                packingListElement?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }, 100)
            }}
            onOpenBodyScan={() => {
              setShowBodyScanWizard(true)
            }}
            onOpenArrivalList={() => {
              setShowArrivalList(true)
            }}
            onSaveAsTemplate={() => setShowSaveAsTemplateModal(true)}
          />
          <TripBasedGenerator 
            trip={trip} 
            onBackToLibrary={() => {
              TripStorage.clearActiveTrip()
              router.push('/')
            }}
          />
        </div>
      </div>

      {/* Save as Template Modal */}
      <SaveAsTemplateModal
        open={showSaveAsTemplateModal}
        onOpenChange={setShowSaveAsTemplateModal}
        trip={trip}
        onSave={(masterList) => {
          MasterListStorage.saveMasterList(masterList)
          toast({
            title: "Template saved successfully",
            description: `"${masterList.name}" has been added to your Master List Library`,
          })
        }}
      />

      {/* Body-Scan & Day Viz Modal */}
      {showBodyScanWizard && (
        <div className="fixed inset-0 z-50 bg-background">
          <BodyScanDayWizard
            masterList={{
              id: trip.masterListId || 'trip-list',
              name: trip.name,
              description: `Packing list for ${trip.destination}`,
              category: 'Trip',
              items: trip.checklistItems.map(item => ({
                id: item.id,
                name: item.name,
                category: item.category,
                quantity: item.quantity,
                essential: item.essential,
                notes: item.notes
              })),
              createdAt: new Date(),
              updatedAt: new Date(),
              isTemplate: false
            }}
            onBack={() => setShowBodyScanWizard(false)}
            onComplete={(results) => {
              // Update trip with optimized items
              if (results.optimizedItems) {
                const updatedTrip = { ...trip }
                updatedTrip.checklistItems = results.optimizedItems.map(item => ({
                  ...item,
                  packed: false
                }))
                TripStorage.saveTrip(updatedTrip)
                setTrip(updatedTrip)
                toast({
                  title: "Packing list optimized",
                  description: "Your items have been updated based on the Body-Scan results.",
                })
              }
              setShowBodyScanWizard(false)
            }}
          />
        </div>
      )}

      {/* Arrival List Modal */}
      {showArrivalList && (
        <div className="fixed inset-0 z-50 bg-background overflow-auto">
          <div className="container mx-auto p-6">
            <BuyThereManager
              packingItems={trip.checklistItems}
              onBackToPackingList={() => setShowArrivalList(false)}
              onItemsUpdated={(updatedItems) => {
                // Update trip with buy-there information
                const updatedTrip = { ...trip, checklistItems: updatedItems }
                TripStorage.saveTrip(updatedTrip)
                setTrip(updatedTrip)
                toast({
                  title: "Buy-there items updated",
                  description: "Your arrival shopping list has been saved.",
                })
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}