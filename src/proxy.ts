import { NextResponse } from "next/server";

// Auth is handled client-side via localStorage token.
// This proxy layer is intentionally a pass-through.
export default function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
