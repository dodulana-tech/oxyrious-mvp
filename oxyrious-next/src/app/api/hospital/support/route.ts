import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as { role: string; hospitalId: number | null; email: string };
    if (user.role !== "HOSPITAL" || !user.hospitalId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { topic, subject, message, priority, orderRef } = body;

    if (!topic || !subject || !message || !priority) {
      return NextResponse.json(
        { error: "topic, subject, message, and priority are required" },
        { status: 400 }
      );
    }

    const formattedMessage = [
      `[Support Ticket]`,
      `Topic: ${topic}`,
      `Priority: ${priority}`,
      `Subject: ${subject}`,
      ...(orderRef ? [`Order Ref: ${orderRef}`] : []),
      ``,
      message,
    ].join("\n");

    const notification = await prisma.notification.create({
      data: {
        hospitalId: user.hospitalId,
        channel: "SUPPORT",
        recipient: user.email,
        message: formattedMessage,
        status: "SENT",
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (err) {
    console.error("POST /api/hospital/support error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
