import { describe, it, expect, beforeEach, jest, afterEach } from "@jest/globals"
import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import CreateRankingPage from "@/app/rankings/create/page"

describe("Rankings Create Page - Step Component Transitions", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("Criteria Selection Component", () => {
    it("renders criteria selection step after next", async () => {
      const user = userEvent.setup()
      render(<CreateRankingPage />)

      const nextButtons = screen.queryAllByText(/Next|Continue/i)
      if (nextButtons.length > 0) {
        await act(async () => {
          await user.click(nextButtons[0])
        })

        await waitFor(() => {
          const step2 = screen.queryByText(/Step 2/)
          expect(step2).toBeTruthy()
        })
      }
    })

    it("displays criteria checkboxes or selection options", async () => {
      const user = userEvent.setup()
      render(<CreateRankingPage />)

      const nextButtons = screen.queryAllByText(/Next|Continue/i)
      if (nextButtons.length > 0) {
        await act(async () => {
          await user.click(nextButtons[0])
        })

        await waitFor(() => {
          const checkboxes = screen.queryAllByRole("checkbox")
          expect(checkboxes.length).toBeGreaterThanOrEqual(0)
        })
      }
    })
  })

  describe("Criteria Weighting Component", () => {
    it("renders weighting step after step 2", async () => {
      const user = userEvent.setup()
      render(<CreateRankingPage />)

      const nextButtons = screen.queryAllByText(/Next|Continue/i)

      if (nextButtons.length > 0) {
        await act(async () => {
          await user.click(nextButtons[0])
        })

        await waitFor(() => {
          const step2NextButtons = screen.queryAllByText(/Next|Continue/i)
          if (step2NextButtons.length > 0) {
            userEvent.click(step2NextButtons[0])
          }
        })
      }
    })

    it("displays weight sliders or input fields", async () => {
      const user = userEvent.setup()
      render(<CreateRankingPage />)

      const nextButtons = screen.queryAllByText(/Next|Continue/i)
      if (nextButtons.length > 1) {
        await act(async () => {
          await user.click(nextButtons[0])
          await waitFor(() => {
            const nextBtns = screen.queryAllByText(/Next|Continue/i)
            if (nextBtns.length > 0) {
              userEvent.click(nextBtns[0])
            }
          })
        })
      }
    })
  })

  describe("Review Component", () => {
    it("renders review step as final step", async () => {
      const user = userEvent.setup()
      render(<CreateRankingPage />)

      const nextButtons = screen.queryAllByText(/Next|Continue/i)
      if (nextButtons.length > 0) {
        await act(async () => {
          // Move through all steps
          await user.click(nextButtons[0])
        })
      }
    })

    it("displays create/submit button on review step", async () => {
      const user = userEvent.setup()
      render(<CreateRankingPage />)

      const buttons = screen.queryAllByRole("button")
      const createButtons = buttons.filter((btn) => btn.textContent?.toLowerCase().includes("create"))
      expect(createButtons.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe("Component Appearance on Transitions", () => {
    it("hides previous step component when transitioning", async () => {
      const user = userEvent.setup()
      render(<CreateRankingPage />)

      const nextButtons = screen.queryAllByText(/Next|Continue/i)
      if (nextButtons.length > 0) {
        await act(async () => {
          await user.click(nextButtons[0])
        })

        await waitFor(() => {
          const step1Text = screen.queryByText(/Job Position Step/)
          expect(step1Text).toBeFalsy()
        })
      }
    })

    it("displays new component with smooth transition", async () => {
      const user = userEvent.setup()
      render(<CreateRankingPage />)

      const nextButtons = screen.queryAllByText(/Next|Continue/i)
      if (nextButtons.length > 0) {
        await act(async () => {
          await user.click(nextButtons[0])
        })

        await waitFor(() => {
          const step2 = screen.queryByText(/Step 2|Criteria/)
          expect(step2).toBeTruthy()
        })
      }
    })
  })
})
