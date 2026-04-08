import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      todaySales,
      monthSales,
      totalMedicines,
      lowStockCount,
      expiringCount,
      totalCustomers,
      recentSales,
      monthlySalesData,
      topMedicines,
      customerDues,
    ] = await Promise.all([
      prisma.sale.aggregate({
        where: { createdAt: { gte: todayStart }, status: "completed" },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.sale.aggregate({
        where: { createdAt: { gte: monthStart }, status: "completed" },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.medicine.count({ where: { active: true } }),
      prisma.batch.count({
        where: {
          quantity: { gt: 0 },
          medicine: { active: true },
          expiryDate: { gt: now },
        },
      }).then(async () => {
        const batches = await prisma.batch.findMany({
          where: { quantity: { gt: 0 }, expiryDate: { gt: now } },
          include: { medicine: { select: { reorderLevel: true } } },
        });
        return batches.filter((b) => b.quantity <= b.medicine.reorderLevel).length;
      }),
      prisma.batch.count({
        where: {
          quantity: { gt: 0 },
          expiryDate: { lte: thirtyDaysFromNow, gt: now },
        },
      }),
      prisma.customer.count(),
      prisma.sale.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { name: true } },
          user: { select: { name: true } },
          _count: { select: { items: true } },
        },
      }),
      getLast6MonthsSales(),
      prisma.saleItem.groupBy({
        by: ["medicineId"],
        _sum: { quantity: true, totalAmount: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }).then(async (items) => {
        const medicineIds = items.map((i) => i.medicineId);
        const medicines = await prisma.medicine.findMany({
          where: { id: { in: medicineIds } },
          select: { id: true, name: true },
        });
        return items.map((item) => ({
          name: medicines.find((m) => m.id === item.medicineId)?.name || "Unknown",
          quantity: item._sum.quantity || 0,
          revenue: item._sum.totalAmount || 0,
        }));
      }),
      prisma.customer.findMany({
        where: { balance: { gt: 0 } },
        select: { name: true, balance: true, phone: true },
        orderBy: { balance: "desc" },
        take: 5,
      }),
    ]);

    const todayPurchases = await prisma.purchase.aggregate({
      where: { createdAt: { gte: todayStart } },
      _sum: { totalAmount: true },
    });

    const monthPurchases = await prisma.purchase.aggregate({
      where: { createdAt: { gte: monthStart } },
      _sum: { totalAmount: true },
    });

    return NextResponse.json({
      stats: {
        todaySales: todaySales._sum.totalAmount || 0,
        todaySalesCount: todaySales._count,
        monthSales: monthSales._sum.totalAmount || 0,
        monthSalesCount: monthSales._count,
        todayPurchases: todayPurchases._sum.totalAmount || 0,
        monthPurchases: monthPurchases._sum.totalAmount || 0,
        monthProfit:
          (monthSales._sum.totalAmount || 0) - (monthPurchases._sum.totalAmount || 0),
        totalMedicines,
        lowStockCount,
        expiringCount,
        totalCustomers,
      },
      recentSales,
      monthlySalesData,
      topMedicines,
      customerDues,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}

async function getLast6MonthsSales() {
  const data = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const sales = await prisma.sale.aggregate({
      where: {
        createdAt: { gte: start, lt: end },
        status: "completed",
      },
      _sum: { totalAmount: true },
    });
    const purchases = await prisma.purchase.aggregate({
      where: { purchaseDate: { gte: start, lt: end } },
      _sum: { totalAmount: true },
    });
    data.push({
      month: start.toLocaleDateString("en-IN", { month: "short" }),
      sales: sales._sum.totalAmount || 0,
      purchases: purchases._sum.totalAmount || 0,
    });
  }
  return data;
}
