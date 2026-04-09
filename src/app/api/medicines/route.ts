import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const where: Record<string, unknown> = { active: true };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { genericName: { contains: search } },
        { composition: { contains: search } },
        { manufacturer: { contains: search } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const medicines = await prisma.medicine.findMany({
      where,
      include: {
        batches: {
          where: { quantity: { gt: 0 } },
          orderBy: { expiryDate: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    const result = medicines.map((med) => {
      const totalStock = med.batches.reduce((sum, b) => sum + b.quantity, 0);
      const nearestExpiry = med.batches[0]?.expiryDate || null;
      return { ...med, totalStock, nearestExpiry };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Medicines GET error:", error);
    return NextResponse.json({ error: "Failed to fetch medicines" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
      return NextResponse.json({ error: "Medicine name is required" }, { status: 400 });
    }

    const medicine = await prisma.medicine.create({
      data: {
        name: body.name.trim(),
        genericName: body.genericName || null,
        composition: body.composition || null,
        category: body.category || "Tablet",
        manufacturer: body.manufacturer || null,
        hsnCode: body.hsnCode || null,
        gstRate: parseFloat(body.gstRate) || 12,
        prescriptionReq: body.prescriptionReq || false,
        rackLocation: body.rackLocation || null,
        reorderLevel: parseInt(body.reorderLevel) || 10,
      },
    });
    return NextResponse.json(medicine, { status: 201 });
  } catch (error) {
    console.error("Medicine POST error:", error);
    return NextResponse.json({ error: "Failed to create medicine" }, { status: 500 });
  }
}
