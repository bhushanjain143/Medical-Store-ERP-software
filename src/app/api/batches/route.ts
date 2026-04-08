import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const batch = await prisma.batch.create({
      data: {
        medicineId: body.medicineId,
        batchNumber: body.batchNumber,
        mrp: parseFloat(body.mrp),
        purchasePrice: parseFloat(body.purchasePrice),
        sellingPrice: parseFloat(body.sellingPrice),
        quantity: parseInt(body.quantity),
        mfgDate: body.mfgDate ? new Date(body.mfgDate) : null,
        expiryDate: new Date(body.expiryDate),
      },
    });
    return NextResponse.json(batch, { status: 201 });
  } catch (error) {
    console.error("Batch POST error:", error);
    return NextResponse.json(
      { error: "Failed to create batch" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const batch = await prisma.batch.update({
      where: { id: body.id },
      data: {
        batchNumber: body.batchNumber,
        mrp: parseFloat(body.mrp),
        purchasePrice: parseFloat(body.purchasePrice),
        sellingPrice: parseFloat(body.sellingPrice),
        quantity: parseInt(body.quantity),
        mfgDate: body.mfgDate ? new Date(body.mfgDate) : null,
        expiryDate: new Date(body.expiryDate),
      },
    });
    return NextResponse.json(batch);
  } catch (error) {
    console.error("Batch PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update batch" },
      { status: 500 }
    );
  }
}
