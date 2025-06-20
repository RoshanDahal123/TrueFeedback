// import { NextResponse, NextRequest } from "next/server";
// export { default } from "next-auth/middleware";
// import { getToken } from "next-auth/jwt";

// export async function middleware(request: NextRequest) {
//   const token = await getToken({ req: request });
//   const url = request.nextUrl;

//   if (
//     token &&
//     (url.pathname.startsWith("/sign-in") ||
//       url.pathname.startsWith("/sign-up") ||
//       url.pathname.startsWith("/verify") ||
//       url.pathname.startsWith("/"))
//   ) {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }
//   return NextResponse.redirect(new URL("/home", request.url));
// }

// // See "Matching Paths" below to learn more
// export const config = {
//   matcher: [
//     "/sign-in",
//     "/sign-up",
//     "/",
//     "/dashboard/:path*",
//     "/verify/:path*",
//     "/home",
//   ],
// };
import { NextResponse, NextRequest } from "next/server";

import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  if (token) {
    // If token exists and user is trying to access auth pages or home, redirect to dashboard
    if (
      url.pathname === "/" ||
      url.pathname.startsWith("/sign-in") ||
      url.pathname.startsWith("/sign-up") ||
      url.pathname.startsWith("/verify")
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } else {
    // If no token and user tries to access protected pages, redirect to home
    if (
      url.pathname.startsWith("/dashboard") ||
      url.pathname.startsWith("/verify")
    ) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  // No redirection needed
  if (url.pathname.startsWith("/api")) {
    return NextResponse.next(); // skip API requests
  }
}

export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico).*)", // Exclude API and Next.js internal routes
  ],
};
