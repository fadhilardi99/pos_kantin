"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ShoppingCart,
  CreditCard,
  BarChart3,
  Wallet,
  QrCode,
} from "lucide-react";
import LoginModal from "@/components/LoginModal";
import StudentDashboard, {
  type StudentUser,
} from "@/components/StudentDashboard";
import CashierDashboard from "@/components/CashierDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import ParentDashboard from "@/components/ParentDashboard";

type User = {
  role: "student" | "cashier" | "admin" | "parent";
  name: string;
  nis?: string; // Only for students
  saldo?: number; // Only for students
  // Add other properties as needed
};

export default function Page() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = (userData: User) => {
    setCurrentUser(userData);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (currentUser) {
    switch (currentUser.role) {
      case "student":
        if (currentUser.nis) {
          return (
            <StudentDashboard
              user={currentUser as StudentUser}
              onLogout={handleLogout}
            />
          );
        }
        return <div>Data siswa tidak lengkap</div>;
      case "cashier":
        return <CashierDashboard user={currentUser} onLogout={handleLogout} />;
      case "admin":
        return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
      case "parent":
        return <ParentDashboard user={currentUser} onLogout={handleLogout} />;
      default:
        return <div>Role tidak dikenali</div>;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b-4 border-green-500">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500 p-3 rounded-full">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  POS Kantin Sekolah
                </h1>
                <p className="text-gray-600">Sistem Saldo Digital Siswa</p>
              </div>
            </div>
            <Button
              onClick={() => setShowLogin(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Masuk
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Sistem POS Modern untuk Kantin Sekolah
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Kelola transaksi kantin dengan mudah menggunakan sistem saldo
            digital yang aman dan efisien
          </p>
          <div className="flex justify-center space-x-4">
            <Badge variant="secondary" className="px-4 py-2 text-lg">
              <QrCode className="h-5 w-5 mr-2" />
              QR Scanner
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-lg">
              <CreditCard className="h-5 w-5 mr-2" />
              Saldo Digital
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-lg">
              <BarChart3 className="h-5 w-5 mr-2" />
              Laporan Real-time
            </Badge>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Fitur Utama Aplikasi
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Student Module */}
            <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
              <CardHeader className="text-center">
                <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-blue-600">Modul Siswa</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Login dengan NIS, cek saldo, dan lihat riwayat pembelian
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li>• Login dengan NIS</li>
                  <li>• Cek saldo real-time</li>
                  <li>• Histori pembelian</li>
                  <li>• QR Code pribadi</li>
                </ul>
              </CardContent>
            </Card>

            {/* Cashier Module */}
            <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-green-500">
              <CardHeader className="text-center">
                <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
                  <ShoppingCart className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-green-600">Kasir POS</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Interface kasir dengan scanner QR dan checkout otomatis
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li>• Scan QR siswa</li>
                  <li>• Pilih produk & jumlah</li>
                  <li>• Checkout otomatis</li>
                  <li>• Cetak struk</li>
                </ul>
              </CardContent>
            </Card>

            {/* Parent/Top-up Module */}
            <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-purple-500">
              <CardHeader className="text-center">
                <div className="mx-auto bg-purple-100 p-3 rounded-full w-fit mb-4">
                  <CreditCard className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-purple-600">Top Up Saldo</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Sistem top-up saldo untuk orang tua dan admin
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li>• Top-up ke siswa</li>
                  <li>• Riwayat top-up</li>
                  <li>• Konfirmasi real-time</li>
                  <li>• Notifikasi berhasil</li>
                </ul>
              </CardContent>
            </Card>

            {/* Admin Module */}
            <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-orange-500">
              <CardHeader className="text-center">
                <div className="mx-auto bg-orange-100 p-3 rounded-full w-fit mb-4">
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-orange-600">
                  Dashboard Admin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Panel admin untuk manajemen dan laporan komprehensif
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li>• Manajemen siswa</li>
                  <li>• Laporan harian</li>
                  <li>• Histori transaksi</li>
                  <li>• Export data</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-16 bg-gradient-to-r from-green-500 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-6">Siap Mencoba Aplikasi?</h3>
          <p className="text-xl mb-8 opacity-90">
            Klik tombol Masuk untuk mengakses aplikasi dengan role yang berbeda
          </p>
          <Button
            onClick={() => setShowLogin(true)}
            size="lg"
            className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 text-lg font-medium"
          >
            Mulai Sekarang
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 POS Kantin Sekolah. Sistem Saldo Digital Siswa.</p>
        </div>
      </footer>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}
