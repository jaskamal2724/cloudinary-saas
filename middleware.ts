import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  "/sign-in",
  "/sign-up",
  "/home",
]);

const isPublicApiRoute = createRouteMatcher([
  "/api/videos",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const currentUrl = new URL(req.url);
  const isAccessingDashboard = currentUrl.pathname === "/home";
  const isRootPath = currentUrl.pathname === "/";
  const isApiRequest = currentUrl.pathname.startsWith("/api");

  // User logged in, trying to access the root or another public route
  if (userId) {
    if (isPublicRoute(req) && !isAccessingDashboard) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
    
    // Handle root path redirection to home after login
    if (isRootPath) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
  }

  // User not logged in
  if (!userId) {
    if (!isPublicRoute(req) && !isPublicApiRoute(req)) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    if (isApiRequest && !isPublicApiRoute(req)) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
