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
        { email: { contains: search } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        _count: { select: { sales: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Customers GET error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const customer = await prisma.customer.create({
      data: {
        name: body.name,
        phone: body.phone || null,
        email: body.email || null,
        address: body.address || null,
      },
    });
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("Customer POST error:", error);
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
