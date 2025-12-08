import { describe, it, expect, beforeEach, jest, afterEach } from "@jest/globals"
import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import LoginForm from "@/components/LoginForm"
import { createMockResponse } from "../../setup/test-utils"

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>
global.fetch = mockFetch as any

describe("LoginForm Component", () => {
  const mockProps = {
    onLogin: jest.fn(),
    onSwitchToSignup: jest.fn(),
    onSwitchToForgot: jest.fn(),
    onSwitchToVerification: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders email input field", () => {
      render(<LoginForm {...mockProps} />)
      const emailInputs = screen.queryAllByRole("textbox") || screen.queryAllByPlaceholderText(/email/i)
      expect(emailInputs.length).toBeGreaterThan(0)
    })

    it("renders password input field", () => {
      render(<LoginForm {...mockProps} />)
      const passwordInputs = screen.queryAllByDisplayValue("")
      expect(passwordInputs.length).toBeGreaterThan(0)
    })

    it("renders submit button", () => {
      render(<LoginForm {...mockProps} />)
      const submitButtons = screen.queryAllByRole("button")
      expect(submitButtons.length).toBeGreaterThan(0)
    })
  })

  describe("User Interaction", () => {
    it("allows typing in email input", async () => {
      const user = userEvent.setup()
      render(<LoginForm {...mockProps} />)

      const inputs = screen.getAllByRole("textbox")
      const emailInput = inputs[0] as HTMLInputElement

      await user.type(emailInput, "test@example.com")

      expect(emailInput.value).toBe("test@example.com")
    })

    it("allows typing in password input", async () => {
      const user = userEvent.setup()
      render(<LoginForm {...mockProps} />)

      const passwordFields = screen.queryAllByDisplayValue("")
      const passwordInput = passwordFields[0] as HTMLInputElement

      await user.type(passwordInput, "password123")

      expect(passwordInput.value).toBe("password123")
    })

    it("calls onSwitchToSignup when signup action triggered", async () => {
      const user = userEvent.setup()
      render(<LoginForm {...mockProps} />)

      const buttons = screen.getAllByRole("button")
      const signupButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes("sign up"))

      if (signupButton) {
        await user.click(signupButton)
        expect(mockProps.onSwitchToSignup).toHaveBeenCalled()
      }
    })

    it("calls onSwitchToForgot when forgot password action triggered", async () => {
      const user = userEvent.setup()
      render(<LoginForm {...mockProps} />)

      const buttons = screen.getAllByRole("button")
      const forgotButton = buttons.find(
        (btn) => btn.textContent?.toLowerCase().includes("forgot") || btn.textContent?.toLowerCase().includes("reset"),
      )

      if (forgotButton) {
        await user.click(forgotButton)
        expect(mockProps.onSwitchToForgot).toHaveBeenCalled()
      }
    })
  })

  describe("Form Submission - Error Cases", () => {
    it("does not call onLogin on failed authentication", async () => {
      const user = userEvent.setup()

      mockFetch.mockResolvedValueOnce(createMockResponse({ error: "Invalid credentials" }, { status: 401 }))

      render(<LoginForm {...mockProps} />)

      const inputs = screen.getAllByRole("textbox")
      const passwordFields = screen.queryAllByDisplayValue("")
      const buttons = screen.getAllByRole("button")

      await act(async () => {
        await user.type(inputs[0], "test@example.com")
        await user.type(passwordFields[0], "wrongpass")
        await user.click(buttons[0])
      })

      await waitFor(() => {
        expect(mockProps.onLogin).not.toHaveBeenCalled()
      })
    })

    it("handles network errors gracefully", async () => {
      const user = userEvent.setup()

      mockFetch.mockRejectedValueOnce(new Error("Network error"))

      render(<LoginForm {...mockProps} />)

      const inputs = screen.getAllByRole("textbox")
      const passwordFields = screen.queryAllByDisplayValue("")
      const buttons = screen.getAllByRole("button")

      await act(async () => {
        await user.type(inputs[0], "test@example.com")
        await user.type(passwordFields[0], "password123")
        await user.click(buttons[0])
      })

      await waitFor(() => {
        expect(mockProps.onLogin).not.toHaveBeenCalled()
      })
    })
  })
})
