import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { transporterId } = await req.json();

    if (!transporterId) {
      return NextResponse.json({ error: "transporterId is required" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Fetch current order to validate status
      const existing = await tx.order.findUnique({ where: { id } });
      if (!existing) throw new Error("Order not found");
      if (existing.status !== "PENDING") {
        throw new Error("Only PENDING orders can be dispatched");
      }

      const order = await tx.order.update({
        where: { id },
        data: { transporterId, status: "DISPATCHED" },
      });

      await tx.transporter.update({
        where: { id: transporterId },
        data: { activeCount: { increment: 1 } },
      });

      return order;
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("POST /api/orders/[id]/dispatch error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    if (message === "Only PENDING orders can be dispatched" || message === "Order not found") {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
