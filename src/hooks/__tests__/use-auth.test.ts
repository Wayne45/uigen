import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { signIn as signInAction, signUp as signUpAction } from "@/actions";
import {
  getAnonWorkData,
  clearAnonWork,
} from "@/lib/anon-work-tracker";
import { getProjects } from "@/actions/get-projects";
import { createProject } from "@/actions/create-project";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/actions", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@/lib/anon-work-tracker", () => ({
  getAnonWorkData: vi.fn(),
  clearAnonWork: vi.fn(),
}));

vi.mock("@/actions/get-projects", () => ({
  getProjects: vi.fn(),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: vi.fn(),
}));

describe("useAuth", () => {
  const mockPush = vi.fn();
  const mockRouter = { push: mockPush };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as Mock).mockReturnValue(mockRouter);
  });

  describe("initial state", () => {
    it("should return initial state with isLoading as false", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.signIn).toBeInstanceOf(Function);
      expect(result.current.signUp).toBeInstanceOf(Function);
    });
  });

  describe("signIn", () => {
    it("should sign in successfully and handle post-sign-in with anonymous work", async () => {
      const mockAnonWork = {
        messages: [{ role: "user", content: "test message" }],
        fileSystemData: { "/App.jsx": "test content" },
      };
      const mockProject = { id: "project-123" };

      (signInAction as Mock).mockResolvedValue({ success: true });
      (getAnonWorkData as Mock).mockReturnValue(mockAnonWork);
      (createProject as Mock).mockResolvedValue(mockProject);

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);

      const authResult = await result.current.signIn("test@example.com", "password123");

      expect(authResult).toEqual({ success: true });
      expect(signInAction).toHaveBeenCalledWith("test@example.com", "password123");
      expect(getAnonWorkData).toHaveBeenCalled();
      expect(createProject).toHaveBeenCalledWith({
        name: expect.stringContaining("Design from"),
        messages: mockAnonWork.messages,
        data: mockAnonWork.fileSystemData,
      });
      expect(clearAnonWork).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/project-123");
      expect(result.current.isLoading).toBe(false);
    });

    it("should sign in successfully and redirect to most recent project when no anonymous work", async () => {
      const mockProjects = [
        { id: "project-1", name: "Project 1" },
        { id: "project-2", name: "Project 2" },
      ];

      (signInAction as Mock).mockResolvedValue({ success: true });
      (getAnonWorkData as Mock).mockReturnValue(null);
      (getProjects as Mock).mockResolvedValue(mockProjects);

      const { result } = renderHook(() => useAuth());

      const authResult = await result.current.signIn("test@example.com", "password123");

      expect(authResult).toEqual({ success: true });
      expect(signInAction).toHaveBeenCalledWith("test@example.com", "password123");
      expect(getAnonWorkData).toHaveBeenCalled();
      expect(getProjects).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/project-1");
      expect(result.current.isLoading).toBe(false);
    });

    it("should sign in successfully and create new project when no projects exist", async () => {
      const mockProject = { id: "new-project-123" };

      (signInAction as Mock).mockResolvedValue({ success: true });
      (getAnonWorkData as Mock).mockReturnValue(null);
      (getProjects as Mock).mockResolvedValue([]);
      (createProject as Mock).mockResolvedValue(mockProject);

      const { result } = renderHook(() => useAuth());

      const authResult = await result.current.signIn("test@example.com", "password123");

      expect(authResult).toEqual({ success: true });
      expect(signInAction).toHaveBeenCalledWith("test@example.com", "password123");
      expect(getAnonWorkData).toHaveBeenCalled();
      expect(getProjects).toHaveBeenCalled();
      expect(createProject).toHaveBeenCalledWith({
        name: expect.stringMatching(/^New Design #\d+$/),
        messages: [],
        data: {},
      });
      expect(mockPush).toHaveBeenCalledWith("/new-project-123");
      expect(result.current.isLoading).toBe(false);
    });

    it("should handle anonymous work with empty messages array", async () => {
      const mockProjects = [{ id: "project-1", name: "Project 1" }];

      (signInAction as Mock).mockResolvedValue({ success: true });
      (getAnonWorkData as Mock).mockReturnValue({
        messages: [],
        fileSystemData: {},
      });
      (getProjects as Mock).mockResolvedValue(mockProjects);

      const { result } = renderHook(() => useAuth());

      const authResult = await result.current.signIn("test@example.com", "password123");

      expect(authResult).toEqual({ success: true });
      expect(getAnonWorkData).toHaveBeenCalled();
      expect(createProject).not.toHaveBeenCalled();
      expect(clearAnonWork).not.toHaveBeenCalled();
      expect(getProjects).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/project-1");
    });

    it("should return error result when sign in fails", async () => {
      const errorResult = { success: false, error: "Invalid credentials" };

      (signInAction as Mock).mockResolvedValue(errorResult);

      const { result } = renderHook(() => useAuth());

      const authResult = await result.current.signIn("test@example.com", "wrongpassword");

      expect(authResult).toEqual(errorResult);
      expect(signInAction).toHaveBeenCalledWith("test@example.com", "wrongpassword");
      expect(getAnonWorkData).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
    });

    it("should set isLoading to false even if post-sign-in throws error", async () => {
      (signInAction as Mock).mockResolvedValue({ success: true });
      (getAnonWorkData as Mock).mockImplementation(() => {
        throw new Error("Storage error");
      });

      const { result } = renderHook(() => useAuth());

      await expect(
        result.current.signIn("test@example.com", "password123")
      ).rejects.toThrow("Storage error");

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("signUp", () => {
    it("should sign up successfully and handle post-sign-in with anonymous work", async () => {
      const mockAnonWork = {
        messages: [{ role: "user", content: "test message" }],
        fileSystemData: { "/App.jsx": "test content" },
      };
      const mockProject = { id: "project-456" };

      (signUpAction as Mock).mockResolvedValue({ success: true });
      (getAnonWorkData as Mock).mockReturnValue(mockAnonWork);
      (createProject as Mock).mockResolvedValue(mockProject);

      const { result } = renderHook(() => useAuth());

      const authResult = await result.current.signUp("new@example.com", "password123");

      expect(authResult).toEqual({ success: true });
      expect(signUpAction).toHaveBeenCalledWith("new@example.com", "password123");
      expect(getAnonWorkData).toHaveBeenCalled();
      expect(createProject).toHaveBeenCalledWith({
        name: expect.stringContaining("Design from"),
        messages: mockAnonWork.messages,
        data: mockAnonWork.fileSystemData,
      });
      expect(clearAnonWork).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/project-456");
      expect(result.current.isLoading).toBe(false);
    });

    it("should sign up successfully and redirect to most recent project when no anonymous work", async () => {
      const mockProjects = [{ id: "project-1", name: "Project 1" }];

      (signUpAction as Mock).mockResolvedValue({ success: true });
      (getAnonWorkData as Mock).mockReturnValue(null);
      (getProjects as Mock).mockResolvedValue(mockProjects);

      const { result } = renderHook(() => useAuth());

      const authResult = await result.current.signUp("new@example.com", "password123");

      expect(authResult).toEqual({ success: true });
      expect(signUpAction).toHaveBeenCalledWith("new@example.com", "password123");
      expect(getProjects).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/project-1");
    });

    it("should sign up successfully and create new project when no projects exist", async () => {
      const mockProject = { id: "new-project-789" };

      (signUpAction as Mock).mockResolvedValue({ success: true });
      (getAnonWorkData as Mock).mockReturnValue(null);
      (getProjects as Mock).mockResolvedValue([]);
      (createProject as Mock).mockResolvedValue(mockProject);

      const { result } = renderHook(() => useAuth());

      const authResult = await result.current.signUp("new@example.com", "password123");

      expect(authResult).toEqual({ success: true });
      expect(createProject).toHaveBeenCalledWith({
        name: expect.stringMatching(/^New Design #\d+$/),
        messages: [],
        data: {},
      });
      expect(mockPush).toHaveBeenCalledWith("/new-project-789");
    });

    it("should return error result when sign up fails", async () => {
      const errorResult = { success: false, error: "Email already registered" };

      (signUpAction as Mock).mockResolvedValue(errorResult);

      const { result } = renderHook(() => useAuth());

      const authResult = await result.current.signUp("existing@example.com", "password123");

      expect(authResult).toEqual(errorResult);
      expect(signUpAction).toHaveBeenCalledWith("existing@example.com", "password123");
      expect(getAnonWorkData).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
    });

    it("should set isLoading to false even if post-sign-in throws error", async () => {
      (signUpAction as Mock).mockResolvedValue({ success: true });
      (getAnonWorkData as Mock).mockImplementation(() => {
        throw new Error("Storage error");
      });

      const { result } = renderHook(() => useAuth());

      await expect(
        result.current.signUp("new@example.com", "password123")
      ).rejects.toThrow("Storage error");

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("loading state", () => {
    it("should manage loading state during sign in", async () => {
      let resolveSignIn: (value: any) => void;
      const signInPromise = new Promise((resolve) => {
        resolveSignIn = resolve;
      });

      (signInAction as Mock).mockReturnValue(signInPromise);
      (getAnonWorkData as Mock).mockReturnValue(null);
      (getProjects as Mock).mockResolvedValue([]);
      (createProject as Mock).mockResolvedValue({ id: "project-123" });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);

      let signInCallPromise: Promise<any>;
      act(() => {
        signInCallPromise = result.current.signIn("test@example.com", "password123");
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await act(async () => {
        resolveSignIn!({ success: true });
        await signInCallPromise!;
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("should manage loading state during sign up", async () => {
      let resolveSignUp: (value: any) => void;
      const signUpPromise = new Promise((resolve) => {
        resolveSignUp = resolve;
      });

      (signUpAction as Mock).mockReturnValue(signUpPromise);
      (getAnonWorkData as Mock).mockReturnValue(null);
      (getProjects as Mock).mockResolvedValue([]);
      (createProject as Mock).mockResolvedValue({ id: "project-123" });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);

      let signUpCallPromise: Promise<any>;
      act(() => {
        signUpCallPromise = result.current.signUp("new@example.com", "password123");
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await act(async () => {
        resolveSignUp!({ success: true });
        await signUpCallPromise!;
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("edge cases", () => {
    it("should handle createProject with timestamp in project name", async () => {
      const mockAnonWork = {
        messages: [{ role: "user", content: "test" }],
        fileSystemData: {},
      };
      const mockProject = { id: "project-time" };

      (signInAction as Mock).mockResolvedValue({ success: true });
      (getAnonWorkData as Mock).mockReturnValue(mockAnonWork);
      (createProject as Mock).mockResolvedValue(mockProject);

      const dateSpy = vi.spyOn(Date.prototype, "toLocaleTimeString");
      dateSpy.mockReturnValue("12:34:56 PM");

      const { result } = renderHook(() => useAuth());

      await result.current.signIn("test@example.com", "password123");

      expect(createProject).toHaveBeenCalledWith({
        name: "Design from 12:34:56 PM",
        messages: mockAnonWork.messages,
        data: mockAnonWork.fileSystemData,
      });

      dateSpy.mockRestore();
    });

    it("should handle random project number generation", async () => {
      (signInAction as Mock).mockResolvedValue({ success: true });
      (getAnonWorkData as Mock).mockReturnValue(null);
      (getProjects as Mock).mockResolvedValue([]);
      (createProject as Mock).mockResolvedValue({ id: "project-random" });

      const mathSpy = vi.spyOn(Math, "random");
      mathSpy.mockReturnValue(0.12345);

      const { result } = renderHook(() => useAuth());

      await result.current.signIn("test@example.com", "password123");

      expect(createProject).toHaveBeenCalledWith({
        name: "New Design #12345",
        messages: [],
        data: {},
      });

      mathSpy.mockRestore();
    });

    it("should not call clearAnonWork when anonWork is null", async () => {
      (signInAction as Mock).mockResolvedValue({ success: true });
      (getAnonWorkData as Mock).mockReturnValue(null);
      (getProjects as Mock).mockResolvedValue([{ id: "project-1" }]);

      const { result } = renderHook(() => useAuth());

      await result.current.signIn("test@example.com", "password123");

      expect(clearAnonWork).not.toHaveBeenCalled();
    });

    it("should not navigate when sign in fails", async () => {
      (signInAction as Mock).mockResolvedValue({
        success: false,
        error: "Network error",
      });

      const { result } = renderHook(() => useAuth());

      await result.current.signIn("test@example.com", "password123");

      expect(mockPush).not.toHaveBeenCalled();
      expect(getAnonWorkData).not.toHaveBeenCalled();
      expect(getProjects).not.toHaveBeenCalled();
    });

    it("should handle multiple concurrent sign in attempts", async () => {
      (signInAction as Mock).mockResolvedValue({ success: true });
      (getAnonWorkData as Mock).mockReturnValue(null);
      (getProjects as Mock).mockResolvedValue([{ id: "project-1" }]);

      const { result } = renderHook(() => useAuth());

      const promise1 = result.current.signIn("test1@example.com", "password1");
      const promise2 = result.current.signIn("test2@example.com", "password2");

      await Promise.all([promise1, promise2]);

      expect(signInAction).toHaveBeenCalledTimes(2);
      expect(signInAction).toHaveBeenCalledWith("test1@example.com", "password1");
      expect(signInAction).toHaveBeenCalledWith("test2@example.com", "password2");
    });
  });
});