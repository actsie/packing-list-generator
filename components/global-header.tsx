'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'

export function GlobalHeader() {
  const router = useRouter()
  const pathname = usePathname()
  
  // Don't show on history page itself
  if (pathname === '/history') return null

  return (
    <div className="fixed top-20 right-4 z-50">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/history')}
        className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border shadow-sm hover:bg-background/90"
      >
        <Clock className="h-4 w-4" />
        <span className="hidden sm:inline">History</span>
      </Button>
    </div>
  )
}