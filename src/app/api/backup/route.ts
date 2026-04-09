import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      users, medicines, batches, customers, suppliers,
      sales, saleItems, purchases, purchaseItems,
      payments, settings, prescriptions, notifications,
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.medicine.findMany(),
      prisma.batch.findMany(),
      prisma.customer.findMany(),
      prisma.supplier.findMany(),
      prisma.sale.findMany(),
      prisma.saleItem.findMany(),
      prisma.purchase.findMany(),
      prisma.purchaseItem.findMany(),
      prisma.payment.findMany(),
      prisma.setting.findMany(),
      prisma.prescription.findMany(),
      prisma.notification.findMany(),
    ]);

    const backup = {
      version: "1.0",
      createdAt: new Date().toISOString(),
      data: {
        users: users.map(({ password, ...u }) => ({ ...u, password: "[REDACTED]" })),
        medicines,
        batches,
        customers,
        suppliers,
        sales,
        saleItems,
        purchases,
        purchaseItems,
        payments,
        settings,
        prescriptions,
        notifications,
      },
      stats: {
        users: users.length,
        medicines: medicines.length,
        batches: batches.length,
        customers: customers.length,
        suppliers: suppliers.length,
        sales: sales.length,
        purchases: purchases.length,
      },
    };

    const json = JSON.stringify(backup, null, 2);
    const filename = `medstore-backup-${new Date().toISOString().split("T")[0]}.json`;

    return new NextResponse(json, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Backup error:", error);
    return NextResponse.json({ error: "Backup failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const backup = await request.json();

    if (!backup?.version || !backup?.data) {
      return NextResponse.json({ error: "Invalid backup file" }, { status: 400 });
    }

    const stats = backup.stats || {};

    return NextResponse.json({
      message: "Backup file validated successfully",
      stats,
      note: "Full restore requires manual confirmation. Contact admin to proceed.",
    });
  } catch {
    return NextResponse.json({ error: "Invalid backup format" }, { status: 400 });
  }
}
