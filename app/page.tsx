'use client'

import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MasterListLibrary } from '@/components/master-list/master-list-library'
import { PackingListGenerator } from '@/components/packing-list/packing-list-generator'
import { AlwaysPackedKitsLibrary } from '@/components/always-packed-kits/always-packed-kits-library'
import { BuyThereManager } from '@/components/buy-there/buy-there-manager'
import { MasterList, PackingItem, Trip } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, BookOpen, List, Star, Wand2, Package2, Scan, CalendarDays, FileText, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react'
import { TripBasedGenerator } from '@/components/trip-based-generator'
import { BodyScanDayWizard } from '@/components/body-scan-day-wizard'
import { PostTripReviewComponent } from '@/components/post-trip-review'
import { TripStorage } from '@/lib/trip-storage'

export default function HomePage() {
  const [selectedMasterList, setSelectedMasterList] = useState<MasterList | null>(null)
  const [packingListItems, setPackingListItems] = useState<PackingItem[]>([])
  const [activeTab, setActiveTab] = useState('library')
  const [featuresExpanded, setFeaturesExpanded] = useState(true)
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null)

  // Check for active trip on mount - if found, redirect to trip page
  useEffect(() => {
    const trip = TripStorage.getActiveTrip()
    if (trip) {
      // Redirect to the trip page
      window.location.href = `/trip/${trip.id}`
    }
  }, [])

  const handleSelectMasterList = (list: MasterList) => {
    setSelectedMasterList(list)
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Packing List Generator
        </h1>
        <p className="text-xl text-muted-foreground">
          Create smart packing lists from your master templates
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="library" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Master Lists
          </TabsTrigger>
          <TabsTrigger value="always-packed-kits" className="flex items-center gap-2">
            <Package2 className="h-4 w-4" />
            Always-Packed Kits
          </TabsTrigger>
          <TabsTrigger value="buy-there" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Buy-There Filter
          </TabsTrigger>
          <TabsTrigger value="post-trip-review" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Post-Trip Review
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-6">
          <MasterListLibrary 
            onSelectList={handleSelectMasterList}
            selectedListId={selectedMasterList?.id}
          />
        </TabsContent>

        <TabsContent value="always-packed-kits" className="space-y-6">
          <AlwaysPackedKitsLibrary 
            onAddItemsToPackingList={(items) => {
              setPackingListItems(prev => [...prev, ...items])
            }}
          />
        </TabsContent>


        <TabsContent value="buy-there" className="space-y-6">
          {selectedMasterList || packingListItems.length > 0 ? (
            <BuyThereManager
              packingItems={selectedMasterList?.items.map(item => ({
                ...item,
                packed: false
              })) || packingListItems}
              onBackToPackingList={() => setActiveTab('library')}
              onItemsUpdated={(items) => {
                // Update packing list items with buy-there information
                if (selectedMasterList) {
                  // Handle master list items update
                  console.log('Updated master list items:', items)
                } else {
                  // Handle custom packing list items update
                  setPackingListItems(items as PackingItem[])
                }
              }}
            />
          ) : (
            <Card className="text-center py-12">
              <CardContent className="space-y-4">
                <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
                <div>
                  <CardTitle className="text-xl mb-2">No Packing List Available</CardTitle>
                  <CardDescription className="max-w-md mx-auto">
                    Start a packing list first to use the Buy-There Filter & Arrival List feature.
                  </CardDescription>
                </div>
                <div className="pt-4 flex flex-col sm:flex-row gap-2 items-center justify-center">
                  <button
                    onClick={() => setActiveTab('library')}
                    className="text-primary hover:underline font-medium"
                  >
                    Browse Master Lists →
                  </button>
                  <span className="text-muted-foreground">or</span>
                  <button
                    onClick={() => setActiveTab('always-packed-kits')}
                    className="text-primary hover:underline font-medium"
                  >
                    Browse Always-Packed Kits →
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="post-trip-review" className="space-y-6">
          <PostTripReviewComponent
            trip={{
              id: 'demo-trip',
              name: 'Sample Trip',
              startDate: '2024-01-15',
              endDate: '2024-01-22',
              days: 7,
              destination: 'San Francisco',
              destinationType: 'city',
              season: 'winter',
              luggage: 'carryOn',
              laundry: true,
              shoppingLikely: false,
              activities: ['business', 'dining', 'walking'],
              createdAt: '2024-01-10T00:00:00Z',
              updatedAt: '2024-01-10T00:00:00Z',
              checklistItems: []
            }}
            packingItems={packingListItems.length > 0 ? packingListItems : [
              {
                id: '1',
                name: 'T-Shirts',
                category: 'tops',
                quantity: 4,
                packed: true,
                essential: true
              },
              {
                id: '2',
                name: 'Jeans',
                category: 'bottoms',
                quantity: 2,
                packed: true,
                essential: true
              },
              {
                id: '3',
                name: 'Sneakers',
                category: 'shoes',
                quantity: 1,
                packed: true,
                essential: true
              },
              {
                id: '4',
                name: 'Phone Charger',
                category: 'tech',
                quantity: 1,
                packed: true,
                essential: true
              },
              {
                id: '5',
                name: 'Laptop',
                category: 'tech',
                quantity: 1,
                packed: true,
                essential: true
              }
            ]}
            onBack={() => setActiveTab('library')}
            onSaveReview={(review) => {
              console.log('Post-trip review saved:', review)
              alert('Review saved successfully!')
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Feature Highlights Section */}
      <div className="mt-12">
        <div className="flex items-center justify-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFeaturesExpanded(!featuresExpanded)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {featuresExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Collapse Feature Highlights
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Expand Feature Highlights
              </>
            )}
          </Button>
        </div>

        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-300 ease-in-out ${
            featuresExpanded
              ? 'opacity-100 max-h-[1000px]'
              : 'opacity-0 max-h-0 overflow-hidden'
          }`}
        >
        <Card>
          <CardHeader className="text-center">
            <BookOpen className="h-8 w-8 mx-auto text-primary mb-2" />
            <CardTitle className="text-lg">Master Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              Browse pre-built packing list templates for different trip types and activities.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Package2 className="h-8 w-8 mx-auto text-primary mb-2" />
            <CardTitle className="text-lg">Always-Packed Kits</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              Pre-defined sets of items you always need - quickly add toiletries, tech, or documents to any trip.
            </CardDescription>
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="text-center">
            <ShoppingBag className="h-8 w-8 mx-auto text-primary mb-2" />
            <CardTitle className="text-lg">Buy-There Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              Smart filtering for items to purchase at your destination with arrival shopping lists.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <FileText className="h-8 w-8 mx-auto text-primary mb-2" />
            <CardTitle className="text-lg">Post-Trip Review</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              Review your packing experience, log regrets, and get insights to improve future trips.
            </CardDescription>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}