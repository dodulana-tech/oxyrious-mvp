import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Status validation: only DISPATCHED or IN_TRANSIT orders can be marked as delivered
    if (order.status !== "DISPATCHED" && order.status !== "IN_TRANSIT") {
      return NextResponse.json(
        { error: "Only DISPATCHED or IN_TRANSIT orders can be marked as delivered" },
        { status: 400 }
      );
    }

    if (!order.transporterId) {
      return NextResponse.json({ error: "Order has no transporter assigned" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: { status: "DELIVERED" },
      });

      await tx.transporter.update({
        where: { id: order.transporterId! },
        data: {
          activeCount: { decrement: 1 },
          deliveries: { increment: 1 },
        },
      });

      await tx.hospital.update({
        where: { id: order.hospitalId },
        data: { orderCount: { increment: 1 } },
      });

      return updated;
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("POST /api/orders/[id]/pod error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
