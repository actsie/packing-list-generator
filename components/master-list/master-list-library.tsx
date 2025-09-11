'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MasterList, PackingItem } from '@/lib/types'
import { defaultMasterLists, categories } from '@/lib/master-lists'
import { MasterListCard } from './master-list-card'
import { CreateMasterListDialog } from './create-master-list-dialog'
import { EditMasterListDialog } from './edit-master-list-dialog'
import { Search, Plus, Filter } from 'lucide-react'

interface MasterListLibraryProps {
  onSelectList?: (list: MasterList) => void
  selectedListId?: string
}

export function MasterListLibrary({ onSelectList, selectedListId }: MasterListLibraryProps) {
  const [masterLists, setMasterLists] = useState<MasterList[]>(defaultMasterLists)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [editingList, setEditingList] = useState<MasterList | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

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
    setMasterLists(prev => [...prev, list])
    setIsCreateDialogOpen(false)
  }

  const handleUpdateList = (updatedList: MasterList) => {
    setMasterLists(prev => 
      prev.map(list => 
        list.id === updatedList.id 
          ? { ...updatedList, updatedAt: new Date() }
          : list
      )
    )
    setIsEditDialogOpen(false)
    setEditingList(null)
  }

  const handleDeleteList = (listId: string) => {
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
    setMasterLists(prev => [...prev, duplicatedList])
  }

  return (
    <div className="space-y-6">
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
    </div>
  )
}