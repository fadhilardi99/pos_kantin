import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    // Role-based route protection
    if (pathname.startsWith("/dashboard/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (
      pathname.startsWith("/dashboard/cashier") &&
      token?.role !== "CASHIER"
    ) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (pathname.startsWith("/dashboard/parent") && token?.role !== "PARENT") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (
      pathname.startsWith("/dashboard/student") &&
      token?.role !== "STUDENT"
    ) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
