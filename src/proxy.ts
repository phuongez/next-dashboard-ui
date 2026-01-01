import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { routeAccessMap } from "./lib/settings";
import { NextResponse } from "next/server";

const matchers = Object.keys(routeAccessMap).map((route) => ({
  matcher: createRouteMatcher([route]),
  allowedRoles: routeAccessMap[route],
}));

// export default clerkMiddleware((auth, req) => {
//   // if (isProtectedRoute(req)) auth().protect()

//   const { sessionClaims } = auth();

//   const role = (sessionClaims?.metadata as { role?: string })?.role;

// for (const { matcher, allowedRoles } of matchers) {
//   if (matcher(req) && !allowedRoles.includes(role!)) {
//     return NextResponse.redirect(new URL(`/${role}`, req.url));
//     }
//   }
// });
export default clerkMiddleware(async (auth, req) => {
  const authData = await auth();

  const role = authData.sessionClaims?.publicMetadata?.role as
    | string
    | undefined;
  if (!role) return;

  const rule = matchers.find(({ matcher }) => matcher(req));
  if (!rule) return;

  if (!rule.allowedRoles.includes(role)) {
    return NextResponse.redirect(new URL(`/${role}`, req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
