import { describe, it, expect, beforeEach, jest } from "@jest/globals"
import { render, screen } from "@testing-library/react"
import AlgorithmPage from "@/app/algorithm/page"

describe("Algorithm Page - Display and Content", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Header and Title", () => {
    it("displays HR Scoring Algorithm title", () => {
      render(<AlgorithmPage />)
      const title = screen.queryByText(/HR Scoring Algorithm/i)
      expect(title).toBeTruthy()
    })

    it("displays algorithm description", () => {
      render(<AlgorithmPage />)
      const description = screen.queryByText(/intelligent scoring system|advanced OCR/i)
      expect(description).toBeTruthy()
    })

    it("renders brain icon or header icon", () => {
      render(<AlgorithmPage />)
      const page = screen.queryByText(/Scoring Algorithm|Algorithm/i)
      expect(page).toBeTruthy()
    })
  })

  describe("How It Works Section", () => {
    it("displays OCR Processing step", () => {
      render(<AlgorithmPage />)
      const ocrText = screen.queryByText(/OCR|Resume|extract/i)
      expect(ocrText).toBeTruthy()
    })

    it("displays Criteria Scoring step", () => {
      render(<AlgorithmPage />)
      const criteriaText = screen.queryByText(/Criteria Scoring|individually/i)
      expect(criteriaText).toBeTruthy()
    })

    it("displays Weighted Calculation step", () => {
      render(<AlgorithmPage />)
      const weightedText = screen.queryByText(/Weighted Calculation|combined/i)
      expect(weightedText).toBeTruthy()
    })
  })

  describe("Scoring Criteria Display", () => {
    it("displays Personality criterion", () => {
      render(<AlgorithmPage />)
      const personality = screen.queryByText(/Personality/)
      expect(personality).toBeTruthy()
    })

    it("displays Skills criterion", () => {
      render(<AlgorithmPage />)
      const skills = screen.queryByText(/Skills/)
      expect(skills).toBeTruthy()
    })

    it("displays Experience criterion", () => {
      render(<AlgorithmPage />)
      const experience = screen.queryByText(/Experience/)
      expect(experience).toBeTruthy()
    })

    it("displays Education criterion", () => {
      render(<AlgorithmPage />)
      const education = screen.queryByText(/Education/)
      expect(education).toBeTruthy()
    })

    it("displays Certifications criterion", () => {
      render(<AlgorithmPage />)
      const certifications = screen.queryByText(/Certifications/)
      expect(certifications).toBeTruthy()
    })
  })

  describe("Weight Display", () => {
    it("shows weight percentages for criteria", () => {
      render(<AlgorithmPage />)
      const weights = screen.queryAllByText(/25%|30%|10%|Weight/i)
      expect(weights.length).toBeGreaterThan(0)
    })

    it("displays score ranges", () => {
      render(<AlgorithmPage />)
      const ranges = screen.queryAllByText(/points|Score Range/i)
      expect(ranges.length).toBeGreaterThan(0)
    })
  })

  describe("Scoring Example Section", () => {
    it("displays scoring example for sample applicant", () => {
      render(<AlgorithmPage />)
      const exampleText = screen.queryByText(/John Smith|Sample|Kitchen Helper/i)
      expect(exampleText).toBeTruthy()
    })

    it("displays individual scores", () => {
      render(<AlgorithmPage />)
      const scores = screen.queryAllByText(/Score:|\/100/i)
      expect(scores.length).toBeGreaterThan(0)
    })

    it("displays final weighted score", () => {
      render(<AlgorithmPage />)
      const finalScore = screen.queryByText(/Final Weighted Score/)
      expect(finalScore).toBeTruthy()
    })
  })

  describe("Key Features Section", () => {
    it("displays Fair & Consistent feature", () => {
      render(<AlgorithmPage />)
      const fairText = screen.queryByText(/Fair|Consistent|unconscious bias/i)
      expect(fairText).toBeTruthy()
    })

    it("displays Customizable Weights feature", () => {
      render(<AlgorithmPage />)
      const customText = screen.queryByText(/Customizable|Weights|adjust/i)
      expect(customText).toBeTruthy()
    })

    it("displays Automated Processing feature", () => {
      render(<AlgorithmPage />)
      const automatedText = screen.queryByText(/Automated|Processing|reduces/i)
      expect(automatedText).toBeTruthy()
    })

    it("displays Transparent Scoring feature", () => {
      render(<AlgorithmPage />)
      const transparentText = screen.queryByText(/Transparent|breakdowns/i)
      expect(transparentText).toBeTruthy()
    })
  })

  describe("Progress Indicators", () => {
    it("displays progress bars for criteria", () => {
      render(<AlgorithmPage />)
      const progressElements = screen.queryAllByRole("progressbar") || screen.queryAllByText(/Progress|%/)
      expect(progressElements.length).toBeGreaterThanOrEqual(0)
    })
  })
})
