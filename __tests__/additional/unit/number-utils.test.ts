import { describe, it, expect } from "@jest/globals"

describe("Number Utils", () => {
  const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max)
  const round = (value: number, decimals: number): number =>
    Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
  const isInRange = (value: number, min: number, max: number): boolean => value >= min && value <= max

  describe("clamp", () => {
    it("clamps to min", () => {
      expect(clamp(0, 10, 20)).toBe(10)
    })

    it("clamps to max", () => {
      expect(clamp(25, 10, 20)).toBe(20)
    })

    it("keeps value in range", () => {
      expect(clamp(15, 10, 20)).toBe(15)
    })
  })

  describe("round", () => {
    it("rounds to decimals", () => {
      expect(round(1.2345, 2)).toBe(1.23)
    })

    it("handles zero decimals", () => {
      expect(round(1.5, 0)).toBe(2)
    })
  })

  describe("isInRange", () => {
    it("detects in range", () => {
      expect(isInRange(15, 10, 20)).toBe(true)
    })

    it("detects out of range", () => {
      expect(isInRange(25, 10, 20)).toBe(false)
    })
  })
})
