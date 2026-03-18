import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";
import { verifyTransaction } from "@/lib/paystack";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // Check for missing PAYSTACK_SECRET_KEY env var
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error("PAYSTACK_SECRET_KEY environment variable is not set");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Verify webhook signature
    const hash = createHmac("sha512", secret).update(body).digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event === "charge.success") {
      const reference = event.data.reference as string;

      // Find the pending transaction
      const txn = await prisma.walletTransaction.findFirst({
        where: { reference, note: "PENDING" },
      });

      if (!txn) {
        // Already processed or not found — return 200 so Paystack doesn't retry
        return NextResponse.json({ received: true });
      }

      // Verify with Paystack to be safe
      const { status, amount: amountInKobo } = await verifyTransaction(reference);
      const amount = amountInKobo / 100;

      if (status === "success") {
        await prisma.$transaction([
          prisma.walletTransaction.update({
            where: { id: txn.id },
            data: { note: "SUCCESS", amount },
          }),
          prisma.hospital.update({
            where: { id: txn.hospitalId },
            data: { walletBalance: { increment: amount } },
          }),
        ]);
      } else {
        await prisma.walletTransaction.update({
          where: { id: txn.id },
          data: { note: "FAILED" },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("POST /api/wallet/webhook error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
