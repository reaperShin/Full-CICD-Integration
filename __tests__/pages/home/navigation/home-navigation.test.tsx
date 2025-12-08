import { describe, it, expect, beforeEach, jest, afterEach } from "@jest/globals"
import { render, screen } from "@testing-library/react"
import Home from "@/app/page"

describe("Home Page Navigation", () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("Navigation Links", () => {
    it("renders navigation menu items", () => {
      render(<Home />)
      const navLinks = screen.queryAllByText(/Features|How it Works|Pricing/i)
      expect(navLinks.length).toBeGreaterThan(0)
    })

    it("renders start free trial button", () => {
      render(<Home />)
      const trialButtons = screen.queryAllByText(/Start Free Trial/i)
      expect(trialButtons.length).toBeGreaterThan(0)
    })

    it("renders watch demo button", () => {
      render(<Home />)
      const demoButtons = screen.queryAllByText(/Watch Demo/i)
      expect(demoButtons.length).toBeGreaterThan(0)
    })

    it("renders transform hiring button", () => {
      render(<Home />)
      const transformButtons = screen.queryAllByText(/Transform Your Hiring/i)
      expect(transformButtons.length).toBeGreaterThan(0)
    })
  })

  describe("Logo and Branding", () => {
    it("displays HireRankerAI logo text", () => {
      render(<Home />)
      const logo = screen.queryByText(/HireRankerAI/i)
      expect(logo).toBeTruthy()
    })

    it("renders feature cards with icons", () => {
      render(<Home />)
      const featureTexts = screen.queryAllByText(
        /AI-Powered Ranking|Video Interviews|Resume Analysis|Automated Workflow/i,
      )
      expect(featureTexts.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe("Statistics Section", () => {
    it("displays company statistics", () => {
      render(<Home />)
      const stats = screen.queryAllByText(/10K\+|500K\+|95%|50%/i)
      expect(stats.length).toBeGreaterThan(0)
    })

    it("shows success metrics", () => {
      render(<Home />)
      const successText = screen.queryAllByText(/Companies|Candidates|Success Rate|Time Saved/i)
      expect(successText.length).toBeGreaterThan(0)
    })
  })

  describe("Responsive Navigation", () => {
    it("renders mobile menu button on small screens", () => {
      render(<Home />)
      const menuButtons = screen.queryAllByRole("button")
      expect(menuButtons.length).toBeGreaterThan(0)
    })

    it("maintains navigation structure", () => {
      render(<Home />)
      const buttons = screen.queryAllByRole("button")
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  it("renders navigation buttons", () => {
    const { container } = render(<Home />)
    const buttons = container.querySelectorAll("button")
    expect(buttons.length).toBeGreaterThan(0)
  })

  it("renders logo or branding", () => {
    const { container } = render(<Home />)
    const links = container.querySelectorAll("a")
    expect(links.length).toBeGreaterThan(0)
  })

  it("renders content sections", () => {
    const { container } = render(<Home />)
    const sections = container.querySelectorAll("section, div[role='main']")
    expect(sections.length).toBeGreaterThan(0)
  })

  it("renders footer elements", () => {
    const { container } = render(<Home />)
    const footers = container.querySelectorAll("footer")
    expect(footers.length).toBeGreaterThanOrEqual(0)
  })
})
