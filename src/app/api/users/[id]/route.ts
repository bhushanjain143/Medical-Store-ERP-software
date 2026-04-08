import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {
      name: body.name,
      email: body.email,
      role: body.role,
      active: body.active,
    };

    if (body.password) {
      data.password = await hash(body.password, 12);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, active: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("User PUT error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    if (id === session.userId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("User DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
