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

import {
  Wallet,
  QrCode,
  History,
  LogOut,
  RefreshCw,
  CreditCard,
  ShoppingCart,
  BarChart3,
} from "lucide-react";

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
  const [topups, setTopups] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const fetchAll = async () => {
    setLoadingStats(true);
    try {
      // Fetch student data
      const resStudent = await fetch(`/api/users/student?email=${user.email}`);
      const dataStudent = await resStudent.json();
      setStudentData(dataStudent);
      // Fetch topups (filter by studentId)
      if (dataStudent?.nis || dataStudent?.id) {
        const resTopups = await fetch(`/api/topups`);
        const allTopups = await resTopups.json();
        const studentTopups = allTopups.filter(
          (t: any) =>
            t.student?.nis === dataStudent.nis ||
            t.student?.id === dataStudent.id
        );
        setTopups(studentTopups);
      } else {
        setTopups([]);
      }
      // Fetch transactions (filter by studentId)
      if (dataStudent?.id) {
        const resTrans = await fetch(`/api/transactions`);
        const allTrans = await resTrans.json();
        const studentTrans = allTrans.filter(
          (t: any) => t.student?.id === dataStudent.id
        );
        setTransactions(studentTrans);
      } else {
        setTransactions([]);
      }
    } catch {
      setStudentData(null);
      setTopups([]);
      setTransactions([]);
    } finally {
      setLoading(false);
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (user.email) fetchAll();
    // eslint-disable-next-line
  }, [user.email]);

  const getTotalTopUp = () =>
    topups
      .filter((t) => t.status === "APPROVED")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const getTopUpThisMonth = () => {
    const now = new Date();
    return topups.filter(
      (t) =>
        t.status === "APPROVED" &&
        new Date(t.createdAt).getMonth() === now.getMonth() &&
        new Date(t.createdAt).getFullYear() === now.getFullYear()
    ).length;
  };
  const getTotalTrans = () =>
    transactions.reduce(
      (sum, t) => sum + Number(t.totalAmount || t.amount || 0),
      0
    );
  const getTransThisMonth = () => {
    const now = new Date();
    return transactions.filter(
      (t) =>
        new Date(t.createdAt).getMonth() === now.getMonth() &&
        new Date(t.createdAt).getFullYear() === now.getFullYear()
    ).length;
  };

  if (loading) return <div>Loading data siswa...</div>;
  if (!studentData) return <div>Data siswa tidak ditemukan.</div>;

  // Tampilkan dashboard dengan data siswa lengkap
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-md border-b-4 border-emerald-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-700 p-2 rounded-full">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Dashboard Siswa
                </h1>
                <p className="text-gray-600">
                  Selamat datang, {studentData?.name}
                </p>
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
        {/* Saldo Card */}
        <Card className="mb-8 bg-gradient-to-r from-emerald-600 to-green-400 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Saldo Anda</CardTitle>
                <CardDescription className="text-emerald-100">
                  NIS: {studentData?.nis}
                </CardDescription>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-none"
                onClick={fetchAll}
                disabled={loadingStats}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {loadingStats ? "Memuat..." : "Refresh"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">
              {formatCurrency(studentData?.saldo ?? 0)}
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

        {/* QR Code Section & Statistik */}
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
                    <p className="text-2xl font-bold text-green-700">
                      {getTransThisMonth()}
                    </p>
                    <p className="text-sm text-gray-600">Transaksi Bulan Ini</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-700">
                      {formatCurrency(getTotalTrans())}
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
                    <p className="text-2xl font-bold text-emerald-700">
                      {formatCurrency(getTotalTopUp())}
                    </p>
                    <p className="text-sm text-gray-600">Total Top Up</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-700">
                      {getTopUpThisMonth()}
                    </p>
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
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="text-gray-500 text-center">
                  Belum ada transaksi.
                </div>
              ) : (
                (showAllTransactions
                  ? transactions
                  : transactions.slice(0, 5)
                ).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1 mb-1">
                        {(t.transactionItems && t.transactionItems.length > 0
                          ? t.transactionItems
                          : t.items && t.items.length > 0
                          ? t.items
                          : []
                        ).map((item: any, idx: number) => (
                          <span
                            key={idx}
                            className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-xs border border-emerald-200"
                          >
                            {item.product?.name || item.name} x{item.quantity}
                          </span>
                        ))}
                        {!t.transactionItems &&
                          (!t.items || t.items.length === 0) && (
                            <span className="text-gray-400 text-xs">
                              Tidak ada produk
                            </span>
                          )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(t.createdAt).toLocaleString("id-ID")}
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="font-bold text-lg text-emerald-700">
                        {formatCurrency(Number(t.totalAmount || t.amount || 0))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {transactions.length > 5 && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAllTransactions((v) => !v)}
                >
                  <History className="h-4 w-4 mr-2" />
                  {showAllTransactions
                    ? "Tampilkan Lebih Sedikit"
                    : "Lihat Semua Riwayat"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
