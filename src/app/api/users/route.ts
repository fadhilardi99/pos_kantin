import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/lib/services";
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const users = await UserService.getUsersByRole(UserRole.STUDENT); // Default: list students
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  try {
    let user;
    switch (body.role) {
      case UserRole.STUDENT:
        user = await UserService.createStudent(body);
        break;
      case UserRole.CASHIER:
        user = await UserService.createCashier(body);
        break;
      case UserRole.ADMIN:
        user = await UserService.createAdmin(body);
        break;
      case UserRole.PARENT:
        user = await UserService.createParent(body);
        break;
      default:
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    return NextResponse.json(user, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  if (!body.id) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }
  try {
    const user = await UserService.updateUser(body.id, body);
    return NextResponse.json(user);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  if (!body.id) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }
  try {
    await UserService.deleteUser(body.id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
