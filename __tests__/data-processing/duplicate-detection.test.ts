import { describe, it, expect, beforeEach } from "@jest/globals"
import { DuplicateDetectionService } from "@/lib/duplicate-detection"

describe("DuplicateDetectionService", () => {
  let service: DuplicateDetectionService

  beforeEach(() => {
    service = new DuplicateDetectionService()
  })

  describe("checkDuplicate - Correct Input Tests", () => {
    it("should identify exact duplicates with high confidence", async () => {
      const newApp = {
        applicant_name: "John Doe",
        applicant_email: "john@example.com",
        applicant_phone: "555-1234",
        applicant_city: "New York",
      }

      const existingApps = [
        {
          applicant_name: "John Doe",
          applicant_email: "john@example.com",
          applicant_phone: "555-1234",
          applicant_city: "New York",
        },
      ]

      const result = await service.checkDuplicate(newApp, existingApps)

      expect(result.isDuplicate).toBe(true)
      expect(result.confidence).toBeGreaterThan(0.85)
      expect(result.matchedFields.length).toBeGreaterThan(0)
    })

    it("should detect name variations as potential duplicates", async () => {
      const newApp = {
        applicant_name: "Robert Smith",
        applicant_email: "bob.smith@example.com",
        applicant_phone: "555-5678",
        applicant_city: "Los Angeles",
      }

      const existingApps = [
        {
          applicant_name: "Bob Smith",
          applicant_email: "bob.smith@example.com",
          applicant_phone: "555-5678",
          applicant_city: "LA",
        },
      ]

      const result = await service.checkDuplicate(newApp, existingApps)

      expect(result.isDuplicate).toBe(true)
      expect(result.confidence).toBeGreaterThan(0.7)
    })

    it("should detect email variations as duplicates", async () => {
      const newApp = {
        applicant_name: "Jane Doe",
        applicant_email: "jane.doe@gmail.com",
        applicant_phone: "555-9999",
        applicant_city: "Chicago",
      }

      const existingApps = [
        {
          applicant_name: "Jane Doe",
          applicant_email: "janedoe@gmail.com", // No dot in local part
          applicant_phone: "555-9999",
          applicant_city: "Chicago",
        },
      ]

      const result = await service.checkDuplicate(newApp, existingApps)

      expect(result.isDuplicate).toBe(true)
      expect(result.matchedFields).toContain("email")
    })

    it("should detect phone number variations", async () => {
      const newApp = {
        applicant_name: "Mike Johnson",
        applicant_email: "mike@example.com",
        applicant_phone: "(555) 123-4567",
        applicant_city: "Seattle",
      }

      const existingApps = [
        {
          applicant_name: "Mike Johnson",
          applicant_email: "mike@example.com",
          applicant_phone: "555-123-4567", // Different format
          applicant_city: "Seattle",
        },
      ]

      const result = await service.checkDuplicate(newApp, existingApps)

      expect(result.isDuplicate).toBe(true)
      expect(result.matchedFields).toContain("phone")
    })

    it("should detect location variations", async () => {
      const newApp = {
        applicant_name: "Alex Brown",
        applicant_email: "alex@example.com",
        applicant_phone: "555-0000",
        applicant_city: "NYC",
      }

      const existingApps = [
        {
          applicant_name: "Alex Brown",
          applicant_email: "alex@example.com",
          applicant_phone: "555-0000",
          applicant_city: "New York",
        },
      ]

      const result = await service.checkDuplicate(newApp, existingApps)

      expect(result.isDuplicate).toBe(true)
      expect(result.matchedFields).toContain("location")
    })
  })

  describe("checkDuplicate - Wrong Input Tests", () => {

    it("should handle missing optional fields gracefully", async () => {
      const newApp = {
        applicant_name: "John Doe",
        applicant_email: "",
        applicant_phone: "",
        applicant_city: "",
      }

      const existingApps = [
        {
          applicant_name: "John Doe",
          applicant_email: "",
          applicant_phone: "",
          applicant_city: "",
        },
      ]

      const result = await service.checkDuplicate(newApp, existingApps)

      expect(result).toBeDefined()
      expect(result.isDuplicate).toBe(true) // Should match on name alone
    })

    it("should handle empty existing applications array", async () => {
      const newApp = {
        applicant_name: "John Doe",
        applicant_email: "john@example.com",
        applicant_phone: "555-1234",
        applicant_city: "New York",
      }

      const result = await service.checkDuplicate(newApp, [])

      expect(result.isDuplicate).toBe(false)
      expect(result.confidence).toBe(0)
    })

    it("should handle invalid phone numbers", async () => {
      const newApp = {
        applicant_name: "John Doe",
        applicant_email: "john@example.com",
        applicant_phone: "invalid-phone",
        applicant_city: "New York",
      }

      const existingApps = [
        {
          applicant_name: "John Doe",
          applicant_email: "john@example.com",
          applicant_phone: "555-1234",
          applicant_city: "New York",
        },
      ]

      const result = await service.checkDuplicate(newApp, existingApps)

      expect(result).toBeDefined()
      expect(typeof result.confidence).toBe("number")
    })

    it("should handle special characters in names", async () => {
      const newApp = {
        applicant_name: "O'Brien-Smith",
        applicant_email: "obrien@example.com",
        applicant_phone: "555-1234",
        applicant_city: "Boston",
      }

      const existingApps = [
        {
          applicant_name: "Obrien Smith",
          applicant_email: "obrien@example.com",
          applicant_phone: "555-1234",
          applicant_city: "Boston",
        },
      ]

      const result = await service.checkDuplicate(newApp, existingApps)

      expect(result).toBeDefined()
      expect(result.confidence).toBeGreaterThan(0.6)
    })
  })

  describe("Similarity and Normalization Methods", () => {
    it("should normalize names correctly", () => {
      const normalized = (service as any).normalizeName("JoHn DOe")
      expect(normalized).toBe("john doe")
    })

    it("should calculate similarity between strings", () => {
      const sim1 = (service as any).similarity("John", "John")
      const sim2 = (service as any).similarity("John", "Joan")

      expect(sim1).toBe(1)
      expect(sim2).toBeGreaterThan(0.5)
      expect(sim2).toBeLessThan(1)
    })

    it("should normalize emails correctly", () => {
      const normalized = (service as any).normalizeEmail("John.Doe+tag@Gmail.com")
      expect(normalized).toContain("@gmail.com")
    })

    it("should normalize phone numbers correctly", () => {
      const normalized = (service as any).normalizePhone("(555) 123-4567")
      expect(normalized).toBe("5551234567")
    })

    it("should normalize locations correctly", () => {
      const normalized = (service as any).normalizeLocation("New York, NY")
      expect(normalized).toBe("new york ny")
    })
  })
})
