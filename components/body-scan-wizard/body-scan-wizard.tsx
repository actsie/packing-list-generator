'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, ArrowRight, CheckCircle, Circle, Scan, Shirt, Package, Eye, RotateCcw } from 'lucide-react'
import { PackingItem, Category } from '@/lib/types'

interface BodyScanWizardProps {
  items: PackingItem[]
  onComplete: (scannedItems: BodyScanResult[]) => void
  onBack: () => void
}

export interface BodyScanResult {
  item: PackingItem
  hasInCloset: boolean
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  needsReplacement: boolean
  notes?: string
}

interface ScanStep {
  id: string
  title: string
  description: string
  category: Category
  icon: React.ReactNode
}

const SCAN_STEPS: ScanStep[] = [
  {
    id: 'tops',
    title: 'Tops & Shirts',
    description: 'Scan your shirts, blouses, t-shirts, and sweaters',
    category: 'tops',
    icon: <Shirt className="h-6 w-6" />
  },
  {
    id: 'bottoms',
    title: 'Bottoms',
    description: 'Check your pants, shorts, skirts, and jeans',
    category: 'bottoms',
    icon: <Package className="h-6 w-6" />
  },
  {
    id: 'shoes',
    title: 'Shoes',
    description: 'Review your footwear options',
    category: 'shoes',
    icon: <Circle className="h-6 w-6" />
  },
  {
    id: 'accessories',
    title: 'Accessories',
    description: 'Scan belts, jewelry, hats, and bags',
    category: 'accessories',
    icon: <Eye className="h-6 w-6" />
  },
  {
    id: 'outerwear',
    title: 'Outerwear',
    description: 'Check jackets, coats, and sweaters',
    category: 'outerwear',
    icon: <Package className="h-6 w-6" />
  }
]

