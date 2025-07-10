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
  shift: string;
}

export interface CreateAdminData extends CreateUserData {
  nip: string;
  position: string;
}

export interface CreateParentData extends CreateUserData {
  nik: string;
  phone: string;
  address?: string;
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
        shift: data.shift,
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

    return await prisma.parent.create({
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
      include: {
        user: true,
      },
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
}
