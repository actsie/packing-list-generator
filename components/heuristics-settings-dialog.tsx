'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HeuristicConfig, DEFAULT_HEURISTICS } from '@/lib/types'
import { Settings, RefreshCw, Info, Shirt, TreePine, Briefcase, Waves, Dumbbell } from 'lucide-react'

interface HeuristicsSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  config: HeuristicConfig
  onConfigChange: (config: HeuristicConfig) => void
}

export default function HeuristicsSettingsDialog({ 
  open, 
  onOpenChange, 
  config, 
  onConfigChange 
}: HeuristicsSettingsDialogProps) {
  const [localConfig, setLocalConfig] = useState<HeuristicConfig>(config)

  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  const handleSave = () => {
    onConfigChange(localConfig)
    onOpenChange(false)
  }

  const handleReset = () => {
    setLocalConfig({ ...DEFAULT_HEURISTICS })
  }

  const updateConfig = (section: keyof HeuristicConfig, field: string, value: number) => {
    setLocalConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: Math.max(1, value)
      }
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Per-Trip Heuristics Settings
          </DialogTitle>
          <DialogDescription>
            Configure how quantities are automatically calculated based on trip parameters
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="clothing" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="clothing" className="flex items-center gap-1">
              <Shirt className="h-4 w-4" />
              Clothing
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center gap-1">
              <Dumbbell className="h-4 w-4" />
              Activities
            </TabsTrigger>
            <TabsTrigger value="seasonal" className="flex items-center gap-1">
              <TreePine className="h-4 w-4" />
              Seasonal
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              Business
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-1">
              <Info className="h-4 w-4" />
              Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clothing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shirt className="h-5 w-5" />
                  Clothing Basics
                </CardTitle>
                <CardDescription>
                  Configure how tops, bottoms, and underwear quantities are calculated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tops (with laundry available)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={localConfig.tops.withLaundry}
                      onChange={(e) => updateConfig('tops', 'withLaundry', parseInt(e.target.value) || 1)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum tops to pack when laundry is available
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Tops multiplier (no laundry)</Label>
                    <Input
                      type="number"
                      min="1"
                      step="0.1"
                      value={localConfig.tops.withoutLaundry}
                      onChange={(e) => updateConfig('tops', 'withoutLaundry', parseFloat(e.target.value) || 1)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Multiplier per day when no laundry available
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bottoms ratio</Label>
                    <Input
                      type="number"
                      min="1"
                      value={localConfig.bottoms.ratio}
                      onChange={(e) => updateConfig('bottoms', 'ratio', parseInt(e.target.value) || 1)}
                    />
                    <p className="text-xs text-muted-foreground">
                      One bottom per X days (e.g., 2 = 1 bottom per 2 days)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Underwear/Socks extra</Label>
                    <Input
                      type="number"
                      min="0"
                      value={localConfig.underwear.extra}
                      onChange={(e) => updateConfig('underwear', 'extra', parseInt(e.target.value) || 0)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Extra pairs beyond trip days (days + extra)
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Sleepwear frequency</Label>
                  <Input
                    type="number"
                    min="1"
                    value={localConfig.sleepwear.per}
                    onChange={(e) => updateConfig('sleepwear', 'per', parseInt(e.target.value) || 1)}
                  />
                  <p className="text-xs text-muted-foreground">
                    One sleepwear set per X days
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Waves className="h-5 w-5 text-blue-500" />
                    Beach/Swimming
                  </CardTitle>
                  <CardDescription>
                    Configure swimwear quantity calculations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Minimum days for multiple swimwear</Label>
                    <Input
                      type="number"
                      min="1"
                      value={localConfig.swim.minDays}
                      onChange={(e) => updateConfig('swim', 'minDays', parseInt(e.target.value) || 1)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Pack multiple swimwear only if trip is X days or longer
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Swimwear quantity (long trips)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={localConfig.swim.qty}
                      onChange={(e) => updateConfig('swim', 'qty', parseInt(e.target.value) || 1)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of swimwear items for longer beach trips
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-green-500" />
                    Gym/Fitness
                  </CardTitle>
                  <CardDescription>
                    Configure workout gear calculations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Gym clothes (short trips)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={localConfig.gym.short}
                      onChange={(e) => updateConfig('gym', 'short', parseInt(e.target.value) || 1)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Gym outfit sets for trips under threshold
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Gym clothes (long trips)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={localConfig.gym.long}
                      onChange={(e) => updateConfig('gym', 'long', parseInt(e.target.value) || 1)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Gym outfit sets for longer trips
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Long trip threshold (days)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={localConfig.gym.longThreshold}
                      onChange={(e) => updateConfig('gym', 'longThreshold', parseInt(e.target.value) || 1)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Days that define a "long" trip for gym calculations
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="seasonal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TreePine className="h-5 w-5 text-green-600" />
                  Seasonal Adjustments
                </CardTitle>
                <CardDescription>
                  Additional heuristics based on season and destination type (coming soon)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Seasonal heuristics will be available in a future update. Currently, 
                  the system applies basic seasonal logic for outerwear based on your trip details.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-slate-600" />
                  Business Travel
                </CardTitle>
                <CardDescription>
                  Specialized heuristics for business trips (coming soon)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Business travel heuristics will be available in a future update. Currently, 
                  the system applies basic formal wear logic when "Business/Formal" activity is selected.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  How Heuristics Work
                </CardTitle>
                <CardDescription>
                  Understanding the automatic quantity calculations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Clothing Calculations</h4>
                    <p className="text-sm text-muted-foreground">
                      Tops: With laundry available, packs up to your set maximum. Without laundry, 
                      packs based on trip duration using your multiplier.
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Bottoms: One pair for every X days based on your ratio setting.
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Underwear/Socks: One for each day plus your extra setting.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Activity-Based Logic</h4>
                    <p className="text-sm text-muted-foreground">
                      The system analyzes your selected activities and destination type to 
                      suggest appropriate quantities for specialized gear.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-1">Smart Defaults</h4>
                    <p className="text-sm text-muted-foreground">
                      All calculations use sensible minimums and maximums to prevent 
                      unrealistic suggestions while adapting to your specific trip needs.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}