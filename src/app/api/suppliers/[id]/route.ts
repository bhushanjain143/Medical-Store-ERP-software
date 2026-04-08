import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: body.name,
        phone: body.phone || null,
        email: body.email || null,
        address: body.address || null,
        gstin: body.gstin || null,
        drugLicense: body.drugLicense || null,
      },
    });
    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Supplier PUT error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.supplier.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Supplier DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
