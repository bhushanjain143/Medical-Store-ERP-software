import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { patientName: { contains: search } },
        { doctorName: { contains: search } },
      ];
    }

    const prescriptions = await prisma.prescription.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true } },
        sale: { select: { invoiceNumber: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(prescriptions);
  } catch (error) {
    console.error("Prescriptions fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch prescriptions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    if (!body.patientName || typeof body.patientName !== "string" || body.patientName.trim().length === 0) {
      return NextResponse.json({ error: "Patient name is required" }, { status: 400 });
    }

    const rx = await prisma.prescription.create({
      data: {
        patientName: body.patientName.trim(),
        doctorName: body.doctorName?.trim() || null,
        doctorPhone: body.doctorPhone?.trim() || null,
        diagnosis: body.diagnosis?.trim() || null,
        notes: body.notes?.trim() || null,
        customerId: body.customerId || null,
        status: "pending",
      },
    });
    return NextResponse.json(rx, { status: 201 });
  } catch (error) {
    console.error("Prescription create error:", error);
    return NextResponse.json({ error: "Failed to create prescription" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: "Prescription ID is required" }, { status: 400 });
    }

    const validStatuses = ["pending", "dispensed", "cancelled"];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const rx = await prisma.prescription.update({
      where: { id: body.id },
      data: { status: body.status },
    });
    return NextResponse.json(rx);
  } catch (error) {
    console.error("Prescription update error:", error);
    return NextResponse.json({ error: "Failed to update prescription" }, { status: 500 });
  }
}
