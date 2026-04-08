import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        user: { select: { name: true } },
        items: {
          include: {
            medicine: { select: { name: true, hsnCode: true } },
            batch: { select: { batchNumber: true } },
          },
        },
      },
    });
    if (!sale) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(sale);
  } catch (error) {
    console.error("Sale GET error:", error);
    return NextResponse.json({ error: "Failed to fetch sale" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.status === "returned") {
      const sale = await prisma.sale.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!sale) {
        return NextResponse.json({ error: "Sale not found" }, { status: 404 });
      }

      await prisma.$transaction(async (tx) => {
        for (const item of sale.items) {
          await tx.batch.update({
            where: { id: item.batchId },
            data: { quantity: { increment: item.quantity } },
          });
        }

        if (sale.customerId && sale.paymentMode === "credit") {
          await tx.customer.update({
            where: { id: sale.customerId },
            data: { balance: { decrement: sale.totalAmount } },
          });
        }

        await tx.sale.update({
          where: { id },
          data: { status: "returned" },
        });
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid operation" }, { status: 400 });
  } catch (error) {
    console.error("Sale PUT error:", error);
    return NextResponse.json({ error: "Failed to update sale" }, { status: 500 });
  }
}
