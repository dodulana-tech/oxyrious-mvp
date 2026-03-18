import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const gases = await prisma.gas.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(gases);
  } catch (err) {
    console.error("GET /api/gases error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // Input validation
    if (!body.name || body.price === undefined || body.stock === undefined) {
      return NextResponse.json(
        { error: "name, price, and stock are required" },
        { status: 400 }
      );
    }

    const gas = await prisma.gas.create({ data: body });
    return NextResponse.json(gas, { status: 201 });
  } catch (err) {
    console.error("POST /api/gases error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
