import { beforeAll, describe, expect, it } from "vitest"

import {
  DATE_FORMAT,
  formatDate,
  formatDateRange,
  getDiffInDays,
  setupDayJs,
} from "../dates"

beforeAll(() => {
  setupDayJs()
})

describe("dates utilities", () => {
  describe("formatDate", () => {
    it("formats a date string with default format", () => {
      const result = formatDate("2024-03-15")
      expect(result).toBe("15/03/24")
    })

    it("formats a date with custom format", () => {
      const result = formatDate("2024-03-15", "YYYY-MM-DD")
      expect(result).toBe("2024-03-15")
    })

    it("formats a Date object", () => {
      const result = formatDate(new Date("2024-03-15"))
      expect(result).toBe("15/03/24")
    })
  })

  describe("formatDateRange", () => {
    it("returns single date when start and end are same day", () => {
      const result = formatDateRange("2024-03-15", "2024-03-15")
      expect(result).toBe("15/03/24")
    })

    it("returns day range when same month", () => {
      const result = formatDateRange("2024-03-10", "2024-03-15")
      expect(result).toBe("10–15/03/24")
    })

    it("returns month range when same year but different months", () => {
      const result = formatDateRange("2024-02-10", "2024-03-15")
      expect(result).toBe("10/02–15/03/24")
    })

    it("returns full range when different years", () => {
      const result = formatDateRange("2023-12-25", "2024-01-05")
      expect(result).toBe("25/12/23–05/01/24")
    })
  })

  describe("getDiffInDays", () => {
    it("returns correct difference for positive days", () => {
      const result = getDiffInDays("2024-03-10", "2024-03-15")
      expect(result).toBe(5)
    })

    it("returns 0 for same day", () => {
      const result = getDiffInDays("2024-03-15", "2024-03-15")
      expect(result).toBe(0)
    })

    it("returns negative for reversed dates", () => {
      const result = getDiffInDays("2024-03-15", "2024-03-10")
      expect(result).toBe(-5)
    })
  })

  describe("DATE_FORMAT constant", () => {
    it("has expected format", () => {
      expect(DATE_FORMAT).toBe("DD/MM/YY")
    })
  })
})
