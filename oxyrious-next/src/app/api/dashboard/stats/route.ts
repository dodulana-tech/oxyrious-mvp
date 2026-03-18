import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Role check: only ADMIN or STAFF can access dashboard stats
    const user = session.user as { role?: string };
    if (user.role !== "ADMIN" && user.role !== "STAFF") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Run all queries in parallel
    const [
      mtdOrders,
      outstandingReceivables,
      overdueReceivables,
      activeOrders,
      hospitals,
      walletHospitals,
      milestoneHospitals,
    ] = await Promise.all([
      // MTD revenue: sum of delivered orders this month
      prisma.order.findMany({
        where: {
          status: "DELIVERED",
          date: { gte: startOfMonth },
        },
        select: { total: true },
      }),

      // Outstanding: sum of non-PAID receivables
      prisma.receivable.aggregate({
        where: { status: { not: "PAID" } },
        _sum: { amount: true },
      }),

      // Overdue: sum of OVERDUE receivables
      prisma.receivable.aggregate({
        where: { status: "OVERDUE" },
        _sum: { amount: true },
      }),

      // Active orders count (not delivered)
      prisma.order.count({
        where: { status: { not: "DELIVERED" } },
      }),

      // All hospitals for avg streak calculation
      prisma.hospital.aggregate({
        _avg: { streak: true },
      }),

      // Wallet hospitals with low balance (balance < minimum)
      prisma.$queryRaw<
        { id: number; name: string; walletBalance: number; walletMinimum: number }[]
      >`SELECT id, name, "walletBalance", "walletMinimum" FROM "Hospital" WHERE "paymentMode" = 'WALLET' AND "walletBalance" < "walletMinimum"`,

      // Milestone hospitals
      prisma.hospital.findMany({
        where: { milestone: true },
        select: { id: true, name: true, orderCount: true, tier: true },
      }),
    ]);

    const mtdRevenue = mtdOrders.reduce((sum, o) => sum + o.total, 0);

    return NextResponse.json({
      mtdRevenue,
      outstandingAmount: outstandingReceivables._sum.amount ?? 0,
      overdueAmount: overdueReceivables._sum.amount ?? 0,
      activeOrdersCount: activeOrders,
      avgStreak: Math.round((hospitals._avg.streak ?? 0) * 10) / 10,
      walletLowBalance: walletHospitals,
      milestoneHospitals,
    });
  } catch (err) {
    console.error("GET /api/dashboard/stats error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
