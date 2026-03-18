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
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { items: { include: { gas: true } }, transporter: true },
        },
      },
    });

    if (!hospital) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
    }

    // Compute stats
    const activeOrders = await prisma.order.count({
      where: {
        hospitalId: user.hospitalId,
        status: { in: ["PENDING", "DISPATCHED", "IN_TRANSIT"] },
      },
    });

    const lastDelivered = await prisma.order.findFirst({
      where: { hospitalId: user.hospitalId, status: "DELIVERED" },
      orderBy: { date: "desc" },
    });

    // Estimate next delivery from the most recent non-delivered order
    const nextPending = await prisma.order.findFirst({
      where: {
        hospitalId: user.hospitalId,
        status: { in: ["PENDING", "DISPATCHED", "IN_TRANSIT"] },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({
      ...hospital,
      stats: {
        activeOrders,
        lastDeliveredDate: lastDelivered?.date ?? null,
        nextDeliveryDate: nextPending?.date ?? null,
      },
    });
  } catch (err) {
    console.error("GET /api/hospital/me error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
