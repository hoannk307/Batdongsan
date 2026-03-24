import { NextResponse } from "next/server";

export function middleware(request) {
  const path = request.nextUrl.pathname;
  const accessToken = request.cookies.get("accessToken")?.value;

  const isPublicPage = path.startsWith("/authentication/login");

  if (!accessToken && !isPublicPage) {
    const returnTo = request.nextUrl.pathname + request.nextUrl.search;
    const url = new URL("/authentication/login", request.url);
    url.searchParams.set("returnTo", returnTo);
    return NextResponse.redirect(url);
  }

  if (accessToken && isPublicPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (path == "/") {
    return NextResponse.redirect(new URL(`/dashboard`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
