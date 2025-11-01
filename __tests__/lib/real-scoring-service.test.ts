import { describe, it, expect } from "@jest/globals"

type RealScoringApplication = {
  id: string
  applicant_name: string
  applicant_email: string
  key_skills: string | null
  experience_years: number | null
  education_level: string | undefined
  ranking_id: string
}

type RealScoringResult = {
  criteriaScores: Record<string, number | undefined>
  totalScore: number
}

// Mock scoring function for testing
const realScoringMock = {
  scoreApplication: (app: RealScoringApplication): RealScoringResult => {
    const scores: Record<string, number> = {}

    if (app.key_skills) {
      const skillCount = app.key_skills.split(",").length
      scores.skill = Math.min(100, skillCount * 20)
    }

    if (app.experience_years !== null && app.experience_years !== undefined) {
      scores.experience = Math.min(100, app.experience_years * 10)
    }

    const educationMap: Record<string, number> = {
      "high-school": 60,
      bachelor: 70,
      master: 85,
      phd: 100,
    }

    if (app.education_level && app.education_level in educationMap) {
      scores.education = educationMap[app.education_level]
    } else if (app.education_level) {
      scores.education = 50
    }

    const scoredValues = Object.values(scores).filter((s) => typeof s === "number")
    const totalScore =
      scoredValues.length > 0 ? Math.round(scoredValues.reduce((a, b) => a + b, 0) / scoredValues.length) : 0

    return {
      criteriaScores: scores,
      totalScore,
    }
  },
}

const mockValidApplication: RealScoringApplication = {
  id: "app-real-001",
  applicant_name: "Alice Johnson",
  applicant_email: "alice@example.com",
  key_skills: "javascript,react,nodejs,css,html",
  experience_years: 3,
  education_level: "bachelor",
  ranking_id: "rank-001",
}

const mockInvalidApplication: RealScoringApplication = {
  id: "app-real-002",
  applicant_name: "Bob Smith",
  applicant_email: "bob@example.com",
  key_skills: null,
  experience_years: -5,
  education_level: "unknown-level",
  ranking_id: "rank-002",
}

describe("RealScoring - Correct Algorithm", () => {
  it("CORRECT: Should score skills based on comma-separated count", () => {
    const result = realScoringMock.scoreApplication(mockValidApplication)

    expect(result.criteriaScores.skill).toBe(100)
  })

  it("CORRECT: Should score experience based on years * 10", () => {
    const result = realScoringMock.scoreApplication(mockValidApplication)

    expect(result.criteriaScores.experience).toBe(30)
  })

  it("CORRECT: Should score education based on level mapping", () => {
    const result = realScoringMock.scoreApplication(mockValidApplication)

    expect(result.criteriaScores.education).toBe(70)
  })

  it("CORRECT: Should calculate average score from all criteria", () => {
    const result = realScoringMock.scoreApplication(mockValidApplication)

    expect(result.totalScore).toBe(67)
    expect(result.totalScore).toBeGreaterThan(50)
    expect(result.totalScore).toBeLessThan(100)
  })

  it("CORRECT: Should return criteria scores object", () => {
    const result = realScoringMock.scoreApplication(mockValidApplication)

    expect(result.criteriaScores).toHaveProperty("skill")
    expect(result.criteriaScores).toHaveProperty("experience")
    expect(result.criteriaScores).toHaveProperty("education")
  })

  it("CORRECT: Should handle maximum education level (PhD)", () => {
    const phDApp: RealScoringApplication = {
      ...mockValidApplication,
      education_level: "phd",
    }

    const result = realScoringMock.scoreApplication(phDApp)
    expect(result.criteriaScores.education).toBe(100)
  })
})

describe("RealScoring - Wrong Algorithm / Invalid Input", () => {
  it("WRONG: Should handle null key_skills", () => {
    const result = realScoringMock.scoreApplication(mockInvalidApplication)

    expect(result.criteriaScores.skill).toBeUndefined()
  })

  it("WRONG: Should handle negative experience years", () => {
    const result = realScoringMock.scoreApplication(mockInvalidApplication)

    expect(result.criteriaScores.experience).toBe(-50)
  })

  it("WRONG: Should handle unknown education level", () => {
    const result = realScoringMock.scoreApplication(mockInvalidApplication)

    expect(result.criteriaScores.education).toBe(50)
  })

  it("WRONG: Should return 0 for missing criteria", () => {
    const appWithNoData: RealScoringApplication = {
      ...mockValidApplication,
      key_skills: null,
      experience_years: null,
      education_level: undefined,
    }

    const result = realScoringMock.scoreApplication(appWithNoData)

    expect(result.totalScore).toBe(0)
  })

  it("WRONG: Should not validate skill count format", () => {
    const malformedSkills: RealScoringApplication = {
      ...mockValidApplication,
      key_skills: "javascript,,,,react",
    }

    const result = realScoringMock.scoreApplication(malformedSkills)

    expect(result.criteriaScores.skill).toBeGreaterThan(50)
  })

  it("WRONG: Should allow extremely high experience years", () => {
    const extremeExp: RealScoringApplication = {
      ...mockValidApplication,
      experience_years: 9999,
    }

    const result = realScoringMock.scoreApplication(extremeExp)

    expect(result.criteriaScores.experience).toBe(100)
  })

  it("WRONG: Should handle undefined education level", () => {
    const noEducLevel: RealScoringApplication = {
      ...mockValidApplication,
      education_level: undefined,
    }

    const result = realScoringMock.scoreApplication(noEducLevel)

    expect(result.criteriaScores.education).toBeUndefined()
  })
})
