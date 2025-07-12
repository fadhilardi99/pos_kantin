import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PARENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ambil parentId dari session user
  const parent = await prisma.parent.findUnique({
    where: { userId: session.user.id },
  });
  if (!parent) {
    return NextResponse.json([], { status: 200 });
  }

  // Ambil semua anak dari tabel relasi
  const children = await prisma.parentStudent.findMany({
    where: { parentId: parent.id },
    include: { student: true },
  });

  // Return data student beserta relation
  return NextResponse.json(
    children.map((c) => ({
      ...c.student,
      relation: c.relation,
    }))
  );
}