export function BodyScanWizard({ items, onComplete, onBack }: BodyScanWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [scanResults, setScanResults] = useState<Map<string, BodyScanResult>>(new Map())
  const [showSummary, setShowSummary] = useState(false)

  const currentStep = SCAN_STEPS[currentStepIndex]
  const currentStepItems = items.filter(item => item.category === currentStep?.category)
  const progress = ((currentStepIndex + 1) / SCAN_STEPS.length) * 100

  useEffect(() => {
    // Initialize scan results for all items
    if (items && items.length > 0) {
      items.forEach(item => {
        if (!scanResults.has(item.id)) {
          setScanResults(prev => new Map(prev).set(item.id, {
            item,
            hasInCloset: false,
            condition: 'good',
            needsReplacement: false
          }))
        }
      })
    }
  }, [items, scanResults])

  const updateScanResult = (itemId: string, updates: Partial<BodyScanResult>) => {
    setScanResults(prev => {
      const newMap = new Map(prev)
      const existing = newMap.get(itemId)
      if (existing) {
        newMap.set(itemId, { ...existing, ...updates })
      }
      return newMap
    })
  }

  const handleNext = () => {
    if (currentStepIndex < SCAN_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      setShowSummary(true)
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const handleComplete = () => {
    onComplete(Array.from(scanResults.values()))
  }

  const handleRestart = () => {
    setCurrentStepIndex(0)
    setShowSummary(false)
    setScanResults(new Map())
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'fair': return 'bg-yellow-100 text-yellow-800'
      case 'poor': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (showSummary) {
    const totalItems = Array.from(scanResults.values())
    const itemsInCloset = totalItems.filter(result => result.hasInCloset)
    const needReplacement = totalItems.filter(result => result.needsReplacement)
    const readyToPack = itemsInCloset.filter(result => !result.needsReplacement)

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Body Scan Summary</CardTitle>
          <CardDescription>
            Here's what we found in your closet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{readyToPack.length}</div>
                <div className="text-sm text-muted-foreground">Ready to Pack</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{needReplacement.length}</div>
                <div className="text-sm text-muted-foreground">Need Replacement</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{totalItems.length - itemsInCloset.length}</div>
                <div className="text-sm text-muted-foreground">Need to Buy</div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <Tabs defaultValue="ready" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ready">Ready to Pack ({readyToPack.length})</TabsTrigger>
              <TabsTrigger value="replace">Need Replacement ({needReplacement.length})</TabsTrigger>
              <TabsTrigger value="buy">Need to Buy ({totalItems.length - itemsInCloset.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ready" className="space-y-2">
              {readyToPack.map(result => (
                <div key={result.item.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">{result.item.name}</span>
                    <Badge className={`ml-2 ${getConditionColor(result.condition)}`}>
                      {result.condition}
                    </Badge>
                  </div>
                  <Badge variant="outline">{result.item.category}</Badge>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="replace" className="space-y-2">
              {needReplacement.map(result => (
                <div key={result.item.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">{result.item.name}</span>
                    <Badge className={`ml-2 ${getConditionColor(result.condition)}`}>
                      {result.condition}
                    </Badge>
                  </div>
                  <Badge variant="outline">{result.item.category}</Badge>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="buy" className="space-y-2">
              {totalItems.filter(result => !result.hasInCloset).map(result => (
                <div key={result.item.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">{result.item.name}</span>
                  <Badge variant="outline">{result.item.category}</Badge>
                </div>
              ))}
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleRestart} className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Restart Scan
            </Button>
            <Button onClick={handleComplete} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Use These Results
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentStep) {
    return null
  }

  // Handle case where no items are available
  if (!items || items.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="text-center py-12">
          <Scan className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <CardTitle className="text-xl mb-2">No Items to Scan</CardTitle>
          <CardDescription className="max-w-md mx-auto mb-6">
            Please select a master list with items before starting the body scan wizard.
          </CardDescription>
          <Button onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Master Lists
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Scan className="h-6 w-6" />
              Body Scan Wizard
            </CardTitle>
            <CardDescription>
              Step {currentStepIndex + 1} of {SCAN_STEPS.length}: {currentStep.title}
            </CardDescription>
          </div>
          <Progress value={progress} className="w-32" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          {currentStep.icon}
          <div>
            <h3 className="font-semibold">{currentStep.title}</h3>
            <p className="text-sm text-muted-foreground">{currentStep.description}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Check each item in your closet:</h4>
          {currentStepItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No items in this category to scan.
            </div>
          ) : (
            currentStepItems.map(item => {
            const result = scanResults.get(item.id)
            return (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={result?.hasInCloset || false}
                          onCheckedChange={(checked) => 
                            updateScanResult(item.id, { hasInCloset: !!checked })
                          }
                        />
                        <div>
                          <span className="font-medium">{item.name}</span>
                          {item.essential && (
                            <Badge variant="secondary" className="ml-2">Essential</Badge>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline">{item.quantity}x needed</Badge>
                    </div>

                    {result?.hasInCloset && (
                      <div className="ml-6 space-y-3 border-l-2 border-muted pl-4">
                        <div>
                          <label className="text-sm font-medium">Condition:</label>
                          <div className="flex gap-2 mt-1">
                            {['excellent', 'good', 'fair', 'poor'].map(condition => (
                              <Button
                                key={condition}
                                variant={result.condition === condition ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => updateScanResult(item.id, { 
                                  condition: condition as any,
                                  needsReplacement: condition === 'poor'
                                })}
                                className="capitalize"
                              >
                                {condition}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {result.condition === 'poor' && (
                          <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                            This item is marked for replacement due to poor condition
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
          )}
        </div>

        <div className="flex items-center justify-between pt-6 border-t">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex gap-2">
            {currentStepIndex > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                Previous
              </Button>
            )}
            <Button onClick={handleNext} className="flex items-center gap-2">
              {currentStepIndex < SCAN_STEPS.length - 1 ? 'Next' : 'View Summary'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}