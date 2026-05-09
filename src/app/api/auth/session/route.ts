import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_SESSION_COOKIE } from "@/lib/auth/constants";

export async function DELETE() {
  (await cookies()).delete(AUTH_SESSION_COOKIE);

  return NextResponse.json({ ok: true });
}
