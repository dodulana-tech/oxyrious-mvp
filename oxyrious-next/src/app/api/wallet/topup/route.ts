import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initializeTransaction } from "@/lib/paystack";

const MAX_TOPUP_AMOUNT = 10_000_000; // 10M NGN cap

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { hospitalId, amount } = await req.json();

    if (!hospitalId || !amount || amount <= 0) {
      return NextResponse.json({ error: "hospitalId and a positive amount are required" }, { status: 400 });
    }

    if (amount > MAX_TOPUP_AMOUNT) {
      return NextResponse.json(
        { error: `Amount exceeds maximum topup limit of ${MAX_TOPUP_AMOUNT.toLocaleString()} NGN` },
        { status: 400 }
      );
    }

    const hospital = await prisma.hospital.findUnique({ where: { id: hospitalId } });
    if (!hospital) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
    }

    // Paystack expects amount in kobo (1 NGN = 100 kobo)
    const amountInKobo = Math.round(amount * 100);

    // Use the logged-in user's email for Paystack (hospital.contact is a name, not email)
    const email = session.user?.email || "customer@oxyrious.com";

    // Build callback URL to redirect user back after payment
    const origin = req.nextUrl.origin;
    const callbackUrl = `${origin}/portal/wallet?verify=${encodeURIComponent("pending")}`;

    const { authorization_url, reference } = await initializeTransaction(
      email,
      amountInKobo,
      { hospitalId },
      callbackUrl,
    );

    // Log a PENDING wallet transaction
    await prisma.walletTransaction.create({
      data: {
        hospitalId,
        type: "TOPUP",
        amount,
        reference,
        note: "PENDING",
      },
    });

    return NextResponse.json({ authorization_url, reference });
  } catch (err) {
    console.error("POST /api/wallet/topup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
