import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-me-sporokulu",
);

const STAFF_PREFIXES = ["/dashboard", "/scanner", "/kayit"];

function isStaffPath(pathname: string): boolean {
  return STAFF_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

async function payloadRole(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return String(payload.role ?? "") || null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("sporokulu_access_token")?.value;

  if (pathname === "/") {
    if (!token) {
      return NextResponse.redirect(new URL("/giris", request.url));
    }
    const role = await payloadRole(token);
    if (!role) {
      return NextResponse.redirect(new URL("/giris", request.url));
    }
    if (role === "VELI") {
      return NextResponse.redirect(new URL("/panel/veli", request.url));
    }
    if (role === "ADMIN" || role === "ANTRENOR") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/giris", request.url));
  }

  if (pathname === "/giris" && token) {
    const role = await payloadRole(token);
    if (role === "VELI") {
      return NextResponse.redirect(new URL("/panel/veli", request.url));
    }
    if (role === "ADMIN" || role === "ANTRENOR") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (pathname.startsWith("/panel/veli")) {
    if (!token) {
      return NextResponse.redirect(new URL(`/giris?redirect=${encodeURIComponent(pathname)}`, request.url));
    }
    const role = await payloadRole(token);
    if (!role) {
      return NextResponse.redirect(new URL("/giris", request.url));
    }
    if (role !== "VELI") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (isStaffPath(pathname)) {
    if (!token) {
      return NextResponse.redirect(new URL(`/giris?redirect=${encodeURIComponent(pathname)}`, request.url));
    }
    const role = await payloadRole(token);
    if (!role) {
      return NextResponse.redirect(new URL("/giris", request.url));
    }
    if (role === "VELI") {
      return NextResponse.redirect(new URL("/panel/veli", request.url));
    }
    if (role !== "ADMIN" && role !== "ANTRENOR") {
      return NextResponse.redirect(new URL("/giris", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/giris", "/dashboard/:path*", "/scanner", "/kayit", "/panel/veli"],
};
