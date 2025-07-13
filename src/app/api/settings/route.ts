import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only import Prisma at runtime
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      const settings = await prisma.schoolSettings.findFirst();
      return NextResponse.json(settings);
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { schoolName, canteenName, address, phone, email } = body;

    // Only import Prisma at runtime
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      const settings = await prisma.schoolSettings.upsert({
        where: { id: "1" },
        update: {
          schoolName,
          canteenName,
          address,
          phone,
          email,
        },
        create: {
          id: "1",
          schoolName,
          canteenName,
          address,
          phone,
          email,
        },
      });

      return NextResponse.json(settings);
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
