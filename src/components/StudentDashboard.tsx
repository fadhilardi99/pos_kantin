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
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export interface StudentUser {
  name: string;
  nis: string;
  saldo: number;
}

interface StudentDashboardProps {
  user: StudentUser;
  onLogout: () => void;
}

const StudentDashboard = ({ user, onLogout }: StudentDashboardProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated" || session?.user?.role !== "STUDENT") {
      router.push("/login");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!session || session.user.role !== "STUDENT") {
    return null;
  }

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/transactions");
        const data = await res.json();
        // Filter transactions for this student (by NIS or name)
        const filtered = data.filter((tx: any) => {
          // tx.student?.nis or tx.student?.user?.name
          return (
            (tx.student && tx.student.nis === user.nis) ||
            (tx.student && tx.student.name === user.name)
          );
        });
        setTransactions(filtered);
      } catch (e: any) {
        setError("Gagal memuat transaksi");
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [user.nis, user.name]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-emerald-700">
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
                <p className="text-gray-600">Selamat datang, {user.name}</p>
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
        <Card className="mb-8 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white border-emerald-600">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Saldo Anda</CardTitle>
                <CardDescription className="text-emerald-100">
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
              {formatCurrency(user.saldo)}
            </div>
            <div className="flex items-center space-x-4">
              <Badge
                variant="secondary"
                className="bg-white/20 text-white border-white/30"
              >
                <QrCode className="h-4 w-4 mr-2" />
                QR Code Aktif
              </Badge>
              <Badge
                variant="secondary"
                className="bg-white/20 text-white border-white/30"
              >
                Status: Aktif
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-1 border-emerald-200">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2 text-emerald-800">
                <QrCode className="h-5 w-5" />
                <span>QR Code Anda</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-emerald-50 p-8 rounded-lg mb-4 border border-emerald-200">
                <div className="w-32 h-32 mx-auto bg-emerald-100 rounded border-2 border-dashed border-emerald-300 flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-emerald-400" />
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Tunjukkan QR code ini ke kasir untuk melakukan pembelian
              </p>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="md:col-span-2 space-y-4">
            <Card className="border-emerald-200">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-700">15</p>
                    <p className="text-sm text-gray-600">Transaksi Bulan Ini</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-700">
                      {formatCurrency(125000)}
                    </p>
                    <p className="text-sm text-gray-600">Total Pembelian</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-200">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-700">
                      {formatCurrency(200000)}
                    </p>
                    <p className="text-sm text-gray-600">Total Top Up</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-700">3</p>
                    <p className="text-sm text-gray-600">Top Up Bulan Ini</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Transaction History */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-emerald-800">
              <History className="h-5 w-5" />
              <span>Riwayat Transaksi</span>
            </CardTitle>
            <CardDescription>
              Histori pembelian dan top up terbaru Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-gray-500 py-8">
                Memuat data...
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : transactions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Belum ada transaksi
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {/* Show product names */}
                        {transaction.transactionItems
                          ?.map((item: any) => item.product?.name)
                          .join(" + ") || "-"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString(
                          "id-ID"
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          transaction.totalAmount > 0
                            ? "text-red-600"
                            : "text-emerald-700"
                        }`}
                      >
                        -{formatCurrency(Number(transaction.totalAmount))}
                      </p>
                      <p className="text-sm text-gray-500">
                        {/* Saldo after transaction not available, so skip */}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
              >
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
