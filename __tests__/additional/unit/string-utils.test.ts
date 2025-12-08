import { describe, it, expect } from "@jest/globals"

// String utility tests
describe("String Utils", () => {
  const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1)
  const truncate = (str: string, length: number): string => (str.length > length ? str.slice(0, length) + "..." : str)
  const isEmpty = (str: string): boolean => str.trim().length === 0

  describe("capitalize", () => {
    it("capitalizes first letter", () => {
      expect(capitalize("hello")).toBe("Hello")
    })

    it("handles empty string", () => {
      expect(capitalize("")).toBe("")
    })

    it("handles single character", () => {
      expect(capitalize("a")).toBe("A")
    })
  })

  describe("truncate", () => {
    it("truncates long strings", () => {
      expect(truncate("hello world", 5)).toBe("hello...")
    })

    it("keeps short strings", () => {
      expect(truncate("hi", 5)).toBe("hi")
    })

    it("handles exact length", () => {
      expect(truncate("hello", 5)).toBe("hello")
    })
  })

  describe("isEmpty", () => {
    it("detects empty strings", () => {
      expect(isEmpty("")).toBe(true)
    })

    it("detects whitespace strings", () => {
      expect(isEmpty("   ")).toBe(true)
    })

    it("detects non-empty strings", () => {
      expect(isEmpty("hello")).toBe(false)
    })
  })
})
