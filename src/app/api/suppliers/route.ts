import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { gstin: { contains: search } },
      ];
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      include: { _count: { select: { purchases: true } } },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("Suppliers GET error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supplier = await prisma.supplier.create({
      data: {
        name: body.name,
        phone: body.phone || null,
        email: body.email || null,
        address: body.address || null,
        gstin: body.gstin || null,
        drugLicense: body.drugLicense || null,
      },
    });
    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error("Supplier POST error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
