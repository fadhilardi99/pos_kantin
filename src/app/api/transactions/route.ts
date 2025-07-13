import { NextRequest, NextResponse } from "next/server";
import { transactionService } from "@/lib/services";
import { PaymentMethod } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const transactions = await transactionService.getAllTransactions();
  return NextResponse.json(transactions);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "CASHIER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  try {
    const transaction = await transactionService.createTransaction({
      studentId: body.studentId,
      cashierId: body.cashierId,
      items: body.items,
      paymentMethod: body.paymentMethod as PaymentMethod,
      notes: body.notes,
    });
    return NextResponse.json(transaction, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
