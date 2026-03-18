import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const referral = await prisma.referral.findUnique({
      where: { id: Number(id) },
      include: { referrer: true },
    });
    if (!referral) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(referral);
  } catch (err) {
    console.error("GET /api/referrals/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    if (Object.keys(body).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    if (body.date) body.date = new Date(body.date);

    const referral = await prisma.referral.update({
      where: { id: Number(id) },
      data: body,
    });
    return NextResponse.json(referral);
  } catch (err) {
    console.error("PUT /api/referrals/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
