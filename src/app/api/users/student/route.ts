import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { student: true },
  });

  if (!user || !user.student) {
    return NextResponse.json(null, { status: 404 });
  }

  return NextResponse.json({
    name: user.name,
    nis: user.student.nis,
    saldo: user.student.saldo,
    email: user.email,
  });
}
