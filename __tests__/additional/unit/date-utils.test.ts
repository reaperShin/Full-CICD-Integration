import { describe, it, expect } from "@jest/globals"

describe("Date Utils", () => {
  const formatDate = (date: Date): string => date.toISOString().split("T")[0]
  const getDaysDiff = (date1: Date, date2: Date): number =>
    Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24))
  const isToday = (date: Date): boolean => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  describe("formatDate", () => {
    it("formats date to ISO string", () => {
      const date = new Date("2024-01-15")
      expect(formatDate(date)).toContain("2024")
    })

    it("handles current date", () => {
      const today = new Date()
      const formatted = formatDate(today)
      expect(formatted).toMatch(/\d{4}-\d{2}-\d{2}/)
    })
  })

  describe("getDaysDiff", () => {
    it("calculates days difference", () => {
      const date1 = new Date("2024-01-01")
      const date2 = new Date("2024-01-11")
      expect(getDaysDiff(date1, date2)).toBe(10)
    })

    it("handles same day", () => {
      const date = new Date("2024-01-01")
      expect(getDaysDiff(date, date)).toBe(0)
    })
  })

  describe("isToday", () => {
    it("detects today's date", () => {
      expect(isToday(new Date())).toBe(true)
    })

    it("rejects past dates", () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(isToday(yesterday)).toBe(false)
    })
  })
})
