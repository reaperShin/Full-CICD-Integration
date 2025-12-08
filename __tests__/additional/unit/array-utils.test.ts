import { describe, it, expect } from "@jest/globals"

describe("Array Utils", () => {
  const unique = <T,>(arr: T[]): T[] => [...new Set(arr)]
  const flatten = <T,>(arr: (T | T[])[]): T[] => arr.reduce((acc, val) => acc.concat(val), [] as T[])
  const chunk = <T,>(arr: T[], size: number): T[][] => {
    const chunks: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size))
    }
    return chunks
  }

  describe("unique", () => {
    it("removes duplicates", () => {
      expect(unique([1, 2, 2, 3])).toEqual([1, 2, 3])
    })

    it("handles empty array", () => {
      expect(unique([])).toEqual([])
    })
  })

  describe("flatten", () => {
    it("flattens nested arrays", () => {
      expect(flatten([1, [2, 3], 4])).toEqual([1, 2, 3, 4])
    })

    it("handles empty arrays", () => {
      expect(flatten([])).toEqual([])
    })
  })

  describe("chunk", () => {
    it("chunks array", () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    })

    it("handles chunk size larger than array", () => {
      expect(chunk([1, 2], 5)).toEqual([[1, 2]])
    })
  })
})
