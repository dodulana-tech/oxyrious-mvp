import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTransaction } from "@/lib/paystack";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json({ error: "reference is required" }, { status: 400 });
    }

    // Find the pending transaction
    const txn = await prisma.walletTransaction.findFirst({
      where: { reference, note: "PENDING" },
    });

    if (!txn) {
      return NextResponse.json({ error: "Transaction not found or already processed" }, { status: 404 });
    }

    const { status, amount: amountInKobo } = await verifyTransaction(reference);
    const amount = amountInKobo / 100;

    if (status === "success") {
      // Update transaction status and credit the wallet in a single transaction
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

      return NextResponse.json({ success: true, amount });
    }

    // Payment was not successful
    await prisma.walletTransaction.update({
      where: { id: txn.id },
      data: { note: "FAILED" },
    });

    return NextResponse.json({ success: false, status }, { status: 400 });
  } catch (err) {
    console.error("POST /api/wallet/verify error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
