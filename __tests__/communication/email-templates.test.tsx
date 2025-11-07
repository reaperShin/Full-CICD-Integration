import { describe, it, expect } from "@jest/globals"
import * as emailTemplates from "@/lib/email-templates"

describe("Email Templates", () => {
  describe("getVerificationEmailTemplate", () => {
    it("should generate verification email with code", () => {
      const email = emailTemplates.getVerificationEmailTemplate("123456", "John Doe")

      expect(email).toContain("123456")
      expect(email).toContain("John Doe")
      expect(email).toContain("verify")
      expect(email).toContain("HireRankerAI")
    })

    it("should contain HTML structure", () => {
      const email = emailTemplates.getVerificationEmailTemplate("123456", "John")

      expect(email).toContain("<!DOCTYPE html")
      expect(email).toContain("</html>")
      expect(email).toContain("<body")
    })

    it("should mention expiration time", () => {
      const email = emailTemplates.getVerificationEmailTemplate("123456", "John")

      expect(email.toLowerCase()).toContain("expire")
    })
  })

  describe("getApprovalEmailTemplate", () => {
    it("should generate approval email with job title", () => {
      const email = emailTemplates.getApprovalEmailTemplate("Jane Smith", "Senior Developer")

      expect(email).toContain("Jane Smith")
      expect(email).toContain("Senior Developer")
      expect(email).toContain("Congratulations")
    })

    it("should contain action link", () => {
      const email = emailTemplates.getApprovalEmailTemplate("Jane", "Developer")

      expect(email).toContain("<a")
      expect(email).toContain("href")
    })

    it("should use success styling", () => {
      const email = emailTemplates.getApprovalEmailTemplate("Jane", "Developer")

      expect(email).toContain("#10b981") // Green color
    })
  })

  describe("getRejectionEmailTemplate", () => {
    it("should generate rejection email gracefully", () => {
      const email = emailTemplates.getRejectionEmailTemplate("John Doe", "Product Manager")

      expect(email).toContain("John Doe")
      expect(email).toContain("Product Manager")
      expect(email).toContain("Thank you")
    })

    it("should encourage future applications", () => {
      const email = emailTemplates.getRejectionEmailTemplate("John", "Developer")

      expect(email.toLowerCase()).toContain("future")
    })

    it("should use appropriate styling", () => {
      const email = emailTemplates.getRejectionEmailTemplate("John", "Developer")

      expect(email).toContain("#6366f1") // Indigo color
    })
  })

  describe("getInterviewInvitationTemplate", () => {
    it("should generate interview invitation with details", () => {
      const email = emailTemplates.getInterviewInvitationTemplate(
        "Alice Brown",
        "UX Designer",
        "https://interview.example.com/room-123",
        "December 15, 2024 at 2:00 PM",
      )

      expect(email).toContain("Alice Brown")
      expect(email).toContain("UX Designer")
      expect(email).toContain("https://interview.example.com/room-123")
      expect(email).toContain("December 15, 2024 at 2:00 PM")
    })

    it("should include interview instructions", () => {
      const email = emailTemplates.getInterviewInvitationTemplate("Alice", "Designer", "https://link.com", "Dec 15")

      expect(email.toLowerCase()).toContain("camera")
      expect(email.toLowerCase()).toContain("microphone")
    })

    it("should have interview details section", () => {
      const email = emailTemplates.getInterviewInvitationTemplate("Alice", "Designer", "https://link.com", "Dec 15")

      expect(email).toContain("Interview Details")
      expect(email).toContain("Date &")
      expect(email).toContain("Format")
      expect(email).toContain("Duration")
    })
  })

  describe("getPasswordResetTemplate", () => {
    it("should generate password reset email", () => {
      const email = emailTemplates.getPasswordResetTemplate("https://reset.example.com/token-123", "John")

      expect(email).toContain("John")
      expect(email).toContain("https://reset.example.com/token-123")
      expect(email).toContain("password")
    })

    it("should mention link expiration", () => {
      const email = emailTemplates.getPasswordResetTemplate("https://reset.example.com", "John")

      expect(email.toLowerCase()).toContain("expire")
      expect(email.toLowerCase()).toContain("1 hour")
    })

    it("should use warning styling", () => {
      const email = emailTemplates.getPasswordResetTemplate("https://reset.example.com", "John")

      expect(email).toContain("#f59e0b") // Amber/warning color
    })

    it("should include security warning", () => {
      const email = emailTemplates.getPasswordResetTemplate("https://reset.example.com", "John")

      expect(email.toLowerCase()).toContain("didn't request")
    })
  })

  describe("Template HTML Validity", () => {
    it("should generate valid HTML for all templates", () => {
      const templates = [
        emailTemplates.getVerificationEmailTemplate("123456", "John"),
        emailTemplates.getApprovalEmailTemplate("Jane", "Developer"),
        emailTemplates.getRejectionEmailTemplate("John", "Developer"),
        emailTemplates.getInterviewInvitationTemplate("Alice", "Designer", "https://link.com", "Dec 15"),
        emailTemplates.getPasswordResetTemplate("https://reset.example.com", "John"),
      ]

      templates.forEach((template) => {
        expect(template).toContain("<!DOCTYPE html")
        expect(template).toContain("</html>")
        expect(template).toMatch(/<html[\s>]/)
        expect(template).toMatch(/<body[\s>]/)
      })
    })

    it("should not have unmatched tags", () => {
      const email = emailTemplates.getVerificationEmailTemplate("123456", "John")

      const openDivs = (email.match(/<div/g) || []).length
      const closeDivs = (email.match(/<\/div>/g) || []).length

      expect(openDivs).toBe(closeDivs)
    })
  })
})
