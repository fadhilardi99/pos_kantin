import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const nis = searchParams.get("nis");

  if (!email && !nis) {
    return NextResponse.json(
      { error: "Email atau NIS is required" },
      { status: 400 }
    );
  }

  let user;
  if (email) {
    user = await prisma.user.findUnique({
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
      class: user.student.class,
      id: user.student.id,
    });
  } else if (nis) {
    const student = await prisma.student.findUnique({
      where: { nis },
      include: { user: true },
    });
    if (!student || !student.user) {
      return NextResponse.json(null, { status: 404 });
    }
    return NextResponse.json({
      name: student.user.name,
      nis: student.nis,
      saldo: student.saldo,
      class: student.class,
      id: student.id,
    });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const { id, amount } = body;
  if (!id || !amount || amount <= 0) {
    return NextResponse.json(
      { error: "ID dan amount diperlukan" },
      { status: 400 }
    );
  }
  try {
    // Update saldo siswa
    const updated = await prisma.student.update({
      where: { id },
      data: { saldo: { increment: amount } },
    });
    // Cari adminId berdasarkan userId
    let adminId = null;
    if (session?.user?.id) {
      const admin = await prisma.admin.findUnique({
        where: { userId: session.user.id },
      });
      adminId = admin?.id || null;
    }
    if (!adminId) {
      return NextResponse.json(
        { error: "Admin tidak ditemukan" },
        { status: 400 }
      );
    }
    // Buat record di tabel top_ups
    await prisma.topUp.create({
      data: {
        studentId: id,
        amount: amount,
        method: "CASH",
        status: "APPROVED",
        approvedBy: adminId,
        createdAt: new Date(),
      },
    });
    return NextResponse.json({ success: true, saldo: updated.saldo });
  } catch (e: any) {
    console.error("Top up manual admin error:", e);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
