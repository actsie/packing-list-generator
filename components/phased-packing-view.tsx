'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  PackingItem, 
  PackingPhase, 
  PhasedPackingConfig 
} from '@/lib/types'
import { 
  initializePhasedPacking,
  markPhaseCompleted,
  isPhaseComplete,
  getPhaseProgress,
  getOverallProgress,
  getCurrentPhase,
  getNextIncompletePhase
} from '@/lib/phased-packing'
import { 
  CheckCircle, 
  Circle, 
  Star, 
  Clock, 
  Package, 
  ArrowRight, 
  Calendar,
  Target,
  TrendingUp
} from 'lucide-react'
import { Label } from '@/components/ui/label'

interface PhasedPackingViewProps {
  items: PackingItem[]
  onItemToggle: (itemId: string) => void
  onItemQuantityUpdate: (itemId: string, quantity: number) => void
}

export function PhasedPackingView({ items, onItemToggle, onItemQuantityUpdate }: PhasedPackingViewProps) {
  const [phasedConfig, setPhasedConfig] = useState<PhasedPackingConfig>(() => {
    try {
      return initializePhasedPacking(items || [])
    } catch (error) {
      console.error('Error initializing phased packing:', error)
      return {
        enabled: true,
        phases: [],
        currentPhaseId: undefined
      }
    }
  })
  const [activePhaseId, setActivePhaseId] = useState<string>(
    phasedConfig.currentPhaseId || phasedConfig.phases[0]?.id || ''
  )
  const [error, setError] = useState<string | null>(null)

  const activePhase = phasedConfig.phases.find(p => p.id === activePhaseId)
  const overallProgress = getOverallProgress(phasedConfig)
  const nextIncompletePhase = getNextIncompletePhase(phasedConfig)

  const handlePhaseComplete = (phaseId: string) => {
    try {
      const updatedConfig = markPhaseCompleted(phasedConfig, phaseId)
      setPhasedConfig(updatedConfig)
      
      if (updatedConfig.currentPhaseId !== phaseId) {
        setActivePhaseId(updatedConfig.currentPhaseId || phaseId)
      }
      setError(null)
    } catch (error) {
      console.error('Error completing phase:', error)
      setError('Failed to mark phase as complete. Please try again.')
    }
  }

  const handleItemUpdate = (itemId: string, updates: Partial<PackingItem>) => {
    try {
      const updatedPhases = phasedConfig.phases.map(phase => ({
        ...phase,
        items: phase.items.map(item => 
          item.id === itemId ? { ...item, ...updates } : item
        )
      }))
      
      setPhasedConfig({
        ...phasedConfig,
        phases: updatedPhases
      })

      if (updates.packed !== undefined) {
        onItemToggle(itemId)
      }
      
      if (updates.quantity !== undefined) {
        onItemQuantityUpdate(itemId, updates.quantity)
      }
      setError(null)
    } catch (error) {
      console.error('Error updating item:', error)
      setError('Failed to update item. Please try again.')
    }
  }

  const completedPhasesCount = phasedConfig.phases.filter(phase => 
    isPhaseComplete(phase)
  ).length

  if (phasedConfig.phases.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <CardTitle className="text-xl mb-2">No Packing Phases Available</CardTitle>
          <CardDescription>
            Unable to create packing phases. Please try refreshing the page or switch to Regular Mode.
          </CardDescription>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-red-600" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setError(null)}
                className="ml-auto"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Phased Packing Mode
          </h2>
          <p className="text-muted-foreground">
            Pack strategically in phases to avoid forgetting essentials
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold">{overallProgress}%</div>
          <p className="text-sm text-muted-foreground">Overall Progress</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Phases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedPhasesCount}/{phasedConfig.phases.length}</div>
            <p className="text-xs text-muted-foreground">phases completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Current Phase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold truncate">
              {nextIncompletePhase?.name || 'All phases complete!'}
            </div>
            <p className="text-xs text-muted-foreground">
              {nextIncompletePhase?.timeframe || 'Great job!'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{overallProgress}% complete</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activePhaseId} onValueChange={setActivePhaseId} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          {phasedConfig.phases.map((phase, index) => {
            const progress = getPhaseProgress(phase)
            const isComplete = isPhaseComplete(phase)
            
            return (
              <TabsTrigger 
                key={phase.id} 
                value={phase.id}
                className="relative flex flex-col gap-1 h-auto p-3"
              >
                <div className="flex items-center gap-1">
                  {isComplete ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                  <span className="text-xs font-medium">Phase {index + 1}</span>
                </div>
                <div className="text-xs opacity-75 truncate max-w-full">
                  {progress}%
                </div>
                {isComplete && (
                  <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                    ✓
                  </Badge>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {phasedConfig.phases.map((phase) => (
          <TabsContent key={phase.id} value={phase.id} className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                      {isPhaseComplete(phase) ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                      {phase.name}
                      {isPhaseComplete(phase) && (
                        <Badge variant="secondary" className="ml-2">Complete</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1 text-base">
                      {phase.description}
                    </CardDescription>
                    {phase.timeframe && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {phase.timeframe}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{getPhaseProgress(phase)}%</div>
                    <p className="text-sm text-muted-foreground">
                      {phase.items.filter(item => item.packed).length}/{phase.items.length} packed
                    </p>
                  </div>
                </div>

                <div className="w-full bg-secondary rounded-full h-2 mt-4">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getPhaseProgress(phase)}%` }}
                  />
                </div>
              </CardHeader>

              {phase.items.length > 0 && (
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Items for this phase</h3>
                    {!isPhaseComplete(phase) && phase.items.filter(item => !item.packed).length > 0 && (
                      <Button 
                        size="sm"
                        onClick={() => {
                          phase.items
                            .filter(item => !item.packed)
                            .forEach(item => handleItemUpdate(item.id, { packed: true }))
                        }}
                      >
                        Pack All Remaining
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {phase.items.map(item => (
                      <Card 
                        key={item.id}
                        className={`transition-all ${
                          item.packed 
                            ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                            : ''
                        }`}
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <button
                              onClick={() => handleItemUpdate(item.id, { packed: !item.packed })}
                              className="flex-shrink-0"
                            >
                              {item.packed ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <Circle className="h-5 w-5 text-muted-foreground" />
                              )}
                            </button>
                            <span className={item.packed ? 'line-through text-muted-foreground' : ''}>
                              {item.name}
                            </span>
                            {item.essential && (
                              <Star className="h-4 w-4 text-orange-500 fill-orange-500" />
                            )}
                          </CardTitle>
                          <CardDescription>
                            {item.category}
                            {item.notes && ` • ${item.notes}`}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`qty-${item.id}`} className="text-sm">
                              Qty:
                            </Label>
                            <Input
                              id={`qty-${item.id}`}
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => 
                                handleItemUpdate(item.id, { quantity: parseInt(e.target.value) || 1 })
                              }
                              className="w-16 h-8"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              )}

              {phase.items.length === 0 && (
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No items assigned to this phase</p>
                  </div>
                </CardContent>
              )}
            </Card>

            {isPhaseComplete(phase) && !phase.isCompleted && (
              <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-800 dark:text-green-200">
                          Phase Complete!
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          All items in this phase are packed.
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handlePhaseComplete(phase.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Mark Phase as Complete
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {phase.isCompleted && (
              <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-200">
                        Phase Completed ✅
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        This phase has been marked as complete.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}