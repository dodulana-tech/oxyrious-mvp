import { PrismaClient, PaymentMode, OrderStatus, PaymentStatus, GasCategory, SourceRegion, InvoiceStatus, ReferralStatus } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // 1. Admin user
  const passwordHash = await bcrypt.hash("oxyrious2025", 12);
  await prisma.user.upsert({
    where: { email: "admin@oxyrious.com" },
    update: {},
    create: {
      email: "admin@oxyrious.com",
      name: "Admin",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log("✓ Admin user created");

  // 2. Hospitals
  const pmMap: Record<string, PaymentMode> = {
    wallet: PaymentMode.WALLET,
    credit: PaymentMode.CREDIT,
    cash: PaymentMode.CASH,
    transfer: PaymentMode.TRANSFER,
  };

  const hospitalsData = [
    { id: 1, name: "Reddington Hospital", contact: "Chioma Eze", phone: "0803 456 7890", area: "Victoria Island", pm: "wallet", wb: 820000, wmin: 300000, score: 94, tier: 3, dso: 0, orders: 48, disc: 5, streak: 247, refCode: "OXY-RED1", refs: 2, refReward: 24000, milestone: false },
    { id: 2, name: "EKO Hospital", contact: "Bola Adeyemi", phone: "0806 123 4567", area: "Surulere", pm: "credit", wb: 0, wmin: 0, score: 81, tier: 3, dso: 24, orders: 36, disc: 0, streak: 183, refCode: "OXY-EKO2", refs: 1, refReward: 9600, milestone: false },
    { id: 3, name: "Lagoon Hospital", contact: "Emeka Obi", phone: "0701 987 6543", area: "Ikoyi", pm: "wallet", wb: 95000, wmin: 200000, score: 88, tier: 3, dso: 0, orders: 29, disc: 3, streak: 201, refCode: "OXY-LAG3", refs: 0, refReward: 0, milestone: false },
    { id: 4, name: "St. Nicholas Hospital", contact: "Funke Adeoye", phone: "0812 345 6789", area: "Lagos Island", pm: "transfer", wb: 0, wmin: 0, score: 67, tier: 2, dso: 18, orders: 14, disc: 0, streak: 94, refCode: "OXY-STN4", refs: 0, refReward: 0, milestone: false },
    { id: 5, name: "Premiere Specialist", contact: "Tunde Bakare", phone: "0905 678 9012", area: "Lekki Phase 1", pm: "cash", wb: 0, wmin: 0, score: 52, tier: 1, dso: 0, orders: 3, disc: 0, streak: 31, refCode: "OXY-PRE5", refs: 0, refReward: 0, milestone: true },
    { id: 6, name: "ClearView Clinic", contact: "Ngozi Nwachukwu", phone: "0704 321 8765", area: "Lekki Phase 2", pm: "cash", wb: 0, wmin: 0, score: 41, tier: 1, dso: 0, orders: 3, disc: 0, streak: 22, refCode: "OXY-CLR6", refs: 0, refReward: 0, milestone: true },
  ];

  for (const h of hospitalsData) {
    await prisma.hospital.upsert({
      where: { id: h.id },
      update: {},
      create: {
        id: h.id,
        name: h.name,
        contact: h.contact,
        phone: h.phone,
        area: h.area,
        paymentMode: pmMap[h.pm],
        walletBalance: h.wb,
        walletMinimum: h.wmin,
        creditScore: h.score,
        tier: h.tier,
        dso: h.dso,
        orderCount: h.orders,
        discount: h.disc,
        streak: h.streak,
        refCode: h.refCode,
        referralCount: h.refs,
        refReward: h.refReward,
        milestone: h.milestone,
      },
    });
  }
  console.log("✓ Hospitals seeded");

  // 3. Gases
  const catMap: Record<string, GasCategory> = {
    oxygen: GasCategory.OXYGEN,
    anaesthetic: GasCategory.ANAESTHETIC,
    specialty: GasCategory.SPECIALTY,
  };
  const srcMap: Record<string, SourceRegion> = {
    island: SourceRegion.ISLAND,
    mainland: SourceRegion.MAINLAND,
  };

  const gasesData = [
    { id: 1, name: "Medical Oxygen (Cylinder)", cat: "oxygen", price: 12000, stock: 85, min: 30, src: "island" },
    { id: 2, name: "Medical Oxygen (Bulk/L)", cat: "oxygen", price: 45, stock: 12000, min: 3000, src: "island" },
    { id: 3, name: "Nitrous Oxide", cat: "anaesthetic", price: 18000, stock: 22, min: 10, src: "island" },
    { id: 4, name: "Carbon Dioxide", cat: "specialty", price: 9500, stock: 18, min: 8, src: "mainland" },
    { id: 5, name: "Nitrogen (Medical)", cat: "specialty", price: 14500, stock: 12, min: 6, src: "mainland" },
    { id: 6, name: "Entonox (50/50)", cat: "anaesthetic", price: 22000, stock: 8, min: 4, src: "mainland" },
  ];

  for (const g of gasesData) {
    await prisma.gas.upsert({
      where: { id: g.id },
      update: {},
      create: {
        id: g.id,
        name: g.name,
        category: catMap[g.cat],
        price: g.price,
        stock: g.stock,
        minStock: g.min,
        source: srcMap[g.src],
      },
    });
  }
  console.log("✓ Gases seeded");

  // 4. Transporters
  const transportersData = [
    { id: 1, name: "Chukwu Logistics", driver: "Emeka Chukwu", phone: "0803 111 2222", deliveries: 31, onTime: 94, active: 2 },
    { id: 2, name: "Rapid Gas Movers", driver: "Yemi Adebayo", phone: "0806 333 4444", deliveries: 18, onTime: 87, active: 1 },
    { id: 3, name: "TranzitNG", driver: "Ike Okafor", phone: "0901 555 6666", deliveries: 12, onTime: 91, active: 0 },
  ];

  for (const t of transportersData) {
    await prisma.transporter.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        name: t.name,
        driver: t.driver,
        phone: t.phone,
        deliveries: t.deliveries,
        onTimeRate: t.onTime,
        activeCount: t.active,
      },
    });
  }
  console.log("✓ Transporters seeded");

  // 5. Gas name -> ID mapping for order items
  const gasNameToId: Record<string, number> = {};
  for (const g of gasesData) {
    gasNameToId[g.name] = g.id;
  }

  // Transporter name -> ID mapping
  const transporterNameToId: Record<string, number> = {};
  for (const t of transportersData) {
    transporterNameToId[t.name] = t.id;
  }

  const statusMap: Record<string, OrderStatus> = {
    pending: OrderStatus.PENDING,
    dispatched: OrderStatus.DISPATCHED,
    "in-transit": OrderStatus.IN_TRANSIT,
    delivered: OrderStatus.DELIVERED,
  };

  const payStatusMap: Record<string, PaymentStatus> = {
    paid: PaymentStatus.PAID,
    pending: PaymentStatus.PENDING,
    awaiting: PaymentStatus.AWAITING,
    overdue: PaymentStatus.OVERDUE,
  };

  const ordersData = [
    { id: "ORD-0041", hospitalId: 1, items: [{ name: "Medical Oxygen (Cylinder)", qty: 10, price: 12000 }, { name: "Nitrous Oxide", qty: 2, price: 18000 }], total: 156000, status: "delivered", pm: "wallet", payStatus: "paid", transporter: "Chukwu Logistics", date: "2025-03-12", source: "island" },
    { id: "ORD-0040", hospitalId: 2, items: [{ name: "Medical Oxygen (Cylinder)", qty: 8, price: 12000 }], total: 96000, status: "in-transit", pm: "credit", payStatus: "pending", transporter: "Rapid Gas Movers", date: "2025-03-12", source: "island" },
    { id: "ORD-0039", hospitalId: 3, items: [{ name: "Medical Oxygen (Cylinder)", qty: 15, price: 12000 }, { name: "Carbon Dioxide", qty: 4, price: 9500 }], total: 218000, status: "dispatched", pm: "wallet", payStatus: "paid", transporter: "Chukwu Logistics", date: "2025-03-12", source: "mainland" },
    { id: "ORD-0038", hospitalId: 4, items: [{ name: "Medical Oxygen (Cylinder)", qty: 5, price: 12000 }], total: 60000, status: "pending", pm: "transfer", payStatus: "awaiting", transporter: null, date: "2025-03-11", source: "island" },
    { id: "ORD-0037", hospitalId: 5, items: [{ name: "Medical Oxygen (Cylinder)", qty: 4, price: 12000 }], total: 48000, status: "pending", pm: "cash", payStatus: "awaiting", transporter: null, date: "2025-03-11", source: "island" },
    { id: "ORD-0036", hospitalId: 2, items: [{ name: "Medical Oxygen (Cylinder)", qty: 12, price: 12000 }], total: 144000, status: "delivered", pm: "credit", payStatus: "overdue", transporter: "TranzitNG", date: "2025-02-10", source: "island" },
    { id: "ORD-0035", hospitalId: 1, items: [{ name: "Medical Oxygen (Cylinder)", qty: 20, price: 12000 }], total: 240000, status: "delivered", pm: "wallet", payStatus: "paid", transporter: "Chukwu Logistics", date: "2025-02-20", source: "island" },
  ];

  for (const o of ordersData) {
    await prisma.order.upsert({
      where: { id: o.id },
      update: {},
      create: {
        id: o.id,
        hospitalId: o.hospitalId,
        total: o.total,
        status: statusMap[o.status],
        paymentMode: pmMap[o.pm],
        payStatus: payStatusMap[o.payStatus],
        transporterId: o.transporter ? transporterNameToId[o.transporter] : null,
        source: srcMap[o.source],
        date: new Date(o.date),
        items: {
          create: o.items.map((item) => ({
            gasId: gasNameToId[item.name],
            quantity: item.qty,
            price: item.price,
          })),
        },
      },
    });
  }
  console.log("✓ Orders seeded");

  // 6. Receivables
  const invStatusMap: Record<string, InvoiceStatus> = {
    current: InvoiceStatus.CURRENT,
    awaiting: InvoiceStatus.AWAITING,
    overdue: InvoiceStatus.OVERDUE,
    paid: InvoiceStatus.PAID,
  };

  const receivablesData = [
    { id: "INV-0084", hospitalId: 2, amount: 144000, due: "2025-03-13", daysOverdue: 1, status: "overdue", reminders: 3 },
    { id: "INV-0082", hospitalId: 2, amount: 96000, due: "2025-04-11", daysOverdue: 0, status: "current", reminders: 0 },
    { id: "INV-0079", hospitalId: 4, amount: 60000, due: "2025-04-10", daysOverdue: 0, status: "awaiting", reminders: 0 },
  ];

  for (const r of receivablesData) {
    await prisma.receivable.upsert({
      where: { id: r.id },
      update: {},
      create: {
        id: r.id,
        hospitalId: r.hospitalId,
        amount: r.amount,
        dueDate: new Date(r.due),
        daysOverdue: r.daysOverdue,
        status: invStatusMap[r.status],
        reminders: r.reminders,
      },
    });
  }
  console.log("✓ Receivables seeded");

  // 7. Referrals
  const refStatusMap: Record<string, ReferralStatus> = {
    pending: ReferralStatus.PENDING,
    active: ReferralStatus.ACTIVE,
    qualified: ReferralStatus.QUALIFIED,
  };

  // Map referrer name -> hospital ID
  const hospitalNameToId: Record<string, number> = {};
  for (const h of hospitalsData) {
    hospitalNameToId[h.name] = h.id;
  }

  const referralsData = [
    { id: 1, referrer: "Reddington Hospital", referred: "Apex Medical Centre", code: "OXY-RED1", status: "qualified", orders: 5, reward: 12000, date: "2025-01-14" },
    { id: 2, referrer: "Reddington Hospital", referred: "Harbour View Clinic", code: "OXY-RED1", status: "active", orders: 2, reward: 0, date: "2025-02-20" },
    { id: 3, referrer: "EKO Hospital", referred: "Unity Specialist Hospital", code: "OXY-EKO2", status: "pending", orders: 0, reward: 0, date: "2025-03-08" },
  ];

  for (const r of referralsData) {
    await prisma.referral.upsert({
      where: { id: r.id },
      update: {},
      create: {
        id: r.id,
        referrerId: hospitalNameToId[r.referrer],
        referred: r.referred,
        code: r.code,
        status: refStatusMap[r.status],
        orderCount: r.orders,
        reward: r.reward,
        date: new Date(r.date),
      },
    });
  }
  console.log("✓ Referrals seeded");

  console.log("\n✅ Database seeded successfully!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
