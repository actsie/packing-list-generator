'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PostTripReview, PostTripItemReview, RegretLogEntry, Trip, PackingItem } from '@/lib/types'
import { Star, AlertTriangle, CheckCircle2, XCircle, Plus, ArrowLeft, BookOpen, Target, TrendingUp, Lightbulb } from 'lucide-react'
import { RegretLogManager } from './regret-log-manager'

interface PostTripReviewProps {
  trip?: Trip
  packingItems?: PackingItem[]
  onBack: () => void
  onSaveReview: (review: PostTripReview) => void
}

export function PostTripReviewComponent({ trip, packingItems = [], onBack, onSaveReview }: PostTripReviewProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [overallRating, setOverallRating] = useState(0)
  const [packingEffectivenessRating, setPackingEffectivenessRating] = useState(0)
  const [itemReviews, setItemReviews] = useState<PostTripItemReview[]>([])
  const [regrets, setRegrets] = useState<RegretLogEntry[]>([])
  const [insights, setInsights] = useState('')
  const [wouldPackDifferently, setWouldPackDifferently] = useState(false)
  const [mostUsefulItems, setMostUsefulItems] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  React.useEffect(() => {
    if (packingItems.length > 0 && itemReviews.length === 0) {
      const initialReviews = packingItems.map(item => ({
        itemId: item.id,
        itemName: item.name,
        category: item.category,
        packedQuantity: item.quantity,
        usedQuantity: item.quantity,
        usageRating: 3,
        wasEssential: item.essential,
        recommendation: 'pack-same' as const
      }))
      setItemReviews(initialReviews)
    }
  }, [packingItems, itemReviews.length])

  const StarRating = ({ rating, onRatingChange, size = 'default' }: { 
    rating: number
    onRatingChange: (rating: number) => void
    size?: 'small' | 'default'
  }) => {
    const starSize = size === 'small' ? 'h-4 w-4' : 'h-5 w-5'
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="text-amber-400 hover:text-amber-500 transition-colors"
          >
            <Star 
              className={`${starSize} ${star <= rating ? 'fill-current' : ''}`}
            />
          </button>
        ))}
      </div>
    )
  }

  const updateItemReview = (itemId: string, updates: Partial<PostTripItemReview>) => {
    setItemReviews(prev => 
      prev.map(review => 
        review.itemId === itemId 
          ? { ...review, ...updates }
          : review
      )
    )
  }

  const handleSubmit = async () => {
    if (!trip) return

    setIsSubmitting(true)
    
    try {
      const review: PostTripReview = {
        id: `review-${Date.now()}`,
        tripId: trip.id,
        tripName: trip.name,
        createdAt: new Date(),
        updatedAt: new Date(),
        overallRating,
        packingEffectivenessRating,
        itemReviews,
        regrets,
        insights,
        wouldPackDifferently,
        mostUsefulItems,
        recommendations
      }

      await onSaveReview(review)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getUsageColor = (used: number, packed: number) => {
    if (used === 0) return 'text-red-600 bg-red-50'
    if (used < packed * 0.5) return 'text-orange-600 bg-orange-50'
    if (used === packed) return 'text-green-600 bg-green-50'
    return 'text-blue-600 bg-blue-50'
  }

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'pack-more': return 'bg-blue-100 text-blue-800'
      case 'pack-same': return 'bg-green-100 text-green-800'
      case 'pack-less': return 'bg-orange-100 text-orange-800'
      case 'skip-next-time': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const generateInsights = () => {
    const unusedItems = itemReviews.filter(r => r.usedQuantity === 0)
    const overpackedItems = itemReviews.filter(r => r.usedQuantity < r.packedQuantity * 0.5)
    const underpackedCategories = itemReviews.filter(r => r.usedQuantity > r.packedQuantity * 0.8)

    let autoInsights = []
    
    if (unusedItems.length > 0) {
      autoInsights.push(`You didn't use ${unusedItems.length} items (${unusedItems.map(i => i.itemName).join(', ')}). Consider if these are truly necessary for future trips.`)
    }
    
    if (overpackedItems.length > 0) {
      autoInsights.push(`You overpacked in ${overpackedItems.length} items. Consider reducing quantities for similar trips.`)
    }

    if (regrets.length > 0) {
      const forgottenItems = regrets.filter(r => r.type === 'forgot-to-pack').length
      if (forgottenItems > 0) {
        autoInsights.push(`You forgot ${forgottenItems} essential items. Consider updating your master list or using a pre-trip checklist.`)
      }
    }

    return autoInsights.join('\n\n')
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Post-Trip Review
          </h1>
          {trip && (
            <p className="text-muted-foreground">
              Review your packing experience for {trip.name}
            </p>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Item Review
          </TabsTrigger>
          <TabsTrigger value="regrets" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Regret Log
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overall Experience</CardTitle>
              <CardDescription>
                Rate your overall trip and packing effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Overall Trip Rating
                </Label>
                <StarRating rating={overallRating} onRatingChange={setOverallRating} />
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Packing Effectiveness
                </Label>
                <StarRating rating={packingEffectivenessRating} onRatingChange={setPackingEffectivenessRating} />
                <p className="text-sm text-muted-foreground mt-1">
                  How well did your packing list serve you?
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="pack-differently"
                  checked={wouldPackDifferently}
                  onChange={(e) => setWouldPackDifferently(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="pack-differently">
                  I would pack differently next time
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {itemReviews.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Items Reviewed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {itemReviews.filter(r => r.usedQuantity > 0).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Items Used</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {itemReviews.filter(r => r.usedQuantity === 0).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Unused Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {regrets.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Regrets Logged</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Item-by-Item Review</CardTitle>
              <CardDescription>
                Review how well each item served you during the trip
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {itemReviews.map((review, index) => (
                  <Card key={review.itemId} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h4 className="font-medium">{review.itemName}</h4>
                          <Badge variant="secondary">{review.category}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <Label className="text-sm text-muted-foreground">Packed</Label>
                            <div className="text-lg font-medium">{review.packedQuantity}</div>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Used</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                max={review.packedQuantity}
                                value={review.usedQuantity}
                                onChange={(e) => updateItemReview(review.itemId, {
                                  usedQuantity: parseInt(e.target.value) || 0
                                })}
                                className="w-20 h-8"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Usage Rating</Label>
                            <StarRating 
                              rating={review.usageRating}
                              onRatingChange={(rating) => updateItemReview(review.itemId, { usageRating: rating })}
                              size="small"
                            />
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Next Time</Label>
                            <select
                              value={review.recommendation}
                              onChange={(e) => updateItemReview(review.itemId, {
                                recommendation: e.target.value as PostTripItemReview['recommendation']
                              })}
                              className="w-full p-1 border rounded text-sm"
                            >
                              <option value="pack-more">Pack More</option>
                              <option value="pack-same">Pack Same</option>
                              <option value="pack-less">Pack Less</option>
                              <option value="skip-next-time">Skip Next Time</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <Badge className={getUsageColor(review.usedQuantity, review.packedQuantity)}>
                            {review.usedQuantity === 0 ? 'Unused' :
                             review.usedQuantity < review.packedQuantity * 0.5 ? 'Underused' :
                             review.usedQuantity === review.packedQuantity ? 'Fully Used' : 'Well Used'}
                          </Badge>
                          <Badge className={getRecommendationColor(review.recommendation)}>
                            {review.recommendation.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regrets" className="space-y-6">
          <RegretLogManager
            regrets={regrets}
            onRegretsChange={setRegrets}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Generated Insights
              </CardTitle>
              <CardDescription>
                Automatic insights based on your review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-blue-50 rounded-lg mb-4">
                <div className="whitespace-pre-wrap text-sm">
                  {generateInsights() || 'Complete your item reviews and regret log to see personalized insights.'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personal Notes & Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="insights">Additional Insights</Label>
                <Textarea
                  id="insights"
                  placeholder="What did you learn from this trip? Any patterns you noticed?"
                  value={insights}
                  onChange={(e) => setInsights(e.target.value)}
                  className="h-24 resize-none"
                />
              </div>
              
              <div>
                <Label htmlFor="recommendations">Recommendations for Future Trips</Label>
                <Textarea
                  id="recommendations"
                  placeholder="What would you tell yourself before packing for a similar trip?"
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  className="h-24 resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          Save Draft
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || overallRating === 0}
          className="flex items-center gap-2"
        >
          {isSubmitting ? 'Saving...' : 'Complete Review'}
          <CheckCircle2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}