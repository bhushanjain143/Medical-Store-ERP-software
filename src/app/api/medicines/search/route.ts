import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const inStock = searchParams.get("inStock") === "true";

  if (!query && !category) {
    return NextResponse.json({ error: "Provide a search query or category" }, { status: 400 });
  }

  try {
    const where: Record<string, unknown> = { active: true };

    if (query) {
      const q = query.toLowerCase();
      where.OR = [
        { name: { contains: q } },
        { genericName: { contains: q } },
        { composition: { contains: q } },
        { manufacturer: { contains: q } },
        { category: { contains: q } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const medicines = await prisma.medicine.findMany({
      where: where as never,
      include: {
        batches: {
          where: inStock ? { quantity: { gt: 0 } } : undefined,
          orderBy: { expiryDate: "asc" },
        },
      },
      take: 20,
    });

    const results = medicines.map((m) => {
      const totalStock = m.batches.reduce((sum, b) => sum + b.quantity, 0);
      const cheapestBatch = m.batches.reduce(
        (min, b) => (b.sellingPrice < min.sellingPrice ? b : min),
        m.batches[0] || { sellingPrice: 0, mrp: 0 }
      );

      return {
        id: m.id,
        name: m.name,
        genericName: m.genericName,
        composition: m.composition,
        category: m.category,
        manufacturer: m.manufacturer,
        gstRate: m.gstRate,
        prescriptionReq: m.prescriptionReq,
        totalStock,
        price: cheapestBatch?.sellingPrice || 0,
        mrp: cheapestBatch?.mrp || 0,
        batchCount: m.batches.length,
        available: totalStock > 0,
      };
    });

    const responseText = results.length > 0
      ? `Found ${results.length} medicine(s) matching "${query || category}":`
      : `No medicines found matching "${query || category}". Try a different search term.`;

    return NextResponse.json({ message: responseText, results, total: results.length });
  } catch (error) {
    console.error("Medicine search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
