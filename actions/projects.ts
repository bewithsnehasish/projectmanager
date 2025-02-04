import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

interface ProjectData {
  name: string;
  key: string;
  description: string;
}

/**
 * Creates a new project in the organization.
 * Only organization admins are allowed to create projects.
 * @param data - The project data including name, key, and description.
 * @returns The created project object.
 * @throws Error if the user is unauthorized, the organization is not found, or the user is not an admin.
 */
export async function createProject({ data }: { data: ProjectData }) {
  const { userId, orgId } = auth();

  // Validate user authentication
  if (!userId) {
    throw new Error("Unauthorized: User not authenticated.");
  }

  // Validate organization ID
  if (!orgId) {
    throw new Error("Organization not found: No organization ID provided.");
  }

  // Fetch the user's membership in the organization
  const { data: membershipList } =
    await clerkClient().organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

  // Check if the user is a member of the organization and has admin role
  const userMembership = membershipList.find(
    (membership) => membership.publicUserData?.userId === userId,
  );

  if (!userMembership || userMembership.role !== "org:admin") {
    throw new Error(
      "Permission denied: Only organization admins can create projects.",
    );
  }

  try {
    // Create the project in the database
    const project = await db.project.create({
      data: {
        name: data.name,
        key: data.key,
        description: data.description,
        organizationId: orgId,
      },
    });

    return project;
  } catch (error: unknown) {
    // Handle errors during project creation
    if (error instanceof Error) {
      throw new Error(`Error creating project: ${error.message}`);
    } else {
      throw new Error("Error creating project: An unknown error occurred.");
    }
  }
}
