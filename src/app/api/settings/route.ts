import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const settings = await prisma.schoolSettings.findFirst();
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  let settings = await prisma.schoolSettings.findFirst();
  if (!settings) {
    settings = await prisma.schoolSettings.create({
      data: {
        schoolName: body.schoolName,
        canteenName: body.canteenName,
      },
    });
  } else {
    settings = await prisma.schoolSettings.update({
      where: { id: settings.id },
      data: {
        schoolName: body.schoolName,
        canteenName: body.canteenName,
      },
    });
  }
  return NextResponse.json(settings);
}
