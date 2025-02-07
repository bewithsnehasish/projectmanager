"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

// Define the shape of an assignee
interface Assignee {
  id: string;
  name: string;
  email: string;
}

// Define the shape of a reporter
interface Reporter {
  id: string;
  name: string;
  email: string;
}

// Define the shape of a project
interface Project {
  id: string;
  adminIds: string[];
  organizationId: string;
}

// Define the shape of an issue
interface Issue {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  projectId: string;
  sprintId: string | null;
  reporterId: string;
  assigneeId: string | null;
  order: number;
  assignee?: Assignee;
  reporter?: Reporter;
  project?: Project;
}

// Define the shape of the data for creating an issue
interface CreateIssueData {
  title: string;
  description: string;
  status: string;
  priority: string;
  sprintId?: string;
  assigneeId?: string;
}

// Define the shape of the data for updating an issue
interface UpdateIssueData {
  status?: string;
  priority?: string;
}

// Define the shape of the data for updating issue order
interface UpdatedIssue {
  id: string;
  status: string;
  order: number;
}

/**
 * Fetches issues for a specific sprint.
 * @param sprintId - The ID of the sprint.
 * @returns A list of issues for the sprint.
 * @throws Error if the user is unauthorized.
 */
export async function getIssuesForSprint(sprintId: string): Promise<Issue[]> {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const issues = await db.issue.findMany({
    where: { sprintId },
    orderBy: [{ status: "asc" }, { order: "asc" }],
    include: {
      assignee: true,
      reporter: true,
    },
  });

  return issues;
}

/**
 * Creates a new issue in a project.
 * @param projectId - The ID of the project.
 * @param data - The data for the new issue.
 * @returns The created issue.
 * @throws Error if the user is unauthorized.
 */
export async function createIssue(
  projectId: string,
  data: CreateIssueData,
): Promise<Issue> {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  // Fetch the user from the database
  const user = await db.user.findUnique({ where: { clerkUserId: userId } });

  if (!user) {
    throw new Error("User not found");
  }

  // Find the last issue in the same project and status to determine the new order
  const lastIssue = await db.issue.findFirst({
    where: { projectId, status: data.status },
    orderBy: { order: "desc" },
  });

  const newOrder = lastIssue ? lastIssue.order + 1 : 0;

  // Create the new issue
  const issue = await db.issue.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      projectId,
      sprintId: data.sprintId || null,
      reporterId: user.id,
      assigneeId: data.assigneeId || null,
      order: newOrder,
    },
    include: {
      assignee: true,
      reporter: true,
    },
  });

  return issue;
}

/**
 * Updates the order of multiple issues.
 * @param updatedIssues - The list of issues with updated order and status.
 * @returns An object indicating success.
 * @throws Error if the user is unauthorized.
 */
export async function updateIssueOrder(
  updatedIssues: UpdatedIssue[],
): Promise<{ success: boolean }> {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  // Start a transaction to update multiple issues
  await db.$transaction(async (prisma: PrismaClient) => {
    for (const issue of updatedIssues) {
      await prisma.issue.update({
        where: { id: issue.id },
        data: {
          status: issue.status,
          order: issue.order,
        },
      });
    }
  });

  return { success: true };
}

/**
 * Deletes an issue.
 * @param issueId - The ID of the issue to delete.
 * @returns An object indicating success.
 * @throws Error if the user is unauthorized or the issue is not found.
 */
export async function deleteIssue(
  issueId: string,
): Promise<{ success: boolean }> {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  // Fetch the user from the database
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Fetch the issue to be deleted
  const issue = await db.issue.findUnique({
    where: { id: issueId },
    include: { project: true },
  });

  if (!issue) {
    throw new Error("Issue not found");
  }

  // Check if the user has permission to delete the issue
  if (
    issue.reporterId !== user.id &&
    !issue.project?.adminIds.includes(user.id)
  ) {
    throw new Error("You don't have permission to delete this issue");
  }

  // Delete the issue
  await db.issue.delete({ where: { id: issueId } });

  return { success: true };
}

/**
 * Updates an issue.
 * @param issueId - The ID of the issue to update.
 * @param data - The data to update the issue with.
 * @returns The updated issue.
 * @throws Error if the user is unauthorized or the issue is not found.
 */
export async function updateIssue(
  issueId: string,
  data: UpdateIssueData,
): Promise<Issue> {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    // Fetch the issue to be updated
    const issue = await db.issue.findUnique({
      where: { id: issueId },
      include: { project: true },
    });

    if (!issue) {
      throw new Error("Issue not found");
    }

    // Check if the user has permission to update the issue
    if (issue.project?.organizationId !== orgId) {
      throw new Error("Unauthorized");
    }

    // Update the issue
    const updatedIssue = await db.issue.update({
      where: { id: issueId },
      data: {
        status: data.status,
        priority: data.priority,
      },
      include: {
        assignee: true,
        reporter: true,
      },
    });

    return updatedIssue;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error("Error updating issue: " + error.message);
    } else {
      throw new Error("Error updating issue: An unknown error occurred.");
    }
  }
}
