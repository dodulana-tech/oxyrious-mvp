import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const transporters = await prisma.transporter.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(transporters);
  } catch (err) {
    console.error("GET /api/transporters error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // Input validation
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: "name and phone are required" },
        { status: 400 }
      );
    }

    const transporter = await prisma.transporter.create({ data: body });
    return NextResponse.json(transporter, { status: 201 });
  } catch (err) {
    console.error("POST /api/transporters error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
