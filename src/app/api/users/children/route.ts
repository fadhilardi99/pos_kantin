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
      const students = await prisma.student.findMany({
        include: {
          user: true,
        },
      });

      return NextResponse.json(students);
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
