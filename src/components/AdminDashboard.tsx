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
import { DataTable } from "@/components/ui/data-table";
import { DataGrid } from "@/components/ui/data-grid";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface AdminDashboardProps {
  user: { name: string; role: string };
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
    null | "student" | "parent" | "cashier" | "admin"
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
  const [admins, setAdmins] = useState<any[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [addAdminModal, setAddAdminModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
    nip: "",
    position: "",
  });
  const [addAdminLoading, setAddAdminLoading] = useState(false);
  const [topUpModal, setTopUpModal] = useState(false);
  const [topUpStudent, setTopUpStudent] = useState<any | null>(null);
  const [topUpAmount, setTopUpAmount] = useState(0);
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [addProductModal, setAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    category: "MAKANAN_BERAT",
    description: "",
    image: "",
    barcode: "",
  });
  const [addProductLoading, setAddProductLoading] = useState(false);
  // Tambahkan state untuk edit produk
  const [editProductModal, setEditProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newStock, setNewStock] = useState(0);
  const [editProductLoading, setEditProductLoading] = useState(false);

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

  // Fetch admins
  useEffect(() => {
    async function fetchAdmins() {
      setLoadingAdmins(true);
      try {
        const res = await fetch("/api/users?role=ADMIN");
        const data = await res.json();
        setAdmins(data);
      } catch {}
      setLoadingAdmins(false);
    }
    fetchAdmins();
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

  // Fungsi untuk mendapatkan top produk terlaris
  const getTopProducts = () => {
    const productSales: Record<string, number> = {};
    transactions.forEach((t) => {
      const allItems = t.transaction_items || [];
      allItems.forEach((item: any) => {
        const name = item.product?.name || item.name;
        if (!name) return;
        productSales[name] = (productSales[name] || 0) + (item.quantity || 1);
      });
    });
    return Object.entries(productSales)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 5);
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

      // Refresh topups with a small delay to ensure database is updated
      setTimeout(async () => {
        try {
          const res2 = await fetch("/api/topups");
          const updatedTopups = await res2.json();
          setTopups(updatedTopups);
        } catch (refreshError) {
          console.error("Error refreshing topups:", refreshError);
        }
      }, 500);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
      setRejectModal({ open: false, id: null });
      setRejectReason("");
    }
  }

  // Fungsi untuk download laporan PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Laporan Penjualan Harian", 14, 16);
    doc.setFontSize(11);
    doc.text(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, 14, 24);
    doc.text(`Total Transaksi: ${transactions.length}`, 14, 32);
    doc.text(`Total Penjualan: ${formatCurrency(getTotalSales())}`, 14, 40);
    doc.text(
      `Rata-rata per Transaksi: ${formatCurrency(
        transactions.length ? getTotalSales() / transactions.length : 0
      )}`,
      14,
      48
    );
    // Table transaksi
    autoTable(doc, {
      startY: 56,
      head: [["No", "Nama Siswa", "Kasir", "Tanggal", "Jumlah", "Item"]],
      body: transactions.map((t: any, idx: number) => [
        idx + 1,
        t.student?.name || "-",
        t.cashier?.user?.name || "-",
        t.date ||
          (t.createdAt ? new Date(t.createdAt).toLocaleString("id-ID") : ""),
        formatCurrency(Number(t.amount || t.totalAmount || 0)),
        Array.isArray(t.items)
          ? t.items
              .map(
                (item: any) =>
                  `${item.product?.name || item.name} x${item.quantity}`
              )
              .join(", ")
          : t.items,
      ]),
      styles: { font: "helvetica", fontSize: 9 },
      headStyles: { fillColor: [22, 101, 52] }, // emerald-700
    });
    doc.save(
      `laporan-penjualan-harian-${new Date()
        .toLocaleDateString("id-ID")
        .replace(/\//g, "-")}.pdf`
    );
  };

  // Hapus handler backup dan restore

  // Hitung jumlah top up pending sebelum return
  const pendingTopupCount = topups.filter((t) => t.status === "PENDING").length;

  // Fungsi untuk edit produk (tambah stok)
  const handleEditProduct = async (product: any) => {
    setEditingProduct(product);
    setNewStock(0);
    setEditProductModal(true);
  };

  // Fungsi untuk update stok produk
  const handleUpdateStock = async () => {
    if (!editingProduct || newStock <= 0) return;

    setEditProductLoading(true);
    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stock: editingProduct.stock + newStock,
        }),
      });

      if (!res.ok) {
        let errMsg = "Gagal update stok produk";
        try {
          const err = await res.json();
          if (err && err.message) errMsg = err.message;
        } catch {}
        throw new Error(errMsg);
      }

      toast({ title: "Stok berhasil ditambahkan" });
      setEditProductModal(false);
      setEditingProduct(null);
      setNewStock(0);

      // Refresh data produk
      setLoadingProducts(true);
      const res2 = await fetch("/api/products");
      setProducts(await res2.json());
      setLoadingProducts(false);
    } catch (error: any) {
      toast({
        title: error.message || "Gagal update stok produk",
        variant: "destructive",
      });
    } finally {
      setEditProductLoading(false);
    }
  };

  // Fungsi untuk hapus produk
  const handleDeleteProduct = async (product: any) => {
    if (!window.confirm(`Yakin hapus produk "${product.name}"?`)) return;

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal hapus produk");

      toast({ title: "Produk berhasil dihapus" });

      // Refresh data produk
      setLoadingProducts(true);
      const res2 = await fetch("/api/products");
      setProducts(await res2.json());
      setLoadingProducts(false);
    } catch (error) {
      toast({
        title: "Gagal hapus produk",
        variant: "destructive",
      });
    }
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
          <TabsList className="grid w-full grid-cols-6 bg-emerald-50 border-emerald-200">
            <TabsTrigger
              value="students"
              className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white"
            >
              Manajemen Data
            </TabsTrigger>
            <TabsTrigger
              value="produk"
              className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white"
            >
              Produk
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white"
            >
              Laporan Transaksi
            </TabsTrigger>
            <TabsTrigger
              value="approval"
              className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white"
            >
              Approval Top Up
              {pendingTopupCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {pendingTopupCount}
                </span>
              )}
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
                      setAddModalType(
                        val as "student" | "parent" | "cashier" | "admin"
                      )
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
                      <SelectItem value="admin">Tambah Admin</SelectItem>
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
                    <TabsTrigger value="tab-admin">Admin</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tab-siswa">
                    <DataTable
                      data={students
                        .filter((u) => u.role === "STUDENT" && u.student)
                        .map((u) => u.student)}
                      columns={[
                        {
                          key: "name",
                          label: "Nama Siswa",
                          sortable: true,
                        },
                        {
                          key: "nis",
                          label: "NIS",
                          sortable: true,
                        },
                        {
                          key: "class",
                          label: "Kelas",
                          sortable: true,
                          render: (value, row) =>
                            `${row.grade || "-"} ${value || "-"}`.trim(),
                        },
                        {
                          key: "saldo",
                          label: "Saldo",
                          sortable: true,
                          render: (value) => formatCurrency(value || 0),
                        },
                        {
                          key: "status",
                          label: "Status",
                          sortable: true,
                          render: (value) => (
                            <Badge
                              variant={
                                value === "ACTIVE" ? "default" : "secondary"
                              }
                              className="bg-emerald-100 text-emerald-800 border-emerald-200"
                            >
                              {value === "ACTIVE" ? "Aktif" : "Nonaktif"}
                            </Badge>
                          ),
                        },
                      ]}
                      title="Data Siswa"
                      description="Kelola data siswa dan saldo mereka"
                      loading={loadingStudents}
                      emptyMessage={errorStudents || "Tidak ada data siswa"}
                      onView={(student) => {
                        setSelectedStudent(student);
                        setShowStudentDetail(true);
                      }}
                      itemsPerPage={10}
                      searchFields={["name", "nis", "class", "grade"]}
                    />
                  </TabsContent>
                  <TabsContent value="tab-parent">
                    <DataTable
                      data={parents}
                      columns={[
                        {
                          key: "name",
                          label: "Nama Orang Tua",
                          sortable: true,
                        },
                        {
                          key: "parent.phone",
                          label: "Telepon",
                          sortable: true,
                          render: (value, row) => row.parent?.phone || "-",
                        },
                        {
                          key: "parent.nik",
                          label: "NIK",
                          sortable: true,
                          render: (value, row) => row.parent?.nik || "-",
                        },
                        {
                          key: "parent.address",
                          label: "Alamat",
                          sortable: true,
                          render: (value, row) => row.parent?.address || "-",
                        },
                        {
                          key: "parent.parentStudents",
                          label: "Jumlah Anak",
                          sortable: true,
                          render: (value, row) =>
                            row.parent?.parentStudents?.length || 0,
                        },
                      ]}
                      title="Data Orang Tua"
                      description="Kelola data orang tua siswa"
                      loading={loadingParents}
                      emptyMessage={errorParents || "Tidak ada data orang tua"}
                      onView={(parent) => {
                        setSelectedParent(parent);
                        setShowParentDetail(true);
                      }}
                      onEdit={(parent) => {
                        setEditParent(parent);
                        setModalEditParent(true);
                      }}
                    />
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
                  <TabsContent value="tab-admin">
                    {loadingAdmins ? (
                      <p>Loading admin...</p>
                    ) : (
                      <div className="space-y-4">
                        {admins.map((a) => (
                          <div
                            key={a.admin?.id}
                            className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
                          >
                            <div>
                              <p className="font-semibold text-gray-800">
                                {a.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                Email: {a.email}
                              </p>
                              <p className="text-sm text-gray-600">
                                NIP: {a.admin?.nip}
                              </p>
                              <p className="text-sm text-gray-600">
                                Jabatan: {a.admin?.position}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={a.admin?.nip === "00000001"}
                                onClick={async () => {
                                  if (a.admin?.nip === "00000001") return;
                                  if (!window.confirm("Yakin hapus admin ini?"))
                                    return;
                                  await fetch(`/api/users`, {
                                    method: "DELETE",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({ id: a.id }),
                                  });
                                  setAdmins((prev) =>
                                    prev.filter((x) => x.id !== a.id)
                                  );
                                }}
                              >
                                Hapus
                              </Button>
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

          {/* Products Management */}
          <TabsContent value="produk">
            <DataGrid
              data={products}
              title="Daftar Produk"
              description="Kelola produk kantin"
              loading={loadingProducts}
              emptyMessage={errorProducts || "Tidak ada data produk"}
              searchFields={["name", "category"]}
              addButton={
                user.role === "ADMIN" ? (
                  <Button
                    onClick={() => setAddProductModal(true)}
                    className="bg-emerald-700 hover:bg-emerald-800"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Produk
                  </Button>
                ) : undefined
              }
              renderItem={(product) => (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="h-8 w-8 text-emerald-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-emerald-800 text-lg truncate">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {product.description || "Tidak ada deskripsi"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Harga:</span>
                      <span className="font-bold text-emerald-700 text-lg">
                        {formatCurrency(product.price)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Stok:</span>
                      <Badge
                        variant={
                          product.stock > 10 ? "secondary" : "destructive"
                        }
                        className={
                          product.stock > 10
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {product.stock} stok
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Kategori:</span>
                      <Badge
                        variant="outline"
                        className="border-emerald-200 text-emerald-700"
                      >
                        {product.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          </TabsContent>

          {/* Transactions */}
          <TabsContent value="transactions">
            <DataTable
              data={transactions}
              columns={[
                {
                  key: "student.name",
                  label: "Nama Siswa",
                  sortable: true,
                  render: (value, row) => row.student?.name || "-",
                },
                {
                  key: "cashier.user.name",
                  label: "Kasir",
                  sortable: true,
                  render: (value, row) => row.cashier?.user?.name || "-",
                },
                {
                  key: "amount",
                  label: "Total",
                  sortable: true,
                  render: (value, row) =>
                    formatCurrency(Number(row.amount || row.totalAmount || 0)),
                },
                {
                  key: "createdAt",
                  label: "Tanggal",
                  sortable: true,
                  render: (value, row) => {
                    const date = row.date || row.createdAt;
                    return date ? new Date(date).toLocaleString("id-ID") : "-";
                  },
                },
                {
                  key: "actions",
                  label: "Aksi",
                  sortable: false,
                  render: (value, row) => (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedTransaction(row);
                        setShowTransactionDetail(true);
                      }}
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  ),
                },
              ]}
              title="Laporan Transaksi"
              description="Riwayat semua transaksi siswa"
              loading={loadingTransactions}
              emptyMessage={errorTransactions || "Tidak ada data transaksi"}
              itemsPerPage={15}
            />
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
                    onClick={handleDownloadPDF}
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
                    {getTopProducts().length === 0 ? (
                      <div className="text-gray-500">
                        Belum ada data penjualan
                      </div>
                    ) : (
                      getTopProducts().map(
                        ([name, count]: [string, number]) => (
                          <div
                            key={name}
                            className="flex justify-between items-center"
                          >
                            <span>{name}</span>
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                              {count} terjual
                            </Badge>
                          </div>
                        )
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Approval Top Up */}
          <TabsContent value="approval">
            <DataTable
              data={topups.filter((t) => t.status === "PENDING")}
              columns={[
                {
                  key: "student.name",
                  label: "Nama Siswa",
                  sortable: true,
                  render: (value, row) => row.student?.name || "-",
                },
                {
                  key: "student.nis",
                  label: "NIS",
                  sortable: true,
                  render: (value, row) => row.student?.nis || "-",
                },
                {
                  key: "amount",
                  label: "Jumlah",
                  sortable: true,
                  render: (value) => formatCurrency(value || 0),
                },
                {
                  key: "method",
                  label: "Metode",
                  sortable: true,
                },
                {
                  key: "createdAt",
                  label: "Tanggal",
                  sortable: true,
                  render: (value) => {
                    return value
                      ? new Date(value).toLocaleString("id-ID")
                      : "-";
                  },
                },
                {
                  key: "actions",
                  label: "Aksi",
                  sortable: false,
                  render: (value, row) => (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={actionLoading === row.id + "approve"}
                        onClick={() => handleTopupAction(row.id, "approve")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {actionLoading === row.id + "approve"
                          ? "Memproses..."
                          : "Approve"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={actionLoading === row.id + "reject"}
                        onClick={() =>
                          setRejectModal({ open: true, id: row.id })
                        }
                      >
                        {actionLoading === row.id + "reject"
                          ? "Memproses..."
                          : "Reject"}
                      </Button>
                    </div>
                  ),
                },
              ]}
              title="Approval Top Up"
              description="Daftar permintaan top up yang menunggu persetujuan"
              loading={loadingTopups}
              emptyMessage={errorTopups || "Tidak ada data top up pending"}
              itemsPerPage={10}
            />
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
            <Label>NIK</Label>
            <Input
              value={newParent.nik}
              onChange={(e) =>
                setNewParent((p) => ({ ...p, nik: e.target.value }))
              }
            />
            <Label>No. HP</Label>
            <Input
              value={newParent.phone}
              onChange={(e) =>
                setNewParent((p) => ({ ...p, phone: e.target.value }))
              }
            />
            <Label>Alamat</Label>
            <Input
              value={newParent.address}
              onChange={(e) =>
                setNewParent((p) => ({ ...p, address: e.target.value }))
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
                if (
                  !newParent.name ||
                  !newParent.email ||
                  !newParent.password ||
                  !newParent.nik ||
                  !newParent.phone ||
                  !newParent.address
                ) {
                  toast({
                    title: "Error",
                    description: "Semua field wajib diisi!",
                    variant: "destructive",
                  });
                  return;
                }
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
        <DialogContent className="max-w-md">
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
                <div className="mt-2 space-y-2">
                  {Array.isArray(selectedTransaction.transaction_items) &&
                  selectedTransaction.transaction_items.length > 0 ? (
                    selectedTransaction.transaction_items.map(
                      (item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <div>
                            <span className="font-medium">
                              {item.product?.name || item.name}
                            </span>
                            <span className="text-sm text-gray-600 ml-2">
                              x{item.quantity}
                            </span>
                          </div>
                          <span className="font-semibold text-emerald-700">
                            {formatCurrency(
                              (item.product?.price || item.price || 0) *
                                item.quantity
                            )}
                          </span>
                        </div>
                      )
                    )
                  ) : (
                    <div className="p-2 bg-gray-50 rounded text-gray-500">
                      Tidak ada item
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTransactionDetail(false)}
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal Tambah Admin */}
      <Dialog
        open={addModalType === "admin" || addAdminModal}
        onOpenChange={(open) => {
          setAddAdminModal(open);
          if (!open) setAddModalType(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Admin Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Nama</Label>
            <Input
              value={newAdmin.name}
              onChange={(e) =>
                setNewAdmin((a) => ({ ...a, name: e.target.value }))
              }
            />
            <Label>Email</Label>
            <Input
              value={newAdmin.email}
              onChange={(e) =>
                setNewAdmin((a) => ({ ...a, email: e.target.value }))
              }
            />
            <Label>Password</Label>
            <Input
              type="password"
              value={newAdmin.password}
              onChange={(e) =>
                setNewAdmin((a) => ({ ...a, password: e.target.value }))
              }
            />
            <Label>NIP</Label>
            <Input
              value={newAdmin.nip}
              onChange={(e) =>
                setNewAdmin((a) => ({ ...a, nip: e.target.value }))
              }
            />
            <Label>Jabatan</Label>
            <Input
              value={newAdmin.position}
              onChange={(e) =>
                setNewAdmin((a) => ({ ...a, position: e.target.value }))
              }
            />
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                setAddAdminLoading(true);
                try {
                  const res = await fetch("/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: newAdmin.name,
                      email: newAdmin.email,
                      password: newAdmin.password,
                      role: "ADMIN",
                      nip: newAdmin.nip,
                      position: newAdmin.position,
                    }),
                  });
                  if (!res.ok) throw new Error("Gagal menambah admin");
                  setAddAdminModal(false);
                  setAddModalType(null);
                  setNewAdmin({
                    name: "",
                    email: "",
                    password: "",
                    nip: "",
                    position: "",
                  });
                  setLoadingAdmins(true);
                  const res2 = await fetch("/api/users?role=ADMIN");
                  setAdmins(await res2.json());
                  setLoadingAdmins(false);
                } catch (e) {
                  alert("Gagal menambah admin");
                } finally {
                  setAddAdminLoading(false);
                }
              }}
              disabled={addAdminLoading}
              className="w-full bg-emerald-700 hover:bg-emerald-800"
            >
              {addAdminLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal Top Up Siswa Manual */}
      <Dialog open={topUpModal} onOpenChange={setTopUpModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Top Up Saldo Siswa</DialogTitle>
          </DialogHeader>
          {topUpStudent && (
            <div className="space-y-3">
              <div>
                Nama: <b>{topUpStudent.name}</b>
              </div>
              <div>Kelas: {topUpStudent.class}</div>
              <div>
                Saldo Saat Ini: <b>{formatCurrency(topUpStudent.saldo)}</b>
              </div>
              <Label>Nominal Top Up</Label>
              <Input
                type="number"
                min={1}
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(Number(e.target.value))}
              />
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={async () => {
                if (!topUpStudent || !topUpAmount || topUpAmount <= 0) return;
                setTopUpLoading(true);
                try {
                  const res = await fetch(`/api/users/student`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      id: topUpStudent.id,
                      amount: topUpAmount,
                    }),
                  });
                  if (!res.ok) throw new Error("Gagal top up saldo siswa");
                  setTopUpModal(false);
                  setTopUpStudent(null);
                  setTopUpAmount(0);
                  setLoadingStudents(true);
                  const res2 = await fetch("/api/users");
                  setStudents(await res2.json());
                  setLoadingStudents(false);
                } catch (e) {
                  alert("Gagal top up saldo siswa");
                } finally {
                  setTopUpLoading(false);
                }
              }}
              disabled={topUpLoading || !topUpAmount || topUpAmount <= 0}
              className="w-full bg-emerald-700 hover:bg-emerald-800"
            >
              {topUpLoading ? "Memproses..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal Tambah Produk */}
      <Dialog open={addProductModal} onOpenChange={setAddProductModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Produk Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Nama Produk</Label>
            <Input
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct((p) => ({ ...p, name: e.target.value }))
              }
            />
            <Label>Harga</Label>
            <Input
              type="number"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct((p) => ({ ...p, price: e.target.value }))
              }
            />
            <Label>Stok</Label>
            <Input
              type="number"
              value={newProduct.stock}
              onChange={(e) =>
                setNewProduct((p) => ({ ...p, stock: e.target.value }))
              }
            />
            <Label>Kategori</Label>
            <select
              className="w-full border rounded p-2"
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct((p) => ({ ...p, category: e.target.value }))
              }
            >
              <option value="MAKANAN_BERAT">Makanan Berat</option>
              <option value="MAKANAN_RINGAN">Makanan Ringan</option>
              <option value="MINUMAN">Minuman</option>
              <option value="SNACK">Snack</option>
              <option value="LAINNYA">Lainnya</option>
            </select>
            <Label>Deskripsi</Label>
            <Input
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct((p) => ({ ...p, description: e.target.value }))
              }
            />
            <Label>Barcode (opsional)</Label>
            <Input
              value={newProduct.barcode}
              onChange={(e) =>
                setNewProduct((p) => ({ ...p, barcode: e.target.value }))
              }
            />
            <Label>URL Gambar (opsional)</Label>
            <Input
              value={newProduct.image}
              onChange={(e) =>
                setNewProduct((p) => ({ ...p, image: e.target.value }))
              }
            />
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                setAddProductLoading(true);
                try {
                  const res = await fetch("/api/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      ...newProduct,
                      price: Number(newProduct.price),
                      stock: Number(newProduct.stock),
                    }),
                  });
                  if (!res.ok) throw new Error("Gagal menambah produk");
                  setAddProductModal(false);
                  setNewProduct({
                    name: "",
                    price: "",
                    stock: "",
                    category: "MAKANAN_BERAT",
                    description: "",
                    image: "",
                    barcode: "",
                  });
                  setLoadingProducts(true);
                  const res2 = await fetch("/api/products");
                  setProducts(await res2.json());
                  setLoadingProducts(false);
                } catch (e) {
                  alert("Gagal menambah produk");
                } finally {
                  setAddProductLoading(false);
                }
              }}
              disabled={addProductLoading}
              className="w-full bg-emerald-700 hover:bg-emerald-800"
            >
              {addProductLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal Edit Produk */}
      <Dialog open={editProductModal} onOpenChange={setEditProductModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Stok Produk</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div>
                <Label>Nama Produk</Label>
                <p className="font-semibold text-gray-900">
                  {editingProduct.name}
                </p>
              </div>
              <div>
                <Label>Stok Saat Ini</Label>
                <p className="font-semibold text-emerald-700">
                  {editingProduct.stock} stok
                </p>
              </div>
              <div>
                <Label htmlFor="new-stock">Tambah Stok</Label>
                <Input
                  id="new-stock"
                  type="number"
                  min="1"
                  value={newStock === 0 ? "" : newStock}
                  onChange={(e) => {
                    // Hapus leading zero dan pastikan hanya angka positif
                    const val = e.target.value.replace(/^0+/, "");
                    setNewStock(val === "" ? 0 : Math.max(0, Number(val)));
                  }}
                  placeholder="Masukkan jumlah stok yang ditambahkan"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditProductModal(false)}
            >
              Batal
            </Button>
            <Button
              onClick={handleUpdateStock}
              disabled={editProductLoading || newStock <= 0}
              className="bg-emerald-700 hover:bg-emerald-800"
            >
              {editProductLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
