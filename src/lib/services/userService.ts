import { prisma } from "@/lib/db";
import { UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface CreateStudentData extends CreateUserData {
  nis: string;
  nisn?: string;
  class: string;
  grade: string;
}

export interface CreateCashierData extends CreateUserData {
  nip: string;
  shift?: string;
  shifts?: string[];
}

export interface CreateAdminData extends CreateUserData {
  nip: string;
  position: string;
}

export interface CreateParentData extends CreateUserData {
  nik: string;
  phone: string;
  address?: string;
  children?: { studentId: string; relation: string }[];
}

export class UserService {
  // Create user with role-specific data
  static async createUser(data: CreateUserData) {
    const hashedPassword = await bcrypt.hash(data.password, 12);

    return await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role,
      },
    });
  }

  // Create student
  static async createStudent(data: CreateStudentData) {
    const hashedPassword = await bcrypt.hash(data.password, 12);

    return await prisma.student.create({
      data: {
        user: {
          create: {
            email: data.email,
            password: hashedPassword,
            name: data.name,
            role: UserRole.STUDENT,
          },
        },
        nis: data.nis,
        nisn: data.nisn,
        name: data.name,
        class: data.class,
        grade: data.grade,
      },
      include: {
        user: true,
      },
    });
  }

  // Create cashier
  static async createCashier(data: CreateCashierData) {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    return await prisma.cashier.create({
      data: {
        user: {
          create: {
            email: data.email,
            password: hashedPassword,
            name: data.name,
            role: UserRole.CASHIER,
          },
        },
        nip: data.nip,
        shift: data.shift || "",
        shifts: data.shifts || [],
      },
      include: {
        user: true,
      },
    });
  }

  // Create admin
  static async createAdmin(data: CreateAdminData) {
    const hashedPassword = await bcrypt.hash(data.password, 12);

    return await prisma.admin.create({
      data: {
        user: {
          create: {
            email: data.email,
            password: hashedPassword,
            name: data.name,
            role: UserRole.ADMIN,
          },
        },
        nip: data.nip,
        position: data.position,
      },
      include: {
        user: true,
      },
    });
  }

  // Create parent
  static async createParent(data: CreateParentData) {
    const hashedPassword = await bcrypt.hash(data.password, 12);

    return await prisma.$transaction(async (tx) => {
      const parent = await tx.parent.create({
        data: {
          user: {
            create: {
              email: data.email,
              password: hashedPassword,
              name: data.name,
              role: UserRole.PARENT,
            },
          },
          nik: data.nik,
          name: data.name,
          phone: data.phone,
          address: data.address,
        },
        include: { user: true },
      });

      // Hubungkan ke anak-anak jika ada
      if (data.children && data.children.length > 0) {
        for (const child of data.children) {
          await tx.parentStudent.create({
            data: {
              parentId: parent.id,
              studentId: child.studentId,
              relation: child.relation,
            },
          });
        }
      }
      return parent;
    });
  }

  // Get user by ID
  static async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        student: true,
        cashier: true,
        admin: true,
        parent: true,
      },
    });
  }

  // Get user by email
  static async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        student: true,
        cashier: true,
        admin: true,
        parent: true,
      },
    });
  }

  // Get student by NIS
  static async getStudentByNIS(nis: string) {
    return await prisma.student.findUnique({
      where: { nis },
      include: {
        user: true,
        parentStudents: {
          include: {
            parent: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  }

  // Get all students
  static async getAllStudents() {
    return await prisma.student.findMany({
      include: {
        user: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  // Get all cashiers
  static async getAllCashiers() {
    return await prisma.cashier.findMany({
      include: {
        user: true,
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });
  }

  // Update user
  static async updateUser(id: string, data: Partial<CreateUserData>) {
    const updateData: any = {};

    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }

    return await prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  // Update student
  static async updateStudent(id: string, data: Partial<CreateStudentData>) {
    const updateData: any = {};

    if (data.name) updateData.name = data.name;
    if (data.class) updateData.class = data.class;
    if (data.grade) updateData.grade = data.grade;
    if (data.nisn) updateData.nisn = data.nisn;

    return await prisma.student.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
      },
    });
  }

  // Update student saldo
  static async updateStudentSaldo(id: string, amount: number) {
    return await prisma.student.update({
      where: { id },
      data: {
        saldo: {
          increment: amount,
        },
      },
      include: {
        user: true,
      },
    });
  }

  // Update parent dan relasi anak-anaknya
  static async updateParentWithChildren(
    userId: string,
    data: any,
    children: { studentId: string; relation: string }[]
  ) {
    return await prisma.$transaction(async (tx) => {
      // Update data user/parent
      await tx.user.update({
        where: { id: userId },
        data: {
          name: data.name,
          email: data.email,
          password: data.password
            ? await bcrypt.hash(data.password, 12)
            : undefined,
        },
      });
      const parent = await tx.parent.update({
        where: { userId },
        data: {
          // update field parent jika ada
          phone: data.phone,
          address: data.address,
        },
      });
      // Hapus semua relasi parentStudents lama
      await tx.parentStudent.deleteMany({ where: { parentId: parent.id } });
      // Tambahkan relasi parentStudents baru
      for (const child of children) {
        await tx.parentStudent.create({
          data: {
            parentId: parent.id,
            studentId: child.studentId,
            relation: child.relation,
          },
        });
      }
      return parent;
    });
  }

  // Delete user
  static async deleteUser(id: string) {
    return await prisma.user.delete({
      where: { id },
    });
  }

  // Change user status
  static async changeUserStatus(id: string, status: UserStatus) {
    return await prisma.user.update({
      where: { id },
      data: { status },
    });
  }

  // Get users by role
  static async getUsersByRole(role: UserRole) {
    if (role === UserRole.PARENT) {
      return await prisma.user.findMany({
        where: { role },
        include: {
          parent: {
            include: {
              parentStudents: {
                include: {
                  student: {
                    include: { user: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { name: "asc" },
      });
    }
    return await prisma.user.findMany({
      where: { role },
      include: {
        student: true,
        cashier: true,
        admin: true,
        parent: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  // Get cashier by userId
  static async getCashierByUserId(userId: string) {
    return await prisma.cashier.findUnique({
      where: { userId },
      include: { user: true },
    });
  }
}
