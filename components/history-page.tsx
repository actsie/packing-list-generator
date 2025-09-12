'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trip } from '@/lib/types'
import { TripStorage } from '@/lib/trip-storage'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Clock, 
  ArrowRight, 
  MoreHorizontal, 
  Calendar,
  MapPin,
  Package,
  Trash2,
  Copy,
  Archive,
  Home,
  CheckCircle,
  Circle
} from 'lucide-react'
import { format } from 'date-fns'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function HistoryPage() {
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tripToDelete, setTripToDelete] = useState<string | null>(null)

  useEffect(() => {
    const allTrips = TripStorage.getAllTrips()
    setTrips(allTrips)
  }, [])

  const handleResume = (tripId: string) => {
    TripStorage.setActiveTrip(tripId)
    router.push(`/trip/${tripId}`)
  }

  const handleDuplicate = (trip: Trip) => {
    const newTrip: Trip = {
      ...trip,
      id: `trip-${Date.now()}`,
      name: `${trip.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      checklistItems: trip.checklistItems.map(item => ({
        ...item,
        id: `item-${Date.now()}-${Math.random()}`,
        packed: false
      })),
      suggestions: [],
      appliedSuggestions: []
    }
    
    TripStorage.saveTrip(newTrip)
    const updatedTrips = TripStorage.getAllTrips()
    setTrips(updatedTrips)
  }

  const handleDelete = (tripId: string) => {
    setTripToDelete(tripId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (tripToDelete) {
      TripStorage.deleteTrip(tripToDelete)
      const updatedTrips = TripStorage.getAllTrips()
      setTrips(updatedTrips)
    }
    setDeleteDialogOpen(false)
    setTripToDelete(null)
  }

  const getProgressPercentage = (trip: Trip) => {
    const totalItems = trip.checklistItems.length
    const packedItems = trip.checklistItems.filter(item => item.packed).length
    return totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0
  }

  const getTripStatus = (trip: Trip) => {
    const now = new Date()
    const startDate = new Date(trip.startDate)
    const endDate = new Date(trip.endDate)

    if (now < startDate) {
      return { label: 'Upcoming', variant: 'secondary' as const }
    } else if (now >= startDate && now <= endDate) {
      return { label: 'In Progress', variant: 'default' as const }
    } else {
      return { label: 'Completed', variant: 'outline' as const }
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Clock className="h-8 w-8" />
            Trip History
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage and resume your packing lists
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/')}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Back to Library
        </Button>
      </div>

      {trips.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              No trips yet. Start your first trip from the library!
            </p>
            <Button onClick={() => router.push('/')}>
              Go to Library
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {trips.map((trip) => {
            const progress = getProgressPercentage(trip)
            const status = getTripStatus(trip)
            
            return (
              <Card key={trip.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl flex items-center gap-3">
                        {trip.name}
                        <Badge variant={status.variant} className="text-xs">
                          {status.label}
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {trip.destination}
                        </span>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleResume(trip.id)} className="cursor-pointer">
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Resume
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(trip)} className="cursor-pointer">
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled className="cursor-pointer">
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(trip.id)} 
                          className="cursor-pointer text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Packing Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-primary h-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Trip Details */}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        {trip.checklistItems.length} items
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">
                        {trip.days} days
                      </span>
                      {trip.setupMode && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <Badge variant="outline" className="text-xs">
                            {trip.setupMode === 'smart' ? 'Smart Setup' : 'Checklist Only'}
                          </Badge>
                        </>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button 
                      onClick={() => handleResume(trip.id)}
                      className="w-full"
                      variant="outline"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Resume Trip
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trip</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this trip? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}