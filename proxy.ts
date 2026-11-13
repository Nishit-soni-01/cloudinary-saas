
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const publicPages = ["/", "/sign-in", "/sign-up"];

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  const pathname = req.nextUrl.pathname;

  const isPublicPage = publicPages.some(
    (path) =>
      pathname === path ||
      (path !== "/" && pathname.startsWith(`${path}/`))
  );

  if (userId && isPublicPage) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  if (!userId && !isPublicPage) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
