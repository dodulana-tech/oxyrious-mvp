import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUniqueOrThrow({
        where: { id },
        include: { items: true },
      });

      if (order.status !== "PENDING") {
        throw new Error("Only PENDING orders can be cancelled");
      }

      // Restore stock
      for (const item of order.items) {
        await tx.gas.update({
          where: { id: item.gasId },
          data: { stock: { increment: item.quantity } },
        });
      }

      // Refund wallet if paid via wallet
      if (order.paymentMode === "WALLET" && order.payStatus === "PAID") {
        await tx.hospital.update({
          where: { id: order.hospitalId },
          data: { walletBalance: { increment: order.total } },
        });
      }

      // If a transporter was assigned, decrement their activeCount
      if (order.transporterId) {
        await tx.transporter.update({
          where: { id: order.transporterId },
          data: { activeCount: { decrement: 1 } },
        });
      }

      // Delete any auto-generated receivable for this amount
      const receivables = await tx.receivable.findMany({
        where: { hospitalId: order.hospitalId, amount: order.total },
      });
      for (const r of receivables) {
        if (r.status !== "PAID") {
          await tx.receivable.delete({ where: { id: r.id } });
        }
      }

      // Delete order items and order
      await tx.orderItem.deleteMany({ where: { orderId: id } });
      const deleted = await tx.order.delete({ where: { id } });
      return deleted;
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("POST /api/orders/[id]/cancel error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    if (message === "Only PENDING orders can be cancelled") {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
