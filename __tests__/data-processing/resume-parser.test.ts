import { describe, it, expect, beforeEach } from "@jest/globals"
import { SimpleResumeParser } from "@/lib/simple-resume-parser"

describe("SimpleResumeParser", () => {
  let parser: SimpleResumeParser

  beforeEach(() => {
    parser = new SimpleResumeParser()
  })

  describe("parseFromFile - Correct Input Tests", () => {
    it("should parse a valid resume file correctly", async () => {
      const mockFile = new File(
        [
          "John Doe\njohn@example.com\n555-1234\nNew York, NY\nJavaScript, React, Node.js\n5 years of experience\nBachelor of Science in Computer Science\n",
        ],
        "resume.txt",
        { type: "text/plain" },
      )

      const result = await parser.parseFromFile(mockFile)

      expect(result).toBeDefined()
      expect(result.applicant_name).toBeTruthy()
      expect(result.applicant_email).toContain("@")
      expect(result.key_skills).toBeTruthy()
      expect(result.experience_years).toBeGreaterThan(0)
    })

    it("should extract experience years correctly", async () => {
      const mockFile = new File(["Jane Smith\njane@test.com\n10 years of experience\n"], "resume.txt", {
        type: "text/plain",
      })

      const result = await parser.parseFromFile(mockFile)

      expect(result.experience_years).toBe(10)
    })

    it("should extract certifications from text", async () => {
      const mockFile = new File(["John Doe\nCertified Cloud Practitioner\nAWS Certification\n"], "resume.txt", {
        type: "text/plain",
      })

      const result = await parser.parseFromFile(mockFile)

      expect(result.certifications).toBeTruthy()
      expect(result.certifications.toLowerCase()).toContain("certified")
    })

    it("should handle multiple certifications", async () => {
      const mockFile = new File(
        ["John Doe\nCertified Developer\nLicense Professional\nRegistered Specialist\n"],
        "resume.txt",
        { type: "text/plain" },
      )

      const result = await parser.parseFromFile(mockFile)

      expect(result.certifications).toContain(";")
    })
  })

  describe("parseFromFile - Wrong Input Tests", () => {
    it("should handle empty file gracefully", async () => {
      const mockFile = new File([""], "empty.txt", { type: "text/plain" })

      await expect(parser.parseFromFile(mockFile)).rejects.toThrow()
    })

    it("should handle file with insufficient data", async () => {
      const mockFile = new File(["A"], "minimal.txt", { type: "text/plain" })

      await expect(parser.parseFromFile(mockFile)).rejects.toThrow()
    })

    it("should handle corrupted file", async () => {
      const mockFile = new File([null as any], "corrupted.txt", { type: "text/plain" })

      await expect(parser.parseFromFile(mockFile)).rejects.toThrow()
    })

    it("should return default values for missing optional fields", async () => {
      const mockFile = new File(["John Doe\n"], "resume.txt", { type: "text/plain" })

      const result = await parser.parseFromFile(mockFile)

      expect(result.applicant_email).toBe("")
      expect(result.applicant_phone).toBe("")
      expect(result.experience_years).toBe(0)
    })
  })

  describe("parseExperienceYears", () => {
    it("should extract numeric years from text", () => {
      const result = (parser as any).parseExperienceYears("15 years of experience")
      expect(result).toBe(15)
    })

    it("should handle years with plus sign", () => {
      const result = (parser as any).parseExperienceYears("10+ years")
      expect(result).toBe(10)
    })

    it("should return 0 for text without years", () => {
      const result = (parser as any).parseExperienceYears("no experience mentioned")
      expect(result).toBe(0)
    })
  })

  describe("extractCertifications", () => {
    it("should extract certification keywords from text", () => {
      const text = "Certified AWS Practitioner\nPHP Certification\nLicense Professional"
      const result = (parser as any).extractCertifications(text)

      expect(result).toContain("Certified")
      expect(result).toContain("Certification")
      expect(result).toContain("License")
    })

    it('should return "None specified" when no certifications found', () => {
      const text = "Just a regular resume with no certifications"
      const result = (parser as any).extractCertifications(text)

      expect(result).toBe("None specified")
    })

    it("should handle multiple certifications separated by semicolons", () => {
      const text = "Certified Developer\nCertified Data Analyst\nCredentialed Professional"
      const result = (parser as any).extractCertifications(text)

      expect(result).toContain(";")
    })
  })
})
