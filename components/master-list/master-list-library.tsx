'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MasterList, PackingItem, Trip } from '@/lib/types'
import { defaultMasterLists, categories } from '@/lib/master-lists'
import { MasterListCard } from './master-list-card'
import { CreateMasterListDialog } from './create-master-list-dialog'
import { EditMasterListDialog } from './edit-master-list-dialog'
import { StartTripModal } from '../start-trip-modal'
import { TripStorage } from '@/lib/trip-storage'
import { MasterListStorage } from '@/lib/master-list-storage'
import { Search, Plus, Filter, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface MasterListLibraryProps {
  onSelectList?: (list: MasterList) => void
  selectedListId?: string
}

export function MasterListLibrary({ onSelectList, selectedListId }: MasterListLibraryProps) {
  const router = useRouter()
  const [masterLists, setMasterLists] = useState<MasterList[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [editingList, setEditingList] = useState<MasterList | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [startTripModalOpen, setStartTripModalOpen] = useState(false)
  const [selectedMasterList, setSelectedMasterList] = useState<MasterList | null>(null)
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null)
  const [recentTrips, setRecentTrips] = useState<Trip[]>([])

  const loadMasterLists = React.useCallback(() => {
    // Load saved master lists from storage
    const savedLists = MasterListStorage.getAllMasterLists()
    
    // Create a map to track which default lists exist in storage
    const savedListIds = new Set(savedLists.map(list => list.id))
    
    // Filter out any default lists that might have been saved to avoid duplicates
    const userCreatedLists = savedLists.filter(list => !defaultMasterLists.some(defaultList => defaultList.id === list.id))
    
    // Combine default lists with user-created lists
    const allLists = [...defaultMasterLists, ...userCreatedLists]
    
    setMasterLists(allLists)
  }, [])

  // Load master lists from storage on mount
  React.useEffect(() => {
    loadMasterLists()
    
    // Load active trip
    const trip = TripStorage.getActiveTrip()
    setActiveTrip(trip)
    
    const recent = TripStorage.getRecentTrips(3)
    setRecentTrips(recent)
  }, [loadMasterLists])
  
  // Reload master lists when the tab becomes visible (in case saved from another tab/component)
  React.useEffect(() => {
    const handleFocus = () => {
      loadMasterLists()
    }
    
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        loadMasterLists()
      }
    })
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [loadMasterLists])

  const uniqueCategories = useMemo(() => {
    const cats = new Set(masterLists.map(list => list.category))
    return Array.from(cats).sort()
  }, [masterLists])

  const filteredLists = useMemo(() => {
    return masterLists.filter(list => {
      const matchesSearch = list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           list.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || list.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [masterLists, searchQuery, selectedCategory])

  const handleCreateList = (newList: Omit<MasterList, 'id' | 'createdAt' | 'updatedAt'>) => {
    const list: MasterList = {
      ...newList,
      id: `custom-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    MasterListStorage.saveMasterList(list)
    setMasterLists(prev => [...prev, list])
    setIsCreateDialogOpen(false)
  }

  const handleUpdateList = (updatedList: MasterList) => {
    const updated = { ...updatedList, updatedAt: new Date() }
    MasterListStorage.saveMasterList(updated)
    setMasterLists(prev => 
      prev.map(list => 
        list.id === updatedList.id 
          ? updated
          : list
      )
    )
    setIsEditDialogOpen(false)
    setEditingList(null)
  }

  const handleDeleteList = (listId: string) => {
    MasterListStorage.deleteMasterList(listId)
    setMasterLists(prev => prev.filter(list => list.id !== listId))
  }

  const handleEditList = (list: MasterList) => {
    setEditingList(list)
    setIsEditDialogOpen(true)
  }

  const handleDuplicateList = (list: MasterList) => {
    const duplicatedList: MasterList = {
      ...list,
      id: `custom-${Date.now()}`,
      name: `${list.name} (Copy)`,
      isTemplate: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: list.items.map(item => ({ ...item, id: `${item.id}-copy-${Date.now()}` }))
    }
    MasterListStorage.saveMasterList(duplicatedList)
    setMasterLists(prev => [...prev, duplicatedList])
  }

  const handleStartTrip = (list: MasterList) => {
    setSelectedMasterList(list)
    setStartTripModalOpen(true)
  }

  const handleCreateTrip = (tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>, mode: 'smart' | 'checklist') => {
    const tripId = `trip-${Date.now()}`
    const trip: Trip = {
      ...tripData,
      id: tripId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      days: Math.ceil((new Date(tripData.endDate).getTime() - new Date(tripData.startDate).getTime()) / (1000 * 60 * 60 * 24))
    }

    TripStorage.saveTrip(trip)
    TripStorage.setActiveTrip(tripId)
    router.push(`/trip/${tripId}`)
  }

  const handleResume = (tripId: string) => {
    TripStorage.setActiveTrip(tripId)
    router.push(`/trip/${tripId}`)
  }

  return (
    <div className="space-y-6">
      {activeTrip && (
        <Alert className="border-primary">
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">Resume last trip:</span>
              <span>{activeTrip.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/trip/${activeTrip.id}`)}
              className="flex items-center gap-2"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Master List Library</h2>
          <p className="text-muted-foreground">
            Browse and manage your packing list templates
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create New List
        </Button>
      </div>

      {/* Recent Trips Strip */}
      {recentTrips.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Recent Trips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recentTrips.map((trip) => {
              const progress = trip.checklistItems.filter(item => item.packed).length / trip.checklistItems.length * 100
              return (
                <Card 
                  key={trip.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleResume(trip.id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{trip.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {trip.destination} • {new Date(trip.startDate).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-primary h-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search master lists..."
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

      <Tabs defaultValue="grid" className="w-full">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLists.map(list => (
              <MasterListCard
                key={list.id}
                list={list}
                isSelected={selectedListId === list.id}
                onSelect={onSelectList}
                onStartTrip={handleStartTrip}
                onEdit={handleEditList}
                onDelete={handleDeleteList}
                onDuplicate={handleDuplicateList}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <div className="space-y-4">
            {filteredLists.map(list => (
              <Card key={list.id} className={`cursor-pointer transition-colors ${
                selectedListId === list.id ? 'ring-2 ring-primary' : ''
              }`}>
                <CardHeader 
                  className="pb-3"
                  onClick={() => onSelectList?.(list)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{list.name}</CardTitle>
                      <CardDescription>{list.description}</CardDescription>
                    </div>
                    <div className="flex flex-col items-end text-sm text-muted-foreground">
                      <span className="bg-secondary px-2 py-1 rounded text-xs">
                        {list.category}
                      </span>
                      <span className="mt-1">{list.items.length} items</span>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredLists.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">
              No master lists found matching your criteria.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Create Your First List
            </Button>
          </CardContent>
        </Card>
      )}

      <CreateMasterListDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreate={handleCreateList}
      />

      {editingList && (
        <EditMasterListDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          list={editingList}
          onUpdate={handleUpdateList}
        />
      )}

      {selectedMasterList && (
        <StartTripModal
          open={startTripModalOpen}
          onOpenChange={setStartTripModalOpen}
          masterList={selectedMasterList}
          onCreateTrip={handleCreateTrip}
        />
      )}
    </div>
  )
}