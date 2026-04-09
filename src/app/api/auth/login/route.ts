import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { generateOTP, storeOTP, sendOTPEmail } from "@/lib/otp";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    let body: { email?: string; password?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    let user;
    try {
      user = await prisma.user.findUnique({ where: { email } });
    } catch (dbError) {
      console.error("Login DB error:", dbError);
      return NextResponse.json(
        { error: "Database connection failed. Please try again." },
        { status: 503 }
      );
    }

    if (!user || !user.active) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    let isValid: boolean;
    try {
      isValid = await compare(password, user.password);
    } catch (bcryptError) {
      console.error("Login bcrypt error:", bcryptError);
      return NextResponse.json(
        { error: "Authentication processing failed" },
        { status: 500 }
      );
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const otp = generateOTP();
    await storeOTP(email, otp, "login");
    await sendOTPEmail(email, otp, "login");

    return NextResponse.json({
      requireOtp: true,
      email,
      message: "Credentials verified. Please enter the OTP sent to your email.",
    });
  } catch (error) {
    console.error("Login unexpected error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
