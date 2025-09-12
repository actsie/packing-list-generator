'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TripSuggestion } from '@/lib/types'
import { Sparkles, Plus, Edit, Trash2, X, Check, ChevronDown, ChevronUp } from 'lucide-react'

interface SuggestionsPanelProps {
  suggestions: TripSuggestion[]
  onApplySuggestions: (suggestionIds: string[]) => void
  onDismiss: () => void
  onDismissSuggestion: (suggestionId: string) => void
}

export function SuggestionsPanel({ 
  suggestions, 
  onApplySuggestions, 
  onDismiss,
  onDismissSuggestion 
}: SuggestionsPanelProps) {
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([])
  const [isExpanded, setIsExpanded] = useState(true)
  
  // Filter out already applied or dismissed suggestions
  const activeSuggestions = suggestions.filter(s => !s.applied && !s.dismissedAt)
  
  if (activeSuggestions.length === 0) return null

  const toggleSuggestion = (suggestionId: string) => {
    setSelectedSuggestions(prev => 
      prev.includes(suggestionId)
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId]
    )
  }

  const handleApplyAll = () => {
    const allIds = activeSuggestions.map(s => s.id)
    onApplySuggestions(allIds)
    setSelectedSuggestions([])
  }

  const handleApplySelected = () => {
    if (selectedSuggestions.length > 0) {
      onApplySuggestions(selectedSuggestions)
      setSelectedSuggestions([])
    }
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
      case 'add': return 'Add item'
      case 'update': return 'Update quantity'
      case 'remove': return 'Remove item'
    }
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg text-blue-900">Smart Suggestions</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-700 hover:text-blue-900"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-blue-700 hover:text-blue-900"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {!isExpanded && (
          <CardDescription className="text-blue-700">
            {activeSuggestions.length} suggestions available
          </CardDescription>
        )}
      </CardHeader>
      
      {isExpanded && (
        <>
          <CardContent className="pb-3">
            <CardDescription className="text-blue-700 mb-4">
              Based on your trip details, we recommend these adjustments to your packing list
            </CardDescription>
            
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {activeSuggestions.map(suggestion => (
                  <div
                    key={suggestion.id}
                    className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100"
                  >
                    <Checkbox
                      id={suggestion.id}
                      checked={selectedSuggestions.includes(suggestion.id)}
                      onCheckedChange={() => toggleSuggestion(suggestion.id)}
                    />
                    
                    <div className="flex-1 space-y-1">
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
                        <div className="font-medium text-sm">
                          {suggestion.item.name}
                          {suggestion.type === 'update' && suggestion.item.quantity && (
                            <span className="text-muted-foreground ml-2">
                              (Qty: {suggestion.item.quantity})
                            </span>
                          )}
                        </div>
                      )}
                      
                      <p className="text-sm text-muted-foreground">
                        {suggestion.reason}
                      </p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDismissSuggestion(suggestion.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          
          <div className="px-6 py-3 bg-blue-100 flex items-center justify-between gap-3">
            <div className="text-sm text-blue-700">
              {selectedSuggestions.length > 0 
                ? `${selectedSuggestions.length} of ${activeSuggestions.length} selected`
                : `${activeSuggestions.length} suggestions available`
              }
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleApplySelected}
                disabled={selectedSuggestions.length === 0}
                className="bg-white"
              >
                <Check className="h-4 w-4 mr-2" />
                Apply Selected
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
        </>
      )}
    </Card>
  )
}