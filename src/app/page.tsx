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
import { useSession, signOut } from "next-auth/react";

type User = {
  role: "student" | "cashier" | "admin" | "parent";
  name: string;
  nis?: string; // Only for students
  saldo?: number; // Only for students
  // Add other properties as needed
};

export default function Page() {
  const { data: session, status } = useSession();
  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = (userData: User) => {
    setShowLogin(false);
  };

  const handleLogout = () => {
    signOut();
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg font-semibold">
        Loading...
      </div>
    );
  }

  if (session?.user) {
    switch (session.user.role) {
      case "STUDENT":
        return <StudentDashboard user={session.user} onLogout={handleLogout} />;
      case "CASHIER":
        return <CashierDashboard user={session.user} onLogout={handleLogout} />;
      case "ADMIN":
        return <AdminDashboard user={session.user} onLogout={handleLogout} />;
      case "PARENT":
        return <ParentDashboard user={session.user} onLogout={handleLogout} />;
      default:
        return <div>Role tidak dikenali</div>;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-amber-50/90 backdrop-blur-md shadow-sm border-b border-green-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-green-700 p-2 rounded-xl shadow-md">
              <Wallet className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-green-800">
                POS Kantin Sekolah
              </h1>
              <p className="text-green-600 text-xs sm:text-sm">
                Sistem Saldo Digital Terpercaya
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowLogin(true)}
            className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 sm:px-8 sm:py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
          >
            🚀 Mulai Sekarang
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 flex-1 flex flex-col justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-amber-500/5 pointer-events-none"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center space-x-2 bg-amber-50/90 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow mb-6 sm:mb-8">
            <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
            <span className="text-xs sm:text-sm font-medium text-green-700">
              Sistem Terdepan 2024
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-8 leading-tight">
            <span className="text-green-700 block">Revolusi Kantin</span>
            <span className="text-green-800 block">Sekolah Digital</span>
          </h2>
          <p className="text-base sm:text-xl text-green-700 mb-6 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
            Transformasi sistem kantin tradisional menjadi platform digital yang
            aman, efisien, dan mudah digunakan oleh semua pihak
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12">
            <Badge
              variant="secondary"
              className="px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-base bg-amber-50/90 backdrop-blur-sm border border-green-200"
            >
              <QrCode className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              QR Scanner Pro
            </Badge>
            <Badge
              variant="secondary"
              className="px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-base bg-amber-50/90 backdrop-blur-sm border border-green-200"
            >
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Saldo Digital
            </Badge>
            <Badge
              variant="secondary"
              className="px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-base bg-amber-50/90 backdrop-blur-sm border border-green-200"
            >
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Analytics Real-time
            </Badge>
          </div>
          <Button
            onClick={() => setShowLogin(true)}
            size="lg"
            className="bg-green-700 hover:bg-green-800 text-white px-8 sm:px-10 py-3 sm:py-4 text-lg sm:text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            🎯 Coba Sekarang
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 sm:py-20 bg-amber-50/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h3 className="text-2xl sm:text-4xl font-bold text-green-800 mb-2 sm:mb-4">
              Platform Lengkap untuk Semua
            </h3>
            <p className="text-base sm:text-xl text-green-700 max-w-2xl mx-auto">
              Setiap role memiliki interface yang disesuaikan dengan kebutuhan
              dan kemudahan penggunaan
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Student Module */}
            <Card className="group hover:shadow-xl transition-all duration-500 hover:scale-105 border-0 bg-amber-50/90 backdrop-blur-sm shadow-md">
              <CardHeader className="text-center pb-2 sm:pb-4">
                <div className="mx-auto bg-green-700 p-3 sm:p-4 rounded-2xl w-fit mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <CardTitle className="text-green-700 text-lg sm:text-xl">
                  Modul Siswa
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-green-700 mb-4 sm:mb-6 text-xs sm:text-base">
                  Akses mudah dengan NIS, pantau saldo real-time, dan kelola
                  pembelian
                </CardDescription>
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-green-700">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>Login dengan NIS</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>Saldo real-time</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>Histori pembelian</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>QR Code pribadi</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Cashier Module */}
            <Card className="group hover:shadow-xl transition-all duration-500 hover:scale-105 border-0 bg-amber-50/90 backdrop-blur-sm shadow-md">
              <CardHeader className="text-center pb-2 sm:pb-4">
                <div className="mx-auto bg-yellow-500 p-3 sm:p-4 rounded-2xl w-fit mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShoppingCart className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <CardTitle className="text-yellow-600 text-lg sm:text-xl">
                  Kasir POS
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-green-700 mb-4 sm:mb-6 text-xs sm:text-base">
                  Interface kasir modern dengan scanner QR dan checkout otomatis
                </CardDescription>
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-green-700">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Scan QR siswa</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Pilih produk & jumlah</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Checkout otomatis</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Cetak struk</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Parent/Top-up Module */}
            <Card className="group hover:shadow-xl transition-all duration-500 hover:scale-105 border-0 bg-amber-50/90 backdrop-blur-sm shadow-md">
              <CardHeader className="text-center pb-2 sm:pb-4">
                <div className="mx-auto bg-amber-500 p-3 sm:p-4 rounded-2xl w-fit mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <CreditCard className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <CardTitle className="text-amber-600 text-lg sm:text-xl">
                  Top Up Saldo
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-green-700 mb-4 sm:mb-6 text-xs sm:text-base">
                  Sistem top-up saldo yang aman dan terpercaya untuk orang tua
                </CardDescription>
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-green-700">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Top-up ke siswa</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Riwayat top-up</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Konfirmasi real-time</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Notifikasi berhasil</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Admin Module */}
            <Card className="group hover:shadow-xl transition-all duration-500 hover:scale-105 border-0 bg-amber-50/90 backdrop-blur-sm shadow-md">
              <CardHeader className="text-center pb-2 sm:pb-4">
                <div className="mx-auto bg-green-600 p-3 sm:p-4 rounded-2xl w-fit mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <CardTitle className="text-green-600 text-lg sm:text-xl">
                  Dashboard Admin
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-green-700 mb-4 sm:mb-6 text-xs sm:text-base">
                  Panel admin komprehensif untuk manajemen dan analisis data
                </CardDescription>
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-green-700">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Manajemen siswa</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Laporan harian</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Histori transaksi</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Export data</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-green-700 via-green-600 to-green-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <h3 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            Siap untuk Revolusi Digital?
          </h3>
          <p className="text-base sm:text-xl mb-6 sm:mb-10 opacity-90 max-w-2xl mx-auto">
            Bergabunglah dengan ratusan sekolah yang telah menggunakan sistem
            POS digital kami
          </p>
          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-white text-green-700 hover:bg-gray-100 px-8 sm:px-10 py-3 sm:py-4 text-lg sm:text-xl font-semibold rounded-xl transition-all duration-300 shadow-lg"
            >
              📞 Hubungi Kami
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-800 text-white py-8 sm:py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3 mb-6">
              <div className="bg-amber-500 p-3 rounded-xl">
                <Wallet className="h-7 w-7 text-white" />
              </div>
              <h4 className="text-xl sm:text-2xl font-bold">
                POS Kantin Sekolah
              </h4>
            </div>
            <p className="text-green-100 mb-4 text-sm sm:text-base">
              Sistem saldo digital terpercaya untuk kantin sekolah modern
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-green-200">
              <span>© 2024 POS Kantin Sekolah</span>
              <span className="hidden sm:inline">•</span>
              <span>Privacy Policy</span>
              <span className="hidden sm:inline">•</span>
              <span>Terms of Service</span>
            </div>
          </div>
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
