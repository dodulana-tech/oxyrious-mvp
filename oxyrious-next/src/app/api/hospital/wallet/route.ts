import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as { role: string; hospitalId: number | null };
    if (user.role !== "HOSPITAL" || !user.hospitalId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const hospital = await prisma.hospital.findUnique({
      where: { id: user.hospitalId },
      select: { walletBalance: true, walletMinimum: true, name: true },
    });

    if (!hospital) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
    }

    const transactions = await prisma.walletTransaction.findMany({
      where: { hospitalId: user.hospitalId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      balance: hospital.walletBalance,
      minimum: hospital.walletMinimum,
      hospitalName: hospital.name,
      transactions,
    });
  } catch (err) {
    console.error("GET /api/hospital/wallet error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
