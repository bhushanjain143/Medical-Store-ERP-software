import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "sales";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const dateFilter: Record<string, unknown> = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      dateFilter.lte = toDate;
    }

    switch (type) {
      case "sales": {
        const sales = await prisma.sale.findMany({
          where: {
            ...(from || to ? { createdAt: dateFilter } : {}),
            status: "completed",
          },
          include: {
            customer: { select: { name: true } },
            user: { select: { name: true } },
            items: { include: { medicine: { select: { name: true } } } },
          },
          orderBy: { createdAt: "desc" },
        });

        const totalRevenue = sales.reduce((s, sale) => s + sale.totalAmount, 0);
        const totalGst = sales.reduce((s, sale) => s + sale.gstAmount, 0);
        const totalDiscount = sales.reduce((s, sale) => s + sale.discount, 0);

        return NextResponse.json({
          type: "sales",
          data: sales,
          summary: {
            count: sales.length,
            totalRevenue,
            totalGst,
            totalDiscount,
          },
        });
      }

      case "purchases": {
        const purchases = await prisma.purchase.findMany({
          where: from || to ? { purchaseDate: dateFilter } : {},
          include: {
            supplier: { select: { name: true } },
            items: { include: { medicine: { select: { name: true } } } },
          },
          orderBy: { createdAt: "desc" },
        });

        const totalAmount = purchases.reduce((s, p) => s + p.totalAmount, 0);
        const totalPaid = purchases.reduce((s, p) => s + p.paidAmount, 0);

        return NextResponse.json({
          type: "purchases",
          data: purchases,
          summary: { count: purchases.length, totalAmount, totalPaid, pending: totalAmount - totalPaid },
        });
      }

      case "profit": {
        const sales = await prisma.sale.aggregate({
          where: {
            ...(from || to ? { createdAt: dateFilter } : {}),
            status: "completed",
          },
          _sum: { totalAmount: true, discount: true },
          _count: true,
        });

        const purchases = await prisma.purchase.aggregate({
          where: from || to ? { purchaseDate: dateFilter } : {},
          _sum: { totalAmount: true },
          _count: true,
        });

        const saleItems = await prisma.saleItem.findMany({
          where: {
            sale: {
              ...(from || to ? { createdAt: dateFilter } : {}),
              status: "completed",
            },
          },
          include: { batch: { select: { purchasePrice: true } } },
        });

        const costOfGoodsSold = saleItems.reduce(
          (sum, item) => sum + item.batch.purchasePrice * item.quantity,
          0
        );

        const revenue = sales._sum.totalAmount || 0;
        const grossProfit = revenue - costOfGoodsSold;

        return NextResponse.json({
          type: "profit",
          summary: {
            revenue,
            costOfGoodsSold,
            grossProfit,
            grossMargin: revenue > 0 ? ((grossProfit / revenue) * 100).toFixed(1) : "0",
            totalPurchases: purchases._sum.totalAmount || 0,
            totalDiscount: sales._sum.discount || 0,
            salesCount: sales._count,
            purchasesCount: purchases._count,
          },
        });
      }

      case "expiry": {
        const now = new Date();
        const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const sixtyDays = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
        const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

        const batches = await prisma.batch.findMany({
          where: {
            quantity: { gt: 0 },
            expiryDate: { lte: ninetyDays },
          },
          include: { medicine: { select: { name: true, category: true } } },
          orderBy: { expiryDate: "asc" },
        });

        const expired = batches.filter((b) => new Date(b.expiryDate) <= now);
        const within30 = batches.filter((b) => {
          const d = new Date(b.expiryDate);
          return d > now && d <= thirtyDays;
        });
        const within60 = batches.filter((b) => {
          const d = new Date(b.expiryDate);
          return d > thirtyDays && d <= sixtyDays;
        });
        const within90 = batches.filter((b) => {
          const d = new Date(b.expiryDate);
          return d > sixtyDays && d <= ninetyDays;
        });

        return NextResponse.json({
          type: "expiry",
          data: batches,
          summary: {
            expired: expired.length,
            expiredValue: expired.reduce((s, b) => s + b.purchasePrice * b.quantity, 0),
            within30: within30.length,
            within60: within60.length,
            within90: within90.length,
            total: batches.length,
          },
        });
      }

      case "stock": {
        const medicines = await prisma.medicine.findMany({
          where: { active: true },
          include: {
            batches: { where: { quantity: { gt: 0 } } },
          },
          orderBy: { name: "asc" },
        });

        const stockData = medicines.map((m) => {
          const totalQty = m.batches.reduce((s, b) => s + b.quantity, 0);
          const stockValue = m.batches.reduce((s, b) => s + b.purchasePrice * b.quantity, 0);
          const retailValue = m.batches.reduce((s, b) => s + b.sellingPrice * b.quantity, 0);
          return {
            id: m.id,
            name: m.name,
            category: m.category,
            totalQty,
            stockValue,
            retailValue,
            reorderLevel: m.reorderLevel,
            isLowStock: totalQty <= m.reorderLevel,
            batches: m.batches.length,
          };
        });

        const totalStockValue = stockData.reduce((s, m) => s + m.stockValue, 0);
        const totalRetailValue = stockData.reduce((s, m) => s + m.retailValue, 0);
        const lowStockItems = stockData.filter((m) => m.isLowStock);

        return NextResponse.json({
          type: "stock",
          data: stockData,
          summary: {
            totalItems: medicines.length,
            totalStockValue,
            totalRetailValue,
            potentialProfit: totalRetailValue - totalStockValue,
            lowStockCount: lowStockItems.length,
          },
        });
      }

      case "gst": {
        const sales = await prisma.sale.findMany({
          where: {
            ...(from || to ? { createdAt: dateFilter } : {}),
            status: "completed",
          },
          include: {
            items: {
              include: {
                medicine: { select: { name: true, hsnCode: true } },
              },
            },
            customer: { select: { name: true } },
          },
          orderBy: { createdAt: "asc" },
        });

        const gstSummary: Record<string, { taxable: number; cgst: number; sgst: number; total: number }> = {};
        for (const sale of sales) {
          for (const item of sale.items) {
            const rate = item.gstRate.toString();
            if (!gstSummary[rate]) {
              gstSummary[rate] = { taxable: 0, cgst: 0, sgst: 0, total: 0 };
            }
            const taxable = item.totalAmount - item.gstAmount;
            gstSummary[rate].taxable += taxable;
            gstSummary[rate].cgst += item.gstAmount / 2;
            gstSummary[rate].sgst += item.gstAmount / 2;
            gstSummary[rate].total += item.gstAmount;
          }
        }

        return NextResponse.json({
          type: "gst",
          data: sales,
          gstSummary,
          summary: {
            totalTaxable: Object.values(gstSummary).reduce((s, g) => s + g.taxable, 0),
            totalGst: Object.values(gstSummary).reduce((s, g) => s + g.total, 0),
          },
        });
      }

      case "gst_detailed": {
        const sales = await prisma.sale.findMany({
          where: { ...(from || to ? { createdAt: dateFilter } : {}), status: "completed" },
          include: {
            items: { include: { medicine: { select: { name: true, hsnCode: true } } } },
            customer: { select: { name: true } },
          },
          orderBy: { createdAt: "asc" },
        });

        const purchases = await prisma.purchase.findMany({
          where: from || to ? { purchaseDate: dateFilter } : {},
          include: {
            supplier: { select: { name: true, gstin: true } },
            items: { include: { medicine: { select: { name: true, hsnCode: true } } } },
          },
          orderBy: { purchaseDate: "asc" },
        });

        const gstSummary: Record<string, { taxable: number; cgst: number; sgst: number; total: number }> = {};
        const hsnSummary: Record<string, { hsnCode: string; taxable: number; cgst: number; sgst: number; total: number; quantity: number }> = {};

        const salesRegister = sales.map((sale) => {
          let taxable = 0;
          let gst = 0;
          for (const item of sale.items) {
            const rate = item.gstRate.toString();
            if (!gstSummary[rate]) gstSummary[rate] = { taxable: 0, cgst: 0, sgst: 0, total: 0 };
            const itemTaxable = item.totalAmount - item.gstAmount;
            gstSummary[rate].taxable += itemTaxable;
            gstSummary[rate].cgst += item.gstAmount / 2;
            gstSummary[rate].sgst += item.gstAmount / 2;
            gstSummary[rate].total += item.gstAmount;
            taxable += itemTaxable;
            gst += item.gstAmount;

            const hsn = item.medicine.hsnCode || "N/A";
            if (!hsnSummary[hsn]) hsnSummary[hsn] = { hsnCode: hsn, taxable: 0, cgst: 0, sgst: 0, total: 0, quantity: 0 };
            hsnSummary[hsn].taxable += itemTaxable;
            hsnSummary[hsn].cgst += item.gstAmount / 2;
            hsnSummary[hsn].sgst += item.gstAmount / 2;
            hsnSummary[hsn].total += item.gstAmount;
            hsnSummary[hsn].quantity += item.quantity;
          }
          return {
            invoiceNumber: sale.invoiceNumber,
            date: new Date(sale.createdAt).toLocaleDateString("en-IN"),
            customerName: sale.customer?.name || "Walk-in",
            taxable,
            cgst: gst / 2,
            sgst: gst / 2,
            total: gst,
            invoiceTotal: sale.totalAmount,
          };
        });

        const purchaseRegister = purchases.map((p) => {
          const gst = p.gstAmount;
          const taxable = p.subtotal - gst;
          return {
            invoiceNumber: p.invoiceNumber,
            date: new Date(p.purchaseDate).toLocaleDateString("en-IN"),
            supplierName: p.supplier.name,
            gstin: p.supplier.gstin || "",
            taxable,
            cgst: gst / 2,
            sgst: gst / 2,
            total: gst,
            invoiceTotal: p.totalAmount,
          };
        });

        return NextResponse.json({
          summary: {
            totalTaxable: Object.values(gstSummary).reduce((s, g) => s + g.taxable, 0),
            totalGst: Object.values(gstSummary).reduce((s, g) => s + g.total, 0),
          },
          gstSummary,
          hsnSummary,
          salesRegister,
          purchaseRegister,
        });
      }

      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Reports error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
