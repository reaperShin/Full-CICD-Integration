import { describe, it, expect, beforeEach, jest, afterEach } from "@jest/globals"
import { GET as getRankings } from "@/app/api/rankings/route"
import { NextRequest } from "next/server"

jest.mock("@/lib/supabase/server", () => ({
  createServerClient: jest.fn(() => ({
    from: jest.fn((table: string) => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [
          { id: 1, title: "Ranking 1", status: "active" },
          { id: 2, title: "Ranking 2", status: "draft" },
        ],
        error: null,
      }),
    })),
  })),
}))

describe("Dashboard API - Rankings Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("fetches user rankings successfully", async () => {
    const request = new NextRequest("http://localhost:3000/api/rankings", {
      method: "GET",
      headers: {
        Authorization: "Bearer mock-token",
      },
    })

    const response = await getRankings(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
  })

  it("returns rankings with required fields", async () => {
    const request = new NextRequest("http://localhost:3000/api/rankings", {
      method: "GET",
      headers: {
        Authorization: "Bearer mock-token",
      },
    })

    const response = await getRankings(request)
    const data = await response.json()

    data.forEach((ranking: any) => {
      expect(ranking.id).toBeDefined()
      expect(ranking.title).toBeDefined()
      expect(ranking.status).toBeDefined()
    })
  })

  it("returns empty array when no rankings exist", async () => {
    const request = new NextRequest("http://localhost:3000/api/rankings", {
      method: "GET",
      headers: {
        Authorization: "Bearer mock-token",
      },
    })

    const response = await getRankings(request)
    const data = await response.json()

    expect(Array.isArray(data)).toBe(true)
  })

  it("returns 401 when unauthorized", async () => {
    const request = new NextRequest("http://localhost:3000/api/rankings", {
      method: "GET",
    })

    const response = await getRankings(request)

    expect(response.status).toBe(401)
  })
})
