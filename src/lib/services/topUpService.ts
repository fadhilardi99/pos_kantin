import { prisma } from "@/lib/db";
import { PaymentMethod, TopUpStatus } from "@prisma/client";
import { UserService } from "./userService";
import { sendTopUpNotification } from "@/lib/services/emailService";

export interface CreateTopUpData {
  studentId: string;
  parentId?: string;
  amount: number;
  method: PaymentMethod;
  proofImage?: string;
  notes?: string;
}

export class TopUpService {
  // Create top-up request
  static async createTopUp(data: CreateTopUpData) {
    return await prisma.topUp.create({
      data: {
        studentId: data.studentId,
        parentId: data.parentId,
        amount: data.amount,
        method: data.method,
        proofImage: data.proofImage,
        notes: data.notes,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        parent: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  // Get top-up by ID
  static async getTopUpById(id: string) {
    return await prisma.topUp.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        parent: {
          include: {
            user: true,
          },
        },
        admin: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  // Get all top-ups
  static async getAllTopUps() {
    return await prisma.topUp.findMany({
      include: {
        student: {
          include: {
            user: true,
          },
        },
        parent: {
          include: {
            user: true,
          },
        },
        admin: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // Get top-ups by student
  static async getTopUpsByStudent(studentId: string) {
    return await prisma.topUp.findMany({
      where: { studentId },
      include: {
        parent: {
          include: {
            user: true,
          },
        },
        admin: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // Get top-ups by parent
  static async getTopUpsByParent(parentId: string) {
    return await prisma.topUp.findMany({
      where: { parentId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        admin: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // Get pending top-ups
  static async getPendingTopUps() {
    return await prisma.topUp.findMany({
      where: { status: TopUpStatus.PENDING },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        parent: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  // Approve top-up
  static async approveTopUp(id: string, adminUserId: string) {
    const topUp = await this.getTopUpById(id);

    if (!topUp) {
      throw new Error("Top-up not found");
    }

    if (topUp.status !== TopUpStatus.PENDING) {
      throw new Error("Top-up is not pending");
    }

    // Cari adminId dari tabel admins berdasarkan userId
    const admin = await prisma.admin.findUnique({
      where: { userId: adminUserId },
    });
    if (!admin) throw new Error("Admin not found");
    const adminId = admin.id;

    const updatedTopUp = await prisma.$transaction(async (tx) => {
      // Update top-up status
      const updated = await tx.topUp.update({
        where: { id },
        data: {
          status: TopUpStatus.APPROVED,
          approvedBy: adminId,
          approvedAt: new Date(),
        },
      });

      // Update student saldo
      await UserService.updateStudentSaldo(
        topUp.studentId,
        Number(topUp.amount)
      );

      return updated;
    });
    // Send email notification to parent
    if (topUp.parent?.user?.email) {
      await sendTopUpNotification(
        topUp.parent.user.email,
        "Top Up Disetujui",
        `<p>Permintaan top up untuk <b>${
          topUp.student?.name
        }</b> sebesar <b>Rp${Number(topUp.amount).toLocaleString(
          "id-ID"
        )}</b> telah <b>DISETUJUI</b>.</p>`
      );
    }
    return updatedTopUp;
  }

  // Reject top-up
  static async rejectTopUp(id: string, adminUserId: string, reason?: string) {
    const topUp = await this.getTopUpById(id);

    if (!topUp) {
      throw new Error("Top-up not found");
    }

    if (topUp.status !== TopUpStatus.PENDING) {
      throw new Error("Top-up is not pending");
    }

    // Cari adminId dari tabel admins berdasarkan userId
    const admin = await prisma.admin.findUnique({
      where: { userId: adminUserId },
    });
    if (!admin) throw new Error("Admin not found");
    const adminId = admin.id;

    const updatedTopUp = await prisma.topUp.update({
      where: { id },
      data: {
        status: TopUpStatus.REJECTED,
        approvedBy: adminId,
        approvedAt: new Date(),
        notes: reason
          ? `${topUp.notes || ""}\nRejection reason: ${reason}`
          : topUp.notes,
      },
    });
    // Send email notification to parent
    if (topUp.parent?.user?.email) {
      await sendTopUpNotification(
        topUp.parent.user.email,
        "Top Up Ditolak",
        `<p>Permintaan top up untuk <b>${
          topUp.student?.name
        }</b> sebesar <b>Rp${Number(topUp.amount).toLocaleString(
          "id-ID"
        )}</b> <b>DITOLAK</b>.<br/>Alasan: ${reason || "-"}</p>`
      );
    }
    return updatedTopUp;
  }

  // Complete top-up (for automatic methods like QR_CODE)
  static async completeTopUp(id: string) {
    const topUp = await this.getTopUpById(id);

    if (!topUp) {
      throw new Error("Top-up not found");
    }

    if (topUp.status !== TopUpStatus.PENDING) {
      throw new Error("Top-up is not pending");
    }

    return await prisma.$transaction(async (tx) => {
      // Update top-up status
      const updatedTopUp = await tx.topUp.update({
        where: { id },
        data: {
          status: TopUpStatus.COMPLETED,
          approvedAt: new Date(),
        },
      });

      // Update student saldo
      await UserService.updateStudentSaldo(
        topUp.studentId,
        Number(topUp.amount)
      );

      return updatedTopUp;
    });
  }

  // Get top-up statistics
  static async getTopUpStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalTopUps, todayTopUps, totalAmount, todayAmount] =
      await Promise.all([
        prisma.topUp.count({
          where: { status: TopUpStatus.COMPLETED },
        }),
        prisma.topUp.count({
          where: {
            status: TopUpStatus.COMPLETED,
            createdAt: {
              gte: today,
            },
          },
        }),
        prisma.topUp.aggregate({
          where: { status: TopUpStatus.COMPLETED },
          _sum: {
            amount: true,
          },
        }),
        prisma.topUp.aggregate({
          where: {
            status: TopUpStatus.COMPLETED,
            createdAt: {
              gte: today,
            },
          },
          _sum: {
            amount: true,
          },
        }),
      ]);

    return {
      totalTopUps,
      todayTopUps,
      totalAmount: totalAmount._sum.amount || 0,
      todayAmount: todayAmount._sum.amount || 0,
    };
  }

  // Link parent to student
  static async linkParentToStudent(
    parentId: string,
    studentId: string,
    relation: string
  ) {
    return await prisma.parentStudent.create({
      data: {
        parentId,
        studentId,
        relation,
      },
      include: {
        parent: {
          include: {
            user: true,
          },
        },
        student: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  // Get students by parent
  static async getStudentsByParent(parentId: string) {
    return await prisma.parentStudent.findMany({
      where: { parentId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  // Get parents by student
  static async getParentsByStudent(studentId: string) {
    return await prisma.parentStudent.findMany({
      where: { studentId },
      include: {
        parent: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  // Remove parent-student link
  static async removeParentStudentLink(parentId: string, studentId: string) {
    return await prisma.parentStudent.delete({
      where: {
        parentId_studentId: {
          parentId,
          studentId,
        },
      },
    });
  }
}
