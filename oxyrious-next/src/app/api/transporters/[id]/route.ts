import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const transporter = await prisma.transporter.findUnique({
      where: { id: Number(id) },
      include: { orders: true },
    });
    if (!transporter) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(transporter);
  } catch (err) {
    console.error("GET /api/transporters/[id] error:", err);
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

    const transporter = await prisma.transporter.update({
      where: { id: Number(id) },
      data: body,
    });
    return NextResponse.json(transporter);
  } catch (err) {
    console.error("PUT /api/transporters/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
