import { test, expect, vi, beforeEach, afterEach, describe } from "vitest";

// Mock server-only before importing auth
vi.mock("server-only", () => ({}));

// Mock next/headers with factory function
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

// Mock jose with factory function
vi.mock("jose", () => ({
  SignJWT: vi.fn(),
  jwtVerify: vi.fn(),
}));

// Import after mocks are declared
import { createSession } from "../auth";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

beforeEach(() => {
  vi.clearAllMocks();

  // Setup cookies mock
  const mockSet = vi.fn();
  (cookies as any).mockResolvedValue({
    set: mockSet,
    get: vi.fn(),
    delete: vi.fn(),
  });

  // Setup SignJWT mock
  const mockSign = vi.fn().mockResolvedValue("mock-jwt-token");
  const mockSetIssuedAt = vi.fn().mockReturnValue({ sign: mockSign });
  const mockSetExpirationTime = vi.fn().mockReturnValue({ setIssuedAt: mockSetIssuedAt });
  const mockSetProtectedHeader = vi.fn().mockReturnValue({ setExpirationTime: mockSetExpirationTime });

  (SignJWT as any).mockImplementation(() => ({
    setProtectedHeader: mockSetProtectedHeader,
  }));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createSession", () => {
  test("creates session with valid userId and email", async () => {
    const userId = "user-123";
    const email = "test@example.com";

    await createSession(userId, email);

    expect(cookies).toHaveBeenCalled();
  });

  test("sets cookie with JWT token", async () => {
    const userId = "user-456";
    const email = "user@test.com";

    await createSession(userId, email);

    const mockCookieStore = await (cookies as any)();
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      "auth-token",
      "mock-jwt-token",
      expect.any(Object)
    );
  });

  test("sets cookie with httpOnly flag", async () => {
    await createSession("user-id", "test@example.com");

    const mockCookieStore = await (cookies as any)();
    const cookieOptions = mockCookieStore.set.mock.calls[0][2];
    expect(cookieOptions.httpOnly).toBe(true);
  });

  test("sets cookie with correct path", async () => {
    await createSession("user-id", "test@example.com");

    const mockCookieStore = await (cookies as any)();
    const cookieOptions = mockCookieStore.set.mock.calls[0][2];
    expect(cookieOptions.path).toBe("/");
  });

  test("sets cookie with sameSite lax", async () => {
    await createSession("user-id", "test@example.com");

    const mockCookieStore = await (cookies as any)();
    const cookieOptions = mockCookieStore.set.mock.calls[0][2];
    expect(cookieOptions.sameSite).toBe("lax");
  });

  test("sets cookie expiration to 7 days from now", async () => {
    const now = new Date("2024-01-01T00:00:00Z");
    vi.setSystemTime(now);

    await createSession("user-id", "test@example.com");

    const mockCookieStore = await (cookies as any)();
    const cookieOptions = mockCookieStore.set.mock.calls[0][2];
    const expectedExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    expect(cookieOptions.expires).toEqual(expectedExpiry);

    vi.useRealTimers();
  });

  test("sets secure flag to false in development", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    await createSession("user-id", "test@example.com");

    const mockCookieStore = await (cookies as any)();
    const cookieOptions = mockCookieStore.set.mock.calls[0][2];
    expect(cookieOptions.secure).toBe(false);

    process.env.NODE_ENV = originalEnv;
  });

  test("sets secure flag to true in production", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    await createSession("user-id", "test@example.com");

    const mockCookieStore = await (cookies as any)();
    const cookieOptions = mockCookieStore.set.mock.calls[0][2];
    expect(cookieOptions.secure).toBe(true);

    process.env.NODE_ENV = originalEnv;
  });

  test("creates JWT with HS256 algorithm", async () => {
    await createSession("user-id", "test@example.com");

    const mockInstance = (SignJWT as any).mock.results[0].value;
    expect(mockInstance.setProtectedHeader).toHaveBeenCalledWith({ alg: "HS256" });
  });

  test("handles empty userId", async () => {
    await createSession("", "test@example.com");

    expect(cookies).toHaveBeenCalled();
  });

  test("handles empty email", async () => {
    await createSession("user-id", "");

    expect(cookies).toHaveBeenCalled();
  });

  test("handles special characters in email", async () => {
    const specialEmail = "test+tag@example.com";

    await createSession("user-id", specialEmail);

    expect(cookies).toHaveBeenCalled();
  });

  test("handles long userId", async () => {
    const longUserId = "a".repeat(1000);

    await createSession(longUserId, "test@example.com");

    expect(cookies).toHaveBeenCalled();
  });

  test("calls cookies function from next/headers", async () => {
    await createSession("user-id", "test@example.com");

    expect(cookies).toHaveBeenCalledTimes(1);
  });

  test("sets cookie name to auth-token", async () => {
    await createSession("user-id", "test@example.com");

    const mockCookieStore = await (cookies as any)();
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      "auth-token",
      expect.any(String),
      expect.any(Object)
    );
  });
});
