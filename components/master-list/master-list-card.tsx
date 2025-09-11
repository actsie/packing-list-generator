'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MasterList } from '@/lib/types'
import { MoreHorizontal, Edit, Trash2, Copy, Package } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface MasterListCardProps {
  list: MasterList
  isSelected?: boolean
  onSelect?: (list: MasterList) => void
  onEdit?: (list: MasterList) => void
  onDelete?: (listId: string) => void
  onDuplicate?: (list: MasterList) => void
}

export function MasterListCard({ 
  list, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete, 
  onDuplicate 
}: MasterListCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [showActionsMenu, setShowActionsMenu] = React.useState(false)

  const essentialItems = list.items.filter(item => item.essential).length
  const totalItems = list.items.length

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onSelect?.(list)
  }

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation()
    action()
    setShowActionsMenu(false)
  }

  const handleDeleteConfirm = () => {
    onDelete?.(list.id)
    setShowDeleteDialog(false)
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
              <Package className="h-5 w-5 text-primary" />
              {list.name}
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {list.description}
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
                  onClick={(e) => handleActionClick(e, () => onEdit?.(list))}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center gap-2"
                  onClick={(e) => handleActionClick(e, () => onDuplicate?.(list))}
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </button>
                {!list.isTemplate && (
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
            <span className="bg-secondary px-2 py-1 rounded text-xs font-medium">
              {list.category}
            </span>
            {list.isTemplate && (
              <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                Template
              </span>
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

          <div className="pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={handleCardClick}
            >
              {isSelected ? 'Selected' : 'Select List'}
            </Button>
          </div>
        </div>
      </CardContent>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Master List</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{list.name}"? This action cannot be undone.
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