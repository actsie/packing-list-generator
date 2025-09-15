'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TripSuggestion } from '@/lib/types'
import { Plus, Edit, Trash2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SuggestionReviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  suggestions: TripSuggestion[]
  onApply: (suggestions: Array<TripSuggestion & { userQuantity?: number }>) => void
}

export function SuggestionReviewModal({ 
  open, 
  onOpenChange, 
  suggestions,
  onApply
}: SuggestionReviewModalProps) {
  const [selectedSuggestions, setSelectedSuggestions] = useState<Record<string, boolean>>(
    suggestions.reduce((acc, s) => ({ ...acc, [s.id]: true }), {})
  )
  const [quantities, setQuantities] = useState<Record<string, number>>(
    suggestions.reduce((acc, s) => ({ 
      ...acc, 
      [s.id]: s.item?.quantity || 1 
    }), {})
  )

  const activeSuggestions = suggestions.filter(s => !s.applied && !s.dismissedAt)

  const handleQuantityChange = (suggestionId: string, value: string) => {
    const qty = parseInt(value) || 1
    setQuantities(prev => ({ ...prev, [suggestionId]: Math.max(1, qty) }))
  }

  const handleApply = () => {
    const suggestionsToApply = activeSuggestions
      .filter(s => selectedSuggestions[s.id])
      .map(s => ({
        ...s,
        userQuantity: quantities[s.id]
      }))
    
    onApply(suggestionsToApply)
    onOpenChange(false)
  }

  const getSuggestionIcon = (type: TripSuggestion['type']) => {
    switch (type) {
      case 'add': return <Plus className="h-4 w-4" />
      case 'update': return <Edit className="h-4 w-4" />
      case 'remove': return <Trash2 className="h-4 w-4" />
    }
  }

  const getSuggestionTypeLabel = (type: TripSuggestion['type']) => {
    switch (type) {
      case 'add': return 'Add'
      case 'update': return 'Update'
      case 'remove': return 'Remove'
    }
  }

  const selectedCount = Object.values(selectedSuggestions).filter(Boolean).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Review & Edit Suggestions</DialogTitle>
          <DialogDescription>
            Select which suggestions to apply and adjust quantities as needed
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {activeSuggestions.map(suggestion => (
              <div
                key={suggestion.id}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-lg border transition-colors",
                  selectedSuggestions[suggestion.id] 
                    ? "bg-blue-50 border-blue-200" 
                    : "bg-gray-50 border-gray-200"
                )}
              >
                <Checkbox
                  id={suggestion.id}
                  checked={selectedSuggestions[suggestion.id]}
                  onCheckedChange={(checked) => 
                    setSelectedSuggestions(prev => ({ ...prev, [suggestion.id]: !!checked }))
                  }
                  className="mt-1"
                />
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      {getSuggestionIcon(suggestion.type)}
                      {getSuggestionTypeLabel(suggestion.type)}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {suggestion.category}
                    </Badge>
                  </div>
                  
                  {suggestion.item && (
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{suggestion.item.name}</span>
                      {suggestion.type === 'update' && suggestion.originalQuantity && (
                        <span className="text-sm text-muted-foreground">
                          ({suggestion.originalQuantity} → {quantities[suggestion.id]})
                        </span>
                      )}
                    </div>
                  )}
                  
                  <p className="text-sm text-muted-foreground">
                    {suggestion.reason}
                  </p>

                  {suggestion.type !== 'remove' && suggestion.item && (
                    <div className="flex items-center gap-2 mt-2">
                      <label className="text-sm font-medium">Quantity:</label>
                      <Input
                        type="number"
                        min="1"
                        value={quantities[suggestion.id]}
                        onChange={(e) => handleQuantityChange(suggestion.id, e.target.value)}
                        className="w-20 h-8"
                        disabled={!selectedSuggestions[suggestion.id]}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedCount} of {activeSuggestions.length} selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={selectedCount === 0}>
              <Check className="h-4 w-4 mr-2" />
              Apply Selected
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}