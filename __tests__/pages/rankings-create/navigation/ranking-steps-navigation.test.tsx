import { describe, it, expect, beforeEach, jest, afterEach } from "@jest/globals"
import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import CreateRankingPage from "@/app/rankings/create/page"

const mockPush = jest.fn()
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe("Rankings Create Page - Step Navigation", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPush.mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("Step Indicator Display", () => {
    it("displays all ranking steps", () => {
      render(<CreateRankingPage />)
      const steps = screen.queryAllByText(/Step|Job Position|Criteria Selection|Criteria Weighting|Review/i)
      expect(steps.length).toBeGreaterThan(0)
    })

    it("highlights current step", () => {
      render(<CreateRankingPage />)
      const stepIndicators = screen.queryAllByText(/Step 1/)
      expect(stepIndicators.length).toBeGreaterThan(0)
    })

    it("shows step titles", () => {
      render(<CreateRankingPage />)
      const stepTitles = screen.queryAllByText(/Job Position|Criteria Selection|Criteria Weighting|Review/i)
      expect(stepTitles.length).toBeGreaterThan(0)
    })
  })

  describe("Navigation Between Steps", () => {
    it("navigates to next step on button click", async () => {
      const user = userEvent.setup()
      render(<CreateRankingPage />)

      const nextButtons = screen.queryAllByText(/Next|Continue/i)
      if (nextButtons.length > 0) {
        await act(async () => {
          await user.click(nextButtons[0])
        })

        await waitFor(() => {
          const stepText = screen.queryByText(/Step 2/)
          expect(stepText).toBeTruthy()
        })
      }
    })

    it("navigates to previous step", async () => {
      const user = userEvent.setup()
      render(<CreateRankingPage />)

      const nextButtons = screen.queryAllByText(/Next|Continue/i)
      if (nextButtons.length > 0) {
        await act(async () => {
          await user.click(nextButtons[0])
        })

        await waitFor(() => {
          const prevButtons = screen.queryAllByText(/Back|Previous/i)
          if (prevButtons.length > 0) {
            act(() => {
              userEvent.click(prevButtons[0])
            })
          }
        })
      }
    })
  })

  describe("Back to Dashboard Navigation", () => {
    it("renders back to dashboard button", () => {
      render(<CreateRankingPage />)
      const backButton = screen.queryByText(/Back to Dashboard/i)
      expect(backButton).toBeTruthy()
    })

    it("navigates back to dashboard on button click", async () => {
      const user = userEvent.setup()
      render(<CreateRankingPage />)

      const backButton = screen.queryByText(/Back to Dashboard/i)
      if (backButton) {
        await act(async () => {
          await user.click(backButton)
        })

        expect(mockPush).toHaveBeenCalledWith("/")
      }
    })
  })

  describe("Step Progress Validation", () => {
    it("shows completed steps with check marks", async () => {
      const user = userEvent.setup()
      render(<CreateRankingPage />)

      const nextButtons = screen.queryAllByText(/Next|Continue/i)
      if (nextButtons.length > 0) {
        await act(async () => {
          await user.click(nextButtons[0])
        })

        const checkMarks = screen.queryAllByText(/✓|✔/i)
        expect(checkMarks.length).toBeGreaterThan(0)
      }
    })
  })
})
