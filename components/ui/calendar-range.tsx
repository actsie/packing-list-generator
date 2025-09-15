"use client"

import * as React from "react"
import { Calendar } from "./calendar"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"

interface CalendarRangeProps {
  startDate?: Date
  endDate?: Date
  onStartDateChange?: (date: Date | undefined) => void
  onEndDateChange?: (date: Date | undefined) => void
  className?: string
  disabled?: (date: Date) => boolean
}

export function CalendarRange({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className,
  disabled,
}: CalendarRangeProps) {
  const [selectedRange, setSelectedRange] = React.useState<DateRange | undefined>(
    startDate && endDate ? { from: startDate, to: endDate } : undefined
  )
  const [isSelectingEndDate, setIsSelectingEndDate] = React.useState(false)

  React.useEffect(() => {
    if (startDate && endDate) {
      setSelectedRange({ from: startDate, to: endDate })
    }
  }, [startDate, endDate])

  const handleSelect = (range: DateRange | undefined) => {
    if (!range) {
      setSelectedRange(undefined)
      onStartDateChange?.(undefined)
      onEndDateChange?.(undefined)
      setIsSelectingEndDate(false)
      return
    }

    if (!isSelectingEndDate && range.from) {
      // First click - set start date
      onStartDateChange?.(range.from)
      onEndDateChange?.(undefined)
      setSelectedRange({ from: range.from, to: undefined })
      setIsSelectingEndDate(true)
    } else if (isSelectingEndDate && range.to) {
      // Second click - set end date
      if (range.from && range.to && range.to < range.from) {
        // Swap dates if end is before start
        onStartDateChange?.(range.to)
        onEndDateChange?.(range.from)
        setSelectedRange({ from: range.to, to: range.from })
      } else {
        onEndDateChange?.(range.to)
        setSelectedRange(range)
      }
      setIsSelectingEndDate(false)
    } else if (range.from && !range.to) {
      // Clicking on a new date while selecting end date
      setSelectedRange({ from: range.from, to: undefined })
      onStartDateChange?.(range.from)
      onEndDateChange?.(undefined)
      setIsSelectingEndDate(true)
    }
  }

  return (
    <div className={cn("relative", className)}>
      <Calendar
        mode="range"
        selected={selectedRange}
        onSelect={handleSelect}
        disabled={disabled}
        numberOfMonths={1}
        defaultMonth={startDate || new Date()}
      />
      {isSelectingEndDate && (
        <div className="text-sm text-muted-foreground text-center mt-2">
          Select end date
        </div>
      )}
    </div>
  )
}