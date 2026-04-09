import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const medicines = await prisma.medicine.findMany({
      where: { active: true },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });

    const dbCategories = medicines.map((m) => m.category);
    const defaults = [
      "Tablet", "Capsule", "Syrup", "Injection", "Ointment",
      "Drops", "Inhaler", "Powder", "Cream", "Gel", "Spray", "Suppository",
    ];

    const all = [...new Set([...defaults, ...dbCategories])].sort();
    return NextResponse.json(all);
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Category name required" }, { status: 400 });
    }
    return NextResponse.json({ category: name.trim() });
  } catch (error) {
    console.error("Categories POST error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
