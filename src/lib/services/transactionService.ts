import { prisma } from "@/lib/db";
import { PaymentMethod, TransactionStatus } from "@prisma/client";
import { ProductService } from "./productService";
import { UserService } from "./userService";

export interface CreateTransactionData {
  studentId: string;
  cashierId?: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface TransactionItemData {
  productId: string;
  quantity: number;
  price: number;
}

export class TransactionService {
  // Create transaction with items
  static async createTransaction(data: CreateTransactionData) {
    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Generate transaction number
    const transactionNo = `TXN${Date.now()}${Math.random()
      .toString(36)
      .substr(2, 5)
      .toUpperCase()}`;

    return await prisma.$transaction(async (tx) => {
      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          transactionNo,
          studentId: data.studentId,
          cashierId: data.cashierId,
          totalAmount,
          paymentMethod: data.paymentMethod,
          notes: data.notes,
        },
      });

      // Create transaction items and update product stock
      const transactionItems = await Promise.all(
        data.items.map(async (item) => {
          // Decrease product stock
          await ProductService.decreaseProductStock(
            item.productId,
            item.quantity
          );

          // Create transaction item
          return await tx.transactionItem.create({
            data: {
              transactionId: transaction.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.price * item.quantity,
            },
          });
        })
      );

      // Update student saldo if payment method is QR_CODE
      if (data.paymentMethod === PaymentMethod.QR_CODE) {
        await UserService.updateStudentSaldo(data.studentId, -totalAmount);
      }

      return {
        transaction,
        items: transactionItems,
        transaction_items: transactionItems, // alias untuk konsistensi frontend
      };
    });
  }

  // Get transaction by ID
  static async getTransactionById(id: string) {
    return await prisma.transaction.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        cashier: {
          include: {
            user: true,
          },
        },
        transactionItems: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  // Get transaction by transaction number
  static async getTransactionByNumber(transactionNo: string) {
    return await prisma.transaction.findUnique({
      where: { transactionNo },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        cashier: {
          include: {
            user: true,
          },
        },
        transactionItems: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  // Get all transactions
  static async getAllTransactions() {
    const results = await prisma.transaction.findMany({
      include: {
        student: { include: { user: true } },
        cashier: { include: { user: true } },
        transactionItems: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return results.map((trx) => ({
      ...trx,
      transaction_items: trx.transactionItems,
    }));
  }

  // Get transactions by student
  static async getTransactionsByStudent(studentId: string) {
    return await prisma.transaction.findMany({
      where: { studentId },
      include: {
        cashier: {
          include: {
            user: true,
          },
        },
        transactionItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // Get transactions by cashier
  static async getTransactionsByCashier(cashierId: string) {
    return await prisma.transaction.findMany({
      where: { cashierId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        transactionItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // Get transactions by status
  static async getTransactionsByStatus(status: TransactionStatus) {
    return await prisma.transaction.findMany({
      where: { status },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        cashier: {
          include: {
            user: true,
          },
        },
        transactionItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // Update transaction status
  static async updateTransactionStatus(id: string, status: TransactionStatus) {
    return await prisma.transaction.update({
      where: { id },
      data: { status },
    });
  }

  // Cancel transaction
  static async cancelTransaction(id: string) {
    const transaction = await this.getTransactionById(id);

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    return await prisma.$transaction(async (tx) => {
      // Update transaction status
      const updatedTransaction = await tx.transaction.update({
        where: { id },
        data: { status: TransactionStatus.CANCELLED },
      });

      // Restore product stock
      await Promise.all(
        transaction.transactionItems.map(async (item) => {
          await ProductService.updateProductStock(
            item.productId,
            item.quantity
          );
        })
      );

      // Restore student saldo if payment was made via QR_CODE
      if (transaction.paymentMethod === PaymentMethod.QR_CODE) {
        await UserService.updateStudentSaldo(
          transaction.studentId,
          Number(transaction.totalAmount)
        );
      }

      return updatedTransaction;
    });
  }

  // Get transaction statistics
  static async getTransactionStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalTransactions, todayTransactions, totalRevenue, todayRevenue] =
      await Promise.all([
        prisma.transaction.count({
          where: { status: TransactionStatus.COMPLETED },
        }),
        prisma.transaction.count({
          where: {
            status: TransactionStatus.COMPLETED,
            createdAt: {
              gte: today,
            },
          },
        }),
        prisma.transaction.aggregate({
          where: { status: TransactionStatus.COMPLETED },
          _sum: {
            totalAmount: true,
          },
        }),
        prisma.transaction.aggregate({
          where: {
            status: TransactionStatus.COMPLETED,
            createdAt: {
              gte: today,
            },
          },
          _sum: {
            totalAmount: true,
          },
        }),
      ]);

    return {
      totalTransactions,
      todayTransactions,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      todayRevenue: todayRevenue._sum.totalAmount || 0,
    };
  }

  // Get transactions by date range
  static async getTransactionsByDateRange(startDate: Date, endDate: Date) {
    return await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        cashier: {
          include: {
            user: true,
          },
        },
        transactionItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // Get top selling products
  static async getTopSellingProducts(limit: number = 10) {
    return await prisma.transactionItem.groupBy({
      by: ["productId"],
      where: {
        transaction: {
          status: TransactionStatus.COMPLETED,
        },
      },
      _sum: {
        quantity: true,
        subtotal: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: limit,
    });
  }
}
