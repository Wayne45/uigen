"use client";

import { Loader2, FileEdit, Eye, FilePlus, FileText, Trash2, FolderTree } from "lucide-react";

interface ToolInvocation {
  toolName: string;
  state: string;
  args?: Record<string, any>;
  result?: any;
}

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

function getToolMessage(toolName: string, args?: Record<string, any>): { icon: React.ReactNode; message: string } {
  const fileName = args?.path ? args.path.split('/').pop() || args.path : '';

  if (toolName === "str_replace_editor") {
    const command = args?.command;
    switch (command) {
      case "create":
        return {
          icon: <FilePlus className="w-3 h-3" />,
          message: `Creating ${fileName}`,
        };
      case "str_replace":
        return {
          icon: <FileEdit className="w-3 h-3" />,
          message: `Editing ${fileName}`,
        };
      case "insert":
        return {
          icon: <FileEdit className="w-3 h-3" />,
          message: `Inserting into ${fileName}`,
        };
      case "view":
        return {
          icon: <Eye className="w-3 h-3" />,
          message: `Viewing ${fileName}`,
        };
      default:
        return {
          icon: <FileText className="w-3 h-3" />,
          message: `Modifying ${fileName}`,
        };
    }
  }

  if (toolName === "file_manager") {
    const command = args?.command;
    switch (command) {
      case "rename":
        const newFileName = args?.new_path ? args.new_path.split('/').pop() || args.new_path : '';
        return {
          icon: <FolderTree className="w-3 h-3" />,
          message: `Renaming ${fileName} to ${newFileName}`,
        };
      case "delete":
        return {
          icon: <Trash2 className="w-3 h-3" />,
          message: `Deleting ${fileName}`,
        };
      default:
        return {
          icon: <FileText className="w-3 h-3" />,
          message: `Managing ${fileName}`,
        };
    }
  }

  return {
    icon: <FileText className="w-3 h-3" />,
    message: toolName,
  };
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const { icon, message } = getToolMessage(toolInvocation.toolName, toolInvocation.args);
  const isCompleted = toolInvocation.state === "result" && toolInvocation.result;

  // Create tooltip text showing full path
  const tooltipText = toolInvocation.args?.path
    ? `Full path: ${toolInvocation.args.path}`
    : message;

  return (
    <div
      className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200"
      title={tooltipText}
    >
      {isCompleted ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-600">{icon}</span>
          <span className="text-neutral-700">{message}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-600">{icon}</span>
          <span className="text-neutral-700">{message}</span>
        </>
      )}
    </div>
  );
}
