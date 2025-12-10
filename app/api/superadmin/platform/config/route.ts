import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    await requireSuperAdmin();

    const configs = await prisma.systemConfig.findMany({
      orderBy: {
        key: "asc",
      },
    });

    return NextResponse.json(configs);
  } catch (error) {
    console.error("Failed to fetch system config:", error);
    return NextResponse.json(
      { error: "Failed to fetch system config" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireSuperAdmin();
    const body = await req.json();
    const { key, value, description } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "Key and value are required" },
        { status: 400 }
      );
    }

    const config = await prisma.systemConfig.upsert({
      where: {
        key,
      },
      update: {
        value,
        description,
        updatedBy: session.user.id,
      },
      create: {
        key,
        value,
        description,
        updatedBy: session.user.id,
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Failed to update system config:", error);
    return NextResponse.json(
      { error: "Failed to update system config" },
      { status: 500 }
    );
  }
}
