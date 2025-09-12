'use client'

import React, { useState, useEffect } from 'react'
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

interface EditMasterListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  list: MasterList
  onUpdate: (list: MasterList) => void
}

interface EditablePackingItem extends PackingItem {
  isNew?: boolean
}

export function EditMasterListDialog({ open, onOpenChange, list, onUpdate }: EditMasterListDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isTemplate: false
  })
  const [items, setItems] = useState<EditablePackingItem[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (list) {
      setFormData({
        name: list.name,
        description: list.description,
        category: list.category,
        isTemplate: list.isTemplate
      })
      setItems(list.items.map(item => ({
        ...item,
        packed: false
      })))
      setErrors({})
    }
  }, [list])

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

    const updatedList: MasterList = {
      ...list,
      ...formData,
      items: items.map((item, index) => ({
        ...item,
        id: item.isNew ? `item-${Date.now()}-${index}` : item.id
      }))
    }

    onUpdate(updatedList)
  }

  const addItem = () => {
    const newItem: EditablePackingItem = {
      id: `temp-${Date.now()}`,
      name: '',
      category: '',
      quantity: 1,
      packed: false,
      essential: false,
      notes: '',
      isNew: true
    }
    setItems(prev => [...prev, newItem])
  }

  const updateItem = (id: string, updates: Partial<EditablePackingItem>) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    )
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Master List</DialogTitle>
          <DialogDescription>
            Update your master list template.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">List Name</Label>
              <Input
                id="edit-name"
                placeholder="e.g., Weekend Getaway"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
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
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              placeholder="Describe what this list is for..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-isTemplate"
              checked={formData.isTemplate}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, isTemplate: checked as boolean }))
              }
            />
            <Label htmlFor="edit-isTemplate">Make this a reusable template</Label>
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
                <div key={item.id} className="border rounded-md p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Item {index + 1} {item.isNew && <span className="text-green-600">(New)</span>}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Input
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, { name: e.target.value })}
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
                        onValueChange={(value) => updateItem(item.id, { category: value })}
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
                        onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
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
                        id={`edit-essential-${item.id}`}
                        checked={item.essential}
                        onCheckedChange={(checked) => 
                          updateItem(item.id, { essential: checked as boolean })
                        }
                      />
                      <Label htmlFor={`edit-essential-${item.id}`} className="text-sm">
                        Essential
                      </Label>
                    </div>
                    
                    <Input
                      placeholder="Notes (optional)"
                      value={item.notes || ''}
                      onChange={(e) => updateItem(item.id, { notes: e.target.value })}
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}