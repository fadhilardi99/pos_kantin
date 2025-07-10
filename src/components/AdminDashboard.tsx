import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart3,
  Users,
  ShoppingCart,
  CreditCard,
  LogOut,
  Plus,
  Download,
  Eye,
} from "lucide-react";

interface AdminDashboardProps {
  user: { name: string };
  onLogout: () => void;
}

const AdminDashboard = ({ user, onLogout }: AdminDashboardProps) => {
  const [students] = useState([
    {
      id: 1,
      name: "Ahmad Rizki",
      nis: "2024001",
      class: "XII IPA 1",
      saldo: 50000,
      status: "active",
    },
    {
      id: 2,
      name: "Siti Fatimah",
      nis: "2024002",
      class: "XII IPA 2",
      saldo: 35000,
      status: "active",
    },
    {
      id: 3,
      name: "Budi Santoso",
      nis: "2024003",
      class: "XI IPS 1",
      saldo: 15000,
      status: "active",
    },
    {
      id: 4,
      name: "Maya Sari",
      nis: "2024004",
      class: "XI IPS 2",
      saldo: 75000,
      status: "active",
    },
  ]);

  const [transactions] = useState([
    {
      id: 1,
      date: "2024-01-15",
      student: "Ahmad Rizki",
      items: "Nasi Gudeg + Es Teh",
      amount: 12000,
      cashier: "Siti Kasir",
    },
    {
      id: 2,
      date: "2024-01-15",
      student: "Siti Fatimah",
      items: "Mie Ayam + Jus Jeruk",
      amount: 15000,
      cashier: "Siti Kasir",
    },
    {
      id: 3,
      date: "2024-01-14",
      student: "Budi Santoso",
      items: "Soto Ayam + Air Mineral",
      amount: 11000,
      cashier: "Andi Kasir",
    },
    {
      id: 4,
      date: "2024-01-14",
      student: "Maya Sari",
      items: "Nasi Gudeg + Jus Jeruk",
      amount: 13000,
      cashier: "Siti Kasir",
    },
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalSales = () => {
    return transactions.reduce((total, t) => total + t.amount, 0);
  };

  const getTotalBalance = () => {
    return students.reduce((total, s) => total + s.saldo, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      {/* Header */}
      <header className="bg-white shadow-md border-b-4 border-orange-500">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-500 p-2 rounded-full">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Dashboard Admin
                </h1>
                <p className="text-gray-600">Administrator: {user.name}</p>
              </div>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Siswa</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {students.length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Penjualan Hari Ini</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(getTotalSales())}
                  </p>
                </div>
                <ShoppingCart className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Saldo Siswa</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(getTotalBalance())}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Transaksi Hari Ini</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {transactions.length}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="students">Manajemen Siswa</TabsTrigger>
            <TabsTrigger value="transactions">Laporan Transaksi</TabsTrigger>
            <TabsTrigger value="reports">Laporan Harian</TabsTrigger>
            <TabsTrigger value="settings">Pengaturan</TabsTrigger>
          </TabsList>

          {/* Students Management */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Manajemen Data Siswa</CardTitle>
                    <CardDescription>
                      Kelola data siswa dan saldo mereka
                    </CardDescription>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Siswa
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {student.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              NIS: {student.nis} • Kelas: {student.class}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {formatCurrency(student.saldo)}
                          </p>
                          <Badge
                            variant={
                              student.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {student.status === "active" ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            Top Up
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Laporan Transaksi</CardTitle>
                    <CardDescription>
                      Riwayat semua transaksi siswa
                    </CardDescription>
                  </div>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {transaction.student}
                            </p>
                            <p className="text-sm text-gray-600">
                              {transaction.items}
                            </p>
                            <p className="text-xs text-gray-500">
                              Kasir: {transaction.cashier}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {transaction.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports */}
          <TabsContent value="reports">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Laporan Penjualan Harian</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Transaksi:</span>
                      <span className="font-bold">{transactions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Penjualan:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(getTotalSales())}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rata-rata per Transaksi:</span>
                      <span className="font-bold">
                        {formatCurrency(getTotalSales() / transactions.length)}
                      </span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Laporan PDF
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Produk Terlaris</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Nasi Gudeg</span>
                      <Badge>15 terjual</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Mie Ayam</span>
                      <Badge>12 terjual</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Es Teh</span>
                      <Badge>20 terjual</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Jus Jeruk</span>
                      <Badge>8 terjual</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Sistem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="school-name">Nama Sekolah</Label>
                    <Input
                      id="school-name"
                      defaultValue="SMA Negeri 1 Jakarta"
                    />
                  </div>
                  <div>
                    <Label htmlFor="canteen-name">Nama Kantin</Label>
                    <Input id="canteen-name" defaultValue="Kantin Sekolah" />
                  </div>
                  <Button>Simpan Pengaturan</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Backup & Restore</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Backup Database
                  </Button>
                  <Button variant="outline" className="w-full">
                    Restore Database
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
