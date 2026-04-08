import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const medicine = await prisma.medicine.findUnique({
      where: { id },
      include: {
        batches: { orderBy: { expiryDate: "asc" } },
      },
    });
    if (!medicine) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(medicine);
  } catch (error) {
    console.error("Medicine GET error:", error);
    return NextResponse.json({ error: "Failed to fetch medicine" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const medicine = await prisma.medicine.update({
      where: { id },
      data: {
        name: body.name,
        genericName: body.genericName || null,
        composition: body.composition || null,
        category: body.category,
        manufacturer: body.manufacturer || null,
        hsnCode: body.hsnCode || null,
        gstRate: parseFloat(body.gstRate) || 12,
        prescriptionReq: body.prescriptionReq || false,
        rackLocation: body.rackLocation || null,
        reorderLevel: parseInt(body.reorderLevel) || 10,
      },
    });
    return NextResponse.json(medicine);
  } catch (error) {
    console.error("Medicine PUT error:", error);
    return NextResponse.json({ error: "Failed to update medicine" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.medicine.update({
      where: { id },
      data: { active: false },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Medicine DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete medicine" }, { status: 500 });
  }
}
