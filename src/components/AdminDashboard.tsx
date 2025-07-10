import { useState, useEffect } from "react";
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
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface AdminDashboardProps {
  user: { name: string };
  onLogout: () => void;
}

const AdminDashboard = ({ user, onLogout }: AdminDashboardProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
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

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  // Students
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [errorStudents, setErrorStudents] = useState<string | null>(null);
  // Transactions
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [errorTransactions, setErrorTransactions] = useState<string | null>(
    null
  );
  // Products
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);
  // TopUps
  const [topups, setTopups] = useState<any[]>([]);
  const [loadingTopups, setLoadingTopups] = useState(true);
  const [errorTopups, setErrorTopups] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    async function fetchStudents() {
      setLoadingStudents(true);
      setErrorStudents(null);
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        setStudents(data);
      } catch (e: any) {
        setErrorStudents("Gagal memuat siswa");
      } finally {
        setLoadingStudents(false);
      }
    }
    fetchStudents();
  }, []);

  useEffect(() => {
    async function fetchTransactions() {
      setLoadingTransactions(true);
      setErrorTransactions(null);
      try {
        const res = await fetch("/api/transactions");
        const data = await res.json();
        setTransactions(data);
      } catch (e: any) {
        setErrorTransactions("Gagal memuat transaksi");
      } finally {
        setLoadingTransactions(false);
      }
    }
    fetchTransactions();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoadingProducts(true);
      setErrorProducts(null);
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (e: any) {
        setErrorProducts("Gagal memuat produk");
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    async function fetchTopups() {
      setLoadingTopups(true);
      setErrorTopups(null);
      try {
        const res = await fetch("/api/topups");
        const data = await res.json();
        setTopups(data);
      } catch (e: any) {
        setErrorTopups("Gagal memuat top up");
      } finally {
        setLoadingTopups(false);
      }
    }
    fetchTopups();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalSales = () => {
    return transactions.reduce(
      (total, t) => total + Number(t.totalAmount || 0),
      0
    );
  };

  const getTotalBalance = () => {
    return students.reduce(
      (total, s) => total + Number(s.student?.saldo || 0),
      0
    );
  };

  // Handler for approve/reject topup
  async function handleTopupAction(
    id: string,
    action: "approve" | "reject",
    reason?: string
  ) {
    setActionLoading(id + action);
    try {
      const res = await fetch("/api/topups", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memproses top up");
      toast({
        title: `Top up ${action === "approve" ? "disetujui" : "ditolak"}`,
      });
      // Refresh topups
      const res2 = await fetch("/api/topups");
      setTopups(await res2.json());
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
      setRejectModal({ open: false, id: null });
      setRejectReason("");
    }
  }

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
                    {loadingStudents
                      ? "Loading..."
                      : errorStudents
                      ? errorStudents
                      : students.length}
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
                    {loadingTransactions
                      ? "Loading..."
                      : errorTransactions
                      ? errorTransactions
                      : formatCurrency(getTotalSales())}
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
                    {loadingStudents
                      ? "Loading..."
                      : errorStudents
                      ? errorStudents
                      : formatCurrency(getTotalBalance())}
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
                    {loadingTransactions
                      ? "Loading..."
                      : errorTransactions
                      ? errorTransactions
                      : transactions.length}
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
                {loadingStudents ? (
                  <p>Loading students...</p>
                ) : errorStudents ? (
                  <p className="text-red-500">{errorStudents}</p>
                ) : (
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
                              {student.status === "active"
                                ? "Aktif"
                                : "Nonaktif"}
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
                )}
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
                {loadingTransactions ? (
                  <p>Loading transactions...</p>
                ) : errorTransactions ? (
                  <p className="text-red-500">{errorTransactions}</p>
                ) : (
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
                )}
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
                      <span className="font-bold">
                        {loadingTransactions
                          ? "Loading..."
                          : errorTransactions
                          ? errorTransactions
                          : transactions.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Penjualan:</span>
                      <span className="font-bold text-emerald-700">
                        {loadingTransactions
                          ? "Loading..."
                          : errorTransactions
                          ? errorTransactions
                          : formatCurrency(getTotalSales())}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rata-rata per Transaksi:</span>
                      <span className="font-bold">
                        {loadingTransactions
                          ? "Loading..."
                          : errorTransactions
                          ? errorTransactions
                          : formatCurrency(
                              getTotalSales() / transactions.length
                            )}
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

          {/* Approval Top Up */}
          <TabsContent value="approval">
            <Card className="border-emerald-200 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-emerald-800">
                  <CreditCard className="h-5 w-5" />
                  <span>Approval Top Up</span>
                </CardTitle>
                <CardDescription>
                  Daftar permintaan top up yang menunggu persetujuan
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingTopups ? (
                  <div>Loading top up...</div>
                ) : errorTopups ? (
                  <div className="text-red-500">{errorTopups}</div>
                ) : (
                  <div className="space-y-4">
                    {topups.filter((t) => t.status === "PENDING").length ===
                    0 ? (
                      <div className="text-gray-500">
                        Tidak ada top up pending
                      </div>
                    ) : (
                      topups
                        .filter((t) => t.status === "PENDING")
                        .map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200"
                          >
                            <div>
                              <div className="font-semibold text-emerald-800">
                                {t.student?.name}
                              </div>
                              <div className="text-sm text-emerald-600">
                                NIS: {t.student?.nis}
                              </div>
                              <div className="text-sm text-gray-600">
                                Jumlah:{" "}
                                <span className="font-bold">
                                  {formatCurrency(Number(t.amount))}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                Metode: {t.method}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                disabled={actionLoading === t.id + "approve"}
                                onClick={() =>
                                  handleTopupAction(t.id, "approve")
                                }
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                {actionLoading === t.id + "approve"
                                  ? "Memproses..."
                                  : "Approve"}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={actionLoading === t.id + "reject"}
                                onClick={() =>
                                  setRejectModal({ open: true, id: t.id })
                                }
                              >
                                {actionLoading === t.id + "reject"
                                  ? "Memproses..."
                                  : "Reject"}
                              </Button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal for reject reason */}
      <Dialog
        open={rejectModal.open}
        onOpenChange={(open) =>
          setRejectModal({ open, id: open ? rejectModal.id : null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alasan Penolakan Top Up</DialogTitle>
          </DialogHeader>
          <textarea
            className="w-full border rounded p-2 min-h-[80px]"
            placeholder="Masukkan alasan penolakan..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectModal({ open: false, id: null })}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={
                !rejectReason.trim() ||
                actionLoading === rejectModal.id + "reject"
              }
              onClick={() =>
                rejectModal.id &&
                handleTopupAction(rejectModal.id, "reject", rejectReason)
              }
            >
              {actionLoading === rejectModal.id + "reject"
                ? "Memproses..."
                : "Tolak Top Up"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
