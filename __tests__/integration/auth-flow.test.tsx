/**
 * __tests__/auth.integration.test.tsx
 *
 * Simplified mocks (TypeScript-friendly) for integration tests.
 */

import { render, screen, waitFor } from "../setup/test-utils"
import userEvent from "@testing-library/user-event"
import Home from "@/app/page"
import { jest } from "@jest/globals"
import { waitForLoadingToFinish } from "../setup/test-utils"

/* -------------------------------------------------------------------------- */
/* 🎯 Console suppression (harmless jsdom/React warnings)                     */
/* -------------------------------------------------------------------------- */

beforeAll(() => {
  const originalError = console.error
  console.error = (...args: unknown[]) => {
    const maybeMsg = args[0]
    if (typeof maybeMsg === "string") {
      if (maybeMsg.includes("InvalidCharacterError")) return
      if (maybeMsg.includes("Attempted to synchronously unmount")) return
    }
    ;(originalError as any)(...args)
  }
})

/* -------------------------------------------------------------------------- */
/* 🧩 Simple mocks: localStorage (in-memory) + fetch (typed jest.fn)          */
/* -------------------------------------------------------------------------- */

// in-memory store
const _store: Record<string, string> = {}

// localStorage-like object with jest.fn wrappers
const localStorageMock = {
  getItem: jest.fn((key: string) =>
    Object.prototype.hasOwnProperty.call(_store, key) ? _store[key] : null
  ),
  setItem: jest.fn((key: string, value: string) => {
    _store[key] = String(value)
  }),
  removeItem: jest.fn((key: string) => {
    delete _store[key]
  }),
  clear: jest.fn(() => {
    for (const k of Object.keys(_store)) delete _store[k]
  }),
}

// attach to window
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
})

// ---- typed fetch mock ----
// explicitly type the mock so mockResolvedValueOnce accepts arbitrary resolved values
const mockFetch = jest.fn() as jest.MockedFunction<
  (input: RequestInfo, init?: RequestInit) => Promise<any>
>

// attach to global.fetch (cast to satisfy TS)
;(global as unknown as { fetch: typeof mockFetch }).fetch = mockFetch

/* -------------------------------------------------------------------------- */
/* 🧪 Tests                                                                    */
/* -------------------------------------------------------------------------- */

describe("Authentication Flow Integration (simple mocks)", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // clear in-memory store
    for (const k of Object.keys(_store)) delete _store[k]
    // ensure getItem returns null by default
    localStorageMock.getItem.mockImplementation((key: string) =>
      Object.prototype.hasOwnProperty.call(_store, key) ? _store[key] : null
    )
  })

  it("completes full login flow", async () => {
    const user = userEvent.setup()
    const mockUserData = { id: 1, email: "test@example.com", name: "Test User" }

    // initial auth check unauthorized, then login success
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 401 }) // initial auth check
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ user: mockUserData }),
      })

    render(<Home />)
    await waitForLoadingToFinish()

    expect(await screen.findByText(/welcome back/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/email address/i), "test@example.com")
    await user.type(
      screen.getByLabelText(/password/i, { selector: "input" }),
      "password123"
    )
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    // verify localStorage.setItem was called with the user object
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify(mockUserData)
      )
    })
  })

  it("persists user session on page reload", async () => {
    const mockUserData = { id: 1, email: "test@example.com", name: "Test User" }

    // simulate existing session in store
    localStorageMock.setItem("user", JSON.stringify(mockUserData))

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ user: mockUserData }),
    })

    render(<Home />)
    await waitForLoadingToFinish()

    expect(localStorageMock.getItem).toHaveBeenCalledWith("user")

    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })
  })

  it("handles logout correctly", async () => {
    const user = userEvent.setup()
    const mockUserData = { id: 1, email: "test@example.com", name: "Test User" }

    // seed session
    localStorageMock.setItem("user", JSON.stringify(mockUserData))

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ user: mockUserData }),
    })

    render(<Home />)
    await waitForLoadingToFinish()

    const logoutButton =
      screen.queryByRole("button", { name: /logout/i }) ||
      screen.queryByRole("button", { name: /sign out/i }) ||
      screen.queryByText(/logout/i) ||
      screen.queryByText(/sign out/i)

    expect(logoutButton).toBeTruthy()

    if (logoutButton) {
      await user.click(logoutButton)

      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith("user")
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
      })
    }
  })
})
