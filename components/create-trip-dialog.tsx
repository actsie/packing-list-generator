'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, MapPin, Luggage, Shirt } from 'lucide-react'

interface CreateTripDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTripCreated: (tripData: any) => void
}

export default function CreateTripDialog({ open, onOpenChange, onTripCreated }: CreateTripDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    destination: '',
    destinationType: '',
    season: '',
    luggage: '',
    laundry: false,
    shoppingLikely: false,
    activities: [] as string[]
  })

  const activities = [
    'Beach/Swimming', 'Hiking', 'Business/Formal', 'Gym/Fitness', 
    'Skiing', 'Camping', 'Photography', 'International'
  ]

  const handleActivityToggle = (activity: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Calculate trip duration
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const tripData = {
      ...formData,
      days,
      id: `trip-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    onTripCreated(tripData)
    
    // Reset form
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      destination: '',
      destinationType: '',
      season: '',
      luggage: '',
      laundry: false,
      shoppingLikely: false,
      activities: []
    })
  }

  const isFormValid = formData.name && formData.startDate && formData.endDate && 
                     formData.destinationType && formData.season && formData.luggage

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Trip</DialogTitle>
          <DialogDescription>
            Set up your trip details to generate a smart packing list
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Trip Name</Label>
              <Input
                id="name"
                placeholder="e.g., Weekend in Paris, Beach vacation"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                placeholder="City, Country"
                value={formData.destination}
                onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
              />
            </div>
          </div>

          {/* Trip Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Destination Type</Label>
              <Select value={formData.destinationType} onValueChange={(value) => setFormData(prev => ({ ...prev, destinationType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="city">🏙️ City</SelectItem>
                  <SelectItem value="beach">🏖️ Beach</SelectItem>
                  <SelectItem value="mountain">🏔️ Mountain</SelectItem>
                  <SelectItem value="rural">🌾 Rural</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Season</Label>
              <Select value={formData.season} onValueChange={(value) => setFormData(prev => ({ ...prev, season: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spring">🌸 Spring</SelectItem>
                  <SelectItem value="summer">☀️ Summer</SelectItem>
                  <SelectItem value="fall">🍂 Fall</SelectItem>
                  <SelectItem value="winter">❄️ Winter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Luggage & Preferences */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Luggage Type</Label>
              <Select value={formData.luggage} onValueChange={(value) => setFormData(prev => ({ ...prev, luggage: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select luggage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="carryOn">🎒 Carry-on only</SelectItem>
                  <SelectItem value="checked">🧳 Checked bag</SelectItem>
                  <SelectItem value="hybrid">🎒🧳 Carry-on + Checked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="laundry"
                  checked={formData.laundry}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, laundry: checked as boolean }))}
                />
                <Label htmlFor="laundry" className="text-sm">
                  Laundry available
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="shopping"
                  checked={formData.shoppingLikely}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, shoppingLikely: checked as boolean }))}
                />
                <Label htmlFor="shopping" className="text-sm">
                  Shopping likely
                </Label>
              </div>
            </div>
          </div>

          {/* Activities */}
          <div className="space-y-3">
            <Label>Planned Activities</Label>
            <div className="flex flex-wrap gap-2">
              {activities.map(activity => (
                <Badge
                  key={activity}
                  variant={formData.activities.includes(activity) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleActivityToggle(activity)}
                >
                  {activity}
                </Badge>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid}>
              Create Trip & Generate List
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}