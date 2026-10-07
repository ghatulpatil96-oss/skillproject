import { NextResponse } from "next/server";
import { getUserFromToken, publicUser, tokenFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getUserFromToken(tokenFromRequest(req));
  return NextResponse.json({ user: user ? publicUser(user) : null });
}
