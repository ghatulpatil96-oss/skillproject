import { NextResponse } from "next/server";
import { getUserFromToken, setEmailLoginNotifications, tokenFromRequest } from "@/lib/auth";
import { assertSameOrigin, readJson } from "@/lib/security";

export async function PATCH(req: Request) {
  if (!(await assertSameOrigin(req))) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }
  const user = await getUserFromToken(tokenFromRequest(req));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await readJson<{ enabled?: boolean }>(req);
  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: body.status });
  }
  if (typeof body.data.enabled !== "boolean") {
    return NextResponse.json({ error: "A boolean preference is required." }, { status: 400 });
  }

  const updated = await setEmailLoginNotifications(user.id, body.data.enabled);
  if (!updated) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  return NextResponse.json({ emailLoginNotifications: body.data.enabled });
}
