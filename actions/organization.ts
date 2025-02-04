"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * Fetches an organization by its slug and verifies the user's membership.
 * @param slug - The slug of the organization to fetch.
 * @returns The organization object if found and the user is a member, otherwise null.
 */
export async function getOrganization({ slug }: { slug: string }) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("User not found");
  }

  // Fetch the user from the database using Clerk's user ID
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Fetch the organization by its slug
  const organization = await clerkClient().organizations.getOrganization({
    slug,
  });

  if (!organization) {
    return null;
  }

  // Fetch all memberships for the organization
  const { data: memberships } =
    await clerkClient().organizations.getOrganizationMembershipList({
      organizationId: organization.id,
    });

  // Check if the current user is a member of the organization
  const userMembership = memberships.find(
    (member) => member.publicUserData?.userId === userId,
  );

  if (!userMembership) {
    return null;
  }

  return organization;
}

/**
 * Fetches all projects for a given organization ID.
 * @param orgId - The ID of the organization.
 * @returns A list of projects for the organization.
 */
export async function getProjects({ orgId }: { orgId: string }) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("User not found");
  }

  // Fetch the user from the database using Clerk's user ID
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Fetch all projects for the organization, ordered by creation date
  const { data: projects } = await db.project.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
  });

  return projects;
}

/**
 * Fetches all issues assigned to or reported by a specific user within an organization.
 * @param userId - The ID of the user.
 * @returns A list of issues associated with the user.
 */
export async function getUserIssues({ userId }: { userId: string }) {
  const { orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("No user ID or organization ID found");
  }

  // Fetch the user from the database using Clerk's user ID
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Fetch all issues where the user is either the assignee or reporter
  const issues = await db.issue.findMany({
    where: {
      OR: [{ assigneeId: user.id }, { reporterId: user.id }],
      project: { organizationId: orgId },
    },
    include: {
      project: true,
      assignee: true,
      reporter: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return issues;
}

/**
 * Fetches all users belonging to a specific organization.
 * @param orgId - The ID of the organization.
 * @returns A list of users in the organization.
 */
export async function getOrganizationUsers({ orgId }: { orgId: string }) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Fetch the user from the database using Clerk's user ID
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Fetch all memberships for the organization
  const organizationMemberships =
    await clerkClient().organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

  // Extract user IDs from memberships, filtering out null or undefined values
  const userIds = organizationMemberships.data
    .map((membership) => membership.publicUserData?.userId)
    .filter(
      (userId): userId is string => userId !== undefined && userId !== null,
    );

  // Fetch all users corresponding to the extracted user IDs
  const users = await db.user.findMany({
    where: { clerkUserId: { in: userIds } },
  });

  return users;
}
