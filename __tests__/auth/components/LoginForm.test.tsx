import { describe, it, expect, beforeEach, jest, afterEach } from "@jest/globals"
import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import LoginForm from "@/components/LoginForm"
import { createMockResponse } from "@/__tests__/setup/test-utils"

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>
global.fetch = mockFetch as any

describe("LoginForm - Rendering", () => {
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

  it("renders login form with all elements", () => {
    render(<LoginForm {...mockProps} />)

    expect(screen.getByText(/welcome back/i)).toBeTruthy()
    expect(screen.getByText(/sign in to continue/i)).toBeTruthy()
    expect(screen.getByLabelText(/email/i)).toBeTruthy()
    expect(screen.getByLabelText(/password/i)).toBeTruthy()
    expect(screen.getByRole("button", { name: /sign in/i })).toBeTruthy()
  })

  it("renders forgot password link", () => {
    render(<LoginForm {...mockProps} />)
    expect(screen.getByText(/forgot.*password/i)).toBeTruthy()
  })

  it("renders signup redirect button", () => {
    render(<LoginForm {...mockProps} />)
    expect(screen.getByRole("button", { name: /sign up/i })).toBeTruthy()
  })
})

describe("LoginForm - User Interaction", () => {
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

  it("updates email input correctly", async () => {
    const user = userEvent.setup()
    render(<LoginForm {...mockProps} />)

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement

    await user.type(emailInput, "test@example.com")

    expect(emailInput.value).toBe("test@example.com")
  })

  it("updates password input correctly", async () => {
    const user = userEvent.setup()
    render(<LoginForm {...mockProps} />)

    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement

    await user.type(passwordInput, "password123")

    expect(passwordInput.value).toBe("password123")
  })

  it("toggles password visibility on button click", async () => {
    const user = userEvent.setup()
    render(<LoginForm {...mockProps} />)

    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
    const toggleButton = screen.getByRole("button", { name: /show password/i })

    expect(passwordInput.type).toBe("password")

    await user.click(toggleButton)

    expect(passwordInput.type).toBe("text")

    await user.click(toggleButton)

    expect(passwordInput.type).toBe("password")
  })

  it("calls onSwitchToForgot when forgot password link clicked", async () => {
    const user = userEvent.setup()
    render(<LoginForm {...mockProps} />)

    const forgotLink = screen.getByText(/forgot.*password/i)

    await user.click(forgotLink)

    expect(mockProps.onSwitchToForgot).toHaveBeenCalledTimes(1)
  })

  it("calls onSwitchToSignup when signup button clicked", async () => {
    const user = userEvent.setup()
    render(<LoginForm {...mockProps} />)

    const signupButton = screen.getByRole("button", { name: /sign up/i })

    await user.click(signupButton)

    expect(mockProps.onSwitchToSignup).toHaveBeenCalledTimes(1)
  })
})

describe("LoginForm - Form Submission Success", () => {
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

  it("submits form with valid credentials and calls onLogin", async () => {
    const user = userEvent.setup()
    const mockUserData = { id: "1", email: "test@example.com", name: "Test User" }

    mockFetch.mockResolvedValueOnce(createMockResponse({ user: mockUserData }, { status: 200 }))

    render(<LoginForm {...mockProps} />)

    await act(async () => {
      await user.type(screen.getByLabelText(/email/i), "test@example.com")
      await user.type(screen.getByLabelText(/password/i), "password123")
      await user.click(screen.getByRole("button", { name: /sign in/i }))
    })

    await waitFor(() => {
      expect(mockProps.onLogin).toHaveBeenCalledWith(mockUserData)
    })
  })

  it("sends correct API request with email and password", async () => {
    const user = userEvent.setup()

    mockFetch.mockResolvedValueOnce(createMockResponse({ user: { id: "1" } }, { status: 200 }))

    render(<LoginForm {...mockProps} />)

    await act(async () => {
      await user.type(screen.getByLabelText(/email/i), "user@test.com")
      await user.type(screen.getByLabelText(/password/i), "secret123")
      await user.click(screen.getByRole("button", { name: /sign in/i }))
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/auth/login",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      )
    })
  })

  it("shows loading state during submission", async () => {
    const user = userEvent.setup()

    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(createMockResponse({ user: { id: "1" } }, { status: 200 })), 200),
        ),
    )

    render(<LoginForm {...mockProps} />)

    await act(async () => {
      await user.type(screen.getByLabelText(/email/i), "test@example.com")
      await user.type(screen.getByLabelText(/password/i), "password123")
      await user.click(screen.getByRole("button", { name: /sign in/i }))
    })

    expect(screen.getByText(/signing in|loading/i)).toBeTruthy()
  })
})

describe("LoginForm - Form Submission Error Cases", () => {
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

  it("displays error message on login failure", async () => {
    const user = userEvent.setup()
    const errorMessage = "Invalid email or password"

    mockFetch.mockResolvedValueOnce(createMockResponse({ error: errorMessage }, { status: 401 }))

    render(<LoginForm {...mockProps} />)

    await act(async () => {
      await user.type(screen.getByLabelText(/email/i), "test@example.com")
      await user.type(screen.getByLabelText(/password/i), "wrongpass")
      await user.click(screen.getByRole("button", { name: /sign in/i }))
    })

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeTruthy()
    })
  })

  it("handles network error gracefully", async () => {
    const user = userEvent.setup()

    mockFetch.mockRejectedValueOnce(new Error("Network error"))

    render(<LoginForm {...mockProps} />)

    await act(async () => {
      await user.type(screen.getByLabelText(/email/i), "test@example.com")
      await user.type(screen.getByLabelText(/password/i), "password123")
      await user.click(screen.getByRole("button", { name: /sign in/i }))
    })

    await waitFor(() => {
      expect(screen.getByText(/network|error/i)).toBeTruthy()
    })
  })

  it("handles verification required response", async () => {
    const user = userEvent.setup()
    const email = "test@example.com"

    mockFetch.mockResolvedValueOnce(createMockResponse({ requiresVerification: true, email }, { status: 403 }))

    render(<LoginForm {...mockProps} />)

    await act(async () => {
      await user.type(screen.getByLabelText(/email/i), email)
      await user.type(screen.getByLabelText(/password/i), "password123")
      await user.click(screen.getByRole("button", { name: /sign in/i }))
    })

    await waitFor(() => {
      expect(mockProps.onSwitchToVerification).toHaveBeenCalledWith(email)
    })
  })
})
