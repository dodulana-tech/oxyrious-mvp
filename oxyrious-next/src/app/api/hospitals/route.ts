import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PaymentMode } from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const mode = req.nextUrl.searchParams.get("paymentMode") as PaymentMode | null;
    const where = mode ? { paymentMode: mode } : {};

    const hospitals = await prisma.hospital.findMany({ where, orderBy: { name: "asc" } });
    return NextResponse.json(hospitals);
  } catch (err) {
    console.error("GET /api/hospitals error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // Input validation
    if (!body.name || !body.contact || !body.area) {
      return NextResponse.json(
        { error: "name, contact, and area are required" },
        { status: 400 }
      );
    }

    const hospital = await prisma.hospital.create({ data: body });
    return NextResponse.json(hospital, { status: 201 });
  } catch (err) {
    console.error("POST /api/hospitals error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
