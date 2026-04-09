import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const jwtSecret = process.env.JWT_SECRET;
  const envInfo = {
    hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
    hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
    hasJwtSecret: !!jwtSecret,
    jwtSecretLength: jwtSecret ? jwtSecret.length : 0,
    nodeEnv: process.env.NODE_ENV,
  };

  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({
      status: "ok",
      database: "connected",
      users: userCount,
      timestamp: new Date().toISOString(),
      env: envInfo,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
        env: envInfo,
      },
      { status: 500 }
    );
  }
}
