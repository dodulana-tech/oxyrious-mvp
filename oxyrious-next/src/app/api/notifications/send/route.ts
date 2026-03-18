import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSMS, sendWhatsApp } from "@/lib/termii";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { hospitalId, channel, message } = body as {
      hospitalId: number;
      channel: "SMS" | "WHATSAPP";
      message: string;
    };

    if (!hospitalId || !channel || !message) {
      return NextResponse.json(
        { error: "hospitalId, channel, and message are required" },
        { status: 400 },
      );
    }

    if (!["SMS", "WHATSAPP"].includes(channel)) {
      return NextResponse.json(
        { error: "channel must be SMS or WHATSAPP" },
        { status: 400 },
      );
    }

    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
    });

    if (!hospital) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
    }

    const phone = hospital.phone;

    let result: { messageId: string; status: "SENT" | "FAILED" };

    try {
      result =
        channel === "SMS"
          ? await sendSMS(phone, message)
          : await sendWhatsApp(phone, message);
    } catch {
      result = { messageId: "", status: "FAILED" };
    }

    const notification = await prisma.notification.create({
      data: {
        hospitalId,
        channel,
        recipient: phone,
        message,
        status: result.status,
        reference: result.messageId || null,
      },
    });

    return NextResponse.json({
      id: notification.id,
      status: result.status,
      messageId: result.messageId,
    });
  } catch (err) {
    console.error("Notification send error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
