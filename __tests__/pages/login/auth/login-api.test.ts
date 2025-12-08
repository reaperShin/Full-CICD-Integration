import { describe, it, expect, beforeEach, jest, afterEach } from "@jest/globals"
import { POST } from "@/app/api/auth/login/route"
import { NextRequest } from "next/server"

jest.mock("@/lib/supabase/server", () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
    },
  })),
}))

describe("/api/auth/login - Success Cases", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("handles successful login with valid credentials", async () => {
    const { createServerClient } = await import("@/lib/supabase/server")
    const mockSupabase = (createServerClient as jest.MockedFunction<typeof createServerClient>)()

    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: {
        user: { id: "1", email: "test@example.com" },
        session: { access_token: "token_123" },
      },
      error: null,
    })

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user).toBeDefined()
    expect(data.user.email).toBe("test@example.com")
    expect(data.session?.access_token).toBe("token_123")
  })

  it("returns 200 with user data on successful login", async () => {
    const { createServerClient } = await import("@/lib/supabase/server")
    const mockSupabase = (createServerClient as jest.MockedFunction<typeof createServerClient>)()

    const mockUser = {
      id: "user-123",
      email: "john@example.com",
      user_metadata: { name: "John Doe" },
    }

    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: mockUser, session: { access_token: "jwt_token" } },
      error: null,
    })

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "john@example.com",
        password: "secure_password",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user.id).toBe("user-123")
    expect(data.user.email).toBe("john@example.com")
  })
})

describe("/api/auth/login - Error Cases", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("returns 400 for missing email", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        password: "password123",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Email and password are required")
  })

  it("returns 400 for missing password", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Email and password are required")
  })

  it("returns 401 for invalid credentials", async () => {
    const { createServerClient } = await import("@/lib/supabase/server")
    const mockSupabase = (createServerClient as jest.MockedFunction<typeof createServerClient>)()

    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials" },
    })

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "wrongpassword",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe("Invalid login credentials")
  })

  it("returns 500 for database error", async () => {
    const { createServerClient } = await import("@/lib/supabase/server")
    const mockSupabase = (createServerClient as jest.MockedFunction<typeof createServerClient>)()

    mockSupabase.auth.signInWithPassword.mockRejectedValueOnce(new Error("Database connection failed"))

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toContain("Database connection failed")
  })

  it("returns 400 for invalid email format", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "not-an-email",
        password: "password123",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toMatch(/invalid|email/i)
  })

  it("returns 400 for empty password", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
  })
})
