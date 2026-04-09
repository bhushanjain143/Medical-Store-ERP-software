import { prisma } from "@/lib/prisma";
import { generateOTP, storeOTP, sendOTPEmail } from "@/lib/otp";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, purpose } = await request.json();

    if (!email || !purpose) {
      return NextResponse.json(
        { error: "Email and purpose are required" },
        { status: 400 }
      );
    }

    if (purpose !== "login" && purpose !== "register") {
      return NextResponse.json(
        { error: "Invalid purpose" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (purpose === "login" && (!user || !user.active)) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    if (purpose === "register" && !user) {
      return NextResponse.json(
        { error: "Please register first before requesting an OTP" },
        { status: 404 }
      );
    }

    const otp = generateOTP();
    await storeOTP(email, otp, purpose);
    await sendOTPEmail(email, otp, purpose);

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
