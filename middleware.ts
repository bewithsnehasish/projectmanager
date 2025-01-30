import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  "/onboarding(.*)",
  "/organisations(.*)",
  "/projects(.*)",
  "/issue(.*)",
]);

export default clerkMiddleware(
  async (auth, req) => {
    const { userId, redirectToSignIn } = await auth();
    if (!userId && isProtectedRoute(req)) {
      // Add custom logic to run before redirecting like to access to non-protected routes or authenticated users
      return redirectToSignIn();
    }

    if (
      auth().userId &&
      !auth().orgId &&
      req.nextUrl.pathname !== "/onboarding" &&
      req.nextUrl.pathname !== "/"
    ) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  },
  // { debug: true },
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
