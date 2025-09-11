'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { MasterList, PackingItem } from '@/lib/types'
import { categories } from '@/lib/master-lists'
import { Plus, Trash2 } from 'lucide-react'
import { Label } from '@/components/ui/label'

interface CreateMasterListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (list: Omit<MasterList, 'id' | 'createdAt' | 'updatedAt'>) => void
}

interface NewPackingItem extends Omit<PackingItem, 'id'> {
  tempId: string
}

export function CreateMasterListDialog({ open, onOpenChange, onCreate }: CreateMasterListDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isTemplate: false
  })
  const [items, setItems] = useState<NewPackingItem[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      isTemplate: false
    })
    setItems([])
    setErrors({})
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!formData.category) {
      newErrors.category = 'Category is required'
    }
    if (items.length === 0) {
      newErrors.items = 'At least one item is required'
    }

    items.forEach((item, index) => {
      if (!item.name.trim()) {
        newErrors[`item-${index}-name`] = 'Item name is required'
      }
      if (!item.category) {
        newErrors[`item-${index}-category`] = 'Item category is required'
      }
      if (item.quantity < 1) {
        newErrors[`item-${index}-quantity`] = 'Quantity must be at least 1'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const newList: Omit<MasterList, 'id' | 'createdAt' | 'updatedAt'> = {
      ...formData,
      items: items.map((item, index) => ({
        ...item,
        id: `item-${Date.now()}-${index}`
      }))
    }

    onCreate(newList)
    resetForm()
  }

  const addItem = () => {
    const newItem: NewPackingItem = {
      tempId: `temp-${Date.now()}`,
      name: '',
      category: '',
      quantity: 1,
      packed: false,
      essential: false,
      notes: ''
    }
    setItems(prev => [...prev, newItem])
  }

  const updateItem = (tempId: string, updates: Partial<NewPackingItem>) => {
    setItems(prev => 
      prev.map(item => 
        item.tempId === tempId ? { ...item, ...updates } : item
      )
    )
  }

  const removeItem = (tempId: string) => {
    setItems(prev => prev.filter(item => item.tempId !== tempId))
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Master List</DialogTitle>
          <DialogDescription>
            Create a new master list template for future packing lists.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">List Name</Label>
              <Input
                id="name"
                placeholder="e.g., Weekend Getaway"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Professional">Professional</SelectItem>
                  <SelectItem value="Leisure">Leisure</SelectItem>
                  <SelectItem value="Outdoor">Outdoor</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Describe what this list is for..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isTemplate"
              checked={formData.isTemplate}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, isTemplate: checked as boolean }))
              }
            />
            <Label htmlFor="isTemplate">Make this a reusable template</Label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Items</h3>
              <Button onClick={addItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {errors.items && <p className="text-sm text-destructive">{errors.items}</p>}

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {items.map((item, index) => (
                <div key={item.tempId} className="border rounded-md p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Item {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.tempId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Input
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => updateItem(item.tempId, { name: e.target.value })}
                      />
                      {errors[`item-${index}-name`] && (
                        <p className="text-xs text-destructive mt-1">
                          {errors[`item-${index}-name`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <Select
                        value={item.category}
                        onValueChange={(value) => updateItem(item.tempId, { category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors[`item-${index}-category`] && (
                        <p className="text-xs text-destructive mt-1">
                          {errors[`item-${index}-category`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.tempId, { quantity: parseInt(e.target.value) || 1 })}
                      />
                      {errors[`item-${index}-quantity`] && (
                        <p className="text-xs text-destructive mt-1">
                          {errors[`item-${index}-quantity`]}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`essential-${item.tempId}`}
                        checked={item.essential}
                        onCheckedChange={(checked) => 
                          updateItem(item.tempId, { essential: checked as boolean })
                        }
                      />
                      <Label htmlFor={`essential-${item.tempId}`} className="text-sm">
                        Essential
                      </Label>
                    </div>
                    
                    <Input
                      placeholder="Notes (optional)"
                      value={item.notes}
                      onChange={(e) => updateItem(item.tempId, { notes: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>

            {items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No items added yet. Click "Add Item" to get started.</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Master List
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}