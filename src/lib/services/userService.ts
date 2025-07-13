// User service functions
export const userService = {
  async getAllUsers() {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      return await prisma.user.findMany({
        include: {
          admin: true,
          cashier: true,
          student: true,
          parent: true,
        },
      });
    } finally {
      await prisma.$disconnect();
    }
  },

  async getUserById(id: string) {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      return await prisma.user.findUnique({
        where: { id },
        include: {
          admin: true,
          cashier: true,
          student: true,
          parent: true,
        },
      });
    } finally {
      await prisma.$disconnect();
    }
  },

  async createUser(userData: any) {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      return await prisma.user.create({
        data: userData,
      });
    } finally {
      await prisma.$disconnect();
    }
  },

  async updateUser(id: string, userData: any) {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      return await prisma.user.update({
        where: { id },
        data: userData,
      });
    } finally {
      await prisma.$disconnect();
    }
  },

  async deleteUser(id: string) {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      return await prisma.user.delete({
        where: { id },
      });
    } finally {
      await prisma.$disconnect();
    }
  },
};
