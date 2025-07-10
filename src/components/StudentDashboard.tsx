import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Wallet, QrCode, History, LogOut, RefreshCw } from "lucide-react";

export interface StudentUser {
  id: string;
  name: string;
  email?: string;
  role: string;
  nis?: string;
  saldo?: number;
}

interface StudentDashboardProps {
  user: StudentUser;
  onLogout: () => void;
}

const StudentDashboard = ({ user, onLogout }: StudentDashboardProps) => {
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    async function fetchStudent() {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/student?email=${user.email}`);
        const data = await res.json();
        setStudentData(data);
      } catch (e) {
        setStudentData(null);
      } finally {
        setLoading(false);
      }
    }
    if (user.email) fetchStudent();
  }, [user.email]);

  if (loading) return <div>Loading data siswa...</div>;
  if (!studentData) return <div>Data siswa tidak ditemukan.</div>;

  // Tampilkan dashboard dengan data siswa lengkap
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md border-b-4 border-blue-500">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-2 rounded-full">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Dashboard Siswa
                </h1>
                <p className="text-gray-600">Selamat datang, {user.name}</p>
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
        {/* Saldo Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Saldo Anda</CardTitle>
                <CardDescription className="text-blue-100">
                  NIS: {user.nis}
                </CardDescription>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-none"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">
              {formatCurrency(user.saldo ?? 0)}
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-white/20 text-white">
                <QrCode className="h-4 w-4 mr-2" />
                QR Code Aktif
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                Status: Aktif
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <QrCode className="h-5 w-5" />
                <span>QR Code Anda</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-gray-100 p-8 rounded-lg mb-4">
                <div className="w-32 h-32 mx-auto bg-black/10 rounded border-2 border-dashed border-gray-400 flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-gray-400" />
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Tunjukkan QR code ini ke kasir untuk melakukan pembelian
              </p>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">15</p>
                    <p className="text-sm text-gray-600">Transaksi Bulan Ini</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(125000)}
                    </p>
                    <p className="text-sm text-gray-600">Total Pembelian</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(200000)}
                    </p>
                    <p className="text-sm text-gray-600">Total Top Up</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">3</p>
                    <p className="text-sm text-gray-600">Top Up Bulan Ini</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History className="h-5 w-5" />
              <span>Riwayat Transaksi</span>
            </CardTitle>
            <CardDescription>
              Histori pembelian dan top up terbaru Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* The transactions state and fetch were removed, so this loop will not render anything. */}
            </div>

            <div className="mt-6 text-center">
              <Button variant="outline">
                <History className="h-4 w-4 mr-2" />
                Lihat Semua Riwayat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
