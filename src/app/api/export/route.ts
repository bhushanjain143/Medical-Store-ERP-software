import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "sales";
  const format = searchParams.get("format") || "csv";
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    const dateFilter: Record<string, Date> = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);
    const hasDateFilter = Object.keys(dateFilter).length > 0;

    let csvContent = "";
    let filename = "";

    if (type === "sales") {
      const sales = await prisma.sale.findMany({
        where: hasDateFilter ? { createdAt: dateFilter } : undefined,
        include: { customer: true, user: true, items: { include: { medicine: true, batch: true } } },
        orderBy: { createdAt: "desc" },
      });

      csvContent = "Invoice,Date,Customer,Billed By,Payment Mode,Subtotal,GST,Discount,Total,Status\n";
      for (const s of sales) {
        csvContent += `"${s.invoiceNumber}","${s.createdAt.toISOString()}","${s.customer?.name || "Walk-in"}","${s.user.name}","${s.paymentMode}",${s.subtotal},${s.gstAmount},${s.discount},${s.totalAmount},"${s.status}"\n`;
      }
      filename = `sales-report-${new Date().toISOString().split("T")[0]}`;
    } else if (type === "purchases") {
      const purchases = await prisma.purchase.findMany({
        where: hasDateFilter ? { createdAt: dateFilter } : undefined,
        include: { supplier: true, items: { include: { medicine: true } } },
        orderBy: { createdAt: "desc" },
      });

      csvContent = "Invoice,Date,Supplier,Subtotal,GST,Total,Payment Status,Paid Amount\n";
      for (const p of purchases) {
        csvContent += `"${p.invoiceNumber}","${p.createdAt.toISOString()}","${p.supplier.name}",${p.subtotal},${p.gstAmount},${p.totalAmount},"${p.paymentStatus}",${p.paidAmount}\n`;
      }
      filename = `purchases-report-${new Date().toISOString().split("T")[0]}`;
    } else if (type === "inventory") {
      const medicines = await prisma.medicine.findMany({
        include: { batches: true },
        orderBy: { name: "asc" },
      });

      csvContent = "Medicine,Category,Manufacturer,HSN,GST%,Batch,MRP,Purchase Price,Selling Price,Stock,Expiry Date\n";
      for (const m of medicines) {
        for (const b of m.batches) {
          csvContent += `"${m.name}","${m.category}","${m.manufacturer || ""}","${m.hsnCode || ""}",${m.gstRate},"${b.batchNumber}",${b.mrp},${b.purchasePrice},${b.sellingPrice},${b.quantity},"${b.expiryDate.toISOString()}"\n`;
        }
      }
      filename = `inventory-${new Date().toISOString().split("T")[0]}`;
    } else if (type === "customers") {
      const customers = await prisma.customer.findMany({ orderBy: { name: "asc" } });

      csvContent = "Name,Phone,Email,Address,GSTIN,Loyalty Points,Balance\n";
      for (const c of customers) {
        csvContent += `"${c.name}","${c.phone || ""}","${c.email || ""}","${c.address || ""}","${c.gstin || ""}",${c.loyaltyPoints},${c.balance}\n`;
      }
      filename = `customers-${new Date().toISOString().split("T")[0]}`;
    } else if (type === "gst") {
      const sales = await prisma.sale.findMany({
        where: hasDateFilter ? { createdAt: dateFilter } : undefined,
        include: { items: { include: { medicine: true } } },
        orderBy: { createdAt: "desc" },
      });

      csvContent = "Invoice,Date,Medicine,HSN,GST Rate,Taxable Amount,CGST,SGST,Total GST,Total\n";
      for (const s of sales) {
        for (const item of s.items) {
          const taxableAmt = item.totalAmount / (1 + item.gstRate / 100);
          const gst = item.totalAmount - taxableAmt;
          csvContent += `"${s.invoiceNumber}","${s.createdAt.toISOString()}","${item.medicine.name}","${item.medicine.hsnCode || ""}",${item.gstRate},${taxableAmt.toFixed(2)},${(gst / 2).toFixed(2)},${(gst / 2).toFixed(2)},${gst.toFixed(2)},${item.totalAmount}\n`;
        }
      }
      filename = `gst-report-${new Date().toISOString().split("T")[0]}`;
    } else {
      return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
    }

    if (format === "csv") {
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
        },
      });
    }

    return NextResponse.json({ data: csvContent, filename });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
