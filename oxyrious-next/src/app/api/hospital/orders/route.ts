import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as { role: string; hospitalId: number | null };
    if (user.role !== "HOSPITAL" || !user.hospitalId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const status = req.nextUrl.searchParams.get("status") as OrderStatus | null;
    const where = {
      hospitalId: user.hospitalId,
      ...(status ? { status } : {}),
    };

    const orders = await prisma.order.findMany({
      where,
      include: { hospital: true, transporter: true, items: { include: { gas: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (err) {
    console.error("GET /api/hospital/orders error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as { role: string; hospitalId: number | null };
    if (user.role !== "HOSPITAL" || !user.hospitalId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { items, source } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "At least one item is required" }, { status: 400 });
    }

    for (const item of items) {
      if (!item.gasId || !item.quantity) {
        return NextResponse.json({ error: "Each item must have gasId and quantity" }, { status: 400 });
      }
    }

    // Get the hospital to determine payment mode
    const hospital = await prisma.hospital.findUniqueOrThrow({
      where: { id: user.hospitalId },
    });

    const paymentMode = hospital.paymentMode;

    // Generate order ID
    const lastOrder = await prisma.order.findFirst({ orderBy: { createdAt: "desc" } });
    let nextNum = 1;
    if (lastOrder) {
      const match = lastOrder.id.match(/ORD-(\d+)/);
      if (match) nextNum = parseInt(match[1], 10) + 1;
    }
    const orderId = `ORD-${String(nextNum).padStart(4, "0")}`;

    // Apply hospital markup to each item's price: effectivePrice = gas.price * (1 + markup/100)
    const pricedItems = await Promise.all(
      (items as { gasId: number; quantity: number; price?: number }[]).map(async (item) => {
        const gas = await prisma.gas.findUniqueOrThrow({ where: { id: item.gasId } });
        const effectivePrice = Math.round(gas.price * (1 + hospital.markup / 100) * 100) / 100;
        return { gasId: item.gasId, quantity: item.quantity, price: effectivePrice };
      })
    );

    // Calculate total from markup-adjusted prices
    const total = pricedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const result = await prisma.$transaction(async (tx) => {
      // Wallet payment: deduct balance
      let payStatus: PaymentStatus = "AWAITING";
      if (paymentMode === "WALLET") {
        if (hospital.walletBalance < total) {
          throw new Error("Insufficient wallet balance");
        }
        await tx.hospital.update({
          where: { id: hospital.id },
          data: { walletBalance: { decrement: total } },
        });
        payStatus = "PAID";
      }

      // Deduct stock
      for (const item of pricedItems) {
        const gas = await tx.gas.findUniqueOrThrow({ where: { id: item.gasId } });
        if (gas.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${gas.name} (available: ${gas.stock}, requested: ${item.quantity})`);
        }
        await tx.gas.update({
          where: { id: item.gasId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Auto-generate receivable for CREDIT/TRANSFER
      if (paymentMode === "CREDIT" || paymentMode === "TRANSFER") {
        const lastInv = await tx.receivable.findFirst({ orderBy: { createdAt: "desc" } });
        let invNum = 1;
        if (lastInv) {
          const match = lastInv.id.match(/INV-(\d+)/);
          if (match) invNum = parseInt(match[1], 10) + 1;
        }
        const receivableId = `INV-${String(invNum).padStart(4, "0")}`;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (paymentMode === "CREDIT" ? 30 : 7));

        await tx.receivable.create({
          data: {
            id: receivableId,
            hospitalId: hospital.id,
            amount: total,
            dueDate,
            status: paymentMode === "CREDIT" ? "CURRENT" : "AWAITING",
          },
        });
      }

      const order = await tx.order.create({
        data: {
          id: orderId,
          hospitalId: hospital.id,
          total,
          paymentMode,
          payStatus,
          source: source ?? "ISLAND",
          date: new Date(),
          items: {
            create: pricedItems.map((item) => ({
              gasId: item.gasId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { items: { include: { gas: true } }, hospital: true },
      });

      return order;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("POST /api/hospital/orders error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    if (message.includes("Insufficient")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
