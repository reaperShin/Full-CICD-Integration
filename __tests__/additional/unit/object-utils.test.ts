import { describe, it, expect } from "@jest/globals"

describe("Object Utils", () => {
  const isEmpty = (obj: Record<string, unknown>): boolean => Object.keys(obj).length === 0
  const merge = (obj1: Record<string, unknown>, obj2: Record<string, unknown>): Record<string, unknown> => ({
    ...obj1,
    ...obj2,
  })
  const pick = (obj: Record<string, unknown>, keys: string[]): Record<string, unknown> => {
    const result: Record<string, unknown> = {}
    keys.forEach((key) => {
      if (key in obj) result[key] = obj[key]
    })
    return result
  }

  describe("isEmpty", () => {
    it("detects empty objects", () => {
      expect(isEmpty({})).toBe(true)
    })

    it("detects non-empty objects", () => {
      expect(isEmpty({ a: 1 })).toBe(false)
    })
  })

  describe("merge", () => {
    it("merges two objects", () => {
      const result = merge({ a: 1 }, { b: 2 })
      expect(result).toEqual({ a: 1, b: 2 })
    })

    it("overwrites properties", () => {
      const result = merge({ a: 1 }, { a: 2 })
      expect(result.a).toBe(2)
    })
  })

  describe("pick", () => {
    it("picks selected keys", () => {
      const result = pick({ a: 1, b: 2, c: 3 }, ["a", "c"])
      expect(result).toEqual({ a: 1, c: 3 })
    })

    it("handles missing keys", () => {
      const result = pick({ a: 1 }, ["b"])
      expect(result).toEqual({})
    })
  })
})
