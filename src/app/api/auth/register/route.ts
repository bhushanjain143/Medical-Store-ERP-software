import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { generateOTP, storeOTP, sendOTPEmail } from "@/lib/otp";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, storeName } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing && existing.active) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 12);

    if (existing && !existing.active) {
      await prisma.user.update({
        where: { email },
        data: { name, password: hashedPassword },
      });
    } else {
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "admin",
          active: false,
        },
      });
    }

    if (storeName) {
      await prisma.setting.upsert({
        where: { key: "storeName" },
        update: { value: storeName },
        create: { key: "storeName", value: storeName },
      });
    }

    const otp = generateOTP();
    await storeOTP(email, otp, "register");
    await sendOTPEmail(email, otp, "register");

    return NextResponse.json({
      requireOtp: true,
      email,
      message: "Account created. Please verify your email with the OTP sent.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
