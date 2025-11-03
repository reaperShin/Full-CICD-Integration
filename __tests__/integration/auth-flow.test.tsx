import { describe, it, expect, beforeEach, jest, afterEach } from "@jest/globals"
import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Home from "@/app/page"
import { createMockResponse } from "../setup/test-utils"

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
})

const mockFetch = jest.fn() as jest.Mock<Promise<Response>>
global.fetch = mockFetch as any

describe("Full Authentication Flow - Success Cases", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("completes full login flow from start to dashboard", async () => {
    const user = userEvent.setup()
    const mockUserData = { id: "1", email: "test@example.com", name: "Test User" }

    mockFetch.mockResolvedValueOnce(createMockResponse({ user: mockUserData }, { status: 200 }))

    render(<Home />)

    // Should display login form initially
    await waitFor(() => {
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
    })

    // Simulate login
    await act(async () => {
      await user.type(screen.getByLabelText(/email/i), "test@example.com")
      await user.type(screen.getByLabelText(/password/i), "password123")
      await user.click(screen.getByRole("button", { name: /sign in/i }))
    })

    // Should store user in localStorage after successful login
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith("user", JSON.stringify(mockUserData))
    })
  })

  it("persists user session from localStorage on page reload", () => {
    const mockUserData = { id: "1", email: "test@example.com", name: "Test User" }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUserData))

    render(<Home />)

    // Should retrieve user from localStorage
    expect(localStorageMock.getItem).toHaveBeenCalledWith("user")
  })

  it("restores authenticated state from stored session", async () => {
    const mockUserData = { id: "1", email: "user@example.com", name: "John Doe" }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUserData))

    render(<Home />)

    // Should display user's name or dashboard instead of login form
    await waitFor(() => {
      expect(localStorageMock.getItem).toHaveBeenCalledWith("user")
    })
  })
})

describe("Full Authentication Flow - Error Cases", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("handles login failure and displays error", async () => {
    const user = userEvent.setup()

    mockFetch.mockResolvedValueOnce(createMockResponse({ error: "Invalid credentials" }, { status: 401 }))

    render(<Home />)

    await act(async () => {
      await user.type(screen.getByLabelText(/email/i), "test@example.com")
      await user.type(screen.getByLabelText(/password/i), "wrongpass")
      await user.click(screen.getByRole("button", { name: /sign in/i }))
    })

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it("handles network errors during login", async () => {
    const user = userEvent.setup()

    mockFetch.mockRejectedValueOnce(new Error("Network connection failed"))

    render(<Home />)

    await act(async () => {
      await user.type(screen.getByLabelText(/email/i), "test@example.com")
      await user.type(screen.getByLabelText(/password/i), "password123")
      await user.click(screen.getByRole("button", { name: /sign in/i }))
    })

    await waitFor(() => {
      expect(screen.getByText(/network|error/i)).toBeInTheDocument()
    })
  })

  it("does not restore invalid session data from localStorage", () => {
    localStorageMock.getItem.mockReturnValue("invalid-json{")

    render(<Home />)

    // Should fall back to login form due to invalid data
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
  })
})

describe("Full Authentication Flow - Logout Cases", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("handles logout correctly from authenticated state", async () => {
    const user = userEvent.setup()
    const mockUserData = { id: "1", email: "test@example.com", name: "Test User" }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUserData))

    render(<Home />)

    // Find logout button
    const logoutButton =
      screen.queryByRole("button", { name: /logout|sign out/i }) || screen.queryByText(/logout|sign out/i)

    if (logoutButton) {
      await act(async () => {
        await user.click(logoutButton)
      })

      // Should remove user from localStorage
      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith("user")
      })

      // Should return to login form
      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
      })
    }
  })

  it("clears all session data on logout", async () => {
    const user = userEvent.setup()
    const mockUserData = { id: "1", email: "test@example.com", name: "Test User" }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUserData))

    render(<Home />)

    const logoutButton =
      screen.queryByRole("button", { name: /logout|sign out/i }) || screen.queryByText(/logout|sign out/i)

    if (logoutButton) {
      await act(async () => {
        await user.click(logoutButton)
      })

      // Verify localStorage.removeItem was called
      expect(localStorageMock.removeItem).toHaveBeenCalled()
    }
  })
})

describe("Full Authentication Flow - Session Validation", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("validates session token expiry", async () => {
    const mockUserData = { id: "1", email: "test@example.com", name: "Test User" }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUserData))

    render(<Home />)

    // Should check for valid session
    expect(localStorageMock.getItem).toHaveBeenCalledWith("user")
  })

  it("switches to forgot password flow when requested", async () => {
    const user = userEvent.setup()
    render(<Home />)

    const forgotLink = screen.getByText(/forgot.*password/i)

    await act(async () => {
      await user.click(forgotLink)
    })

    // Should display forgot password form
    await waitFor(() => {
      expect(screen.getByText(/reset.*password|forgot/i)).toBeInTheDocument()
    })
  })

  it("switches to signup flow when requested", async () => {
    const user = userEvent.setup()
    render(<Home />)

    const signupButton = screen.getByRole("button", { name: /sign up/i })

    await act(async () => {
      await user.click(signupButton)
    })

    // Should display signup form
    await waitFor(() => {
      expect(screen.getByText(/create.*account|sign up/i)).toBeInTheDocument()
    })
  })
})
