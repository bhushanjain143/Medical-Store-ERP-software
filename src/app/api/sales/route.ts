import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateInvoiceNumber } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { customer: { name: { contains: search } } },
      ];
    }

    if (from || to) {
      where.createdAt = {};
      if (from) (where.createdAt as Record<string, unknown>).gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        (where.createdAt as Record<string, unknown>).lte = toDate;
      }
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          customer: { select: { name: true, phone: true } },
          user: { select: { name: true } },
          items: {
            include: {
              medicine: { select: { name: true } },
              batch: { select: { batchNumber: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.sale.count({ where }),
    ]);

    return NextResponse.json({ sales, total, page, limit });
  } catch (error) {
    console.error("Sales GET error:", error);
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items, customerId, paymentMode, discount, notes } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in sale" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      let totalGst = 0;
      const saleItems = [];

      for (const item of items) {
        const batch = await tx.batch.findUnique({
          where: { id: item.batchId },
          include: { medicine: true },
        });

        if (!batch || batch.quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for batch ${batch?.batchNumber || item.batchId}`
          );
        }

        const lineTotal = item.quantity * batch.sellingPrice;
        const gstAmount = (lineTotal * batch.medicine.gstRate) / (100 + batch.medicine.gstRate);
        const itemDiscount = item.discount || 0;

        subtotal += lineTotal;
        totalGst += gstAmount;

        saleItems.push({
          medicineId: batch.medicineId,
          batchId: batch.id,
          quantity: item.quantity,
          unitPrice: batch.sellingPrice,
          discount: itemDiscount,
          gstRate: batch.medicine.gstRate,
          gstAmount,
          totalAmount: lineTotal - itemDiscount,
        });

        await tx.batch.update({
          where: { id: batch.id },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      const totalDiscount = parseFloat(discount) || 0;
      const totalAmount = subtotal - totalDiscount;

      const sale = await tx.sale.create({
        data: {
          invoiceNumber: generateInvoiceNumber(),
          customerId: customerId || null,
          userId: session.userId,
          subtotal,
          discount: totalDiscount,
          gstAmount: totalGst,
          totalAmount,
          paymentMode: paymentMode || "cash",
          notes: notes || null,
          items: { create: saleItems },
        },
        include: {
          items: { include: { medicine: true, batch: true } },
          customer: true,
          user: { select: { name: true } },
        },
      });

      if (customerId && paymentMode === "credit") {
        await tx.customer.update({
          where: { id: customerId },
          data: { balance: { increment: totalAmount } },
        });
      }

      if (paymentMode !== "credit") {
        await tx.payment.create({
          data: {
            type: "sale",
            saleId: sale.id,
            customerId: customerId || null,
            amount: totalAmount,
            mode: paymentMode || "cash",
          },
        });
      }

      return sale;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Sale POST error:", error);
    const message = error instanceof Error ? error.message : "Failed to create sale";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
