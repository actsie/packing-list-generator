'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BuyThereItem, ArrivalListConfig } from '@/lib/types'
import { DollarSign, MapPin, Package, AlertCircle, Star, Info, ShoppingCart, CheckCircle2, X } from 'lucide-react'

interface ArrivalListProps {
  items: BuyThereItem[]
  config: ArrivalListConfig
  onItemPurchased?: (itemId: string) => void
  onItemRemoved?: (itemId: string) => void
}

export function ArrivalList({ items, config, onItemPurchased, onItemRemoved }: ArrivalListProps) {
  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4" />
      case 'medium': return <Star className="h-4 w-4" />
      case 'low': return <Info className="h-4 w-4" />
    }
  }

  const groupedItems = React.useMemo(() => {
    if (!config.groupByCategory) {
      return { 'All Items': items }
    }

    return items.reduce((groups, item) => {
      const category = item.category
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(item)
      return groups
    }, {} as Record<string, BuyThereItem[]>)
  }, [items, config.groupByCategory])

  const totalCost = React.useMemo(() => {
    return items.reduce((sum, item) => sum + (item.estimatedCost || 0), 0)
  }, [items])

  if (items.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <CardTitle className="text-xl mb-2">No Buy-There Items</CardTitle>
          <CardDescription>
            No items match your current filters or you haven't marked any items to buy at your destination.
          </CardDescription>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            Shopping List for Arrival
          </CardTitle>
          <CardDescription className="text-base">
            {items.length} items to buy at your destination
            {config.showCosts && totalCost > 0 && (
              <span className="ml-2 font-semibold text-green-700">
                • Estimated total: ${totalCost}
              </span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Grouped Items Display */}
      {Object.entries(groupedItems).map(([categoryName, categoryItems]) => (
        <div key={categoryName} className="space-y-4">
          {config.groupByCategory && (
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{categoryName}</h3>
              <Badge variant="outline">{categoryItems.length} items</Badge>
              {config.showCosts && (
                <Badge variant="secondary">
                  ${categoryItems.reduce((sum, item) => sum + (item.estimatedCost || 0), 0)}
                </Badge>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryItems.map(item => (
              <Card 
                key={item.id} 
                className="transition-all hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-600" />
                        <span>{item.name}</span>
                        <div className="flex items-center gap-1">
                          {item.essential && (
                            <Star className="h-4 w-4 text-orange-500 fill-orange-500" />
                          )}
                        </div>
                      </CardTitle>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          className={getPriorityColor(item.priority)}
                          variant="outline"
                        >
                          <span className="flex items-center gap-1">
                            {getPriorityIcon(item.priority)}
                            {item.priority} priority
                          </span>
                        </Badge>
                        
                        {config.showCosts && item.estimatedCost && (
                          <Badge variant="secondary">
                            <DollarSign className="h-3 w-3 mr-1" />
                            ${item.estimatedCost}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Item Details */}
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Category:</span> {item.category}
                    </div>
                    
                    <div>
                      <span className="font-medium">Quantity needed:</span> {item.quantity}
                    </div>

                    {item.buyThereReason && (
                      <div>
                        <span className="font-medium">Why buy there:</span>
                        <p className="text-muted-foreground mt-1">{item.buyThereReason}</p>
                      </div>
                    )}

                    {config.includeAlternatives && item.alternativeItem && (
                      <div>
                        <span className="font-medium">Alternative:</span>
                        <p className="text-muted-foreground mt-1">{item.alternativeItem}</p>
                      </div>
                    )}

                    {item.notes && (
                      <div>
                        <span className="font-medium">Notes:</span>
                        <p className="text-muted-foreground mt-1">{item.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    {onItemPurchased && (
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => onItemPurchased(item.id)}
                        className="flex-1"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Mark Purchased
                      </Button>
                    )}
                    
                    {onItemRemoved && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onItemRemoved(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Shopping Tips */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5 text-amber-600" />
            Shopping Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-amber-800">
            <li>• Focus on <Badge className="bg-red-100 text-red-800 text-xs">high priority</Badge> items first</li>
            <li>• Check local store hours and locations before arrival</li>
            <li>• Consider buying essentials at the airport if arriving late</li>
            {config.showCosts && totalCost > 0 && (
              <li>• Budget approximately <strong>${totalCost}</strong> for these items</li>
            )}
            <li>• Save receipts for items you might want to return before departure</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}