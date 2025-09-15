'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BuyThereItem, ArrivalListConfig, PackingItem } from '@/lib/types'
import { BuyThereFilterComponent } from './buy-there-filter'
import { ArrivalList } from './arrival-list'
import { ArrowLeft, ShoppingBag, Package, Settings, List, CheckCircle2, X } from 'lucide-react'

interface BuyThereManagerProps {
  packingItems: PackingItem[]
  onBackToPackingList: () => void
  onItemsUpdated?: (items: BuyThereItem[]) => void
}

export function BuyThereManager({ packingItems, onBackToPackingList, onItemsUpdated }: BuyThereManagerProps) {
  const [buyThereItems, setBuyThereItems] = useState<BuyThereItem[]>(() => {
    // Initialize with some sample buy-there items for demo
    return packingItems.map((item, index) => ({
      ...item,
      buyAtDestination: index % 3 === 0, // Every 3rd item is buy-there for demo
      buyThereReason: index % 3 === 0 ? getSampleReason(item.category) : undefined,
      estimatedCost: index % 3 === 0 ? getSampleCost(item.category) : undefined,
      priority: getSamplePriority(item.category, item.essential),
      alternativeItem: index % 3 === 0 && Math.random() > 0.5 ? getSampleAlternative(item.name) : undefined
    }))
  })

  const [filteredItems, setFilteredItems] = useState<BuyThereItem[]>([])
  const [config, setConfig] = useState<ArrivalListConfig>({
    showCosts: true,
    groupByCategory: true,
    sortBy: 'priority',
    includeAlternatives: true
  })
  const [activeTab, setActiveTab] = useState('filter')

  const handleItemPurchased = useCallback((itemId: string) => {
    setBuyThereItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, packed: true, buyAtDestination: false }
          : item
      )
    )
  }, [])

  const handleItemRemoved = useCallback((itemId: string) => {
    setBuyThereItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, buyAtDestination: false }
          : item
      )
    )
  }, [])

  const handleToggleBuyThere = useCallback((itemId: string) => {
    setBuyThereItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              buyAtDestination: !item.buyAtDestination,
              buyThereReason: !item.buyAtDestination ? getSampleReason(item.category) : undefined,
              estimatedCost: !item.buyAtDestination ? getSampleCost(item.category) : undefined,
              priority: getSamplePriority(item.category, item.essential)
            }
          : item
      )
    )
  }, [])

  const buyThereItemsCount = buyThereItems.filter(item => item.buyAtDestination).length
  const totalEstimatedCost = buyThereItems
    .filter(item => item.buyAtDestination)
    .reduce((sum, item) => sum + (item.estimatedCost || 0), 0)

  // Only update parent when user explicitly saves or exits
  const handleSaveAndExit = () => {
    if (onItemsUpdated) {
      onItemsUpdated(buyThereItems)
    }
    onBackToPackingList()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleSaveAndExit}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Save & Back to Packing List
          </Button>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingBag className="h-6 w-6" />
              Buy-There Filter & Arrival List
            </h2>
            <p className="text-muted-foreground">
              Manage items to purchase at your destination
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold">{buyThereItemsCount}</div>
            <div className="text-sm text-muted-foreground">items to buy</div>
          </div>
          <Button variant="ghost" size="icon" onClick={onBackToPackingList} title="Close without saving">
            <X className="h-4 w-4" />
          </Button>
          {config.showCosts && totalEstimatedCost > 0 && (
            <div className="text-right border-l pl-4">
              <div className="text-2xl font-bold text-green-600">${totalEstimatedCost}</div>
              <div className="text-sm text-muted-foreground">estimated cost</div>
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="filter" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Filter & Configure
          </TabsTrigger>
          <TabsTrigger value="arrival-list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Arrival Shopping List
          </TabsTrigger>
          <TabsTrigger value="manage-items" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Manage Items
          </TabsTrigger>
        </TabsList>

        <TabsContent value="filter" className="space-y-6">
          <BuyThereFilterComponent
            items={buyThereItems}
            onFilterChange={setFilteredItems}
            onConfigChange={setConfig}
            config={config}
          />
        </TabsContent>

        <TabsContent value="arrival-list" className="space-y-6">
          <ArrivalList
            items={filteredItems.length > 0 ? filteredItems : buyThereItems.filter(item => item.buyAtDestination)}
            config={config}
            onItemPurchased={handleItemPurchased}
            onItemRemoved={handleItemRemoved}
          />
        </TabsContent>

        <TabsContent value="manage-items" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Buy-There Items</CardTitle>
              <CardDescription>
                Toggle which items you want to buy at your destination instead of packing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {buyThereItems.map(item => (
                  <Card 
                    key={item.id} 
                    className={`transition-all ${item.buyAtDestination ? 'bg-blue-50 border-blue-200' : ''}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={item.buyAtDestination}
                              onChange={() => handleToggleBuyThere(item.id)}
                              className="rounded border-gray-300"
                            />
                            <span>{item.name}</span>
                            {item.packed && (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {item.category} • Qty: {item.quantity}
                            {item.buyAtDestination && item.estimatedCost && (
                              <span className="ml-2 text-green-600 font-medium">
                                ~${item.estimatedCost}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {item.buyAtDestination && item.buyThereReason && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          <strong>Why buy there:</strong> {item.buyThereReason}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper functions for sample data
function getSampleReason(category: string): string {
  const reasons: Record<string, string[]> = {
    toiletries: ['Liquids restrictions', 'Cheaper to buy locally', 'Avoid leakage in luggage'],
    tech: ['Available duty-free', 'Better local warranty', 'Voltage compatibility'],
    bottoms: ['Try before buying', 'Local fashion preferences', 'Weather-appropriate'],
    tops: ['Local style preferences', 'Climate-specific materials', 'Souvenir shopping'],
    shoes: ['Comfort fitting important', 'Local terrain specific', 'Weight savings'],
    misc: ['Available everywhere', 'Bulk items', 'Local preferences'],
    outerwear: ['Weather-dependent', 'Local climate gear', 'Rental available'],
    underwear: ['Personal preference', 'Local brands', 'Pack light strategy'],
    accessories: ['Local fashion', 'Cultural appropriateness', 'Souvenir potential']
  }
  
  const categoryReasons = reasons[category] || ['Better to buy locally', 'Save luggage space', 'Local availability']
  return categoryReasons[Math.floor(Math.random() * categoryReasons.length)]
}

function getSampleCost(category: string): number {
  const costs: Record<string, [number, number]> = {
    toiletries: [5, 25],
    tech: [20, 200],
    bottoms: [25, 80],
    tops: [15, 60],
    shoes: [40, 150],
    misc: [5, 30],
    outerwear: [50, 200],
    underwear: [10, 40],
    accessories: [10, 50]
  }
  
  const [min, max] = costs[category] || [10, 50]
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getSamplePriority(category: string, isEssential: boolean): 'high' | 'medium' | 'low' {
  if (isEssential) return 'high'
  
  const priorities: Record<string, ('high' | 'medium' | 'low')[]> = {
    toiletries: ['high', 'high', 'medium'],
    tech: ['medium', 'medium', 'low'],
    bottoms: ['high', 'medium', 'medium'],
    tops: ['medium', 'medium', 'low'],
    shoes: ['high', 'medium', 'low'],
    underwear: ['high', 'high', 'medium'],
    outerwear: ['high', 'medium', 'low'],
    misc: ['low', 'low', 'medium'],
    accessories: ['low', 'medium', 'low']
  }
  
  const categoryPriorities = priorities[category] || ['medium', 'low', 'low']
  return categoryPriorities[Math.floor(Math.random() * categoryPriorities.length)]
}

function getSampleAlternative(itemName: string): string {
  const alternatives = [
    `Generic ${itemName.toLowerCase()}`,
    `Local brand ${itemName.toLowerCase()}`,
    `Travel-size ${itemName.toLowerCase()}`,
    `Disposable ${itemName.toLowerCase()}`,
    `Budget ${itemName.toLowerCase()}`
  ]
  return alternatives[Math.floor(Math.random() * alternatives.length)]
}