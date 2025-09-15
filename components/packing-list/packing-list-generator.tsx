'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MasterList, PackingItem, PackingListFilters, Trip, HeuristicConfig } from '@/lib/types'
import { PackingHeuristics } from '@/lib/heuristics'
import { ArrowLeft, Search, Filter, Package, CheckCircle, Circle, Star, Pin, PinOff, Target, List, Package2, Plus } from 'lucide-react'
import { Label } from '@/components/ui/label'
import EssentialsPanel from '@/components/essentials-panel'
import { PhasedPackingView } from '@/components/phased-packing-view'

interface PackingListGeneratorProps {
  masterList: MasterList
  onBackToLibrary: () => void
  onAddItemsFromKit?: (items: PackingItem[]) => void
  trip?: Trip
  heuristicsConfig?: HeuristicConfig
  onItemUpdate?: (itemId: string, updates: Partial<PackingItem>) => void
  onItemDelete?: (itemId: string) => void
}

export function PackingListGenerator({ masterList, onBackToLibrary, onAddItemsFromKit, trip, heuristicsConfig, onItemUpdate, onItemDelete }: PackingListGeneratorProps) {
  const [packingItems, setPackingItems] = useState<PackingItem[]>(() => 
    masterList.items.map(item => ({ ...item, packed: false, pinned: false }))
  )
  
  const heuristics = useMemo(() => 
    heuristicsConfig ? new PackingHeuristics(heuristicsConfig) : null, 
    [heuristicsConfig]
  )
  const [filters, setFilters] = useState<PackingListFilters>({
    searchQuery: '',
    category: undefined,
    essential: undefined,
    packed: undefined
  })
  const [packingMode, setPackingMode] = useState<'regular' | 'phased'>('regular')

  const categories = useMemo(() => {
    const cats = new Set(packingItems.map(item => item.category))
    return Array.from(cats).sort()
  }, [packingItems])

  const filteredItems = useMemo(() => {
    return packingItems.filter(item => {
      const matchesSearch = !filters.searchQuery || 
        item.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        (item.notes?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ?? false)
      
      const matchesCategory = !filters.category || item.category === filters.category
      const matchesEssential = filters.essential === undefined || item.essential === filters.essential
      const matchesPacked = filters.packed === undefined || item.packed === filters.packed

      return matchesSearch && matchesCategory && matchesEssential && matchesPacked
    })
  }, [packingItems, filters])

  const stats = useMemo(() => {
    const total = packingItems.length
    const packed = packingItems.filter(item => item.packed).length
    const essential = packingItems.filter(item => item.essential).length
    const essentialPacked = packingItems.filter(item => item.essential && item.packed).length
    
    return {
      total,
      packed,
      essential,
      essentialPacked,
      progress: total > 0 ? Math.round((packed / total) * 100) : 0,
      essentialProgress: essential > 0 ? Math.round((essentialPacked / essential) * 100) : 0
    }
  }, [packingItems])

  const toggleItemPacked = (itemId: string) => {
    const item = packingItems.find(i => i.id === itemId)
    if (!item) return
    
    if (onItemUpdate) {
      onItemUpdate(itemId, { packed: !item.packed })
    } else {
      setPackingItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, packed: !item.packed } : item
        )
      )
    }
  }

  const toggleItemPinned = (itemId: string) => {
    const item = packingItems.find(i => i.id === itemId)
    if (!item) return
    
    if (onItemUpdate) {
      onItemUpdate(itemId, { pinned: !item.pinned })
    } else {
      setPackingItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, pinned: !item.pinned } : item
        )
      )
    }
  }

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (onItemUpdate) {
      onItemUpdate(itemId, { quantity: Math.max(1, quantity) })
    } else {
      setPackingItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
        )
      )
    }
  }

  const addCustomItem = () => {
    const newItem: PackingItem = {
      id: `custom-${Date.now()}`,
      name: 'New Item',
      category: 'Custom',
      quantity: 1,
      packed: false,
      essential: false,
      notes: ''
    }
    setPackingItems(prev => [...prev, newItem])
  }

  const removeItem = (itemId: string) => {
    if (onItemDelete) {
      onItemDelete(itemId)
    } else {
      setPackingItems(prev => prev.filter(item => item.id !== itemId))
    }
  }

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      category: undefined,
      essential: undefined,
      packed: undefined
    })
  }

  const markAllEssentialPacked = () => {
    setPackingItems(prev => 
      prev.map(item => 
        item.essential ? { ...item, packed: true } : item
      )
    )
  }

  return (
    <div className={`flex gap-6 ${packingMode === 'phased' ? 'flex-col' : ''}`}>
      {/* Main Content */}
      <div className={`space-y-6 ${packingMode === 'regular' ? 'flex-1' : 'w-full'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBackToLibrary}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Library
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{masterList.name}</h2>
            <p className="text-muted-foreground">{masterList.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 border rounded-lg p-1">
          <Button
            variant={packingMode === 'regular' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPackingMode('regular')}
            className="flex items-center gap-2"
          >
            <List className="h-4 w-4" />
            Regular Mode
          </Button>
          <Button
            variant={packingMode === 'phased' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPackingMode('phased')}
            className="flex items-center gap-2"
          >
            <Target className="h-4 w-4" />
            Phased Mode
          </Button>
        </div>
      </div>

      {packingMode === 'regular' && (
        <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.packed}/{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.progress}% packed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-orange-500" />
              Essential Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.essentialPacked}/{stats.essential}</div>
            <p className="text-xs text-muted-foreground">
              {stats.essentialProgress}% packed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              different categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.progress}% complete
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="pl-10"
            />
          </div>
          
          <Select 
            value={filters.category || 'all'} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, category: value === 'all' ? undefined : value }))}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={filters.essential === undefined ? 'all' : filters.essential.toString()} 
            onValueChange={(value) => setFilters(prev => ({ 
              ...prev, 
              essential: value === 'all' ? undefined : value === 'true' 
            }))}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="All Items" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="true">Essential Only</SelectItem>
              <SelectItem value="false">Non-Essential</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={filters.packed === undefined ? 'all' : filters.packed.toString()} 
            onValueChange={(value) => setFilters(prev => ({ 
              ...prev, 
              packed: value === 'all' ? undefined : value === 'true' 
            }))}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="true">Packed</SelectItem>
              <SelectItem value="false">Not Packed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
          <Button variant="outline" size="sm" onClick={markAllEssentialPacked}>
            <Star className="h-4 w-4 mr-2" />
            Pack All Essential
          </Button>
          {onAddItemsFromKit && (
            <Button variant="outline" size="sm" onClick={() => {
              // This would open always-packed kits in a modal or navigate to the tab
              // For now, we'll just show a message
              alert('Switch to Always-Packed Kits tab to add kit items')
            }}>
              <Package2 className="h-4 w-4 mr-2" />
              Add Kit
            </Button>
          )}
          <Button size="sm" onClick={addCustomItem}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <Card 
            key={item.id}
            id={`item-${item.id}`}
            className={`transition-all ${item.packed ? 'bg-green-50 border-green-200' : ''}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    <button
                      onClick={() => toggleItemPacked(item.id)}
                      className="flex-shrink-0"
                    >
                      {item.packed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    <span className={item.packed ? 'line-through text-muted-foreground' : ''}>
                      {item.name}
                    </span>
                    <div className="flex items-center gap-1">
                      {item.essential && (
                        <Star className="h-4 w-4 text-orange-500 fill-orange-500" />
                      )}
                      {item.pinned && (
                        <Pin className="h-4 w-4 text-blue-500 fill-blue-500" />
                      )}
                    </div>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {item.category}
                    {item.notes && ` • ${item.notes}`}
                    {trip && heuristics && (
                      <div className="mt-1 text-xs text-blue-600">
                        💡 {heuristics.getHeuristicExplanation(trip, item)}
                      </div>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`qty-${item.id}`} className="text-sm">
                    Qty:
                  </Label>
                  <Input
                    id={`qty-${item.id}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                    className="w-16 h-8"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleItemPinned(item.id)}
                    className={item.pinned ? "text-blue-600 hover:text-blue-700" : "text-muted-foreground hover:text-blue-600"}
                  >
                    {item.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                  </Button>
                  
                  {item.id.startsWith('custom-') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="text-xl mb-2">No Items Found</CardTitle>
            <CardDescription>
              No items match your current filters. Try adjusting your search criteria.
            </CardDescription>
          </CardContent>
        </Card>
      )}
        </>
      )}

      {packingMode === 'phased' && (
        <PhasedPackingView
          items={packingItems}
          onItemToggle={toggleItemPacked}
          onItemQuantityUpdate={updateItemQuantity}
        />
      )}
      </div>

      {/* Sidebar with Essentials Panel - Only in Regular Mode */}
      {packingMode === 'regular' && (
        <div className="w-80 flex-shrink-0">
          <EssentialsPanel 
            items={packingItems}
            onItemToggle={toggleItemPacked}
            onItemPin={toggleItemPinned}
          />
        </div>
      )}
    </div>
  )
}