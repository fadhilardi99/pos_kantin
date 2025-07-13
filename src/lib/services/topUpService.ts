// TopUp service functions
export const topUpService = {
  async getAllTopUps() {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      return await prisma.topUp.findMany({
        include: {
          student: {
            include: { user: true },
          },
          parent: {
            include: { user: true },
          },
          admin: {
            include: { user: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } finally {
      await prisma.$disconnect();
    }
  },

  async getTopUpById(id: string) {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      return await prisma.topUp.findUnique({
        where: { id },
        include: {
          student: {
            include: { user: true },
          },
          parent: {
            include: { user: true },
          },
          admin: {
            include: { user: true },
          },
        },
      });
    } finally {
      await prisma.$disconnect();
    }
  },

  async createTopUp(topUpData: any) {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      return await prisma.topUp.create({
        data: topUpData,
        include: {
          student: {
            include: { user: true },
          },
          parent: {
            include: { user: true },
          },
          admin: {
            include: { user: true },
          },
        },
      });
    } finally {
      await prisma.$disconnect();
    }
  },

  async updateTopUp(id: string, topUpData: any) {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      return await prisma.topUp.update({
        where: { id },
        data: topUpData,
      });
    } finally {
      await prisma.$disconnect();
    }
  },

  async deleteTopUp(id: string) {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      return await prisma.topUp.delete({
        where: { id },
      });
    } finally {
      await prisma.$disconnect();
    }
  },
};
