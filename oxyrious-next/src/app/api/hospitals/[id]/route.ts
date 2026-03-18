import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

const ALLOWED_HOSPITAL_FIELDS = [
  "name",
  "contact",
  "phone",
  "area",
  "paymentMode",
  "walletMinimum",
  "discount",
  "tier",
  "milestone",
  "streak",
  "notes",
];

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const hospital = await prisma.hospital.findUnique({
      where: { id: Number(id) },
      include: { orders: true, receivables: true, referralsGiven: true },
    });

    if (!hospital) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(hospital);
  } catch (err) {
    console.error("GET /api/hospitals/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    // Field whitelisting: only allow specific fields
    const data: Record<string, unknown> = {};
    for (const key of ALLOWED_HOSPITAL_FIELDS) {
      if (body[key] !== undefined) {
        data[key] = body[key];
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const hospital = await prisma.hospital.update({
      where: { id: Number(id) },
      data,
    });
    return NextResponse.json(hospital);
  } catch (err) {
    console.error("PUT /api/hospitals/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const hospitalId = Number(id);

    // Check for dependent records before allowing delete
    const [orderCount, receivableCount, referralCount] = await Promise.all([
      prisma.order.count({ where: { hospitalId } }),
      prisma.receivable.count({ where: { hospitalId } }),
      prisma.referral.count({ where: { referrerId: hospitalId } }),
    ]);

    if (orderCount > 0 || receivableCount > 0 || referralCount > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete hospital with existing orders, receivables, or referrals",
          details: { orderCount, receivableCount, referralCount },
        },
        { status: 409 }
      );
    }

    await prisma.hospital.delete({ where: { id: hospitalId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/hospitals/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
