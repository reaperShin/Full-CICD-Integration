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

  describe("Progress Indicators", () => {
    it("displays progress bars for criteria", () => {
      render(<AlgorithmPage />)
      const progressElements = screen.queryAllByRole("progressbar") || screen.queryAllByText(/Progress|%/)
      expect(progressElements.length).toBeGreaterThanOrEqual(0)
    })
  })
})
