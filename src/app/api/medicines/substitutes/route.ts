import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const medicineId = searchParams.get("medicineId");

  if (!medicineId) {
    return NextResponse.json({ error: "medicineId is required" }, { status: 400 });
  }

  try {
    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId },
      include: { batches: { where: { quantity: { gt: 0 } } } },
    });

    if (!medicine) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
    }

    const substitutes = await prisma.medicine.findMany({
      where: {
        id: { not: medicineId },
        active: true,
        OR: [
          medicine.genericName ? { genericName: { equals: medicine.genericName } } : {},
          medicine.composition ? { composition: { contains: medicine.composition.split(",")[0]?.trim() || "" } } : {},
          { category: medicine.category, manufacturer: { not: medicine.manufacturer || undefined } },
        ].filter((c) => Object.keys(c).length > 0),
      },
      include: {
        batches: {
          where: { quantity: { gt: 0 } },
          orderBy: { expiryDate: "desc" },
          take: 1,
        },
      },
      take: 10,
    });

    const results = substitutes
      .filter((s) => s.batches.length > 0)
      .map((s) => ({
        id: s.id,
        name: s.name,
        genericName: s.genericName,
        composition: s.composition,
        category: s.category,
        manufacturer: s.manufacturer,
        matchReason: s.genericName === medicine.genericName
          ? "Same generic name"
          : s.composition?.includes(medicine.composition?.split(",")[0]?.trim() || "___")
          ? "Similar composition"
          : "Same category",
        price: s.batches[0]?.sellingPrice || 0,
        stock: s.batches.reduce((sum, b) => sum + b.quantity, 0),
      }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Substitute search error:", error);
    return NextResponse.json({ error: "Failed to find substitutes" }, { status: 500 });
  }
}
