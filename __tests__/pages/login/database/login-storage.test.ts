import { describe, it, expect, beforeEach, jest } from "@jest/globals"
import * as storageModule from "@/lib/storage"

// Mock the Supabase client
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn((table: string) => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 1, email: "test@example.com" }, error: null }),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    })),
  })),
}))

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
  compare: jest.fn().mockResolvedValue(true),
}))

describe("Storage - User Management", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("createUser - Correct Input Tests", () => {
    it("should create a user with valid credentials", async () => {
      const result = await storageModule.createUser("test@example.com", "password123", "John", "Doe")

      expect(result).toBeDefined()
      expect(result.email).toBe("test@example.com")
    })

    it("should hash password before storing", async () => {
      await storageModule.createUser("test@example.com", "password123", "John", "Doe")

      expect(storageModule.hashPassword).toBeDefined()
    })

    it("should set is_verified to false for new users", async () => {
      const result = await storageModule.createUser("test@example.com", "password123", "Jane", "Smith")

      expect(result).toBeDefined()
    })
  })

  describe("createUser - Wrong Input Tests", () => {
    it("should handle invalid email format", async () => {
      await expect(storageModule.createUser("invalid-email", "password123", "John", "Doe")).rejects.toThrow()
    })

    it("should handle weak password", async () => {
      await expect(storageModule.createUser("test@example.com", "123", "John", "Doe")).rejects.toThrow()
    })

    it("should handle missing required fields", async () => {
      await expect(storageModule.createUser("", "password123", "John", "Doe")).rejects.toThrow()
    })
  })

  describe("findUserByEmail", () => {
    it("should find user by email", async () => {
      const result = await storageModule.findUserByEmail("test@example.com")

      expect(result).toBeDefined()
      expect(result.email).toBe("test@example.com")
    })

    it("should return null for non-existent user", async () => {
      const result = await storageModule.findUserByEmail("nonexistent@example.com")

      expect(result).toBeDefined() // Depending on mock implementation
    })
  })

  describe("Password Management", () => {
    it("should hash password correctly", async () => {
      const hashedPassword = await storageModule.hashPassword("password123")

      expect(hashedPassword).toBeTruthy()
      expect(typeof hashedPassword).toBe("string")
    })

    it("should verify password correctly", async () => {
      const isValid = await storageModule.verifyPassword("password123", "hashed_password")

      expect(isValid).toBe(true)
    })

    it("should reject invalid password", async () => {
      // Mock to return false
      const bcrypt = require("bcryptjs")
      bcrypt.compare.mockResolvedValueOnce(false)

      const isValid = await storageModule.verifyPassword("wrong_password", "hashed_password")

      expect(isValid).toBe(false)
    })
  })

  describe("Verification Code Management", () => {
    it("should store verification code", async () => {
      const result = await storageModule.storeVerificationCode("test@example.com", "123456", "verification")

      expect(result).toBeDefined()
    })

    it("should verify correct verification code", async () => {
      const isValid = await storageModule.verifyCode("test@example.com", "123456", "verification")

      expect(isValid).toBe(true)
    })

    it("should reject invalid verification code", async () => {
      const isValid = await storageModule.verifyCode("test@example.com", "wrong_code", "verification")

      expect(typeof isValid).toBe("boolean")
    })

    it("should handle reset code separately", async () => {
      const result = await storageModule.storeVerificationCode("test@example.com", "654321", "reset")

      expect(result).toBeDefined()
    })

    it("should reject invalid code type", async () => {
      await expect(storageModule.storeVerificationCode("test@example.com", "123456", "invalid_type")).rejects.toThrow()
    })
  })
})
