'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Trip } from '@/lib/types'
import { TripStorage } from '@/lib/trip-storage'
import { useRouter } from 'next/navigation'
import { 
  ChevronDown, 
  Sparkles, 
  Scan, 
  ShoppingBag, 
  Clock,
  Home,
  Settings,
  Calendar,
  Save
} from 'lucide-react'

interface ChecklistHeaderProps {
  trip: Trip
  onOpenSmartSetup?: () => void
  onOpenBodyScan?: () => void
  onOpenArrivalList?: () => void
  onSaveAsTemplate?: () => void
}

export function ChecklistHeader({ 
  trip, 
  onOpenSmartSetup,
  onOpenBodyScan,
  onOpenArrivalList,
  onSaveAsTemplate
}: ChecklistHeaderProps) {
  const router = useRouter()
  const [recentTrips, setRecentTrips] = useState<Trip[]>([])
  const [showTripSwitcher, setShowTripSwitcher] = useState(false)

  const handleTripSwitcherClick = () => {
    const trips = TripStorage.getRecentTrips(5)
    setRecentTrips(trips)
    setShowTripSwitcher(true)
  }

  const handleSwitchTrip = (tripId: string) => {
    TripStorage.setActiveTrip(tripId)
    router.push(`/trip/${tripId}`)
  }

  const handleGoToHistory = () => {
    router.push('/history')
  }

  const handleGoHome = () => {
    TripStorage.clearActiveTrip()
    router.push('/')
  }

  return (
    <div className="flex items-center justify-between mb-6">
      {/* Trip Switcher */}
      <div className="flex items-center gap-3">
        <DropdownMenu open={showTripSwitcher} onOpenChange={setShowTripSwitcher}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              onClick={handleTripSwitcherClick}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              {trip.name}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>Recent Trips</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {recentTrips.map((recentTrip) => (
              <DropdownMenuItem
                key={recentTrip.id}
                onClick={() => handleSwitchTrip(recentTrip.id)}
                className="cursor-pointer"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{recentTrip.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {recentTrip.destination} • {new Date(recentTrip.startDate).toLocaleDateString()}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleGoToHistory} className="cursor-pointer">
              <Clock className="h-4 w-4 mr-2" />
              View All History
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleGoHome} className="cursor-pointer">
              <Home className="h-4 w-4 mr-2" />
              Back to Library
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tools Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Tools
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={onOpenSmartSetup} className="cursor-pointer">
            <Sparkles className="h-4 w-4 mr-2" />
            Smart Setup
            <span className="ml-auto text-xs text-muted-foreground">AI suggestions</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onOpenBodyScan} className="cursor-pointer">
            <Scan className="h-4 w-4 mr-2" />
            Body-Scan & Day Viz
            <span className="ml-auto text-xs text-muted-foreground">Visual packing</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onOpenArrivalList} className="cursor-pointer">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Arrival List
            <span className="ml-auto text-xs text-muted-foreground">Buy there items</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSaveAsTemplate} className="cursor-pointer">
            <Save className="h-4 w-4 mr-2" />
            Save as Template
            <span className="ml-auto text-xs text-muted-foreground">Save to library</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}