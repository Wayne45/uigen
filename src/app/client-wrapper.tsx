"use client";

import { MainContent } from "./main-content";
import { useEffect, useState } from "react";

interface ClientWrapperProps {
  user?: {
    id: string;
    email: string;
  } | null;
  project?: {
    id: string;
    name: string;
    messages: any[];
    data: any;
    createdAt: Date;
    updatedAt: Date;
  };
}

export function ClientWrapper({ user, project }: ClientWrapperProps) {
  const [mounted, setMounted] = useState(false);

  console.log('[ClientWrapper] Rendering, mounted:', mounted, 'typeof window:', typeof window);

  useEffect(() => {
    console.log('[ClientWrapper] useEffect - mounting client-side');
    setMounted(true);
  }, []);

  if (!mounted) {
    console.log('[ClientWrapper] Not mounted yet, showing loading...');
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-neutral-50">
        <div className="text-neutral-600">Loading...</div>
      </div>
    );
  }

  return <MainContent user={user} project={project} />;
}
