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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-emerald-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-700 p-2 rounded-full">
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
              className="flex items-center space-x-2 border-emerald-700 text-emerald-700 hover:bg-emerald-700 hover:text-white"
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
          <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Siswa</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {students.length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Penjualan Hari Ini</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {formatCurrency(getTotalSales())}
                  </p>
                </div>
                <ShoppingCart className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Saldo Siswa</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {formatCurrency(getTotalBalance())}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Transaksi Hari Ini</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {transactions.length}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-emerald-50 border-emerald-200">
            <TabsTrigger
              value="students"
              className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white"
            >
              Manajemen Siswa
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white"
            >
              Laporan Transaksi
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white"
            >
              Laporan Harian
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white"
            >
              Pengaturan
            </TabsTrigger>
          </TabsList>

          {/* Students Management */}
          <TabsContent value="students">
            <Card className="border-emerald-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-emerald-800">
                      Manajemen Data Siswa
                    </CardTitle>
                    <CardDescription>
                      Kelola data siswa dan saldo mereka
                    </CardDescription>
                  </div>
                  <Button className="bg-emerald-700 hover:bg-emerald-800">
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
                      className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
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
                          <p className="font-bold text-emerald-700">
                            {formatCurrency(student.saldo)}
                          </p>
                          <Badge
                            variant={
                              student.status === "active"
                                ? "default"
                                : "secondary"
                            }
                            className="bg-emerald-100 text-emerald-800 border-emerald-200"
                          >
                            {student.status === "active" ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                          >
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
            <Card className="border-emerald-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-emerald-800">
                      Laporan Transaksi
                    </CardTitle>
                    <CardDescription>
                      Riwayat semua transaksi siswa
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                  >
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
                      className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
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
                        <p className="font-bold text-emerald-700">
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
              <Card className="border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-emerald-800">
                    Laporan Penjualan Harian
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Transaksi:</span>
                      <span className="font-bold">{transactions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Penjualan:</span>
                      <span className="font-bold text-emerald-700">
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
                  <Button
                    className="w-full mt-4 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Laporan PDF
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-emerald-800">
                    Top Produk Terlaris
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Nasi Gudeg</span>
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                        15 terjual
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Mie Ayam</span>
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                        12 terjual
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Es Teh</span>
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                        20 terjual
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Jus Jeruk</span>
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                        8 terjual
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-emerald-800">
                    Pengaturan Sistem
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="school-name">Nama Sekolah</Label>
                    <Input
                      id="school-name"
                      defaultValue="SMA Negeri 1 Jakarta"
                      className="border-emerald-300 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="canteen-name">Nama Kantin</Label>
                    <Input
                      id="canteen-name"
                      defaultValue="Kantin Sekolah"
                      className="border-emerald-300 focus:border-emerald-500"
                    />
                  </div>
                  <Button className="bg-emerald-700 hover:bg-emerald-800">
                    Simpan Pengaturan
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-emerald-800">
                    Backup & Restore
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Backup Database
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                  >
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
