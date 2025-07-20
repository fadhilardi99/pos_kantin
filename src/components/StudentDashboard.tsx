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
import { toast } from "@/hooks/use-toast";

import {
  Wallet,
  QrCode,
  History,
  LogOut,
  RefreshCw,
  CreditCard,
  ShoppingCart,
  BarChart3,
  Copy,
  Download,
} from "lucide-react";

import useSWR from "swr";

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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const StudentDashboard = ({ user, onLogout }: StudentDashboardProps) => {
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  // QR Code states
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [qrCodeLoading, setQrCodeLoading] = useState(false);

  // Pakai SWR untuk topups dan transactions
  const {
    data: allTopups = [],
    isLoading: loadingTopups,
    error: errorTopups,
    mutate: mutateTopups,
  } = useSWR(`/api/topups`, fetcher, { refreshInterval: 10000 });

  const {
    data: allTransactions = [],
    isLoading: loadingTransactions,
    error: errorTransactions,
    mutate: mutateTransactions,
  } = useSWR(`/api/transactions`, fetcher, { refreshInterval: 10000 });

  // Fetch student data
  useEffect(() => {
    async function fetchStudentData() {
      if (!user.email) return;

      setLoading(true);
      try {
        const res = await fetch(`/api/users/student?email=${user.email}`);
        const data = await res.json();
        setStudentData(data);
      } catch (error) {
        console.error("Error fetching student data:", error);
        setStudentData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchStudentData();
  }, [user.email]);

  // Filter topups dan transactions berdasarkan student yang sedang login
  const topups = allTopups.filter(
    (t: any) =>
      studentData &&
      (t.student?.nis === studentData.nis ||
        t.student?.id === studentData.id ||
        t.student?.name === studentData.name)
  );

  const transactions = allTransactions.filter(
    (t: any) =>
      studentData &&
      (t.student?.nis === studentData.nis ||
        t.student?.id === studentData.id ||
        t.student?.name === studentData.name)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Hapus useEffect fetchAll lama dan semua setTopups/setTransactions manual
  // Ganti semua penggunaan state topups dan transactions menjadi variabel dari SWR

  const getTotalTopUp = () =>
    topups
      .filter((t: any) => t.status === "APPROVED")
      .reduce((sum: any, t: any) => sum + Number(t.amount || 0), 0);
  const getTopUpThisMonth = () => {
    const now = new Date();
    return topups.filter(
      (t: any) =>
        t.status === "APPROVED" &&
        new Date(t.createdAt).getMonth() === now.getMonth() &&
        new Date(t.createdAt).getFullYear() === now.getFullYear()
    ).length;
  };
  const getTotalTrans = () =>
    transactions.reduce(
      (sum: any, t: any) => sum + Number(t.totalAmount || t.amount || 0),
      0
    );
  const getTransThisMonth = () => {
    const now = new Date();
    return transactions.filter(
      (t: any) =>
        new Date(t.createdAt).getMonth() === now.getMonth() &&
        new Date(t.createdAt).getFullYear() === now.getFullYear()
    ).length;
  };

  // Generate QR Code for student purchase
  const generateQRCode = () => {
    if (!studentData) return;

    setQrCodeLoading(true);

    // Create QR code data with student information
    const qrData = {
      studentId: studentData.id,
      studentName: studentData.name,
      nis: studentData.nis,
      saldo: studentData.saldo,
      timestamp: new Date().toISOString(),
      type: "PURCHASE_QR",
      merchantId: "KANTIN_SCHOOL_001",
    };

    // Encode the data
    const encodedData = btoa(JSON.stringify(qrData));
    setQrCodeData(encodedData);

    // Generate QR code URL using a QR code service
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      encodedData
    )}`;
    setQrCodeUrl(qrCodeUrl);

    setQrCodeLoading(false);
  };

  const copyQRCodeData = () => {
    if (qrCodeData) {
      navigator.clipboard.writeText(qrCodeData);
      toast({
        title: "Data QR Code Disalin",
        description: "Data QR code telah disalin ke clipboard",
      });
    }
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement("a");
      link.href = qrCodeUrl;
      link.download = `qr_code_${studentData?.nis || "student"}.png`;
      link.click();
      toast({
        title: "QR Code Diunduh",
        description: "QR code telah diunduh ke perangkat Anda",
      });
    }
  };

  // Generate QR code when student data is loaded
  useEffect(() => {
    if (studentData && !qrCodeData) {
      generateQRCode();
    }
  }, [studentData]);

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
                onClick={() => mutateTopups()} // Trigger refresh
                disabled={loadingTopups}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {loadingTopups ? "Memuat..." : "Refresh"}
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
                {qrCodeLoading ? (
                  <div className="w-32 h-32 mx-auto bg-white rounded-lg border-2 border-emerald-200 flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin" />
                  </div>
                ) : qrCodeUrl ? (
                  <div className="w-32 h-32 mx-auto bg-white rounded-lg border-2 border-emerald-200 flex items-center justify-center">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="w-28 h-28"
                      onError={(e) => {
                        // Fallback jika gambar gagal dimuat
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.parentElement!.innerHTML = `
                          <div class="w-28 h-28 bg-black/10 rounded border-2 border-dashed border-gray-400 flex items-center justify-center">
                            <svg class="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z"/>
                            </svg>
                          </div>
                        `;
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 mx-auto bg-black/10 rounded border-2 border-dashed border-gray-400 flex items-center justify-center">
                    <QrCode className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Tunjukkan QR code ini ke kasir untuk melakukan pembelian
                </p>
                {qrCodeData && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyQRCodeData}
                      className="flex-1 text-xs"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Salin Data
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadQRCode}
                      className="flex-1 text-xs"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateQRCode}
                  disabled={qrCodeLoading}
                  className="w-full"
                >
                  <RefreshCw
                    className={`h-3 w-3 mr-1 ${
                      qrCodeLoading ? "animate-spin" : ""
                    }`}
                  />
                  {qrCodeLoading ? "Membuat QR..." : "Refresh QR Code"}
                </Button>
              </div>
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
                ).map((t: any) => (
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
