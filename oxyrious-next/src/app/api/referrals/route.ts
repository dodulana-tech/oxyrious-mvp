import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReferralStatus } from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const status = req.nextUrl.searchParams.get("status") as ReferralStatus | null;
    const where = status ? { status } : {};

    const referrals = await prisma.referral.findMany({
      where,
      include: { referrer: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(referrals);
  } catch (err) {
    console.error("GET /api/referrals error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // Input validation
    if (!body.referrerId || !body.hospitalName || !body.contactPerson) {
      return NextResponse.json(
        { error: "referrerId, hospitalName, and contactPerson are required" },
        { status: 400 }
      );
    }

    const referral = await prisma.referral.create({
      data: {
        ...body,
        date: body.date ? new Date(body.date) : new Date(),
      },
    });
    return NextResponse.json(referral, { status: 201 });
  } catch (err) {
    console.error("POST /api/referrals error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
