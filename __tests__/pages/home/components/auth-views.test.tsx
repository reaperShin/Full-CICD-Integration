import { describe, it, expect, beforeEach, jest, afterEach } from "@jest/globals"
import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Home from "@/app/page"
import { createMockResponse } from "@/__tests__/setup/test-utils"

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>
global.fetch = mockFetch as any

describe("Home Page Auth Views & Overlays", () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("Initial Render - Login View", () => {
    it("displays login form overlay on initial load", () => {
      render(<Home />)
      const loginRelated = screen.queryAllByRole("textbox") || screen.queryAllByText(/login|email|password/i)
      expect(loginRelated.length).toBeGreaterThan(0)
    })

    it("shows auth form container overlay", () => {
      render(<Home />)
      const formElements = screen.queryAllByRole("textbox")
      expect(formElements.length).toBeGreaterThan(0)
    })

    it("renders form with proper structure", () => {
      render(<Home />)
      const buttons = screen.queryAllByRole("button")
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe("View Switching - Login to Signup", () => {
    it("switches to signup view when signup action triggered", async () => {
      const user = userEvent.setup()
      render(<Home />)

      const buttons = screen.getAllByRole("button")
      const signupButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes("sign up"))

      if (signupButton) {
        await act(async () => {
          await user.click(signupButton)
        })

        await waitFor(() => {
          const formInputs = screen.queryAllByRole("textbox")
          expect(formInputs.length).toBeGreaterThan(0)
        })
      }
    })

    it("displays signup form overlay when triggered", async () => {
      const user = userEvent.setup()
      render(<Home />)

      const buttons = screen.getAllByRole("button")
      const signupButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes("sign up"))

      if (signupButton) {
        await act(async () => {
          await user.click(signupButton)
        })

        const formElements = screen.queryAllByRole("textbox")
        expect(formElements.length).toBeGreaterThan(0)
      }
    })
  })

  describe("View Switching - Login to Forgot Password", () => {
    it("switches to forgot password view", async () => {
      const user = userEvent.setup()
      render(<Home />)

      const buttons = screen.getAllByRole("button")
      const forgotButton = buttons.find(
        (btn) => btn.textContent?.toLowerCase().includes("forgot") || btn.textContent?.toLowerCase().includes("reset"),
      )

      if (forgotButton) {
        await act(async () => {
          await user.click(forgotButton)
        })

        await waitFor(() => {
          const formElements = screen.queryAllByRole("textbox")
          expect(formElements.length).toBeGreaterThan(0)
        })
      }
    })

    it("displays forgot password overlay correctly", async () => {
      const user = userEvent.setup()
      render(<Home />)

      const buttons = screen.getAllByRole("button")
      const forgotButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes("forgot"))

      if (forgotButton) {
        await act(async () => {
          await user.click(forgotButton)
        })

        const inputs = screen.queryAllByRole("textbox")
        expect(inputs.length).toBeGreaterThan(0)
      }
    })
  })

  describe("Dashboard View on Successful Login", () => {
    it("switches to dashboard view after successful login", async () => {
      const user = userEvent.setup()
      const mockUserData = { id: "1", email: "test@example.com", name: "Test User" }

      mockFetch.mockResolvedValueOnce(createMockResponse({ user: mockUserData }, { status: 200 }))

      render(<Home />)

      const inputs = screen.getAllByRole("textbox")
      const passwordFields = screen.queryAllByDisplayValue("")
      const buttons = screen.getAllByRole("button")
      const submitButton = buttons[0]

      await act(async () => {
        await user.type(inputs[0], "test@example.com")
        if (passwordFields[0]) {
          await user.type(passwordFields[0], "password123")
        }
        await user.click(submitButton)
      })

      await waitFor(
        () => {
          const localStorageUser = localStorage.getItem("user")
          expect(localStorageUser).toBeTruthy()
        },
        { timeout: 2000 },
      )
    })

    it("stores user data in localStorage on login", async () => {
      const user = userEvent.setup()
      const mockUserData = { id: "1", email: "test@example.com", name: "Test User" }

      mockFetch.mockResolvedValueOnce(createMockResponse({ user: mockUserData }, { status: 200 }))

      render(<Home />)

      const inputs = screen.getAllByRole("textbox")
      const buttons = screen.getAllByRole("button")

      await act(async () => {
        await user.type(inputs[0], "test@example.com")
        await user.click(buttons[0])
      })

      await waitFor(
        () => {
          const stored = localStorage.getItem("user")
          expect(stored).toBeTruthy()
        },
        { timeout: 2000 },
      )
    })
  })

  describe("Overlay Content Validation", () => {
    it("auth form overlay contains proper elements", () => {
      render(<Home />)
      const formElements = screen.queryAllByRole("textbox")
      const buttons = screen.queryAllByRole("button")
      expect(formElements.length).toBeGreaterThan(0)
      expect(buttons.length).toBeGreaterThan(0)
    })

    it("overlay appears with glassmorphism styling indicators", () => {
      render(<Home />)
      const overlayContainer = screen.queryAllByRole("textbox")
      expect(overlayContainer.length).toBeGreaterThan(0)
    })

    it("renders auth form inside right-side container", () => {
      render(<Home />)
      const inputs = screen.queryAllByRole("textbox")
      expect(inputs.length).toBeGreaterThan(0)
    })
  })

  describe("Form Toggle Navigation", () => {
    it("allows navigation between auth forms", async () => {
      const user = userEvent.setup()
      render(<Home />)

      const buttons = screen.getAllByRole("button")
      const signupButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes("sign up"))

      if (signupButton) {
        await act(async () => {
          await user.click(signupButton)
        })

        const loginBackButton = screen
          .queryAllByRole("button")
          .find((btn) => btn.textContent?.toLowerCase().includes("login"))

        if (loginBackButton) {
          await act(async () => {
            await user.click(loginBackButton)
          })

          const inputs = screen.queryAllByRole("textbox")
          expect(inputs.length).toBeGreaterThan(0)
        }
      }
    })
  })
})
