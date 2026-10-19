import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as { debeCambiarPassword?: boolean } | null;

    if (token?.debeCambiarPassword && req.nextUrl.pathname !== "/cambiar-password") {
      return NextResponse.redirect(new URL("/cambiar-password", req.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/((?!consulta-publica|login|api/auth|api/trpc|api/debug|api/keep-alive|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)",
  ],
};
