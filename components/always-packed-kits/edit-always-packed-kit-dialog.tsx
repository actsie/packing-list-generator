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
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlwaysPackedKit, PackingItem } from '@/lib/types'
import { kitCategories } from '@/lib/always-packed-kits'
import { Plus, Trash2, Star } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

interface EditAlwaysPackedKitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kit: AlwaysPackedKit
  onUpdate: (kit: AlwaysPackedKit) => void
}

const kitIcons = [
  '🧴', '🔌', '👙', '📄', '💊', '✈️', '👕', '👖', '👟', '🎒', 
  '📱', '💻', '🧼', '🪥', '🧴', '🔋', '📖', '🎧', '⚡', '🔍'
]

export function EditAlwaysPackedKitDialog({ open, onOpenChange, kit, onUpdate }: EditAlwaysPackedKitDialogProps) {
  const [kitName, setKitName] = useState('')
  const [kitDescription, setKitDescription] = useState('')
  const [kitCategory, setKitCategory] = useState('')
  const [kitIcon, setKitIcon] = useState('📦')
  const [kitColor, setKitColor] = useState('blue')
  const [items, setItems] = useState<(PackingItem & { tempId: string })[]>([])

  // Initialize form with kit data
  useEffect(() => {
    if (kit) {
      setKitName(kit.name)
      setKitDescription(kit.description)
      setKitCategory(kit.category)
      setKitIcon(kit.icon || '📦')
      setKitColor(kit.color || 'blue')
      setItems(kit.items.map(item => ({ ...item, tempId: item.id })))
    }
  }, [kit])

  const handleAddItem = () => {
    const newItem: PackingItem & { tempId: string } = {
      id: `temp-${Date.now()}`,
      tempId: `temp-${Date.now()}`,
      name: '',
      category: 'Misc',
      quantity: 1,
      packed: false,
      essential: false,
      notes: ''
    }
    setItems(prev => [...prev, newItem])
  }

  const handleRemoveItem = (tempId: string) => {
    setItems(prev => prev.filter(item => item.tempId !== tempId))
  }

  const handleUpdateItem = <K extends keyof PackingItem>(
    tempId: string, 
    field: K, 
    value: PackingItem[K]
  ) => {
    setItems(prev => prev.map(item => 
      item.tempId === tempId ? { ...item, [field]: value } : item
    ))
  }

  const handleSubmit = () => {
    if (!kitName.trim() || !kitCategory || items.some(item => !item.name.trim())) {
      return
    }

    const updatedItems: PackingItem[] = items.map((item, index) => ({
      id: item.id.startsWith('temp-') ? `kit-item-${Date.now()}-${index}` : item.id,
      name: item.name.trim(),
      category: item.category,
      quantity: Math.max(1, item.quantity),
      packed: false,
      essential: item.essential,
      notes: item.notes?.trim() || undefined,
    }))

    const updatedKit: AlwaysPackedKit = {
      ...kit,
      name: kitName.trim(),
      description: kitDescription.trim(),
      category: kitCategory,
      items: updatedItems,
      icon: kitIcon,
      color: kitColor,
    }

    onUpdate(updatedKit)
  }

  const isValid = kitName.trim() && kitCategory && items.every(item => item.name.trim())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Always-Packed Kit</DialogTitle>
          <DialogDescription>
            Modify your always-packed kit details and items.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Kit Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kit-name">Kit Name</Label>
              <Input
                id="kit-name"
                value={kitName}
                onChange={(e) => setKitName(e.target.value)}
                placeholder="e.g., My Tech Essentials"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kit-category">Category</Label>
              <Select value={kitCategory} onValueChange={setKitCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {kitCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kit-description">Description</Label>
            <Input
              id="kit-description"
              value={kitDescription}
              onChange={(e) => setKitDescription(e.target.value)}
              placeholder="Describe what this kit contains..."
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-8 sm:grid-cols-10 gap-2 max-h-[120px] overflow-y-auto p-1">
                {kitIcons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setKitIcon(icon)}
                    className={`p-2 text-lg border rounded hover:bg-accent flex items-center justify-center transition-colors ${
                      kitIcon === icon ? 'bg-primary text-primary-foreground' : ''
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Color</Label>
              <Select value={kitColor} onValueChange={setKitColor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="pink">Pink</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium">Kit Items</h4>
              <Button onClick={handleAddItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <Card key={item.tempId}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-4">
                        <Input
                          value={item.name}
                          onChange={(e) => handleUpdateItem(item.tempId, 'name', e.target.value)}
                          placeholder="Item name"
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <Select 
                          value={item.category} 
                          onValueChange={(value) => handleUpdateItem(item.tempId, 'category', value)}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Clothing">Clothing</SelectItem>
                            <SelectItem value="Toiletries">Toiletries</SelectItem>
                            <SelectItem value="Electronics">Electronics</SelectItem>
                            <SelectItem value="Documents">Documents</SelectItem>
                            <SelectItem value="Medications">Medications</SelectItem>
                            <SelectItem value="Accessories">Accessories</SelectItem>
                            <SelectItem value="Misc">Misc</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.tempId, 'quantity', parseInt(e.target.value) || 1)}
                          className="text-sm text-center"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          value={item.notes || ''}
                          onChange={(e) => handleUpdateItem(item.tempId, 'notes', e.target.value)}
                          placeholder="Notes (optional)"
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-1 flex items-center gap-1">
                        <Checkbox
                          checked={item.essential}
                          onCheckedChange={(checked) => handleUpdateItem(item.tempId, 'essential', !!checked)}
                        />
                        <Star className="h-3 w-3 text-orange-500" />
                      </div>
                      <div className="col-span-1">
                        {items.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.tempId)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Update Kit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}