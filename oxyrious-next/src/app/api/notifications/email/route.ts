import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { to, subject, html, hospitalId } = body as {
      to: string;
      subject: string;
      html: string;
      hospitalId?: number;
    };

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: "to, subject, and html are required" },
        { status: 400 },
      );
    }

    const result = await sendEmail(to, subject, html);

    const notification = await prisma.notification.create({
      data: {
        hospitalId: hospitalId ?? null,
        channel: "EMAIL",
        recipient: to,
        message: subject,
        status: result.status,
        reference: result.id || null,
      },
    });

    return NextResponse.json({
      id: notification.id,
      status: result.status,
      emailId: result.id,
    });
  } catch (err) {
    console.error("Email notification error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
