// Product service functions
export const productService = {
  async getAllProducts() {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      return await prisma.product.findMany({
        orderBy: { name: "asc" },
      });
    } finally {
      await prisma.$disconnect();
    }
  },

  async getProductById(id: string) {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      return await prisma.product.findUnique({
        where: { id },
      });
    } finally {
      await prisma.$disconnect();
    }
  },

  async createProduct(productData: any) {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      return await prisma.product.create({
        data: productData,
      });
    } finally {
      await prisma.$disconnect();
    }
  },

  async updateProduct(id: string, productData: any) {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      return await prisma.product.update({
        where: { id },
        data: productData,
      });
    } finally {
      await prisma.$disconnect();
    }
  },

  async deleteProduct(id: string) {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      return await prisma.product.delete({
        where: { id },
      });
    } finally {
      await prisma.$disconnect();
    }
  },

  async updateStock(id: string, stock: number) {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
      return await prisma.product.update({
        where: { id },
        data: { stock },
      });
    } finally {
      await prisma.$disconnect();
    }
  },
};
