import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        sales: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { _count: { select: { items: true } } },
        },
        payments: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });
    if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(customer);
  } catch (error) {
    console.error("Customer GET error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name: body.name,
        phone: body.phone || null,
        email: body.email || null,
        address: body.address || null,
      },
    });
    return NextResponse.json(customer);
  } catch (error) {
    console.error("Customer PUT error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.customer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Customer DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
