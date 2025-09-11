'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlwaysPackedKit, PackingItem } from '@/lib/types'
import { defaultAlwaysPackedKits, kitCategories } from '@/lib/always-packed-kits'
import { AlwaysPackedKitCard } from './always-packed-kit-card'
import { CreateAlwaysPackedKitDialog } from './create-always-packed-kit-dialog'
import { EditAlwaysPackedKitDialog } from './edit-always-packed-kit-dialog'
import { Search, Plus, Filter, Package2, CheckCircle } from 'lucide-react'

interface AlwaysPackedKitsLibraryProps {
  onAddItemsToPackingList?: (items: PackingItem[]) => void
  selectedKitId?: string
}

export function AlwaysPackedKitsLibrary({ onAddItemsToPackingList, selectedKitId }: AlwaysPackedKitsLibraryProps) {
  const [alwaysPackedKits, setAlwaysPackedKits] = useState<AlwaysPackedKit[]>(defaultAlwaysPackedKits)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedKit, setSelectedKit] = useState<AlwaysPackedKit | null>(null)
  const [editingKit, setEditingKit] = useState<AlwaysPackedKit | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null)

  const uniqueCategories = useMemo(() => {
    const cats = new Set(alwaysPackedKits.map(kit => kit.category))
    return Array.from(cats).sort()
  }, [alwaysPackedKits])

  const filteredKits = useMemo(() => {
    return alwaysPackedKits.filter(kit => {
      const matchesSearch = kit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           kit.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || kit.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [alwaysPackedKits, searchQuery, selectedCategory])

  const handleCreateKit = (newKit: Omit<AlwaysPackedKit, 'id' | 'createdAt' | 'updatedAt'>) => {
    const kit: AlwaysPackedKit = {
      ...newKit,
      id: `custom-kit-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setAlwaysPackedKits(prev => [...prev, kit])
    setIsCreateDialogOpen(false)
  }

  const handleUpdateKit = (updatedKit: AlwaysPackedKit) => {
    setAlwaysPackedKits(prev => 
      prev.map(kit => 
        kit.id === updatedKit.id 
          ? { ...updatedKit, updatedAt: new Date() }
          : kit
      )
    )
    setIsEditDialogOpen(false)
    setEditingKit(null)
  }

  const handleDeleteKit = (kitId: string) => {
    setAlwaysPackedKits(prev => prev.filter(kit => kit.id !== kitId))
    if (selectedKit?.id === kitId) {
      setSelectedKit(null)
    }
  }

  const handleEditKit = (kit: AlwaysPackedKit) => {
    setEditingKit(kit)
    setIsEditDialogOpen(true)
  }

  const handleDuplicateKit = (kit: AlwaysPackedKit) => {
    const duplicatedKit: AlwaysPackedKit = {
      ...kit,
      id: `custom-kit-${Date.now()}`,
      name: `${kit.name} (Copy)`,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: kit.items.map(item => ({ ...item, id: `${item.id}-copy-${Date.now()}` }))
    }
    setAlwaysPackedKits(prev => [...prev, duplicatedKit])
  }

  const handleSelectKit = (kit: AlwaysPackedKit) => {
    setSelectedKit(selectedKit?.id === kit.id ? null : kit)
  }

  const handleAddToPackingList = (kit: AlwaysPackedKit) => {
    if (onAddItemsToPackingList) {
      const itemsToAdd = kit.items.map(item => ({
        ...item,
        id: `${item.id}-${Date.now()}`,
        packed: false,
        pinned: false
      }))
      onAddItemsToPackingList(itemsToAdd)
      
      setShowSuccessMessage(`Added ${kit.name} items to your packing list!`)
      setTimeout(() => setShowSuccessMessage(null), 3000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Always-Packed Kits</h2>
          <p className="text-muted-foreground">
            Pre-defined sets of items you always need - quickly add them to any packing list
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create New Kit
        </Button>
      </div>

      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center gap-2 text-green-700">
          <CheckCircle className="h-5 w-5" />
          {showSuccessMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search always-packed kits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {uniqueCategories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-6">
        {/* Kits Grid */}
        <div className="flex-1">
          <Tabs defaultValue="grid" className="w-full">
            <TabsList>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>

            <TabsContent value="grid" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredKits.map(kit => (
                  <AlwaysPackedKitCard
                    key={kit.id}
                    kit={kit}
                    isSelected={selectedKit?.id === kit.id}
                    onSelect={handleSelectKit}
                    onAddToPackingList={handleAddToPackingList}
                    onEdit={handleEditKit}
                    onDelete={handleDeleteKit}
                    onDuplicate={handleDuplicateKit}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list" className="mt-6">
              <div className="space-y-4">
                {filteredKits.map(kit => (
                  <Card 
                    key={kit.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedKit?.id === kit.id ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <CardHeader 
                      className="pb-3"
                      onClick={() => handleSelectKit(kit)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{kit.icon}</span>
                          <div>
                            <CardTitle className="text-lg">{kit.name}</CardTitle>
                            <CardDescription>{kit.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex flex-col items-end text-sm text-muted-foreground">
                          <span className="bg-secondary px-2 py-1 rounded text-xs">
                            {kit.category}
                          </span>
                          <span className="mt-1">{kit.items.length} items</span>
                          <Button 
                            size="sm"
                            className="mt-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddToPackingList(kit)
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add to List
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {filteredKits.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  No always-packed kits found matching your criteria.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  Create Your First Kit
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Kit Details Sidebar */}
        {selectedKit && (
          <div className="w-80 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">{selectedKit.icon}</span>
                  {selectedKit.name}
                </CardTitle>
                <CardDescription>{selectedKit.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Category:</span>
                  <span className="text-sm font-medium">{selectedKit.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Items:</span>
                  <span className="text-sm font-medium">{selectedKit.items.length}</span>
                </div>
                
                <div className="pt-2">
                  <Button 
                    className="w-full mb-2"
                    onClick={() => handleAddToPackingList(selectedKit)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add All Items to Packing List
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Items in this kit:</h4>
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {selectedKit.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                        <div className="flex items-center gap-2">
                          <span>{item.name}</span>
                          {item.essential && (
                            <span className="text-xs bg-orange-100 text-orange-600 px-1 rounded">
                              essential
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <CreateAlwaysPackedKitDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreate={handleCreateKit}
      />

      {editingKit && (
        <EditAlwaysPackedKitDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          kit={editingKit}
          onUpdate={handleUpdateKit}
        />
      )}
    </div>
  )
}