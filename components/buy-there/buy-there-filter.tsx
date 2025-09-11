'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { BuyThereItem, BuyThereFilter, ArrivalListConfig } from '@/lib/types'
import { Search, Filter, DollarSign, MapPin, Package, AlertCircle, Star, ShoppingBag } from 'lucide-react'
import { Label } from '@/components/ui/label'

interface BuyThereFilterProps {
  items: BuyThereItem[]
  onFilterChange: (filteredItems: BuyThereItem[]) => void
  onConfigChange: (config: ArrivalListConfig) => void
  config: ArrivalListConfig
}

export function BuyThereFilterComponent({ items, onFilterChange, onConfigChange, config }: BuyThereFilterProps) {
  const [filters, setFilters] = useState<BuyThereFilter>({
    searchQuery: '',
    category: undefined,
    priority: undefined,
    maxCost: undefined
  })

  const categories = useMemo(() => {
    const cats = new Set(items.filter(item => item.buyAtDestination).map(item => item.category))
    return Array.from(cats).sort()
  }, [items])

  const buyThereItems = useMemo(() => {
    return items.filter(item => item.buyAtDestination)
  }, [items])

  const filteredItems = useMemo(() => {
    let filtered = buyThereItems.filter(item => {
      const matchesSearch = !filters.searchQuery || 
        item.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        (item.buyThereReason?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ?? false) ||
        (item.alternativeItem?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ?? false)
      
      const matchesCategory = !filters.category || item.category === filters.category
      const matchesPriority = !filters.priority || item.priority === filters.priority
      const matchesCost = filters.maxCost === undefined || 
        (item.estimatedCost !== undefined && item.estimatedCost <= filters.maxCost)

      return matchesSearch && matchesCategory && matchesPriority && matchesCost
    })

    // Sort based on config
    switch (config.sortBy) {
      case 'priority':
        filtered.sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        })
        break
      case 'cost':
        filtered.sort((a, b) => (a.estimatedCost || 0) - (b.estimatedCost || 0))
        break
      case 'alphabetical':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return filtered
  }, [buyThereItems, filters, config.sortBy])

  React.useEffect(() => {
    onFilterChange(filteredItems)
  }, [filteredItems, onFilterChange])

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      category: undefined,
      priority: undefined,
      maxCost: undefined
    })
  }

  const totalEstimatedCost = useMemo(() => {
    return filteredItems.reduce((sum, item) => sum + (item.estimatedCost || 0), 0)
  }, [filteredItems])

  const priorityStats = useMemo(() => {
    const stats = filteredItems.reduce((acc, item) => {
      acc[item.priority] = (acc[item.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return stats
  }, [filteredItems])

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-blue-500" />
              Buy-There Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredItems.length}</div>
            <p className="text-xs text-muted-foreground">
              of {buyThereItems.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              Estimated Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEstimatedCost}</div>
            <p className="text-xs text-muted-foreground">
              approximate total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{priorityStats.high || 0}</div>
            <p className="text-xs text-muted-foreground">
              critical items
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
              different types
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & View Options
          </CardTitle>
          <CardDescription>
            Customize your Buy-There shopping list view
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items, reasons, or alternatives..."
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            <Select 
              value={filters.category || 'all'} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, category: value === 'all' ? undefined : value }))}
            >
              <SelectTrigger className="w-full lg:w-[180px]">
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
              value={filters.priority || 'all'} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value === 'all' ? undefined : value as any }))}
            >
              <SelectTrigger className="w-full lg:w-[140px]">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Label htmlFor="maxCost" className="text-sm whitespace-nowrap">Max Cost:</Label>
              <Input
                id="maxCost"
                type="number"
                placeholder="$"
                value={filters.maxCost || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, maxCost: e.target.value ? parseInt(e.target.value) : undefined }))}
                className="w-20"
              />
            </div>

            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          </div>

          {/* View Configuration */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Display Options</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showCosts"
                  checked={config.showCosts}
                  onChange={(e) => onConfigChange({ ...config, showCosts: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="showCosts" className="text-sm">Show Costs</Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="groupByCategory"
                  checked={config.groupByCategory}
                  onChange={(e) => onConfigChange({ ...config, groupByCategory: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="groupByCategory" className="text-sm">Group by Category</Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeAlternatives"
                  checked={config.includeAlternatives}
                  onChange={(e) => onConfigChange({ ...config, includeAlternatives: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="includeAlternatives" className="text-sm">Show Alternatives</Label>
              </div>

              <Select 
                value={config.sortBy} 
                onValueChange={(value: 'priority' | 'cost' | 'alphabetical') => onConfigChange({ ...config, sortBy: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">Sort by Priority</SelectItem>
                  <SelectItem value="cost">Sort by Cost</SelectItem>
                  <SelectItem value="alphabetical">Sort A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Filters Display */}
      {(filters.searchQuery || filters.category || filters.priority || filters.maxCost !== undefined) && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">Active filters:</span>
              {filters.searchQuery && (
                <Badge variant="secondary">Search: "{filters.searchQuery}"</Badge>
              )}
              {filters.category && (
                <Badge variant="secondary">Category: {filters.category}</Badge>
              )}
              {filters.priority && (
                <Badge variant="secondary">Priority: {filters.priority}</Badge>
              )}
              {filters.maxCost !== undefined && (
                <Badge variant="secondary">Max Cost: ${filters.maxCost}</Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}