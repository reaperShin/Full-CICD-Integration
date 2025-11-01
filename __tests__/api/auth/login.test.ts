/**
 * @jest-environment node
 */

import { jest } from "@jest/globals";

// ✅ 1. Mock before importing anything
jest.unstable_mockModule("@/lib/storage", () => ({
  findUserByEmail: jest.fn(),
  verifyPassword: jest.fn(),
}));

jest.unstable_mockModule("@/lib/auth", () => ({
  createAuthToken: jest.fn(() => Promise.resolve("mocked-token")),
}));

// ✅ 2. Declare placeholders for imports
let POST: any;
let findUserByEmail: jest.Mock;
let verifyPassword: jest.Mock;
let createAuthToken: jest.Mock;
let NextRequest: typeof import("next/server").NextRequest;

// ✅ 3. Import dynamically in beforeAll
beforeAll(async () => {
  // Dynamic imports after mocks
  const routeModule = await import("@/app/api/auth/login/route");
  const storageModule = await import("@/lib/storage");
  const authModule = await import("@/lib/auth");
  const nextServer = await import("next/server");

  POST = routeModule.POST;
  findUserByEmail = storageModule.findUserByEmail as jest.Mock;
  verifyPassword = storageModule.verifyPassword as jest.Mock;
  createAuthToken = authModule.createAuthToken as jest.Mock;
  NextRequest = nextServer.NextRequest;

  // Silence console errors (optional)
  jest.spyOn(console, "error").mockImplementation(() => { });
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ✅ 4. Tests now work
describe("/api/auth/login", () => {
  it("validates required fields", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        // Missing password
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Email and password are required");
  });
});
