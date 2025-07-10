import { prisma } from "@/lib/db";
import { ProductCategory, ProductStatus } from "@prisma/client";

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: ProductCategory;
  image?: string;
  barcode?: string;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: ProductCategory;
  status?: ProductStatus;
  image?: string;
  barcode?: string;
}

export class ProductService {
  // Create product
  static async createProduct(data: CreateProductData) {
    return await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        category: data.category,
        image: data.image,
        barcode: data.barcode,
      },
    });
  }

  // Get product by ID
  static async getProductById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
    });
  }

  // Get product by barcode
  static async getProductByBarcode(barcode: string) {
    return await prisma.product.findUnique({
      where: { barcode },
    });
  }

  // Get all products
  static async getAllProducts() {
    return await prisma.product.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }

  // Get products by category
  static async getProductsByCategory(category: ProductCategory) {
    return await prisma.product.findMany({
      where: { category },
      orderBy: {
        name: "asc",
      },
    });
  }

  // Get available products (in stock)
  static async getAvailableProducts() {
    return await prisma.product.findMany({
      where: {
        status: ProductStatus.AVAILABLE,
        stock: {
          gt: 0,
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  // Update product
  static async updateProduct(id: string, data: UpdateProductData) {
    return await prisma.product.update({
      where: { id },
      data,
    });
  }

  // Update product stock
  static async updateProductStock(id: string, quantity: number) {
    return await prisma.product.update({
      where: { id },
      data: {
        stock: {
          increment: quantity,
        },
      },
    });
  }

  // Decrease product stock (for transactions)
  static async decreaseProductStock(id: string, quantity: number) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.stock < quantity) {
      throw new Error("Insufficient stock");
    }

    return await prisma.product.update({
      where: { id },
      data: {
        stock: {
          decrement: quantity,
        },
        status:
          product.stock - quantity === 0
            ? ProductStatus.OUT_OF_STOCK
            : ProductStatus.AVAILABLE,
      },
    });
  }

  // Delete product
  static async deleteProduct(id: string) {
    return await prisma.product.delete({
      where: { id },
    });
  }

  // Change product status
  static async changeProductStatus(id: string, status: ProductStatus) {
    return await prisma.product.update({
      where: { id },
      data: { status },
    });
  }

  // Search products by name
  static async searchProducts(query: string) {
    return await prisma.product.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  // Get low stock products (stock < 10)
  static async getLowStockProducts() {
    return await prisma.product.findMany({
      where: {
        stock: {
          lt: 10,
        },
        status: ProductStatus.AVAILABLE,
      },
      orderBy: {
        stock: "asc",
      },
    });
  }

  // Get out of stock products
  static async getOutOfStockProducts() {
    return await prisma.product.findMany({
      where: {
        status: ProductStatus.OUT_OF_STOCK,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  // Bulk update product stock
  static async bulkUpdateStock(updates: { id: string; quantity: number }[]) {
    const transactions = updates.map((update) =>
      prisma.product.update({
        where: { id: update.id },
        data: {
          stock: {
            increment: update.quantity,
          },
        },
      })
    );

    return await prisma.$transaction(transactions);
  }
}
