import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

const OTP_EXPIRY_MINUTES = 5;

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function storeOTP(
  email: string,
  otp: string,
  purpose: "login" | "register"
): Promise<void> {
  const expiry = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;
  const value = `${otp}:${expiry}:${purpose}`;
  const key = `otp:${email.toLowerCase()}`;

  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function verifyOTP(
  email: string,
  otp: string,
  purpose: "login" | "register"
): Promise<{ valid: boolean; error?: string }> {
  const key = `otp:${email.toLowerCase()}`;

  const record = await prisma.setting.findUnique({ where: { key } });
  if (!record) {
    return { valid: false, error: "No OTP found. Please request a new one." };
  }

  const [storedOtp, expiryStr, storedPurpose] = record.value.split(":");
  const expiry = parseInt(expiryStr, 10);

  if (Date.now() > expiry) {
    await prisma.setting.delete({ where: { key } });
    return { valid: false, error: "OTP has expired. Please request a new one." };
  }

  if (storedPurpose !== purpose) {
    return { valid: false, error: "Invalid OTP for this action." };
  }

  if (storedOtp !== otp) {
    return { valid: false, error: "Incorrect OTP. Please try again." };
  }

  await prisma.setting.delete({ where: { key } });
  return { valid: true };
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendOTPEmail(
  email: string,
  otp: string,
  purpose: "login" | "register"
): Promise<{ sent: boolean; fallback?: boolean }> {
  const transporter = getTransporter();
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@medstore.com";
  const subject =
    purpose === "register"
      ? "Verify your MedStore ERP account"
      : "Your MedStore ERP login code";

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f8fafc; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 12px; padding: 12px;">
          <span style="font-size: 24px; font-weight: 800; color: white; letter-spacing: -0.5px;">MedStore ERP</span>
        </div>
      </div>
      <div style="background: white; border-radius: 12px; padding: 32px 24px; border: 1px solid #e2e8f0;">
        <h2 style="margin: 0 0 8px; font-size: 20px; font-weight: 700; color: #1e293b;">
          ${purpose === "register" ? "Verify your email" : "Login verification"}
        </h2>
        <p style="margin: 0 0 24px; font-size: 14px; color: #64748b; line-height: 1.6;">
          ${purpose === "register" ? "Use the code below to complete your registration:" : "Enter the code below to sign in to your account:"}
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <div style="display: inline-block; background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 16px 32px;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; font-family: monospace;">${otp}</span>
          </div>
        </div>
        <p style="margin: 24px 0 0; font-size: 12px; color: #94a3b8; text-align: center;">
          This code expires in ${OTP_EXPIRY_MINUTES} minutes. Do not share it with anyone.
        </p>
      </div>
      <p style="margin: 16px 0 0; font-size: 11px; color: #94a3b8; text-align: center;">
        If you didn't request this code, please ignore this email.
      </p>
    </div>
  `;

  if (!transporter) {
    console.log(`\n${"=".repeat(50)}`);
    console.log(`  OTP for ${email}: ${otp}`);
    console.log(`  Purpose: ${purpose}`);
    console.log(`  (Configure SMTP_HOST, SMTP_USER, SMTP_PASS env vars to send real emails)`);
    console.log(`${"=".repeat(50)}\n`);
    return { sent: true, fallback: true };
  }

  try {
    await transporter.sendMail({
      from: `"MedStore ERP" <${fromEmail}>`,
      to: email,
      subject,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error("Failed to send OTP email:", err);
    console.log(`\n  FALLBACK — OTP for ${email}: ${otp} (purpose: ${purpose})\n`);
    return { sent: true, fallback: true };
  }
}
