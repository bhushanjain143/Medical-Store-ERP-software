import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [expiryBatches, allBatches, customerDues, supplierDues, expiredBatches] =
      await Promise.all([
        prisma.batch.findMany({
          where: { quantity: { gt: 0 }, expiryDate: { lte: thirtyDaysFromNow, gt: now } },
          include: { medicine: { select: { name: true, reorderLevel: true } } },
          orderBy: { expiryDate: "asc" },
          take: 20,
        }),
        prisma.batch.findMany({
          where: { quantity: { gt: 0 }, expiryDate: { gt: now } },
          include: { medicine: { select: { name: true, reorderLevel: true } } },
        }),
        prisma.customer.findMany({
          where: { balance: { gt: 0 } },
          select: { name: true, balance: true, phone: true },
          orderBy: { balance: "desc" },
          take: 20,
        }),
        prisma.supplier.findMany({
          where: { balance: { gt: 0 } },
          select: { name: true, balance: true, phone: true },
          orderBy: { balance: "desc" },
          take: 20,
        }),
        prisma.batch.findMany({
          where: { quantity: { gt: 0 }, expiryDate: { lte: now } },
        }),
      ]);

    const expiryAlerts = expiryBatches.map((b) => ({
      medicineName: b.medicine.name,
      batchNumber: b.batchNumber,
      quantity: b.quantity,
      expiryDate: b.expiryDate,
      daysLeft: Math.ceil((new Date(b.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    }));

    const lowStockAlerts = allBatches
      .filter((b) => b.quantity <= b.medicine.reorderLevel)
      .map((b) => ({
        medicineName: b.medicine.name,
        batchNumber: b.batchNumber,
        currentQty: b.quantity,
        reorderLevel: b.medicine.reorderLevel,
      }))
      .slice(0, 20);

    const totalExpiryLoss = expiredBatches.reduce(
      (s, b) => s + b.purchasePrice * b.quantity,
      0
    );

    return NextResponse.json({
      expiryAlerts,
      lowStockAlerts,
      customerDues,
      supplierDues,
      expiredCount: expiredBatches.length,
      totalExpiryLoss,
    });
  } catch (error) {
    console.error("Notifications error:", error);
    return NextResponse.json(
      { expiryAlerts: [], lowStockAlerts: [], customerDues: [], supplierDues: [], expiredCount: 0, totalExpiryLoss: 0 },
      { status: 200 }
    );
  }
}
