"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function getOrganization({ slug }: { slug: string }) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("User not found");
  }

  // Get user from database using Clerk user ID
  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get organization by slug
  const organization = await clerkClient().organizations.getOrganization({
    slug,
  });

  if (!organization) {
    return null;
  }

  // Get organization memberships (corrected API call)
  const { data: memberships } =
    await clerkClient().organizations.getOrganizationMembershipList({
      organizationId: organization.id,
    });

  // Find user's membership using Clerk user ID (not database ID)
  const userMembership = memberships.find(
    (member) => member.publicUserData?.userId === userId, // Compare with Clerk's userId
  );

  if (!userMembership) {
    return null;
  }

  return organization;
}
