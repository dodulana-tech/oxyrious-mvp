import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InvoiceStatus } from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const status = req.nextUrl.searchParams.get("status") as InvoiceStatus | null;
    const where = status ? { status } : {};

    const receivables = await prisma.receivable.findMany({
      where,
      include: { hospital: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(receivables);
  } catch (err) {
    console.error("GET /api/receivables error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // Input validation
    if (!body.hospitalId || !body.amount || !body.dueDate) {
      return NextResponse.json(
        { error: "hospitalId, amount, and dueDate are required" },
        { status: 400 }
      );
    }

    const receivable = await prisma.receivable.create({
      data: {
        ...body,
        dueDate: new Date(body.dueDate),
      },
    });
    return NextResponse.json(receivable, { status: 201 });
  } catch (err) {
    console.error("POST /api/receivables error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
