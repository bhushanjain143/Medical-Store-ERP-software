import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        _count: { select: { sales: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Users GET error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const hashedPassword = await hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "salesperson",
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("User POST error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
