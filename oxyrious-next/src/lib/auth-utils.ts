import { auth } from "./auth";
import { NextResponse } from "next/server";

export async function requireAuth(role?: "ADMIN" | "STAFF" | "HOSPITAL") {
  const session = await auth();
  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null };
  }
  const userRole = (session.user as unknown as { role: string })?.role;
  if (role && userRole !== role) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), session: null };
  }
  return { error: null, session };
}
