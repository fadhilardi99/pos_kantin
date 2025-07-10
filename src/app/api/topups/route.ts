import { NextRequest, NextResponse } from "next/server";
import { TopUpService } from "@/lib/services";
import { PaymentMethod } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const topups = await TopUpService.getAllTopUps();
  return NextResponse.json(topups);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "PARENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  try {
    const topup = await TopUpService.createTopUp({
      studentId: body.studentId,
      parentId: body.parentId,
      amount: body.amount,
      method: body.method as PaymentMethod,
      proofImage: body.proofImage,
      notes: body.notes,
    });
    return NextResponse.json(topup, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  if (!body.id || !body.action) {
    return NextResponse.json(
      { error: "TopUp ID and action required" },
      { status: 400 }
    );
  }
  try {
    let result;
    if (body.action === "approve") {
      result = await TopUpService.approveTopUp(body.id, session.user.id);
    } else if (body.action === "reject") {
      result = await TopUpService.rejectTopUp(
        body.id,
        session.user.id,
        body.reason
      );
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
