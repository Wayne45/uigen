import { getUser } from "@/actions";
import { getProjects } from "@/actions/get-projects";
import { createProject } from "@/actions/create-project";
import { ClientWrapper } from "./client-wrapper";
import { redirect } from "next/navigation";

export default async function Home() {
  console.log('[Home Page] Server-side rendering, typeof window:', typeof window);
  console.log('[Home Page] typeof localStorage:', typeof localStorage);
  console.log('[Home Page] typeof global.localStorage:', typeof (global as any).localStorage);

  try {
    const user = await getUser();
    console.log('[Home Page] User:', user ? 'authenticated' : 'anonymous');

    // If user is authenticated, redirect to their most recent project
    if (user) {
      const projects = await getProjects();

      if (projects.length > 0) {
        redirect(`/${projects[0].id}`);
      }

      // If no projects exist, create a new one
      const newProject = await createProject({
        name: `New Design #${~~(Math.random() * 100000)}`,
        messages: [],
        data: {},
      });

      redirect(`/${newProject.id}`);
    }

    // For anonymous users, show the main content without a project
    console.log('[Home Page] Returning ClientWrapper');
    return <ClientWrapper user={user} />;
  } catch (error) {
    console.error('[Home Page] Error during rendering:', error);
    console.error('[Home Page] Error stack:', error instanceof Error ? error.stack : 'No stack');
    throw error;
  }
}
