import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    if (!body.medicineId || !body.batchNumber || !body.expiryDate) {
      return NextResponse.json({ error: "Medicine, batch number, and expiry date are required" }, { status: 400 });
    }

    const batch = await prisma.batch.create({
      data: {
        medicineId: body.medicineId,
        batchNumber: body.batchNumber.trim(),
        mrp: parseFloat(body.mrp) || 0,
        purchasePrice: parseFloat(body.purchasePrice) || 0,
        sellingPrice: parseFloat(body.sellingPrice) || 0,
        quantity: parseInt(body.quantity) || 0,
        mfgDate: body.mfgDate ? new Date(body.mfgDate) : null,
        expiryDate: new Date(body.expiryDate),
      },
    });
    return NextResponse.json(batch, { status: 201 });
  } catch (error) {
    console.error("Batch POST error:", error);
    return NextResponse.json({ error: "Failed to create batch" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: "Batch ID is required" }, { status: 400 });
    }

    const batch = await prisma.batch.update({
      where: { id: body.id },
      data: {
        batchNumber: body.batchNumber?.trim(),
        mrp: parseFloat(body.mrp) || 0,
        purchasePrice: parseFloat(body.purchasePrice) || 0,
        sellingPrice: parseFloat(body.sellingPrice) || 0,
        quantity: parseInt(body.quantity) || 0,
        mfgDate: body.mfgDate ? new Date(body.mfgDate) : null,
        expiryDate: new Date(body.expiryDate),
      },
    });
    return NextResponse.json(batch);
  } catch (error) {
    console.error("Batch PUT error:", error);
    return NextResponse.json({ error: "Failed to update batch" }, { status: 500 });
  }
}
