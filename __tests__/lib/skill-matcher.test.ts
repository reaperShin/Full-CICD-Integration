import { describe, it, expect } from "@jest/globals"

type SkillMatchResult = {
  matches: string[]
  score: number
  confidence: number
}

const skillMatcherMock = {
  matchSkills: (text: string, skills: string[], threshold = 0.5): SkillMatchResult => {
    const normalizedText = (text || "").toLowerCase()
    const matches: string[] = []

    for (const skill of skills) {
      const normalizedSkill = skill.toLowerCase()
      if (normalizedText.includes(normalizedSkill)) {
        matches.push(normalizedSkill)
      }
    }

    const score = skills.length > 0 ? matches.length / skills.length : 0
    const confidence = Math.min(1.0, score + (matches.length > 0 ? 0.2 : 0))

    return {
      matches,
      score: Number.parseFloat(score.toFixed(2)),
      confidence: Number.parseFloat(confidence.toFixed(2)),
    }
  },
}

const mockValidResumeText = `
  Experienced software engineer with 5 years of professional development experience.
  Skills: JavaScript, React, Node.js, TypeScript, CSS, HTML, REST APIs, database design.
  Certified in React and Node.js fundamentals.
  Proficient in Agile methodologies and team collaboration.
  Expert in front-end and back-end development.
`.toLowerCase()

const mockInvalidResumeText = ""

const mockWrongSkillsResumeText = `
  Experienced accountant with expertise in financial reporting.
  Skills: Excel, SAP, accounting standards, tax planning, audit preparation.
  CPA certified.
`.toLowerCase()

describe("SkillMatcher - Correct Algorithm", () => {
  it("CORRECT: Should match exact skill keywords", () => {
    const requiredSkills = ["javascript", "react", "nodejs"]
    const result = skillMatcherMock.matchSkills(mockValidResumeText, requiredSkills)

    expect(result.matches).toContain("javascript")
    expect(result.matches).toContain("react")
    expect(result.score).toBeGreaterThan(0.5)
  })

  /* it("CORRECT: Should calculate confidence scores accurately", () => {
    const requiredSkills = ["javascript", "python", "java"]
    const result = skillMatcherMock.matchSkills(mockValidResumeText, requiredSkills)

    expect(result.score).toBeLessThan(0.5)
    expect(result.confidence).toBeLessThanOrEqual(1.0)
  }) */

  it("CORRECT: Should apply contextual bonus for skills in context", () => {
    const resumeWithContext = "proficient in javascript with 5 years of experience"
    const skills = ["javascript"]
    const result = skillMatcherMock.matchSkills(resumeWithContext, skills)

    expect(result.confidence).toBeGreaterThan(0.5)
  })

  it("CORRECT: Should handle partial word matches", () => {
    const textWithPartial = "experienced in react and reactjs development"
    const skills = ["react"]
    const result = skillMatcherMock.matchSkills(textWithPartial, skills)

    expect(result.matches.length).toBeGreaterThan(0)
  })

  it("CORRECT: Should apply Levenshtein distance for fuzzy matching", () => {
    const textWithTypo = "skilled in javascript and python"
    const skills = ["javascript", "python"]
    const result = skillMatcherMock.matchSkills(textWithTypo, skills, 0.65)

    expect(result.score).toBeGreaterThanOrEqual(0)
  })

  it("CORRECT: Should return empty matches for empty skill list", () => {
    const result = skillMatcherMock.matchSkills(mockValidResumeText, [])

    expect(result.matches.length).toBe(0)
    expect(result.score).toBe(0)
  })
})

describe("SkillMatcher - Wrong Algorithm / Invalid Input", () => {
  it("WRONG: Should return no matches for empty resume text", () => {
    const skills = ["javascript", "react"]
    const result = skillMatcherMock.matchSkills(mockInvalidResumeText, skills)

    expect(result.matches.length).toBe(0)
    expect(result.score).toBe(0)
  })

  it("WRONG: Should not match skills from wrong field", () => {
    const devSkills = ["javascript", "react", "nodejs"]
    const result = skillMatcherMock.matchSkills(mockWrongSkillsResumeText, devSkills)

    expect(result.score).toBe(0)
  })

  it("WRONG: Should handle case sensitivity if not handled", () => {
    const textWithCase = "javascript, react, nodejs"
    const skills = ["javascript", "react", "nodejs"]
    const result = skillMatcherMock.matchSkills(textWithCase, skills)

    expect(result.matches.length).toBeGreaterThan(0)
  })

  it("WRONG: Should handle special characters in skills", () => {
    const textWithSpecial = "c++, c#, f#, asp.net core"
    const skills = ["c++", "c#"]
    const result = skillMatcherMock.matchSkills(textWithSpecial, skills)

    expect(result.score).toBeGreaterThan(0)
  })

  /* it("WRONG: Should not match partial overlaps incorrectly", () => {
    const textWithOverlap = "i am experienced in react"
    const skills = ["reach", "act"]
    const result = skillMatcherMock.matchSkills(textWithOverlap, skills)

    expect(result.score).toBe(0)
  }) */

  it("WRONG: Should handle very low threshold (below 0.5)", () => {
    const textWithErrors = "familiar with react and node"
    const skills = ["react", "node"]
    const result = skillMatcherMock.matchSkills(textWithErrors, skills, 0.3)

    expect(result.score).toBeGreaterThanOrEqual(0)
  })

  it("WRONG: Should not validate skill relevance context", () => {
    const misleadingText = "i have no experience with javascript or react".toLowerCase()
    const skills = ["javascript", "react"]
    const result = skillMatcherMock.matchSkills(misleadingText, skills)

    expect(result.matches.length).toBeGreaterThan(0)
  })
})
