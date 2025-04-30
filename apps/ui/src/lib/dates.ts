import dayjs from "dayjs"
import cs from "dayjs/locale/cs"
import localizedFormat from "dayjs/plugin/localizedFormat"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"

export const DATE_FORMAT = "DD/MM/YY"
export const TIME_FORMAT = "H:mm"
export const DATE_TIME_FORMAT = "DD/MM/YY HH:mm"

export const setupDayJs = () => {
  dayjs.extend(utc)
  dayjs.extend(timezone)
  dayjs.extend(localizedFormat)
  dayjs.locale(cs)
  dayjs.tz.setDefault("Europe/Prague")
}

export function formatDateRange(
  startDate: string,
  endDate: string,
  format = DATE_FORMAT
) {
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  if (end.isSame(start, "day")) {
    return end.format(format)
  }
  if (end.isSame(start, "month")) {
    return `${start.format("DD")}–${end.format(format)}`
  }
  if (!end.isSame(start, "month") && end.isSame(start, "year")) {
    return `${start.format("DD/MM")}–${end.format(format)}`
  }
  if (!end.isSame(start, "year")) {
    return `${start.format(format)}–${end.format(format)}`
  }
  return undefined
}

export function formatDate(
  date: string | Date | undefined,
  format = DATE_FORMAT
): string {
  return dayjs(date).format(format)
}

export function getToday(format = DATE_FORMAT): string {
  return dayjs().format(format)
}

export function getDiffInDays(startDate: string, endDate: string): number {
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  return end.diff(start, "day")
}
