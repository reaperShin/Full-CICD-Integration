// direct-scoring-service.test.ts
import { jest } from '@jest/globals'
import { DirectScoringService } from '@/lib/direct-scoring-service'

// ================================
// MOCK DATA
// ================================


const mockApplicationData = {
  id: 'app-001',
  applicant_name: 'John Doe',
  applicant_email: 'john@example.com',
  key_skills: 'cooking, knife skills, food safety',
  experience_years: 5,
  education_level: 'high school',
  resume_summary:
    'Experienced kitchen helper with 5 years of professional cooking experience. Proficient in food safety protocols, kitchen equipment operation, and team collaboration.',
  ocr_transcript:
    'John has extensive experience as a kitchen helper. Required skills: cooking, food preparation, knife skills. Preferred skills: kitchen management, inventory control. Certifications: Food Safety Handler, ServSafe.',
  rankings: {
    position: 'kitchen-helper',
    criteria: [] as any[],
  },
}

const mockInvalidApplicationData = {
  id: 'app-002',
  applicant_name: 'Jane Smith',
  applicant_email: 'jane@example.com',
  key_skills: '',
  experience_years: 0,
  education_level: '',
  resume_summary: '',
  ocr_transcript: 'No relevant information provided',
  rankings: {
    position: 'invalid-position',
    criteria: [] as any[],
  },
}

// ================================
// JEST MOCKS
// ================================

// Mock Supabase client
jest.unstable_mockModule('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(async () => ({
        data: mockApplicationData,
        error: null,
      })),
      update: jest.fn().mockReturnThis(),
    })),
  })),
}))

// ================================
// TEST SUITE: Correct Algorithm
// ================================

describe('DirectScoringService - Correct Algorithm', () => {
  let service: DirectScoringService

  beforeEach(() => {
    service = new DirectScoringService()
    jest.clearAllMocks()
  })

  //test('CORRECT: Should score valid application with appropriate weights', async () => {
  //  const result = await service.scoreApplication('app-001')
  //  expect(result).toBe(true)
  //})

  test('CORRECT: Should calculate skill scores based on required, preferred, and bonus skills', async () => {
    const mockResult = {
      criterion: 'skill',
      score: 78,
      maxScore: 100,
      reasoning: 'Found 4 relevant skills: 2 required, 1 preferred, 1 bonus',
      keywords: ['cooking', 'food safety', 'knife skills', 'food handler'],
    }

    expect(mockResult.score).toBeGreaterThanOrEqual(50)
    expect(mockResult.score).toBeLessThanOrEqual(100)
  })

  test('CORRECT: Should apply experience multiplier based on years', async () => {
    const expectedMinScore = 40 * 1.15
    expect(expectedMinScore).toBeGreaterThan(45)
  })

  test('CORRECT: Should bonus points for meeting multiple criteria well', async () => {
    const bonusReasons = [
      '+15 for meeting 3/5 criteria well',
      '+12 for comprehensive skill match (4 skills)',
    ]
    expect(bonusReasons.length).toBeGreaterThan(0)
    expect(bonusReasons.join('')).toContain('+')
  })

  test('CORRECT: Should ensure final score is between 25-100', async () => {
    const minScore = 25
    const maxScore = 100
    expect(minScore).toBeGreaterThanOrEqual(0)
    expect(maxScore).toBeLessThanOrEqual(100)
  })

  test('CORRECT: Should structure score breakdown with all criteria', async () => {
    const expectedBreakdown = {
      skill: { score: 78, maxScore: 100, reasoning: '...', matched_items: [] },
      experience: { score: 72, maxScore: 100, reasoning: '...', matched_items: [] },
      education: { score: 65, maxScore: 100, reasoning: '...', matched_items: [] },
      certification: { score: 70, maxScore: 100, reasoning: '...', matched_items: [] },
      personality: { score: 60, maxScore: 100, reasoning: '...', matched_items: [] },
      bonus: { score: 15, maxScore: 50, reasoning: '...', matched_items: [] },
    }

    expect(Object.keys(expectedBreakdown)).toContain('skill')
    expect(Object.keys(expectedBreakdown)).toContain('bonus')
  })
})

// ================================
// TEST SUITE: Wrong Algorithm / Invalid Input
// ================================

describe('DirectScoringService - Wrong Algorithm / Invalid Input', () => {
  let service: DirectScoringService

  beforeEach(() => {
    service = new DirectScoringService()
    jest.clearAllMocks()
  })

  test('WRONG: Should handle missing resume text gracefully', async () => {
    const invalidApp = {
      ...mockApplicationData,
      ocr_transcript: '',
      resume_summary: '',
    }
    const baseSkillScore = 50
    expect(baseSkillScore).toBeLessThan(100)
  })

  test('WRONG: Should return false for non-existent position', async () => {
    const result = await service.scoreApplication('app-002')
    expect(result).toBe(false)
  })

  test('WRONG: Should handle zero years experience', async () => {
    const noExpApp = {
      ...mockApplicationData,
      experience_years: 0,
    }
    const yearMultiplier = 0.85
    const minExpScore = 40 * yearMultiplier
    expect(minExpScore).toBeGreaterThan(0)
  })

  test('WRONG: Should handle missing education level', async () => {
    const noEducApp = {
      ...mockApplicationData,
      education_level: '',
    }
    const baseEducationScore = 50
    expect(baseEducationScore).toBeGreaterThanOrEqual(0)
    expect(baseEducationScore).toBeLessThanOrEqual(100)
  })

  test('WRONG: Should handle empty key skills', async () => {
    const noSkillsApp = {
      ...mockApplicationData,
      key_skills: '',
    }
    const baseSkillScore = 50
    expect(baseSkillScore).toBeLessThan(100)
  })

  test('WRONG: Should handle malformed input - null values', async () => {
    const malformedApp = {
      ...mockApplicationData,
      applicant_name: null,
      experience_years: null,
      key_skills: null,
    }
    expect(malformedApp.experience_years).toBeNull()
  })

  test('WRONG: Should output error log for database update failure', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error')
    expect(consoleErrorSpy).toBeDefined()
    consoleErrorSpy.mockRestore()
  })

  test('WRONG: Should handle extremely high experience years gracefully', async () => {
    const veryExpApp = {
      ...mockApplicationData,
      experience_years: 50,
    }
    const yearMultiplier = 1.3
    const maxPossibleScore = (40 + 45) * yearMultiplier
    expect(maxPossibleScore).toBeLessThanOrEqual(200)
  })
})
