'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Trip, MasterList, MasterListItem } from '@/lib/types'
import { Save } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface SaveAsTemplateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trip: Trip
  onSave: (masterList: MasterList) => void
}

export function SaveAsTemplateModal({ open, onOpenChange, trip, onSave }: SaveAsTemplateModalProps) {
  const { toast } = useToast()
  const [name, setName] = useState(`${trip.name} Template`)
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>('')

  const categories = [
    'Business Travel',
    'Beach Vacation',
    'Mountain/Hiking',
    'City Break',
    'Adventure',
    'Family Travel',
    'Backpacking',
    'Luxury Travel',
    'Road Trip',
    'Camping',
    'Other'
  ]

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your template",
        variant: "destructive"
      })
      return
    }

    if (!category) {
      toast({
        title: "Category required",
        description: "Please select a category for your template",
        variant: "destructive"
      })
      return
    }

    const newMasterList: MasterList = {
      id: `template-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || `Template based on ${trip.name}`,
      category,
      items: trip.checklistItems.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        essential: item.essential,
        notes: item.notes
      } as MasterListItem)),
      isTemplate: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    onSave(newMasterList)
    onOpenChange(false)
    
    toast({
      title: "Template saved",
      description: `"${name}" has been saved to your Master List Library`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save as Template
          </DialogTitle>
          <DialogDescription>
            Save your current trip checklist as a new template in the Master List Library
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter template name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for your template"
              rows={3}
            />
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              This will save <strong>{trip.checklistItems.length} items</strong> from your current trip checklist, including all quantities and settings.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}