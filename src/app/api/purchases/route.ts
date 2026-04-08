import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { supplier: { name: { contains: search } } },
      ];
    }

    const purchases = await prisma.purchase.findMany({
      where,
      include: {
        supplier: { select: { name: true } },
        items: {
          include: {
            medicine: { select: { name: true } },
            batch: { select: { batchNumber: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(purchases);
  } catch (error) {
    console.error("Purchases GET error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { supplierId, invoiceNumber, items, paymentStatus, paidAmount, notes } = body;

    if (!supplierId || !invoiceNumber || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      let totalGst = 0;
      const purchaseItems = [];

      for (const item of items) {
        const medicine = await tx.medicine.findUnique({ where: { id: item.medicineId } });
        if (!medicine) throw new Error(`Medicine not found: ${item.medicineId}`);

        const batch = await tx.batch.create({
          data: {
            medicineId: item.medicineId,
            batchNumber: item.batchNumber,
            mrp: parseFloat(item.mrp),
            purchasePrice: parseFloat(item.purchasePrice),
            sellingPrice: parseFloat(item.sellingPrice),
            quantity: parseInt(item.quantity),
            mfgDate: item.mfgDate ? new Date(item.mfgDate) : null,
            expiryDate: new Date(item.expiryDate),
          },
        });

        const lineTotal = parseInt(item.quantity) * parseFloat(item.purchasePrice);
        const gstAmount = (lineTotal * medicine.gstRate) / (100 + medicine.gstRate);
        subtotal += lineTotal;
        totalGst += gstAmount;

        purchaseItems.push({
          medicineId: item.medicineId,
          batchId: batch.id,
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.purchasePrice),
          gstRate: medicine.gstRate,
          gstAmount,
          totalAmount: lineTotal,
        });
      }

      const totalAmount = subtotal;
      const paid = parseFloat(paidAmount) || 0;

      const purchase = await tx.purchase.create({
        data: {
          invoiceNumber,
          supplierId,
          subtotal,
          gstAmount: totalGst,
          totalAmount,
          paymentStatus: paymentStatus || (paid >= totalAmount ? "paid" : paid > 0 ? "partial" : "pending"),
          paidAmount: paid,
          notes: notes || null,
          items: { create: purchaseItems },
        },
        include: {
          items: { include: { medicine: true, batch: true } },
          supplier: true,
        },
      });

      if (paid > 0) {
        await tx.payment.create({
          data: {
            type: "purchase",
            purchaseId: purchase.id,
            supplierId,
            amount: paid,
            mode: "bank_transfer",
          },
        });
      }

      const dueAmount = totalAmount - paid;
      if (dueAmount > 0) {
        await tx.supplier.update({
          where: { id: supplierId },
          data: { balance: { increment: dueAmount } },
        });
      }

      return purchase;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Purchase POST error:", error);
    const message = error instanceof Error ? error.message : "Failed to create purchase";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
