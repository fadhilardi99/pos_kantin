import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }
  const { stock } = body;

  if (!id || typeof stock !== "number" || stock < 0) {
    return NextResponse.json({ message: "Data tidak valid" }, { status: 400 });
  }

  try {
    const updated = await prisma.product.update({
      where: { id },
      data: { stock },
    });
    return NextResponse.json({
      message: "Stok produk berhasil diupdate",
      product: updated,
    });
  } catch (e) {
    return NextResponse.json(
      { message: "Produk tidak ditemukan" },
      { status: 404 }
    );
  }
}
