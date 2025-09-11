'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { RegretLogEntry } from '@/lib/types'
import { Plus, Trash2, AlertTriangle, Package, X, CheckCircle } from 'lucide-react'

interface RegretLogManagerProps {
  regrets: RegretLogEntry[]
  onRegretsChange: (regrets: RegretLogEntry[]) => void
}

export function RegretLogManager({ regrets, onRegretsChange }: RegretLogManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newRegret, setNewRegret] = useState({
    type: 'forgot-to-pack' as RegretLogEntry['type'],
    itemName: '',
    category: '',
    description: '',
    impact: 'medium' as RegretLogEntry['impact'],
    solution: '',
    preventionTip: ''
  })

  const regretTypes = [
    { value: 'forgot-to-pack', label: 'Forgot to Pack', icon: AlertTriangle, color: 'text-red-600' },
    { value: 'overpacked', label: 'Overpacked', icon: Package, color: 'text-orange-600' },
    { value: 'wrong-choice', label: 'Wrong Choice', icon: X, color: 'text-yellow-600' },
    { value: 'quality-issue', label: 'Quality Issue', icon: AlertTriangle, color: 'text-purple-600' }
  ]

  const impactLevels = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' }
  ]

  const categories = [
    'tops', 'bottoms', 'underwear', 'outerwear', 'toiletries', 
    'tech', 'documents', 'meds', 'shoes', 'accessories', 'misc'
  ]

  const handleAddRegret = () => {
    if (!newRegret.itemName.trim() || !newRegret.description.trim()) return

    const regret: RegretLogEntry = {
      id: `regret-${Date.now()}`,
      ...newRegret,
      createdAt: new Date()
    }

    onRegretsChange([...regrets, regret])
    
    setNewRegret({
      type: 'forgot-to-pack',
      itemName: '',
      category: '',
      description: '',
      impact: 'medium',
      solution: '',
      preventionTip: ''
    })
    setShowAddForm(false)
  }

  const handleDeleteRegret = (id: string) => {
    onRegretsChange(regrets.filter(r => r.id !== id))
  }

  const getTypeInfo = (type: RegretLogEntry['type']) => {
    return regretTypes.find(t => t.value === type) || regretTypes[0]
  }

  const getImpactColor = (impact: RegretLogEntry['impact']) => {
    return impactLevels.find(l => l.value === impact)?.color || 'bg-gray-100 text-gray-800'
  }

  const getRegretTypeDescription = (type: RegretLogEntry['type']) => {
    switch (type) {
      case 'forgot-to-pack':
        return 'Something essential you forgot to bring'
      case 'overpacked':
        return 'Items you brought too many of or didn\'t need'
      case 'wrong-choice':
        return 'Items that weren\'t suitable for the trip'
      case 'quality-issue':
        return 'Items that failed or performed poorly'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Regret Log
          </CardTitle>
          <CardDescription>
            Track packing mistakes and lessons learned to improve future trips
          </CardDescription>
        </CardHeader>
        <CardContent>
          {regrets.length === 0 && !showAddForm && (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No regrets logged yet</h3>
              <p className="text-muted-foreground mb-4">
                Add items you forgot, overpacked, or wish you had chosen differently
              </p>
              <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Regret
              </Button>
            </div>
          )}

          {regrets.length > 0 && (
            <div className="space-y-4 mb-6">
              {regrets.map((regret) => {
                const typeInfo = getTypeInfo(regret.type)
                const TypeIcon = typeInfo.icon

                return (
                  <Card key={regret.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <TypeIcon className={`h-5 w-5 ${typeInfo.color}`} />
                        <div>
                          <h4 className="font-medium">{regret.itemName}</h4>
                          <p className="text-sm text-muted-foreground">{typeInfo.label}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getImpactColor(regret.impact)}>
                          {regret.impact} impact
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRegret(regret.id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Issue:</p>
                        <p className="text-sm">{regret.description}</p>
                      </div>

                      {regret.solution && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Solution Used:</p>
                          <p className="text-sm">{regret.solution}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Prevention Tip:</p>
                        <p className="text-sm">{regret.preventionTip}</p>
                      </div>

                      {regret.category && (
                        <Badge variant="outline" className="text-xs">
                          {regret.category}
                        </Badge>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          )}

          {showAddForm && (
            <Card className="p-4 border-2 border-dashed">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Add New Regret</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Regret Type</Label>
                    <select
                      value={newRegret.type}
                      onChange={(e) => setNewRegret(prev => ({ 
                        ...prev, 
                        type: e.target.value as RegretLogEntry['type'] 
                      }))}
                      className="w-full mt-1 p-2 border rounded-md"
                    >
                      {regretTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getRegretTypeDescription(newRegret.type)}
                    </p>
                  </div>

                  <div>
                    <Label>Impact Level</Label>
                    <select
                      value={newRegret.impact}
                      onChange={(e) => setNewRegret(prev => ({ 
                        ...prev, 
                        impact: e.target.value as RegretLogEntry['impact'] 
                      }))}
                      className="w-full mt-1 p-2 border rounded-md"
                    >
                      {impactLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Item Name *</Label>
                    <Input
                      value={newRegret.itemName}
                      onChange={(e) => setNewRegret(prev => ({ ...prev, itemName: e.target.value }))}
                      placeholder="What item is this about?"
                    />
                  </div>

                  <div>
                    <Label>Category</Label>
                    <select
                      value={newRegret.category}
                      onChange={(e) => setNewRegret(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full mt-1 p-2 border rounded-md"
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Description *</Label>
                  <Textarea
                    value={newRegret.description}
                    onChange={(e) => setNewRegret(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what went wrong and how it affected your trip..."
                    className="h-20 resize-none"
                  />
                </div>

                <div>
                  <Label>How did you solve it?</Label>
                  <Input
                    value={newRegret.solution}
                    onChange={(e) => setNewRegret(prev => ({ ...prev, solution: e.target.value }))}
                    placeholder="What did you do to address this issue during the trip?"
                  />
                </div>

                <div>
                  <Label>Prevention Tip</Label>
                  <Input
                    value={newRegret.preventionTip}
                    onChange={(e) => setNewRegret(prev => ({ ...prev, preventionTip: e.target.value }))}
                    placeholder="How will you prevent this next time?"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddRegret}
                    disabled={!newRegret.itemName.trim() || !newRegret.description.trim()}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Add Regret
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {!showAddForm && regrets.length > 0 && (
            <Button 
              onClick={() => setShowAddForm(true)} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Another Regret
            </Button>
          )}
        </CardContent>
      </Card>

      {regrets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {regretTypes.map(type => {
                const count = regrets.filter(r => r.type === type.value).length
                const Icon = type.icon
                return (
                  <div key={type.value} className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Icon className={`h-8 w-8 ${type.color}`} />
                    </div>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-muted-foreground">{type.label}</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}