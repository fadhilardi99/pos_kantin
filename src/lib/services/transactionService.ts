// Transaction service functions
export const transactionService = {
  async getAllTransactions() {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      return await prisma.transaction.findMany({
        include: {
          student: {
            include: { user: true },
          },
          cashier: {
            include: { user: true },
          },
          transactionItems: {
            include: { product: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } finally {
      await prisma.$disconnect();
    }
  },

  async getTransactionById(id: string) {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      return await prisma.transaction.findUnique({
        where: { id },
        include: {
          student: {
            include: { user: true },
          },
          cashier: {
            include: { user: true },
          },
          transactionItems: {
            include: { product: true },
          },
        },
      });
    } finally {
      await prisma.$disconnect();
    }
  },

  async createTransaction(transactionData: any) {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      return await prisma.transaction.create({
        data: transactionData,
        include: {
          student: {
            include: { user: true },
          },
          cashier: {
            include: { user: true },
          },
          transactionItems: {
            include: { product: true },
          },
        },
      });
    } finally {
      await prisma.$disconnect();
    }
  },

  async updateTransaction(id: string, transactionData: any) {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      return await prisma.transaction.update({
        where: { id },
        data: transactionData,
      });
    } finally {
      await prisma.$disconnect();
    }
  },

  async deleteTransaction(id: string) {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      return await prisma.transaction.delete({
        where: { id },
      });
    } finally {
      await prisma.$disconnect();
    }
  },
};
