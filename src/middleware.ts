import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { routeAccessMap } from "./lib/settings";
import { NextResponse } from "next/server";

const matchers = Object.keys(routeAccessMap)
  .sort((a, b) => b.length - a.length)
  .map((route) => ({
    matcher: createRouteMatcher([route]),
    allowedRoles: routeAccessMap[route],
  }));

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // ✅ BỎ QUA NEXT INTERNAL & STATIC
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  const authData = await auth();

  const role = (authData.sessionClaims?.metadata as { role?: string })?.role;

  // console.log("PATH:", pathname);
  // console.log("ROLE:", role);

  if (!role) {
    return NextResponse.next(); // ⭐ BẮT BUỘC
  }

  const rule = matchers.find(({ matcher }) => matcher(req));
  console.log("MATCHED RULE:", rule);

  if (!rule) {
    return NextResponse.next(); // ⭐ BẮT BUỘC
  }

  if (!rule.allowedRoles.includes(role)) {
    return NextResponse.redirect(new URL(`/${role}`, req.url));
  }

  // ⭐⭐ DÒNG QUAN TRỌNG NHẤT ⭐⭐
  return NextResponse.next();
});

// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// import { routeAccessMap } from "./lib/settings";
// import { NextResponse } from "next/server";

// const matchers = Object.keys(routeAccessMap)
//   .sort((a, b) => b.length - a.length) // ⭐ QUAN TRỌNG
//   .map((route) => ({
//     matcher: createRouteMatcher([route]),
//     allowedRoles: routeAccessMap[route],
//   }));

// export default clerkMiddleware(async (auth, req) => {
//   const authData = await auth();

//   const role = (
//     authData.sessionClaims as {
//       publicMetadata?: { role?: "admin" | "teacher" | "student" | "parent" };
//     }
//   )?.publicMetadata?.role;
//   if (!role) return;

//   const rule = matchers.find(({ matcher }) => matcher(req));
//   console.log("PATH:", req.nextUrl.pathname);
//   console.log("MATCHED RULE:", rule);
//   console.log("ROLE:", role);

//   if (!rule) return;

//   if (!rule.allowedRoles.includes(role)) {
//     return NextResponse.redirect(new URL(`/${role}`, req.url));
//   }
// });

// export const config = {
//   matcher: [
//     // Skip Next.js internals and all static files, unless found in search params
//     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
//     // Always run for API routes
//     "/(api|trpc)(.*)",
//   ],
// };
