import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CreditCard, LogOut, Plus, Search, History } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface User {
  name: string;
  // Add other properties if needed
}

interface ParentDashboardProps {
  user: User;
  onLogout: () => void;
}

const ParentDashboard = ({ user, onLogout }: ParentDashboardProps) => {
  // Hapus import berikut:
  // import { useSession } from "next-auth/react";
  // import { useRouter } from "next/navigation";

  // Hapus semua kode yang menggunakan useSession, useRouter, dan router.push("/login")
  // Hapus juga pengecekan status === "loading" dan session.user.role !== "PARENT"

  const [selectedStudent, setSelectedStudent] = useState("");
  const [topUpAmount, setTopUpAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("TRANSFER");
  const [children, setChildren] = useState<any[]>([]);

  // Top up & transaction history from API
  const [topUpHistory, setTopUpHistory] = useState<any[]>([]);
  const [loadingTopUp, setLoadingTopUp] = useState(true);
  const [errorTopUp, setErrorTopUp] = useState<string | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [errorTx, setErrorTx] = useState<string | null>(null);

  // Toggle for showing all history
  const [showAllTopUps, setShowAllTopUps] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [activeTab, setActiveTab] = useState("topup");

  // Fetch children (students) from backend
  useEffect(() => {
    async function fetchChildren() {
      try {
        const res = await fetch("/api/users/children");
        const data = await res.json();
        setChildren(data);
      } catch (e) {
        // Optional: handle error
      }
    }
    fetchChildren();
  }, []);

  useEffect(() => {
    async function fetchTopUps() {
      setLoadingTopUp(true);
      setErrorTopUp(null);
      try {
        const res = await fetch("/api/topups");
        const data = await res.json();
        // Filter topups for this parent's children (by NIS or name)
        const filtered = data.filter((t: any) =>
          children.some(
            (c) => t.student?.nis === c.nis || t.student?.name === c.name
          )
        );
        setTopUpHistory(filtered);
      } catch (e: any) {
        setErrorTopUp("Gagal memuat top up");
      } finally {
        setLoadingTopUp(false);
      }
    }
    fetchTopUps();
  }, [children]);

  useEffect(() => {
    async function fetchTransactions() {
      setLoadingTx(true);
      setErrorTx(null);
      try {
        const res = await fetch("/api/transactions");
        const data = await res.json();
        // Filter transactions for this parent's children (by NIS or name)
        const filtered = data.filter((t: any) =>
          children.some(
            (c) => t.student?.nis === c.nis || t.student?.name === c.name
          )
        );
        setTransactionHistory(filtered);
      } catch (e: any) {
        setErrorTx("Gagal memuat transaksi");
      } finally {
        setLoadingTx(false);
      }
    }
    fetchTransactions();
  }, [children]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleTopUp = async () => {
    if (!selectedStudent || !topUpAmount) {
      toast({
        title: "Error",
        description: "Pilih siswa dan masukkan jumlah top up",
        variant: "destructive",
      });
      return;
    }

    const amount = parseInt(topUpAmount);
    if (amount < 10000) {
      toast({
        title: "Error",
        description: "Minimal top up Rp 10.000",
        variant: "destructive",
      });
      return;
    }

    // Ambil id anak dari children
    const student = children.find((c) => c.name === selectedStudent);
    if (!student) {
      toast({
        title: "Error",
        description: "Data siswa tidak ditemukan",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch("/api/topups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id.toString(),
          amount: amount,
          method: selectedMethod,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal melakukan top up");
      }
      toast({
        title: "Top Up Berhasil",
        description: `Berhasil top up ${formatCurrency(amount)} ke akun ${
          student.name
        }`,
      });
      setSelectedStudent("");
      setTopUpAmount("");
      // Refresh data top up
      setLoadingTopUp(true);
      const res2 = await fetch("/api/topups");
      const data2 = await res2.json();
      const filtered = data2.filter((t: any) =>
        children.some(
          (c) => t.student?.nis === c.nis || t.student?.name === c.name
        )
      );
      setTopUpHistory(filtered);
      setLoadingTopUp(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const quickTopUpAmounts = [10000, 25000, 50000, 100000];

  const now = new Date();
  const topUpsThisMonth = topUpHistory.filter(
    (t) =>
      t.status === "APPROVED" &&
      new Date(t.createdAt).getMonth() === now.getMonth() &&
      new Date(t.createdAt).getFullYear() === now.getFullYear()
  );
  const totalTopUpThisMonth = topUpsThisMonth.reduce(
    (sum, t) => sum + Number(t.amount || 0),
    0
  );
  const countTopUpThisMonth = topUpsThisMonth.length;
  const avgTopUpThisMonth =
    countTopUpThisMonth > 0 ? totalTopUpThisMonth / countTopUpThisMonth : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-emerald-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-700 p-2 rounded-full">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Dashboard Orang Tua
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
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Children Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-emerald-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-emerald-800">
                  <Search className="h-5 w-5" />
                  <span>Data Anak</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {children.map((child) => (
                    <div
                      key={child.id}
                      className="p-4 bg-gradient-to-r from-emerald-100 to-green-100 rounded-lg border border-emerald-200"
                    >
                      <h3 className="font-semibold text-emerald-800">
                        {child.name}
                      </h3>
                      <p className="text-sm text-emerald-600">
                        NIS: {child.nis}
                      </p>
                      <p className="text-sm text-emerald-600">
                        Kelas: {child.class}
                      </p>
                      <p className="text-xs text-emerald-500 italic">
                        Sebagai: {child.relation}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-gray-600">Saldo:</span>
                        <span className="font-bold text-emerald-700">
                          {formatCurrency(child.saldo)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-emerald-200">
              <CardHeader>
                <CardTitle className="text-emerald-800">
                  Statistik Bulan Ini
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Top Up:</span>
                    <span className="font-bold text-emerald-700">
                      {formatCurrency(totalTopUpThisMonth)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Jumlah Top Up:</span>
                    <span className="font-bold">
                      {countTopUpThisMonth} kali
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rata-rata:</span>
                    <span className="font-bold">
                      {formatCurrency(avgTopUpThisMonth)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Top Up & History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Top Up Form */}
            <Card className="border-emerald-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-emerald-800">
                  <Plus className="h-5 w-5" />
                  <span>Top Up Saldo</span>
                </CardTitle>
                <CardDescription>
                  Isi saldo untuk anak Anda dengan mudah dan aman
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="student-select">Pilih Anak</Label>
                  <Select
                    value={selectedStudent}
                    onValueChange={setSelectedStudent}
                  >
                    <SelectTrigger className="border-emerald-300 focus:border-emerald-500">
                      <SelectValue placeholder="Pilih anak yang akan di-top up" />
                    </SelectTrigger>
                    <SelectContent>
                      {children.map((child) => (
                        <SelectItem key={child.id} value={child.name}>
                          {child.name} - {child.class} (Saldo:{" "}
                          {formatCurrency(child.saldo)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">Jumlah Top Up</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Masukkan jumlah (min. Rp 10.000)"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className="border-emerald-300 focus:border-emerald-500"
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div>
                  <Label>Jumlah Cepat</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {quickTopUpAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setTopUpAmount(amount.toString())}
                        className="text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                      >
                        {formatCurrency(amount)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Metode Pembayaran</Label>
                  <Select
                    value={selectedMethod}
                    onValueChange={setSelectedMethod}
                  >
                    <SelectTrigger className="border-emerald-300 focus:border-emerald-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRANSFER">Transfer Bank</SelectItem>
                      <SelectItem value="CASH">Tunai ke Sekolah</SelectItem>
                      <SelectItem value="E_WALLET">E-Wallet</SelectItem>
                      <SelectItem value="QR_CODE">QR Code</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleTopUp}
                  className="w-full bg-emerald-700 hover:bg-emerald-800"
                  disabled={!selectedStudent || !topUpAmount}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Proses Top Up
                </Button>
              </CardContent>
            </Card>

            {/* Top Up History */}
            <Card className="border-emerald-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-emerald-800">
                  <History className="h-5 w-5" />
                  <span>Riwayat Top Up & Transaksi</span>
                </CardTitle>
                <CardDescription>
                  Histori semua top up dan transaksi anak Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="mb-4">
                    <TabsTrigger value="topup">Top Up</TabsTrigger>
                    <TabsTrigger value="transaksi">Transaksi Anak</TabsTrigger>
                  </TabsList>
                  <TabsContent value="topup">
                    <div className="space-y-4">
                      {(showAllTopUps
                        ? topUpHistory
                        : topUpHistory.slice(0, 5)
                      ).map((topup) => (
                        <div
                          key={topup.id}
                          className="p-4 bg-gradient-to-r from-emerald-100 to-green-100 rounded-lg border border-emerald-200 mb-2"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold text-emerald-800">
                                {topup.student?.name}
                              </div>
                              <div className="text-sm text-emerald-600">
                                Tanggal:{" "}
                                {new Date(topup.createdAt).toLocaleDateString(
                                  "id-ID"
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                Jumlah:{" "}
                                <span className="font-bold">
                                  {formatCurrency(Number(topup.amount))}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                Metode: {topup.method}
                              </div>
                              <div className="text-sm text-gray-600">
                                Status:{" "}
                                <span
                                  className={
                                    topup.status === "REJECTED"
                                      ? "text-red-600"
                                      : topup.status === "APPROVED"
                                      ? "text-emerald-700"
                                      : "text-gray-700"
                                  }
                                >
                                  {topup.status}
                                </span>
                              </div>
                              {topup.status === "REJECTED" && topup.notes && (
                                <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                                  <span className="font-semibold">
                                    Alasan Penolakan:
                                  </span>{" "}
                                  {topup.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {topUpHistory.length > 5 && (
                      <div className="mt-6 text-center">
                        <Button
                          variant="outline"
                          className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                          onClick={() => setShowAllTopUps((v) => !v)}
                        >
                          <History className="h-4 w-4 mr-2" />
                          {showAllTopUps
                            ? "Tampilkan Lebih Sedikit"
                            : "Lihat Semua Riwayat"}
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="transaksi">
                    <div className="space-y-4">
                      {(showAllTransactions
                        ? transactionHistory
                        : transactionHistory.slice(0, 5)
                      ).map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-emerald-800">
                              {t.student?.name}
                            </div>
                            <div className="flex flex-wrap gap-1 mb-1">
                              {(t.transactionItems &&
                              t.transactionItems.length > 0
                                ? t.transactionItems
                                : t.items && t.items.length > 0
                                ? t.items
                                : []
                              ).map((item: any, idx: number) => (
                                <span
                                  key={idx}
                                  className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-xs border border-emerald-200"
                                >
                                  {item.product?.name || item.name} x
                                  {item.quantity}
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
                              {formatCurrency(
                                Number(t.totalAmount || t.amount || 0)
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {transactionHistory.length > 5 && (
                      <div className="mt-6 text-center">
                        <Button
                          variant="outline"
                          className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                          onClick={() => setShowAllTransactions((v) => !v)}
                        >
                          <History className="h-4 w-4 mr-2" />
                          {showAllTransactions
                            ? "Tampilkan Lebih Sedikit"
                            : "Lihat Semua Riwayat"}
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
