import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { sendEmail } from "@/lib/email";

async function generatePdfBuffer(hospitalId: number) {
  const hospital = await prisma.hospital.findUnique({
    where: { id: hospitalId },
  });

  if (!hospital) throw new Error("Hospital not found");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const orders = await prisma.order.findMany({
    where: { hospitalId, date: { gte: thirtyDaysAgo } },
    include: { items: { include: { gas: true } } },
    orderBy: { date: "desc" },
  });

  const receivables = await prisma.receivable.findMany({
    where: { hospitalId },
    orderBy: { dueDate: "desc" },
    take: 10,
  });

  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED");
  const totalSpend = deliveredOrders.reduce((s, o) => s + o.total, 0);
  const missedCount = orders.filter((o) => o.status === "CANCELLED").length;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const now = new Date();
  const monthYear = now.toLocaleString("en-US", { month: "long", year: "numeric" });

  // Header
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 112, 243);
  doc.text("O\u2082 Oxyrious", pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(`Monthly Supply Report \u2014 ${monthYear}`, pageWidth / 2, 27, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(hospital.name, pageWidth / 2, 38, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(`${hospital.area}  \u00B7  Prepared for: ${hospital.contact}`, pageWidth / 2, 44, {
    align: "center",
  });

  doc.setDrawColor(220, 220, 220);
  doc.line(15, 48, pageWidth - 15, 48);

  // Metrics
  let y = 56;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("Summary Metrics", 15, y);
  y += 8;

  const metrics = [
    ["Deliveries", String(deliveredOrders.length)],
    ["Total Spend", `\u20A6${totalSpend.toLocaleString()}`],
    ["Supply Streak", `${hospital.streak} days`],
    ["Missed Deliveries", String(missedCount)],
  ];

  doc.setFontSize(10);
  for (const [label, value] of metrics) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(label, 20, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 112, 243);
    doc.text(value, 100, y);
    y += 7;
  }

  // Supply continuity
  y += 5;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("Supply Continuity", 15, y);
  y += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  const tier = hospital.streak >= 200 ? "Top 10%" : hospital.streak >= 100 ? "Top 25%" : "";
  doc.text(
    `${hospital.streak} consecutive days \u2014 ${missedCount} missed deliveries${tier ? ` \u2014 ${tier} of all Oxyrious clients` : ""}`,
    20,
    y,
  );

  // Orders table
  y += 12;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("Recent Orders (Last 30 Days)", 15, y);
  y += 4;

  const tableRows = orders.map((o) => [
    new Date(o.date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    o.id,
    o.items.map((i) => `${i.quantity}x ${i.gas?.name?.split("(")[0]?.trim() || "Gas"}`).join(", "),
    `\u20A6${o.total.toLocaleString()}`,
    o.status,
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (doc as any).autoTable({
    startY: y,
    head: [["Date", "Order ID", "Items", "Amount", "Status"]],
    body: tableRows.length > 0 ? tableRows : [["No orders in this period", "", "", "", ""]],
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [0, 112, 243], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { left: 15, right: 15 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 10;

  // Receivables
  if (receivables.length > 0) {
    const totalReceivable = receivables.reduce((s, r) => s + r.amount, 0);
    const overdueCount = receivables.filter((r) => r.status === "OVERDUE").length;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Receivables Summary", 15, y);
    y += 7;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(`Total Outstanding: \u20A6${totalReceivable.toLocaleString()}`, 20, y);
    y += 6;
    doc.text(`Overdue Invoices: ${overdueCount}`, 20, y);
    y += 10;
  }

  // Wallet
  if (hospital.paymentMode === "WALLET") {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Wallet Account", 15, y);
    y += 7;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(`Current Balance: \u20A6${hospital.walletBalance.toLocaleString()}`, 20, y);
    y += 6;
    doc.text(`Discount Tier: ${hospital.discount}% active`, 20, y);
    y += 10;
  }

  // Footer
  doc.setDrawColor(220, 220, 220);
  doc.line(15, y, pageWidth - 15, y);
  y += 6;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Oxyrious \u00B7 Medical Oxygen. Elevated. \u00B7 Lagos, Nigeria \u00B7 Report auto-generated",
    pageWidth / 2,
    y,
    { align: "center" },
  );

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  const filename = `Oxyrious_Report_${hospital.name.replace(/\s+/g, "_")}_${monthYear.replace(/\s+/g, "_")}.pdf`;

  return {
    buffer: pdfBuffer,
    filename,
    hospital,
    metrics: {
      deliveries: deliveredOrders.length,
      totalSpend,
      streak: hospital.streak,
      missed: missedCount,
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Role check: only ADMIN or STAFF can send reports
    const user = session.user as { role?: string };
    if (user.role !== "ADMIN" && user.role !== "STAFF") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { hospitalId, channel } = body as {
      hospitalId: number;
      channel: "EMAIL" | "WHATSAPP";
    };

    if (!hospitalId || !channel) {
      return NextResponse.json(
        { error: "hospitalId and channel are required" },
        { status: 400 },
      );
    }

    if (!["EMAIL", "WHATSAPP"].includes(channel)) {
      return NextResponse.json(
        { error: "channel must be EMAIL or WHATSAPP" },
        { status: 400 },
      );
    }

    const { buffer, filename, hospital, metrics } = await generatePdfBuffer(hospitalId);

    // Look up a user with HOSPITAL role linked to this hospital for their email
    const hospitalUser = await prisma.user.findFirst({
      where: { hospitalId, role: "HOSPITAL" },
      select: { email: true },
    });
    const recipientEmail = hospitalUser?.email || session.user?.email || "noreply@oxyrious.com";

    if (channel === "EMAIL") {
      const monthYear = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
      const subject = `Oxyrious Monthly Supply Report \u2014 ${hospital.name} \u2014 ${monthYear}`;
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0070f3;">O\u2082 Oxyrious</h2>
          <p>Dear ${hospital.contact},</p>
          <p>Please find attached your monthly supply report for <strong>${monthYear}</strong>.</p>
          <h3>Quick Summary</h3>
          <ul>
            <li><strong>${metrics.deliveries}</strong> deliveries completed</li>
            <li><strong>\u20A6${metrics.totalSpend.toLocaleString()}</strong> total spend</li>
            <li><strong>${metrics.streak}</strong> day supply streak</li>
            <li><strong>${metrics.missed}</strong> missed deliveries</li>
          </ul>
          <p>The full detailed report is attached as a PDF.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">Oxyrious &middot; Medical Oxygen. Elevated. &middot; Lagos, Nigeria</p>
        </div>
      `;

      const emailResult = await sendEmail(recipientEmail, subject, html, [
        { filename, content: buffer },
      ]);

      const notification = await prisma.notification.create({
        data: {
          hospitalId,
          channel: "EMAIL",
          recipient: recipientEmail,
          message: subject,
          status: emailResult.status,
          reference: emailResult.id || null,
        },
      });

      return NextResponse.json({
        id: notification.id,
        status: emailResult.status,
        channel: "EMAIL",
        emailId: emailResult.id,
      });
    } else {
      // WHATSAPP: send text summary via existing Termii endpoint
      const monthYear = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
      const message = [
        `*O\u2082 Oxyrious \u2014 Monthly Report*`,
        `*${hospital.name}* \u2014 ${monthYear}`,
        ``,
        `\u2705 ${metrics.deliveries} deliveries`,
        `\uD83D\uDCB0 \u20A6${metrics.totalSpend.toLocaleString()} total spend`,
        `\uD83D\uDD25 ${metrics.streak}-day supply streak`,
        `\u274C ${metrics.missed} missed`,
        ``,
        `Full PDF report available on your Oxyrious dashboard.`,
      ].join("\n");

      // Call the existing Termii WhatsApp endpoint
      const baseUrl = req.nextUrl.origin;
      const whatsappRes = await fetch(`${baseUrl}/api/notifications/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospitalId,
          channel: "WHATSAPP",
          message,
        }),
      });

      const whatsappResult = await whatsappRes.json();

      return NextResponse.json({
        id: whatsappResult.id,
        status: whatsappResult.status,
        channel: "WHATSAPP",
        messageId: whatsappResult.messageId,
      });
    }
  } catch (err) {
    console.error("Report send error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
