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
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface AdminDashboardProps {
  user: { name: string };
  onLogout: () => void;
}

const AdminDashboard = ({ user, onLogout }: AdminDashboardProps) => {
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
  const [addModalType, setAddModalType] = useState<
    null | "student" | "parent" | "cashier"
  >(null);
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    password: "",
    nis: "",
    grade: "",
    class: "",
    classNumber: "",
  });
  // Tipe untuk newParent
  type NewParentType = {
    name: string;
    email: string;
    password: string;
    selectedStudentId: string;
    studentIds: string[];
    nik: string;
    phone: string;
    address: string;
  };
  const [newParent, setNewParent] = useState<NewParentType>({
    name: "",
    email: "",
    password: "",
    selectedStudentId: "",
    studentIds: [],
    nik: "",
    phone: "",
    address: "",
  });
  // Tipe untuk newCashier
  type NewCashierType = {
    name: string;
    email: string;
    password: string;
    nip: string;
    shifts: string[];
  };
  const [newCashier, setNewCashier] = useState<NewCashierType>({
    name: "",
    email: "",
    password: "",
    nip: "",
    shifts: [],
  });
  const [addCashierLoading, setAddCashierLoading] = useState(false);
  const [addStudentLoading, setAddStudentLoading] = useState(false);
  const [addParentLoading, setAddParentLoading] = useState(false);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  // Tambahkan state untuk parent dan cashier
  type ParentType = any; // Ganti dengan tipe yang sesuai jika ada
  type CashierType = any;
  const [parents, setParents] = useState<ParentType[]>([]);
  const [loadingParents, setLoadingParents] = useState(true);
  const [errorParents, setErrorParents] = useState<string | null>(null);
  const [cashiers, setCashiers] = useState<CashierType[]>([]);
  const [loadingCashiers, setLoadingCashiers] = useState(true);
  const [errorCashiers, setErrorCashiers] = useState<string | null>(null);
  // Buat state untuk editParent dan modalEditParent
  const [editParent, setEditParent] = useState<any>(null);
  const [modalEditParent, setModalEditParent] = useState(false);
  // State untuk settings
  const [settings, setSettings] = useState({ schoolName: "", canteenName: "" });
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  // Tambahkan state untuk modal detail
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [showStudentDetail, setShowStudentDetail] = useState(false);
  const [selectedParent, setSelectedParent] = useState<any | null>(null);
  const [showParentDetail, setShowParentDetail] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(
    null
  );
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);

  // Fetch settings saat buka tab
  useEffect(() => {
    async function fetchSettings() {
      setLoadingSettings(true);
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data)
          setSettings({
            schoolName: data.schoolName || "",
            canteenName: data.canteenName || "",
          });
      } finally {
        setLoadingSettings(false);
      }
    }
    fetchSettings();
  }, []);

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

  // Fetch all students for parent dropdown
  useEffect(() => {
    async function fetchAllStudents() {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        setAllStudents(data);
      } catch {}
    }
    fetchAllStudents();
  }, []);

  // Tambah fungsi fetchParents agar bisa dipanggil ulang
  const fetchParents = async () => {
    setLoadingParents(true);
    setErrorParents(null);
    try {
      const res = await fetch("/api/users?role=PARENT");
      const data = await res.json();
      setParents(data);
    } catch (e: any) {
      setErrorParents("Gagal memuat orang tua");
    } finally {
      setLoadingParents(false);
    }
  };

  // Ganti useEffect fetchParents
  useEffect(() => {
    fetchParents();
  }, []);

  // Fetch cashiers
  useEffect(() => {
    async function fetchCashiers() {
      setLoadingCashiers(true);
      setErrorCashiers(null);
      try {
        const res = await fetch("/api/users?role=CASHIER");
        const data = await res.json();
        setCashiers(data);
      } catch (e: any) {
        setErrorCashiers("Gagal memuat kasir");
      } finally {
        setLoadingCashiers(false);
      }
    }
    fetchCashiers();
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

  // Hapus handler backup dan restore

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
              Manajemen Data
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
                      Manajemen Data
                    </CardTitle>
                    <CardDescription>
                      Kelola data siswa, orang tua, dan kasir
                    </CardDescription>
                  </div>
                  <Select
                    onValueChange={(val) =>
                      setAddModalType(val as "student" | "parent" | "cashier")
                    }
                    value={addModalType || ""}
                  >
                    <SelectTrigger className="w-[170px] bg-emerald-700 text-white hover:bg-emerald-800 focus:ring-emerald-700">
                      <Plus className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Tambah Data" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Tambah Siswa</SelectItem>
                      <SelectItem value="parent">Tambah Orang Tua</SelectItem>
                      <SelectItem value="cashier">Tambah Kasir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="tab-siswa" className="space-y-4">
                  <TabsList className="mb-4">
                    <TabsTrigger value="tab-siswa">Siswa</TabsTrigger>
                    <TabsTrigger value="tab-parent">Orang Tua</TabsTrigger>
                    <TabsTrigger value="tab-cashier">Kasir</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tab-siswa">
                    {loadingStudents ? (
                      <p>Loading students...</p>
                    ) : errorStudents ? (
                      <p className="text-red-500">{errorStudents}</p>
                    ) : (
                      <div className="space-y-4">
                        {students
                          .filter((u) => u.role === "STUDENT" && u.student)
                          .map((u) => {
                            const s = u.student;
                            return (
                              <div
                                key={s.id}
                                className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center space-x-4">
                                    <div>
                                      <p className="font-semibold text-gray-800">
                                        {s.name}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        NIS: {s.nis} • Kelas: {s.class}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <div className="text-right">
                                    <p className="font-bold text-emerald-700">
                                      {formatCurrency(s.saldo)}
                                    </p>
                                    <Badge
                                      variant={
                                        s.status === "ACTIVE"
                                          ? "default"
                                          : "secondary"
                                      }
                                      className="bg-emerald-100 text-emerald-800 border-emerald-200"
                                    >
                                      {s.status === "ACTIVE"
                                        ? "Aktif"
                                        : "Nonaktif"}
                                    </Badge>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                                      onClick={() => {
                                        setSelectedStudent(s);
                                        setShowStudentDetail(true);
                                      }}
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
                            );
                          })}
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="tab-parent">
                    {loadingParents ? (
                      <p>Loading orang tua...</p>
                    ) : errorParents ? (
                      <p className="text-red-500">{errorParents}</p>
                    ) : (
                      <div className="space-y-4">
                        {parents.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
                          >
                            <div>
                              <p className="font-semibold text-gray-800">
                                {p.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                Telepon: {p.parent?.phone || "-"}
                              </p>
                              {p.parent?.parentStudents?.length > 0 && (
                                <div className="text-sm text-gray-600">
                                  Anak:
                                  <ul className="list-disc ml-4">
                                    {p.parent.parentStudents.map((ps: any) => (
                                      <li key={ps.studentId}>
                                        {ps.student?.user?.name || "-"}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditParent(p);
                                  setModalEditParent(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                                onClick={() => {
                                  setSelectedParent(p);
                                  setShowParentDetail(true);
                                }}
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
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="tab-cashier">
                    {loadingCashiers ? (
                      <p>Loading kasir...</p>
                    ) : errorCashiers ? (
                      <p className="text-red-500">{errorCashiers}</p>
                    ) : (
                      <div className="space-y-4">
                        {cashiers.map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
                          >
                            <div>
                              <p className="font-semibold text-gray-800">
                                NIP: {c.nip}
                              </p>
                              <p className="text-sm text-gray-800">
                                Nama: {c.user?.name || "-"}
                              </p>
                              <p className="text-sm text-gray-600">
                                Hari Kerja:{" "}
                                {Array.isArray(c.shifts)
                                  ? c.shifts.join(", ")
                                  : "-"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
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
                                {transaction.student?.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {/* Render item list jika array, atau tampilkan string jika sudah diolah */}
                                {Array.isArray(transaction.items)
                                  ? transaction.items.map(
                                      (item: any, idx: number) => (
                                        <span key={idx}>
                                          {item.product?.name || item.name} x
                                          {item.quantity}
                                          {idx < transaction.items.length - 1
                                            ? ", "
                                            : ""}
                                        </span>
                                      )
                                    )
                                  : transaction.items}
                              </p>
                              <p className="text-xs text-gray-500">
                                Kasir: {transaction.cashier?.user?.name || "-"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-700">
                            {formatCurrency(
                              Number(
                                transaction.amount ||
                                  transaction.totalAmount ||
                                  0
                              )
                            )}
                          </p>
                          <p className="text-sm text-gray-500">
                            {transaction.date ||
                              (transaction.createdAt
                                ? new Date(
                                    transaction.createdAt
                                  ).toLocaleString("id-ID")
                                : "")}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 mt-2"
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowTransactionDetail(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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
            <Card className="border-emerald-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-emerald-800">
                      Pengaturan Sistem
                    </CardTitle>
                    <CardDescription>
                      Atur nama sekolah dan kantin
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="school-name">Nama Sekolah</Label>
                  <Input
                    id="school-name"
                    value={settings.schoolName}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, schoolName: e.target.value }))
                    }
                    className="border-emerald-300 focus:border-emerald-500"
                    disabled={loadingSettings || savingSettings}
                  />
                </div>
                <div>
                  <Label htmlFor="canteen-name">Nama Kantin</Label>
                  <Input
                    id="canteen-name"
                    value={settings.canteenName}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        canteenName: e.target.value,
                      }))
                    }
                    className="border-emerald-300 focus:border-emerald-500"
                    disabled={loadingSettings || savingSettings}
                  />
                </div>
                <Button
                  className="bg-emerald-700 hover:bg-emerald-800"
                  disabled={loadingSettings || savingSettings}
                  onClick={async () => {
                    setSavingSettings(true);
                    try {
                      await fetch("/api/settings", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(settings),
                      });
                      toast({ title: "Pengaturan berhasil disimpan" });
                    } catch {
                      toast({
                        title: "Gagal menyimpan pengaturan",
                        variant: "destructive",
                      });
                    } finally {
                      setSavingSettings(false);
                    }
                  }}
                >
                  Simpan Pengaturan
                </Button>
              </CardContent>
            </Card>
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

      {/* Modal Tambah Siswa */}
      <Dialog
        open={addModalType === "student"}
        onOpenChange={(open) => setAddModalType(open ? "student" : null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Siswa Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Nama</Label>
            <Input
              value={newStudent.name}
              onChange={(e) =>
                setNewStudent((s) => ({ ...s, name: e.target.value }))
              }
            />
            <Label>Email</Label>
            <Input
              value={newStudent.email}
              onChange={(e) =>
                setNewStudent((s) => ({ ...s, email: e.target.value }))
              }
            />
            <Label>Password</Label>
            <Input
              type="password"
              value={newStudent.password}
              onChange={(e) =>
                setNewStudent((s) => ({ ...s, password: e.target.value }))
              }
            />
            <Label>NIS</Label>
            <Input
              value={newStudent.nis}
              onChange={(e) =>
                setNewStudent((s) => ({ ...s, nis: e.target.value }))
              }
            />
            <Label>Grade</Label>
            <Select
              value={newStudent.grade}
              onValueChange={(val) =>
                setNewStudent((s) => ({ ...s, grade: val }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="X">X</SelectItem>
                <SelectItem value="XI">XI</SelectItem>
                <SelectItem value="XII">XII</SelectItem>
              </SelectContent>
            </Select>
            <Label>Jurusan</Label>
            <Select
              value={newStudent.class}
              onValueChange={(val) =>
                setNewStudent((s) => ({ ...s, class: val, classNumber: "" }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Jurusan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IPA">IPA</SelectItem>
                <SelectItem value="IPS">IPS</SelectItem>
                <SelectItem value="BAHASA">BAHASA</SelectItem>
              </SelectContent>
            </Select>
            {newStudent.class && (
              <>
                <Label>Nomor Kelas</Label>
                <Select
                  value={newStudent.classNumber}
                  onValueChange={(val) =>
                    setNewStudent((s) => ({ ...s, classNumber: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Nomor Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {newStudent.class === "BAHASA"
                      ? [1, 2, 3, 4].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n}
                          </SelectItem>
                        ))
                      : [1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                setAddStudentLoading(true);
                try {
                  const classFull =
                    newStudent.class && newStudent.classNumber
                      ? `${newStudent.class} ${newStudent.classNumber}`
                      : newStudent.class;
                  const res = await fetch("/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      ...newStudent,
                      class: classFull,
                      role: "STUDENT",
                    }),
                  });
                  const data = await res.json();
                  if (!res.ok)
                    throw new Error(data.error || "Gagal menambah siswa");
                  toast({ title: "Siswa berhasil ditambahkan" });
                  setAddModalType(null);
                  setNewStudent({
                    name: "",
                    email: "",
                    password: "",
                    nis: "",
                    grade: "",
                    class: "",
                    classNumber: "",
                  });
                  setLoadingStudents(true);
                  const res2 = await fetch("/api/users");
                  setStudents(await res2.json());
                  setLoadingStudents(false);
                } catch (e: any) {
                  toast({
                    title: "Error",
                    description: e.message,
                    variant: "destructive",
                  });
                } finally {
                  setAddStudentLoading(false);
                }
              }}
              disabled={addStudentLoading}
              className="w-full bg-emerald-700 hover:bg-emerald-800"
            >
              {addStudentLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal Tambah Orang Tua */}
      <Dialog
        open={addModalType === "parent"}
        onOpenChange={(open) => setAddModalType(open ? "parent" : null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Orang Tua</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Nama</Label>
            <Input
              value={newParent.name}
              onChange={(e) =>
                setNewParent((p) => ({ ...p, name: e.target.value }))
              }
            />
            <Label>Email</Label>
            <Input
              value={newParent.email}
              onChange={(e) =>
                setNewParent((p) => ({ ...p, email: e.target.value }))
              }
            />
            <Label>Password</Label>
            <Input
              type="password"
              value={newParent.password}
              onChange={(e) =>
                setNewParent((p) => ({ ...p, password: e.target.value }))
              }
            />
            <Label>Anak (Nama/Kelas/Jurusan)</Label>
            <Select
              value={newParent.selectedStudentId}
              onValueChange={(val) =>
                setNewParent((p) => ({ ...p, selectedStudentId: val }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Anak" />
              </SelectTrigger>
              <SelectContent>
                {allStudents
                  .filter((u) => u.role === "STUDENT" && u.student)
                  .map((u) => (
                    <SelectItem key={u.student.id} value={u.student.id}>
                      {u.student.name} - {u.student.class} - {u.student.grade}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              className="mt-2"
              onClick={() => {
                if (
                  newParent.selectedStudentId &&
                  !newParent.studentIds.includes(newParent.selectedStudentId)
                ) {
                  setNewParent((p) => ({
                    ...p,
                    studentIds: [...p.studentIds, p.selectedStudentId],
                    selectedStudentId: "",
                  }));
                }
              }}
            >
              Tambah Anak
            </Button>
            {/* Daftar anak yang sudah dipilih */}
            {newParent.studentIds.length > 0 && (
              <div className="mt-2">
                <Label>Anak Terpilih:</Label>
                <ul className="list-disc ml-4">
                  {newParent.studentIds.map((id) => {
                    const s = allStudents.find(
                      (u) => u.student && u.student.id === id
                    );
                    return (
                      <li key={id}>
                        {s?.student?.name} - {s?.student?.class} -{" "}
                        {s?.student?.grade}
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="ml-2"
                          onClick={() =>
                            setNewParent((p) => ({
                              ...p,
                              studentIds: p.studentIds.filter(
                                (sid) => sid !== id
                              ),
                            }))
                          }
                        >
                          Hapus
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                setAddParentLoading(true);
                try {
                  const res = await fetch("/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      ...newParent,
                      role: "PARENT",
                      children: newParent.studentIds.map((id) => ({
                        studentId: id,
                        relation: "Orang Tua",
                      })),
                    }),
                  });
                  const data = await res.json();
                  if (!res.ok)
                    throw new Error(data.error || "Gagal menambah orang tua");
                  toast({ title: "Orang tua berhasil ditambahkan" });
                  setAddModalType(null);
                  setNewParent({
                    name: "",
                    email: "",
                    password: "",
                    selectedStudentId: "",
                    studentIds: [],
                    nik: "",
                    phone: "",
                    address: "",
                  });
                  await fetchParents(); // REFRESH DATA
                } catch (e: any) {
                  toast({
                    title: "Error",
                    description: e.message,
                    variant: "destructive",
                  });
                } finally {
                  setAddParentLoading(false);
                }
              }}
              disabled={addParentLoading}
              className="w-full bg-emerald-700 hover:bg-emerald-800"
            >
              {addParentLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal Tambah Kasir */}
      <Dialog
        open={addModalType === "cashier"}
        onOpenChange={(open) => setAddModalType(open ? "cashier" : null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Kasir</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Nama</Label>
            <Input
              value={newCashier.name}
              onChange={(e) =>
                setNewCashier((c) => ({ ...c, name: e.target.value }))
              }
            />
            <Label>Email</Label>
            <Input
              value={newCashier.email}
              onChange={(e) =>
                setNewCashier((c) => ({ ...c, email: e.target.value }))
              }
            />
            <Label>Password</Label>
            <Input
              type="password"
              value={newCashier.password}
              onChange={(e) =>
                setNewCashier((c) => ({ ...c, password: e.target.value }))
              }
            />
            <Label>NIP</Label>
            <Input
              value={newCashier.nip}
              onChange={(e) =>
                setNewCashier((c) => ({ ...c, nip: e.target.value }))
              }
            />
            <Label>Hari Kerja (bisa pilih lebih dari satu)</Label>
            <div className="flex flex-wrap gap-2">
              {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map(
                (day) => (
                  <label key={day} className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={newCashier.shifts.includes(day)}
                      onChange={(e) => {
                        setNewCashier((c) => {
                          if (e.target.checked) {
                            return { ...c, shifts: [...c.shifts, day] };
                          } else {
                            return {
                              ...c,
                              shifts: c.shifts.filter((d) => d !== day),
                            };
                          }
                        });
                      }}
                    />
                    <span>{day}</span>
                  </label>
                )
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                setAddCashierLoading(true);
                try {
                  const res = await fetch("/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      ...newCashier,
                      role: "CASHIER",
                    }),
                  });
                  const data = await res.json();
                  if (!res.ok)
                    throw new Error(data.error || "Gagal menambah kasir");
                  toast({ title: "Kasir berhasil ditambahkan" });
                  setAddModalType(null);
                  setNewCashier({
                    name: "",
                    email: "",
                    password: "",
                    nip: "",
                    shifts: [],
                  });
                } catch (e: any) {
                  toast({
                    title: "Error",
                    description: e.message,
                    variant: "destructive",
                  });
                } finally {
                  setAddCashierLoading(false);
                }
              }}
              disabled={addCashierLoading}
              className="w-full bg-emerald-700 hover:bg-emerald-800"
            >
              {addCashierLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal Edit Orang Tua */}
      <Dialog open={modalEditParent} onOpenChange={setModalEditParent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Orang Tua</DialogTitle>
          </DialogHeader>
          {editParent && (
            <div className="space-y-3">
              <Label>Nama</Label>
              <Input
                value={editParent.name}
                onChange={(e) =>
                  setEditParent((prev: any) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
              <Label>Email</Label>
              <Input
                value={editParent.email}
                onChange={(e) =>
                  setEditParent((prev: any) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
              />
              <Label>Password</Label>
              <Input
                type="password"
                value={editParent.password}
                onChange={(e) =>
                  setEditParent((prev: any) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
              />
              <Label>Anak (Nama/Kelas/Jurusan)</Label>
              <Select
                value={editParent.selectedStudentIdEdit || ""}
                onValueChange={(val) =>
                  setEditParent((prev: any) => ({
                    ...prev,
                    selectedStudentIdEdit: val,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Anak" />
                </SelectTrigger>
                <SelectContent>
                  {allStudents
                    .filter((u) => u.role === "STUDENT" && u.student)
                    .map((u) => (
                      <SelectItem key={u.student.id} value={u.student.id}>
                        {u.student.name} - {u.student.class} - {u.student.grade}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                className="mt-2"
                onClick={() => {
                  if (
                    editParent.selectedStudentIdEdit &&
                    !editParent.parent.parentStudents.some(
                      (ps: any) =>
                        ps.studentId === editParent.selectedStudentIdEdit
                    )
                  ) {
                    setEditParent((prev: any) => ({
                      ...prev,
                      parent: {
                        ...prev.parent,
                        parentStudents: [
                          ...prev.parent.parentStudents,
                          {
                            studentId: editParent.selectedStudentIdEdit,
                            student: allStudents.find(
                              (u) =>
                                u.student &&
                                u.student.id ===
                                  editParent.selectedStudentIdEdit
                            )?.student,
                          },
                        ],
                      },
                      selectedStudentIdEdit: "",
                    }));
                  }
                }}
              >
                Tambah Anak
              </Button>
              {/* Daftar anak yang sudah dipilih */}
              {editParent.parent?.parentStudents?.length > 0 && (
                <div className="mt-2">
                  <Label>Anak Terpilih:</Label>
                  <ul className="list-disc ml-4">
                    {editParent.parent.parentStudents.map((ps: any) => (
                      <li key={ps.studentId}>
                        {ps.student?.name} - {ps.student?.class} -{" "}
                        {ps.student?.grade}
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="ml-2"
                          onClick={() =>
                            setEditParent((prev: any) => ({
                              ...prev,
                              parent: {
                                ...prev.parent,
                                parentStudents:
                                  prev.parent.parentStudents.filter(
                                    (x: any) => x.studentId !== ps.studentId
                                  ),
                              },
                            }))
                          }
                        >
                          Hapus
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={async () => {
                // Kirim update ke backend (implementasi endpoint update parent & relasi anak)
                await fetch("/api/users", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    id: editParent.id,
                    name: editParent.name,
                    email: editParent.email,
                    password: editParent.password,
                    role: "PARENT",
                    children: editParent.parent.parentStudents.map(
                      (ps: any) => ({
                        studentId: ps.studentId,
                        relation: "Orang Tua",
                      })
                    ),
                  }),
                });
                setModalEditParent(false);
                await fetchParents(); // REFRESH DATA
              }}
              className="w-full bg-emerald-700 hover:bg-emerald-800"
            >
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal Detail Siswa */}
      <Dialog open={showStudentDetail} onOpenChange={setShowStudentDetail}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-emerald-800">Detail Siswa</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <span className="font-semibold text-gray-700">Nama</span>
                <span className="text-gray-900">{selectedStudent.name}</span>
                <span className="font-semibold text-gray-700">NIS</span>
                <span className="text-gray-900">{selectedStudent.nis}</span>
                <span className="font-semibold text-gray-700">Kelas</span>
                <span className="text-gray-900">{selectedStudent.class}</span>
                <span className="font-semibold text-gray-700">Grade</span>
                <span className="text-gray-900">{selectedStudent.grade}</span>
                <span className="font-semibold text-gray-700">Saldo</span>
                <span className="text-gray-900">
                  {formatCurrency(selectedStudent.saldo)}
                </span>
                <span className="font-semibold text-gray-700">Status</span>
                <span className="text-gray-900">{selectedStudent.status}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Modal Detail Orang Tua */}
      <Dialog open={showParentDetail} onOpenChange={setShowParentDetail}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-emerald-800">
              Detail Orang Tua
            </DialogTitle>
          </DialogHeader>
          {selectedParent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <span className="font-semibold text-gray-700">Nama</span>
                <span className="text-gray-900">{selectedParent.name}</span>
                <span className="font-semibold text-gray-700">Email</span>
                <span className="text-gray-900">{selectedParent.email}</span>
                <span className="font-semibold text-gray-700">Telepon</span>
                <span className="text-gray-900">
                  {selectedParent.parent?.phone || "-"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Anak:</span>
                <ul className="list-disc ml-6 mt-1 text-gray-900">
                  {selectedParent.parent?.parentStudents?.map((ps: any) => (
                    <li key={ps.studentId}>{ps.student?.user?.name || "-"}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Modal Detail Transaksi */}
      <Dialog
        open={showTransactionDetail}
        onOpenChange={setShowTransactionDetail}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-emerald-800">
              Detail Transaksi
            </DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <span className="font-semibold text-gray-700">Nama Siswa</span>
                <span className="text-gray-900">
                  {selectedTransaction.student?.name}
                </span>
                <span className="font-semibold text-gray-700">Kasir</span>
                <span className="text-gray-900">
                  {selectedTransaction.cashier?.user?.name || "-"}
                </span>
                <span className="font-semibold text-gray-700">Waktu</span>
                <span className="text-gray-900">
                  {selectedTransaction.date ||
                    (selectedTransaction.createdAt
                      ? new Date(selectedTransaction.createdAt).toLocaleString(
                          "id-ID"
                        )
                      : "")}
                </span>
                <span className="font-semibold text-gray-700">Jumlah</span>
                <span className="text-gray-900">
                  {formatCurrency(
                    Number(
                      selectedTransaction.amount ||
                        selectedTransaction.totalAmount ||
                        0
                    )
                  )}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Item:</span>
                <ul className="list-disc ml-6 mt-1 text-gray-900">
                  {Array.isArray(selectedTransaction.items) ? (
                    selectedTransaction.items.map((item: any, idx: number) => (
                      <li key={idx}>
                        {item.product?.name || item.name} x{item.quantity}
                      </li>
                    ))
                  ) : (
                    <li>{selectedTransaction.items}</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
