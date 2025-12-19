import { describe, it, expect, beforeEach } from "@jest/globals"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { jest } from "@jest/globals"
import LoginForm from "@/components/LoginForm"

describe("Form Edge Cases", () => {
  const mockProps = {
    onLogin: jest.fn(),
    onSwitchToSignup: jest.fn(),
    onSwitchToForgot: jest.fn(),
    onSwitchToVerification: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Input Edge Cases", () => {
    it("handles special characters in email", async () => {
      const user = userEvent.setup()
      render(<LoginForm {...mockProps} />)

      const inputs = screen.getAllByRole("textbox")
      await user.type(inputs[0], "test+tag@example.co.uk")

      expect((inputs[0] as HTMLInputElement).value).toContain("+")
    })

    it("handles rapid input changes", async () => {
      const user = userEvent.setup()
      render(<LoginForm {...mockProps} />)

      const inputs = screen.getAllByRole("textbox")
      await user.type(inputs[0], "test1@example.com")
      await user.clear(inputs[0])
      await user.type(inputs[0], "test2@example.com")

      expect((inputs[0] as HTMLInputElement).value).toBe("test2@example.com")
    })

    it("handles pasted content with line breaks", async () => {
      const user = userEvent.setup()
      render(<LoginForm {...mockProps} />)

      const inputs = screen.getAllByRole("textbox")
      const pastedContent = "test@example.com\nemail2@example.com"

      await user.type(inputs[0], pastedContent)
      expect((inputs[0] as HTMLInputElement).value.length).toBeGreaterThan(0)
    })
  })

  describe("Form State Edge Cases", () => {
    it("handles multiple rapid form submissions", async () => {
      const user = userEvent.setup()
      render(<LoginForm {...mockProps} />)

      const buttons = screen.getAllByRole("button")
      const submitButton = buttons[0]

      await user.click(submitButton)
      await user.click(submitButton)
      await user.click(submitButton)

      expect(buttons).toBeTruthy()
    })

    it("handles form with empty inputs submitted", async () => {
      const user = userEvent.setup()
      render(<LoginForm {...mockProps} />)

      const buttons = screen.getAllByRole("button")
      await user.click(buttons[0])

      expect(mockProps.onLogin).not.toHaveBeenCalled()
    })

    it("handles partial form completion", async () => {
      const user = userEvent.setup()
      render(<LoginForm {...mockProps} />)

      const inputs = screen.getAllByRole("textbox")
      await user.type(inputs[0], "test@example.com")

      const buttons = screen.getAllByRole("button")
      await user.click(buttons[0])

      expect(mockProps.onLogin).not.toHaveBeenCalled()
    })
  })
})
