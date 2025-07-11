import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create school settings
  const schoolSettings = await prisma.schoolSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      schoolName: "SMA Negeri 1 Jakarta",
      canteenName: "Kantin Sekolah",
      address: "Jl. Pendidikan No. 1, Jakarta",
      phone: "+62-21-1234567",
      email: "info@sman1jakarta.sch.id",
    },
  });

  // Create admin user
  const adminPassword = await bcrypt.hash("admin", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      password: adminPassword,
      name: "Administrator",
      role: "ADMIN",
    },
  });

  const admin = await prisma.admin.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      nip: "198501012010012001",
      position: "Kepala Sekolah",
    },
  });

  // Create cashier user
  const cashierPassword = await bcrypt.hash("cashier", 12);
  const cashierUser = await prisma.user.upsert({
    where: { email: "cashier@demo.com" },
    update: {},
    create: {
      email: "cashier@demo.com",
      password: cashierPassword,
      name: "Siti Kasir",
      role: "CASHIER",
    },
  });

  const cashier = await prisma.cashier.upsert({
    where: { userId: cashierUser.id },
    update: {},
    create: {
      userId: cashierUser.id,
      nip: "199002152010012002",
      shift: "08:00 - 16:00",
    },
  });

  // Create parent user
  const parentPassword = await bcrypt.hash("parent", 12);
  const parentUser = await prisma.user.upsert({
    where: { email: "parent@demo.com" },
    update: {},
    create: {
      email: "parent@demo.com",
      password: parentPassword,
      name: "Ahmad Santoso",
      role: "PARENT",
    },
  });

  const parent = await prisma.parent.upsert({
    where: { userId: parentUser.id },
    update: {},
    create: {
      userId: parentUser.id,
      nik: "1234567890123456",
      name: "Ahmad Santoso",
      phone: "+6281234567890",
      address: "Jl. Keluarga No. 123, Jakarta",
    },
  });

  // Create student user
  const studentPassword = await bcrypt.hash("student", 12);
  const studentUser = await prisma.user.upsert({
    where: { email: "student@demo.com" },
    update: {},
    create: {
      email: "student@demo.com",
      password: studentPassword,
      name: "Ahmad Rizki",
      role: "STUDENT",
    },
  });

  const student = await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      nis: "2024001",
      nisn: "1234567890",
      name: "Ahmad Rizki",
      class: "XII IPA 1",
      grade: "XII",
      saldo: 50000,
    },
  });

  // Create parent-student relationship
  await prisma.parentStudent.upsert({
    where: {
      parentId_studentId: {
        parentId: parent.id,
        studentId: student.id,
      },
    },
    update: {},
    create: {
      parentId: parent.id,
      studentId: student.id,
      relation: "Ayah",
    },
  });

  // Create products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { barcode: "1234567890123" },
      update: {},
      create: {
        name: "Nasi Gudeg",
        description: "Nasi gudeg dengan ayam dan telur",
        price: 8000,
        stock: 25,
        category: "MAKANAN_BERAT",
        barcode: "1234567890123",
      },
    }),
    prisma.product.upsert({
      where: { barcode: "1234567890124" },
      update: {},
      create: {
        name: "Mie Ayam",
        description: "Mie ayam dengan kuah kaldu",
        price: 10000,
        stock: 20,
        category: "MAKANAN_BERAT",
        barcode: "1234567890124",
      },
    }),
    prisma.product.upsert({
      where: { barcode: "1234567890125" },
      update: {},
      create: {
        name: "Soto Ayam",
        description: "Soto ayam dengan kuah santan",
        price: 9000,
        stock: 15,
        category: "MAKANAN_BERAT",
        barcode: "1234567890125",
      },
    }),
    prisma.product.upsert({
      where: { barcode: "1234567890126" },
      update: {},
      create: {
        name: "Es Teh",
        description: "Es teh manis segar",
        price: 3000,
        stock: 50,
        category: "MINUMAN",
        barcode: "1234567890126",
      },
    }),
    prisma.product.upsert({
      where: { barcode: "1234567890127" },
      update: {},
      create: {
        name: "Jus Jeruk",
        description: "Jus jeruk segar",
        price: 5000,
        stock: 30,
        category: "MINUMAN",
        barcode: "1234567890127",
      },
    }),
    prisma.product.upsert({
      where: { barcode: "1234567890128" },
      update: {},
      create: {
        name: "Air Mineral",
        description: "Air mineral kemasan 600ml",
        price: 2000,
        stock: 40,
        category: "MINUMAN",
        barcode: "1234567890128",
      },
    }),
  ]);

  // Create sample transactions
  const transaction = await prisma.transaction.upsert({
    where: { transactionNo: "TRX-2024-001" },
    update: {},
    create: {
      transactionNo: "TRX-2024-001",
      studentId: student.id,
      cashierId: cashier.id,
      totalAmount: 12000,
      paymentMethod: "QR_CODE",
      status: "COMPLETED",
      transactionItems: {
        create: [
          {
            productId: products[0].id, // Nasi Gudeg
            quantity: 1,
            price: 8000,
            subtotal: 8000,
          },
          {
            productId: products[3].id, // Es Teh
            quantity: 1,
            price: 3000,
            subtotal: 3000,
          },
        ],
      },
    },
  });

  // Create sample top up
  await prisma.topUp.create({
    data: {
      studentId: student.id,
      parentId: parent.id,
      amount: 25000,
      method: "TRANSFER",
      status: "COMPLETED",
      approvedBy: admin.id,
      approvedAt: new Date(),
    },
  });

  // Cek apakah sudah ada super admin
  const superAdminEmail = "superadmin@kantin.com";
  const existing = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });
  if (existing) {
    console.log("Super admin already exists");
    return;
  }

  // Buat user super admin
  const password = await bcrypt.hash("superadmin123", 10);
  const user = await prisma.user.create({
    data: {
      email: superAdminEmail,
      password,
      name: "Super Admin",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  // Buat admin (harus isi nip dan position)
  await prisma.admin.create({
    data: {
      userId: user.id,
      nip: "00000001",
      position: "Super Admin",
    },
  });

  console.log("Super admin created!");

  console.log("✅ Database seeded successfully!");
  console.log("📊 Created:");
  console.log(`   - School Settings: ${schoolSettings.schoolName}`);
  console.log(`   - Admin: ${adminUser.name}`);
  console.log(`   - Cashier: ${cashierUser.name}`);
  console.log(`   - Parent: ${parentUser.name}`);
  console.log(`   - Student: ${studentUser.name}`);
  console.log(`   - Products: ${products.length}`);
  console.log(`   - Sample Transaction: ${transaction.transactionNo}`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
