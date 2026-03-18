import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const status = req.nextUrl.searchParams.get("status") as OrderStatus | null;
    const where = status ? { status } : {};

    const orders = await prisma.order.findMany({
      where,
      include: { hospital: true, transporter: true, items: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch (err) {
    console.error("GET /api/orders error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { items, ...orderData } = body;

    // Input validation
    if (!orderData.hospitalId) {
      return NextResponse.json({ error: "hospitalId is required" }, { status: 400 });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "At least one item is required" }, { status: 400 });
    }
    if (!orderData.paymentMode) {
      return NextResponse.json({ error: "paymentMode is required" }, { status: 400 });
    }
    for (const item of items) {
      if (!item.gasId || !item.quantity || !item.price) {
        return NextResponse.json({ error: "Each item must have gasId, quantity, and price" }, { status: 400 });
      }
    }

    // Generate order ID: ORD-XXXX
    const lastOrder = await prisma.order.findFirst({ orderBy: { createdAt: "desc" } });
    let nextNum = 1;
    if (lastOrder) {
      const match = lastOrder.id.match(/ORD-(\d+)/);
      if (match) nextNum = parseInt(match[1], 10) + 1;
    }
    const orderId = `ORD-${String(nextNum).padStart(4, "0")}`;

    // Fetch hospital to get markup percentage
    const hospital = await prisma.hospital.findUniqueOrThrow({
      where: { id: orderData.hospitalId },
    });

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
      // If WALLET mode, deduct balance and auto-set payStatus to PAID
      let payStatus = orderData.payStatus ?? "AWAITING";
      if (orderData.paymentMode === "WALLET") {
        if (hospital.walletBalance < total) {
          throw new Error("Insufficient wallet balance");
        }
        await tx.hospital.update({
          where: { id: orderData.hospitalId },
          data: { walletBalance: { decrement: total } },
        });
        payStatus = "PAID";
      }

      // Deduct stock for each item
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

      // Auto-generate receivable for CREDIT/TRANSFER orders
      let receivableId: string | null = null;
      if (orderData.paymentMode === "CREDIT" || orderData.paymentMode === "TRANSFER") {
        const lastInv = await tx.receivable.findFirst({ orderBy: { createdAt: "desc" } });
        let invNum = 1;
        if (lastInv) {
          const match = lastInv.id.match(/INV-(\d+)/);
          if (match) invNum = parseInt(match[1], 10) + 1;
        }
        receivableId = `INV-${String(invNum).padStart(4, "0")}`;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (orderData.paymentMode === "CREDIT" ? 30 : 7));

        await tx.receivable.create({
          data: {
            id: receivableId,
            hospitalId: orderData.hospitalId,
            amount: total,
            dueDate,
            status: orderData.paymentMode === "CREDIT" ? "CURRENT" : "AWAITING",
          },
        });
      }

      const order = await tx.order.create({
        data: {
          id: orderId,
          hospitalId: orderData.hospitalId,
          total,
          paymentMode: orderData.paymentMode,
          payStatus,
          source: orderData.source ?? "ISLAND",
          date: orderData.date ? new Date(orderData.date) : new Date(),
          items: {
            create: pricedItems.map((item) => ({
              gasId: item.gasId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { items: true, hospital: true },
      });

      return order;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("POST /api/orders error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    if (message.includes("Insufficient")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
