// components/ProjectList.tsx
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getProjects } from "@/actions/organizations";
import DeleteProject from "./DeleteProject";

interface Project {
  id: string;
  name: string;
  description: string;
}

interface ProjectListProps {
  orgId: string;
}

export default async function ProjectList({
  orgId,
}: ProjectListProps): Promise<JSX.Element> {
  const projects: Project[] = await getProjects({ orgId });

  if (!projects || projects.length === 0) {
    return (
      <p>
        <span className="text-white">No projects found. </span>
        <Link
          className="underline underline-offset-2 text-blue-200"
          href="/project/create"
        >
          Create New.
        </Link>
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              {project.name}
              <DeleteProject projectId={project.id} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">{project.description}</p>
            <Link
              href={`/project/${project.id}`}
              className="text-blue-500 hover:underline"
            >
              View Project
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
