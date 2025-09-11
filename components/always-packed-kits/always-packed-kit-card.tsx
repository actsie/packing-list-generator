'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlwaysPackedKit } from '@/lib/types'
import { MoreHorizontal, Edit, Trash2, Copy, Package, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface AlwaysPackedKitCardProps {
  kit: AlwaysPackedKit
  isSelected?: boolean
  onSelect?: (kit: AlwaysPackedKit) => void
  onAddToPackingList?: (kit: AlwaysPackedKit) => void
  onEdit?: (kit: AlwaysPackedKit) => void
  onDelete?: (kitId: string) => void
  onDuplicate?: (kit: AlwaysPackedKit) => void
}

export function AlwaysPackedKitCard({ 
  kit, 
  isSelected, 
  onSelect,
  onAddToPackingList,
  onEdit, 
  onDelete, 
  onDuplicate 
}: AlwaysPackedKitCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [showActionsMenu, setShowActionsMenu] = React.useState(false)

  const essentialItems = kit.items.filter(item => item.essential).length
  const totalItems = kit.items.length

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onSelect?.(kit)
  }

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation()
    action()
    setShowActionsMenu(false)
  }

  const handleDeleteConfirm = () => {
    onDelete?.(kit.id)
    setShowDeleteDialog(false)
  }

  const handleAddToPackingList = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAddToPackingList?.(kit)
  }

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary shadow-md' : ''
      }`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-xl">{kit.icon}</span>
              {kit.name}
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {kit.description}
            </CardDescription>
          </div>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setShowActionsMenu(!showActionsMenu)
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            
            {showActionsMenu && (
              <div className="absolute right-0 top-8 z-10 bg-background border rounded-md shadow-md py-1 min-w-[120px]">
                <button
                  className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center gap-2"
                  onClick={(e) => handleActionClick(e, () => onEdit?.(kit))}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center gap-2"
                  onClick={(e) => handleActionClick(e, () => onDuplicate?.(kit))}
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </button>
                {!kit.isDefault && (
                  <button
                    className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center gap-2 text-destructive"
                    onClick={(e) => handleActionClick(e, () => setShowDeleteDialog(true))}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <Badge variant="secondary" className="text-xs">
              {kit.category}
            </Badge>
            {kit.isDefault && (
              <Badge variant="outline" className="text-xs">
                Default Kit
              </Badge>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Items</span>
              <span className="font-medium">{totalItems}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Essential Items</span>
              <span className="font-medium text-orange-600">{essentialItems}</span>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <Button 
              variant="default" 
              size="sm" 
              className="w-full"
              onClick={handleAddToPackingList}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Packing List
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={handleCardClick}
            >
              <Package className="h-4 w-4 mr-2" />
              {isSelected ? 'Selected' : 'View Details'}
            </Button>
          </div>
        </div>
      </CardContent>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Always-Packed Kit</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{kit.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}