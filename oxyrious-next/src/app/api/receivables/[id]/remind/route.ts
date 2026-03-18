import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSMS, sendWhatsApp } from "@/lib/termii";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const body = await req.json().catch(() => ({}));
    const {
      channel = "SMS",
      message,
    } = body as {
      channel?: "SMS" | "WHATSAPP";
      message?: string;
    };

    if (!message) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 },
      );
    }

    if (!["SMS", "WHATSAPP"].includes(channel)) {
      return NextResponse.json(
        { error: "channel must be SMS or WHATSAPP" },
        { status: 400 },
      );
    }

    // Fetch the receivable to get the hospitalId
    const receivable = await prisma.receivable.findUnique({
      where: { id },
    });

    if (!receivable) {
      return NextResponse.json({ error: "Receivable not found" }, { status: 404 });
    }

    // Look up the hospital to get its phone number
    const hospital = await prisma.hospital.findUnique({
      where: { id: receivable.hospitalId },
    });

    if (!hospital) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
    }

    const phone = hospital.phone;

    // Send the reminder via SMS or WhatsApp
    let result: { messageId: string; status: "SENT" | "FAILED" };

    try {
      result =
        channel === "SMS"
          ? await sendSMS(phone, message)
          : await sendWhatsApp(phone, message);
    } catch {
      result = { messageId: "", status: "FAILED" };
    }

    // Log the notification
    const notification = await prisma.notification.create({
      data: {
        hospitalId: receivable.hospitalId,
        channel,
        recipient: phone,
        message,
        status: result.status,
        reference: result.messageId || null,
      },
    });

    // Increment the reminders counter
    const updated = await prisma.receivable.update({
      where: { id },
      data: { reminders: { increment: 1 } },
    });

    return NextResponse.json({
      receivable: updated,
      notification: {
        id: notification.id,
        status: result.status,
        messageId: result.messageId,
      },
    });
  } catch (err) {
    console.error("POST /api/receivables/[id]/remind error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
