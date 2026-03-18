import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const receivable = await prisma.receivable.findUnique({
      where: { id },
      include: { hospital: true },
    });
    if (!receivable) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(receivable);
  } catch (err) {
    console.error("GET /api/receivables/[id] error:", err);
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

    // If marking as paid, set status to PAID
    if (body.dueDate) body.dueDate = new Date(body.dueDate);

    const receivable = await prisma.receivable.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(receivable);
  } catch (err) {
    console.error("PUT /api/receivables/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
