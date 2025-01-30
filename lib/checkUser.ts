import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    console.log("No user found.");
    return null;
  }

  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      console.log("User already exists:");
      return loggedInUser;
    }

    const name = `${user.firstName} ${user.lastName}`;
    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
      console.error("User email not found.");
      return null;
    }

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        image: user.imageUrl,
        email,
      },
    });

    console.log("New user created:");
    return newUser;
  } catch (error) {
    console.error("Error in checkUser:", error);
    return null;
  }
};
