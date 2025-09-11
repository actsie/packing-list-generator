'use client'

import { useState } from 'react'
import { PackingItem } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { AlertTriangle, Lock, Clock, Plane, Pin, PinOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EssentialsPanelProps {
  items: PackingItem[]
  onItemToggle: (itemId: string) => void
  onItemPin?: (itemId: string) => void
}

export default function EssentialsPanel({ items, onItemToggle, onItemPin }: EssentialsPanelProps) {
  const [showUnlockDialog, setShowUnlockDialog] = useState(false)
  const [itemToUnlock, setItemToUnlock] = useState<string | null>(null)
  const [showUnpinDialog, setShowUnpinDialog] = useState(false)
  const [itemToUnpin, setItemToUnpin] = useState<string | null>(null)

  const essentialItems = items.filter(item => item.essential)
  const pinnedItems = items.filter(item => item.pinned)
  const packedEssentials = essentialItems.filter(item => item.packed)
  const packedPinned = pinnedItems.filter(item => item.packed)
  const isAllEssentialsPacked = essentialItems.length > 0 && packedEssentials.length === essentialItems.length
  const isAllPinnedPacked = pinnedItems.length > 0 && packedPinned.length === pinnedItems.length

  const handleEssentialToggle = (itemId: string, currentPacked: boolean) => {
    // If trying to unpack an essential item, show confirmation dialog
    if (currentPacked) {
      setItemToUnlock(itemId)
      setShowUnlockDialog(true)
    } else {
      onItemToggle(itemId)
    }
  }

  const handlePinToggle = (itemId: string, currentPinned: boolean) => {
    if (currentPinned && onItemPin) {
      // Show confirmation when unpinning
      setItemToUnpin(itemId)
      setShowUnpinDialog(true)
    } else if (onItemPin) {
      onItemPin(itemId)
    }
  }

  const confirmUnlock = () => {
    if (itemToUnlock) {
      onItemToggle(itemToUnlock)
    }
    setShowUnlockDialog(false)
    setItemToUnlock(null)
  }

  const confirmUnpin = () => {
    if (itemToUnpin && onItemPin) {
      onItemPin(itemToUnpin)
    }
    setShowUnpinDialog(false)
    setItemToUnpin(null)
  }

  const getTimeToFlight = () => {
    // Mock function - in real app this would calculate based on trip start date
    return "2 days, 4 hours"
  }

  return (
    <div className="space-y-4">
      {/* Pinned Items Card */}
      <Card className={cn(
        "border-2 transition-colors",
        isAllPinnedPacked ? "border-blue-200 bg-blue-50" : "border-blue-200 bg-blue-50"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Pin className={cn(
                "h-5 w-5",
                isAllPinnedPacked ? "text-blue-600" : "text-blue-600"
              )} />
              Pinned Items
            </CardTitle>
            <Badge variant={isAllPinnedPacked ? "default" : "secondary"}>
              {packedPinned.length}/{pinnedItems.length}
            </Badge>
          </div>
          <CardDescription>
            Your manually pinned priority items
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {pinnedItems.map(item => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-3 p-2 rounded-md transition-colors",
                item.packed ? "bg-blue-100" : "bg-white border"
              )}
            >
              <Checkbox
                checked={item.packed}
                onCheckedChange={() => onItemToggle(item.id)}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <div className="flex-1 min-w-0">
                <span className={cn(
                  "font-medium text-sm",
                  item.packed && "line-through text-muted-foreground"
                )}>
                  {item.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePinToggle(item.id, true)}
                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
              >
                <PinOff className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {pinnedItems.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No pinned items yet. Pin items from your packing list to see them here.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Essentials Lock Card */}
      <Card className={cn(
        "border-2 transition-colors",
        isAllEssentialsPacked ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className={cn(
                "h-5 w-5",
                isAllEssentialsPacked ? "text-green-600" : "text-orange-600"
              )} />
              Essentials Lock
            </CardTitle>
            <Badge variant={isAllEssentialsPacked ? "default" : "destructive"}>
              {packedEssentials.length}/{essentialItems.length}
            </Badge>
          </div>
          <CardDescription>
            Critical items that require confirmation to unpack
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {essentialItems.map(item => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-3 p-2 rounded-md transition-colors",
                item.packed ? "bg-green-100" : "bg-white border"
              )}
            >
              <Checkbox
                checked={item.packed}
                onCheckedChange={() => handleEssentialToggle(item.id, item.packed)}
                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
              <div className="flex-1 min-w-0">
                <span className={cn(
                  "font-medium text-sm",
                  item.packed && "line-through text-muted-foreground"
                )}>
                  {item.name}
                </span>
              </div>
              {!item.packed && (
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              )}
            </div>
          ))}

          {essentialItems.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No essential items in current list
            </div>
          )}
        </CardContent>
      </Card>

      {/* Final Gate Check */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plane className="h-5 w-5 text-blue-600" />
            Final Gate Check
          </CardTitle>
          <CardDescription>
            Last-minute travel essentials reminder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Flight in: {getTimeToFlight()}
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Last-minute checklist:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Checkbox className="h-4 w-4" />
                  <span>Phone fully charged</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox className="h-4 w-4" />
                  <span>Power bank charged</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox className="h-4 w-4" />
                  <span>Check weather forecast</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox className="h-4 w-4" />
                  <span>Confirm transportation</span>
                </div>
              </div>
            </div>

            <Button 
              className="w-full" 
              disabled={!isAllEssentialsPacked}
              variant={isAllEssentialsPacked ? "default" : "outline"}
            >
              {isAllEssentialsPacked ? "Ready to Go!" : "Pack Essentials First"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Always-Packed Kits */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Always-Packed Kits</CardTitle>
          <CardDescription>
            Pre-assembled kits for common items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" size="sm">
              🧴 Toiletries Kit
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              📱 Tech Kit
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              🧺 Laundry Kit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Unlock Confirmation Dialog */}
      <AlertDialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Unpack Essential Item?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You're about to unpack an essential item. Essential items are critical for your trip
              and forgetting them could cause significant problems. Are you sure you want to remove 
              this item from your packed list?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmUnlock}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Yes, Unpack Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unpin Confirmation Dialog */}
      <AlertDialog open={showUnpinDialog} onOpenChange={setShowUnpinDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <PinOff className="h-5 w-5 text-blue-500" />
              Unpin Item?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unpin this item? It will be removed from your pinned items 
              list and you'll need to manually pin it again if you want it back here.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmUnpin}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Yes, Unpin Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}