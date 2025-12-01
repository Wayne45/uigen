import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

test("displays creating message for str_replace_editor create command", () => {
  const toolInvocation = {
    toolName: "str_replace_editor",
    state: "result",
    args: {
      command: "create",
      path: "/src/components/Button.tsx",
    },
    result: "Success",
  };

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("displays editing message for str_replace_editor str_replace command", () => {
  const toolInvocation = {
    toolName: "str_replace_editor",
    state: "result",
    args: {
      command: "str_replace",
      path: "/src/App.tsx",
      old_str: "old text",
      new_str: "new text",
    },
    result: "Success",
  };

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Editing App.tsx")).toBeDefined();
});

test("displays inserting message for str_replace_editor insert command", () => {
  const toolInvocation = {
    toolName: "str_replace_editor",
    state: "result",
    args: {
      command: "insert",
      path: "/index.html",
      insert_line: 10,
      new_str: "new content",
    },
    result: "Success",
  };

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Inserting into index.html")).toBeDefined();
});

test("displays viewing message for str_replace_editor view command", () => {
  const toolInvocation = {
    toolName: "str_replace_editor",
    state: "result",
    args: {
      command: "view",
      path: "/README.md",
    },
    result: "File content",
  };

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Viewing README.md")).toBeDefined();
});

test("displays renaming message for file_manager rename command", () => {
  const toolInvocation = {
    toolName: "file_manager",
    state: "result",
    args: {
      command: "rename",
      path: "/old-name.tsx",
      new_path: "/new-name.tsx",
    },
    result: { success: true },
  };

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Renaming old-name.tsx to new-name.tsx")).toBeDefined();
});

test("displays deleting message for file_manager delete command", () => {
  const toolInvocation = {
    toolName: "file_manager",
    state: "result",
    args: {
      command: "delete",
      path: "/components/OldComponent.tsx",
    },
    result: { success: true },
  };

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Deleting OldComponent.tsx")).toBeDefined();
});

test("shows loading spinner when tool is in progress", () => {
  const toolInvocation = {
    toolName: "str_replace_editor",
    state: "in-progress",
    args: {
      command: "create",
      path: "/Loading.tsx",
    },
  };

  const { container } = render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  // Check for the loading spinner by class
  const spinner = container.querySelector(".animate-spin");
  expect(spinner).toBeDefined();
  expect(screen.getByText("Creating Loading.tsx")).toBeDefined();
});

test("shows success indicator when tool is completed", () => {
  const toolInvocation = {
    toolName: "str_replace_editor",
    state: "result",
    args: {
      command: "create",
      path: "/Success.tsx",
    },
    result: "Created successfully",
  };

  const { container } = render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  // Check for the green success dot
  const successDot = container.querySelector(".bg-emerald-500");
  expect(successDot).toBeDefined();
  expect(screen.getByText("Creating Success.tsx")).toBeDefined();
});

test("handles paths without directory separators", () => {
  const toolInvocation = {
    toolName: "str_replace_editor",
    state: "result",
    args: {
      command: "create",
      path: "simple.txt",
    },
    result: "Success",
  };

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Creating simple.txt")).toBeDefined();
});

test("handles deeply nested paths", () => {
  const toolInvocation = {
    toolName: "str_replace_editor",
    state: "result",
    args: {
      command: "edit",
      path: "/src/components/ui/forms/inputs/TextInput.tsx",
    },
    result: "Success",
  };

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Modifying TextInput.tsx")).toBeDefined();
});

test("displays default message for unknown tool", () => {
  const toolInvocation = {
    toolName: "unknown_tool",
    state: "result",
    args: {},
    result: "Success",
  };

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("unknown_tool")).toBeDefined();
});

test("displays default message for str_replace_editor with unknown command", () => {
  const toolInvocation = {
    toolName: "str_replace_editor",
    state: "result",
    args: {
      command: "unknown_command",
      path: "/test.txt",
    },
    result: "Success",
  };

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Modifying test.txt")).toBeDefined();
});

test("displays default message for file_manager with unknown command", () => {
  const toolInvocation = {
    toolName: "file_manager",
    state: "result",
    args: {
      command: "unknown_command",
      path: "/test.txt",
    },
    result: "Success",
  };

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Managing test.txt")).toBeDefined();
});

test("handles missing args gracefully", () => {
  const toolInvocation = {
    toolName: "str_replace_editor",
    state: "result",
    result: "Success",
  };

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Modifying")).toBeDefined();
});

test("handles missing path in args", () => {
  const toolInvocation = {
    toolName: "str_replace_editor",
    state: "result",
    args: {
      command: "create",
    },
    result: "Success",
  };

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Creating")).toBeDefined();
});
