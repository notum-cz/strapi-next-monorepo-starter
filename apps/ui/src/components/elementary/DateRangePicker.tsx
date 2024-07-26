"use client"

import { useMemo } from "react"
import dayjs from "dayjs"
import { Calendar as CalendarIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { DateRange } from "react-day-picker"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { cn } from "@/lib/styles"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const DATE_FORMAT = "LLL dd, y"

type Props = React.HTMLAttributes<HTMLDivElement> & {
  readonly date: DateRange | undefined
  readonly setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>
}

export function DateRangePicker({ className, date, setDate }: Props) {
  removeThisWhenYouNeedMe("DateRangePicker")

  const t = useTranslations("comps.dateRangePicker")

  const selectedDate = useMemo(() => {
    if (date?.from != null) {
      if (date?.to != null) {
        return (
          <>
            {dayjs(date.from).format(DATE_FORMAT)}
            <span className="mx-1">-</span>
            {dayjs(date.to).format(DATE_FORMAT)}
          </>
        )
      }
      return dayjs(date.from).format(DATE_FORMAT)
    }
    return <span>{t("label")}</span>
  }, [date, t])

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[300px] justify-center font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 size-4" />
            {selectedDate}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            autoFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
