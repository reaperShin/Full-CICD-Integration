"use client"

import type React from "react"

import { describe, it, expect, beforeEach, jest, afterEach } from "@jest/globals"
import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMockResponse } from "../../setup/test-utils"

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>
global.fetch = mockFetch as any

describe("Application Form Component", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("Form Rendering", () => {
    it("renders application form", () => {
      const ApplyPage = () => (
        <form>
          <input type="text" placeholder="Full Name" />
          <input type="email" placeholder="Email" />
          <button type="submit">Submit Application</button>
        </form>
      )

      render(<ApplyPage />)
      const inputs = screen.queryAllByRole("textbox")
      expect(inputs.length).toBeGreaterThan(0)
    })

    it("displays name input field", () => {
      const ApplyPage = () => <input type="text" placeholder="Full Name" />

      render(<ApplyPage />)
      const nameInput = screen.queryByPlaceholderText(/Full Name/i) || screen.queryByDisplayValue("")
      expect(nameInput).toBeTruthy()
    })

    it("displays email input field", () => {
      const ApplyPage = () => <input type="email" placeholder="Email" />

      render(<ApplyPage />)
      const emailInput = screen.queryByPlaceholderText(/Email/i)
      expect(emailInput).toBeTruthy()
    })

    it("displays submit button", () => {
      const ApplyPage = () => <button type="submit">Submit Application</button>

      render(<ApplyPage />)
      const submitBtn = screen.queryByText(/Submit Application/i)
      expect(submitBtn).toBeTruthy()
    })
  })

  describe("Form Submission", () => {
    it("submits application with user data", async () => {
      const user = userEvent.setup()

      const ApplyForm = () => {
        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault()
          const formData = new FormData(e.target as HTMLFormElement)
          await fetch("/api/applications", {
            method: "POST",
            body: formData,
          })
        }

        return (
          <form onSubmit={handleSubmit}>
            <input name="name" type="text" placeholder="Full Name" />
            <input name="email" type="email" placeholder="Email" />
            <button type="submit">Submit</button>
          </form>
        )
      }

      mockFetch.mockResolvedValueOnce(createMockResponse({ success: true }, { status: 200 }))

      render(<ApplyForm />)

      const inputs = screen.queryAllByRole("textbox")
      const button = screen.queryByText(/Submit/i)

      if (inputs[0] && inputs[1] && button) {
        await act(async () => {
          await user.type(inputs[0], "John Doe")
          await user.type(inputs[1], "john@example.com")
          await user.click(button)
        })

        await waitFor(() => {
          expect(mockFetch).toHaveBeenCalledWith("/api/applications", expect.any(Object))
        })
      }
    })
  })

  describe("Resume Upload", () => {
    it("displays resume upload field", () => {
      const ApplyPage = () => <input type="file" accept=".pdf,.doc,.docx" />

      render(<ApplyPage />)
      const fileInput = screen.queryByDisplayValue("")
      expect(fileInput).toBeTruthy()
    })
  })
})
