'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TripSuggestion } from '@/lib/types'
import { Sparkles, Plus, Edit, Trash2, Check, FileEdit } from 'lucide-react'
import { SuggestionReviewModal } from './suggestion-review-modal'

interface SuggestionsPanelProps {
  suggestions: TripSuggestion[]
  onApplySuggestions: (suggestions: Array<TripSuggestion & { userQuantity?: number }>) => void
}

export function SuggestionsPanel({ 
  suggestions, 
  onApplySuggestions
}: SuggestionsPanelProps) {
  const [showReviewModal, setShowReviewModal] = useState(false)
  
  // Filter out already applied or dismissed suggestions
  const activeSuggestions = suggestions.filter(s => !s.applied && !s.dismissedAt)
  
  if (activeSuggestions.length === 0) return null

  const handleApplyAll = () => {
    onApplySuggestions(activeSuggestions)
  }

  const handleReviewAndEdit = () => {
    setShowReviewModal(true)
  }

  const getSuggestionIcon = (type: TripSuggestion['type']) => {
    switch (type) {
      case 'add': return <Plus className="h-4 w-4" />
      case 'update': return <Edit className="h-4 w-4" />
      case 'remove': return <Trash2 className="h-4 w-4" />
    }
  }

  const getSuggestionDescription = (suggestion: TripSuggestion) => {
    if (suggestion.type === 'add' && suggestion.item) {
      return `Add ${suggestion.item.name} (${suggestion.item.quantity})`
    } else if (suggestion.type === 'update' && suggestion.item) {
      const from = suggestion.originalQuantity || 'current'
      return `Set ${suggestion.item.name} → ${suggestion.item.quantity} (from ${from})`
    } else if (suggestion.type === 'remove' && suggestion.item) {
      return `Remove ${suggestion.item.name}`
    }
    return ''
  }

  return (
    <>
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg text-blue-900">Smart Suggestions</CardTitle>
          </div>
          <CardDescription className="text-blue-700">
            Based on your trip details, we recommend these adjustments to your packing list
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-3">
          <ScrollArea className="h-[250px] pr-4">
            <div className="space-y-2">
              {activeSuggestions.map(suggestion => (
                <div
                  key={suggestion.id}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100"
                >
                  <div className="mt-0.5">
                    {getSuggestionIcon(suggestion.type)}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {getSuggestionDescription(suggestion)}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {suggestion.category}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {suggestion.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        
        <div className="px-6 py-3 bg-blue-100 flex items-center justify-between gap-3">
          <div className="text-sm text-blue-700">
            {activeSuggestions.length} suggestions ready to apply
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReviewAndEdit}
              className="bg-white"
            >
              <FileEdit className="h-4 w-4 mr-2" />
              Review & Edit
            </Button>
            <Button
              size="sm"
              onClick={handleApplyAll}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Apply All
            </Button>
          </div>
        </div>
      </Card>

      <SuggestionReviewModal
        open={showReviewModal}
        onOpenChange={setShowReviewModal}
        suggestions={activeSuggestions}
        onApply={onApplySuggestions}
      />
    </>
  )
}