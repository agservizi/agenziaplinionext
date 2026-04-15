import { NextResponse } from "next/server";

// Auth is handled client-side via localStorage token.
// This middleware is a pass-through; the ClientAreaShell component
// checks the token and redirects to /login if missing.
export default function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
