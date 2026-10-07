import { NextResponse } from "next/server";
import { listOutbox, sendEmail, templates } from "@/lib/email";

/** GET /api/emails — list the outbox (Dev Inbox). */
export async function GET() {
  const emails = await listOutbox();
  return NextResponse.json({ emails });
}

/**
 * POST /api/emails — send a templated notification.
 * Body: { to, template, params }
 * Kept generic so any feature can trigger notifications.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      to?: string;
      template?: keyof typeof templates;
      params?: unknown[];
    };
    if (!body.to || !body.template || !(body.template in templates)) {
      return NextResponse.json({ error: "to and a valid template are required" }, { status: 400 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tpl = (templates as any)[body.template](...(body.params ?? []));
    const email = await sendEmail({ to: body.to, ...tpl });
    return NextResponse.json({ email }, { status: 201 });
  } catch (err) {
    console.error("email error", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
