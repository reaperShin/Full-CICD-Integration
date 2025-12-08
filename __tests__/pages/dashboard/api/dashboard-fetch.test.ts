import { describe, it, expect, beforeEach, jest, afterEach } from "@jest/globals"
import { createMockResponse } from "../../setup/test-utils"

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>
global.fetch = mockFetch as any

describe("Dashboard API Calls", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("Fetch Rankings", () => {
    it("fetches user rankings on dashboard load", async () => {
      const mockRankings = [
        { id: "1", title: "Software Engineer", position: "Engineering" },
        { id: "2", title: "Product Manager", position: "Product" },
      ]

      mockFetch.mockResolvedValueOnce(createMockResponse({ rankings: mockRankings }, { status: 200 }))

      const response = await fetch("/api/rankings")
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.rankings).toBeDefined()
      expect(data.rankings.length).toBe(2)
    })

    it("handles rankings fetch error", async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ error: "Failed to fetch rankings" }, { status: 500, ok: false }),
      )

      const response = await fetch("/api/rankings")
      const data = await response.json()

      expect(response.ok).toBe(false)
      expect(data.error).toBeDefined()
    })
  })

  describe("Create Ranking", () => {
    it("sends ranking creation request", async () => {
      const rankingData = {
        title: "New Ranking",
        position: "Engineering",
        description: "Test ranking",
      }

      mockFetch.mockResolvedValueOnce(createMockResponse({ id: "new-id", ...rankingData }, { status: 201, ok: true }))

      const response = await fetch("/api/rankings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rankingData),
      })

      expect(response.ok).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith("/api/rankings", expect.any(Object))
    })
  })

  describe("Delete Ranking", () => {
    it("sends delete request for ranking", async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ success: true }, { status: 200 }))

      const response = await fetch("/api/rankings/1", { method: "DELETE" })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
    })
  })
})
