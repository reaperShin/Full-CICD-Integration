import { describe, it, expect } from "@jest/globals"

describe("Form Validation Rules", () => {
  describe("Email Validation", () => {
    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    it("accepts valid email", () => {
      expect(validateEmail("test@example.com")).toBe(true)
    })

    it("rejects email without @", () => {
      expect(validateEmail("testexample.com")).toBe(false)
    })

    it("rejects email without domain", () => {
      expect(validateEmail("test@")).toBe(false)
    })

    it("rejects email with spaces", () => {
      expect(validateEmail("test @example.com")).toBe(false)
    })

    it("accepts email with plus sign", () => {
      expect(validateEmail("test+tag@example.com")).toBe(true)
    })
  })

  describe("Password Validation", () => {
    const validatePassword = (pwd: string) => pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)

    it("accepts strong password", () => {
      expect(validatePassword("SecurePass123")).toBe(true)
    })

    it("rejects password too short", () => {
      expect(validatePassword("Short1A")).toBe(false)
    })

    it("rejects password without uppercase", () => {
      expect(validatePassword("lowercase123")).toBe(false)
    })

    it("rejects password without numbers", () => {
      expect(validatePassword("NoNumbers")).toBe(false)
    })
  })

  describe("Name Validation", () => {
    const validateName = (name: string) => name.trim().length >= 2 && name.trim().length <= 100

    it("accepts valid name", () => {
      expect(validateName("John Doe")).toBe(true)
    })

    it("rejects name too short", () => {
      expect(validateName("J")).toBe(false)
    })

    it("rejects name too long", () => {
      expect(validateName("a".repeat(101))).toBe(false)
    })

    it("accepts name with spaces", () => {
      expect(validateName("Jean Claude Van Damme")).toBe(true)
    })
  })

  describe("Phone Validation", () => {
    const validatePhone = (phone: string) => /^\+?1?\d{9,15}$/.test(phone.replace(/\D/g, ""))

    it("accepts valid phone number", () => {
      expect(validatePhone("+1-555-123-4567")).toBe(true)
    })

    it("accepts phone without country code", () => {
      expect(validatePhone("5551234567")).toBe(true)
    })

    it("rejects phone too short", () => {
      expect(validatePhone("123")).toBe(false)
    })
  })
})
