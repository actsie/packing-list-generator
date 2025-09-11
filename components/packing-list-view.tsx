'use client'

import { useState } from 'react'
import { PackingItem, PackingListFilters } from '@/lib/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Minus, Plus, Search, ShoppingCart, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PackingListViewProps {
  items: PackingItem[]
  onItemToggle: (itemId: string) => void
  onQuantityChange: (itemId: string, newQuantity: number) => void
  showCategories?: boolean
  filters?: PackingListFilters
}

export default function PackingListView({
  items,
  onItemToggle,
  onQuantityChange,
  showCategories = true,
  filters
}: PackingListViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<PackingListFilters>(filters || {})

  // Filter items based on search and filters
  const filteredItems = items.filter(item => {
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (activeFilters.category && item.category !== activeFilters.category) {
      return false
    }
    if (activeFilters.essential !== undefined && item.essential !== activeFilters.essential) {
      return false
    }
    if (activeFilters.packed !== undefined && item.packed !== activeFilters.packed) {
      return false
    }
    return true
  })

  // Group items by category if showing categories
  const groupedItems = showCategories ? 
    filteredItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    }, {} as Record<string, PackingItem[]>) :
    { all: filteredItems }

  const categories = Object.keys(groupedItems)
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'documents': return '📄'
      case 'tech': return '📱'
      case 'tops': return '👕'
      case 'bottoms': return '👖'
      case 'underwear': return '🩲'
      case 'toiletries': return '🧴'
      case 'meds': return '💊'
      case 'shoes': return '👟'
      case 'outerwear': return '🧥'
      case 'accessories': return '👜'
      default: return '📦'
    }
  }

  const getTotalStats = () => {
    const total = filteredItems.length
    const packed = filteredItems.filter(item => item.packed).length
    const essential = filteredItems.filter(item => item.essential).length
    const essentialPacked = filteredItems.filter(item => item.essential && item.packed).length
    
    return { total, packed, essential, essentialPacked }
  }

  const stats = getTotalStats()

  return (
    <div className="space-y-4">
      {/* Search and Stats */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">
            {stats.packed}/{stats.total} packed
          </Badge>
          <Badge variant={stats.essentialPacked === stats.essential ? "default" : "destructive"}>
            {stats.essentialPacked}/{stats.essential} essentials
          </Badge>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-6">
        {categories.map(category => (
          <div key={category} className="space-y-3">
            {showCategories && (
              <h3 className="flex items-center gap-2 text-lg font-semibold capitalize">
                <span className="text-2xl">{getCategoryIcon(category)}</span>
                {category}
                <Badge variant="secondary">
                  {groupedItems[category].filter(item => item.packed).length}/
                  {groupedItems[category].length}
                </Badge>
              </h3>
            )}
            
            <div className="space-y-2">
              {groupedItems[category].map(item => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                    item.packed ? "bg-muted/50 text-muted-foreground" : "bg-card",
                    item.essential && !item.packed && "border-orange-200 bg-orange-50"
                  )}
                >
                  {/* Checkbox */}
                  <Checkbox
                    checked={item.packed}
                    onCheckedChange={() => onItemToggle(item.id)}
                    className={cn(
                      "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
                      item.essential && !item.packed && "border-orange-400"
                    )}
                  />

                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-medium",
                        item.packed && "line-through"
                      )}>
                        {item.name}
                      </span>
                      {item.essential && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Essential
                        </Badge>
                      )}
                    </div>
                    {item.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{item.notes}</p>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="min-w-[2rem] text-center font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Buy There Option */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    title="Buy at destination"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery ? 'No items match your search.' : 'No items to pack yet.'}
        </div>
      )}
    </div>
  )
}