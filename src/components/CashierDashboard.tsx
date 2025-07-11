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

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingCart,
  QrCode,
  Plus,
  Minus,
  LogOut,
  User,
  Receipt,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Student = {
  id: string;
  name: string;
  nis: string;
  saldo: number;
  class: string;
};

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  quantity?: number;
  image?: string; // Added image property
};

type Cashier = { id: string; user: { name: string } };

interface CashierDashboardProps {
  user: { name: string; id: string };
  onLogout: () => void;
}

const CashierDashboard = ({ user, onLogout }: CashierDashboardProps) => {
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [cart, setCart] = useState<Product[]>([]);
  const [nisInput, setNisInput] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);
  const [studentTransactions, setStudentTransactions] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [cashier, setCashier] = useState<Cashier | null>(null);

  useEffect(() => {
    async function fetchCashier() {
      const res = await fetch(`/api/users?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setCashier(data);
      }
    }
    if (user?.id) fetchCashier();
  }, [user?.id]);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const fetchStudentByNIS = async (nis: string) => {
    try {
      const res = await fetch(`/api/users/student?nis=${nis}`);
      if (!res.ok) throw new Error("Siswa tidak ditemukan");
      const data = await res.json();
      setCurrentStudent({
        id: data.id,
        name: data.name,
        nis: data.nis,
        saldo: Number(data.saldo),
        class: data.class || "-",
      });
      fetchStudentTransactions(data.id);
      toast({
        title: "Siswa Ditemukan",
        description: `${data.name} - Saldo: ${formatCurrency(
          Number(data.saldo)
        )}`,
      });
    } catch {
      setCurrentStudent(null);
      setStudentTransactions([]);
      toast({ title: "Siswa tidak ditemukan", variant: "destructive" });
    }
  };
  const fetchStudentTransactions = async (studentId: string) => {
    try {
      const res = await fetch(`/api/transactions`);
      const allTrans = await res.json();
      setStudentTransactions(
        allTrans.filter((t: any) => t.student?.id === studentId)
      );
    } catch {
      setStudentTransactions([]);
    }
  };
  const handleScanStudent = () => {
    if (nisInput.trim()) fetchStudentByNIS(nisInput.trim());
  };
  const handleSearchByNIS = () => {
    if (nisInput.trim()) fetchStudentByNIS(nisInput.trim());
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity ?? 1) + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: number, change: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === productId) {
            const newQuantity = Math.max(0, (item.quantity ?? 1) + change);
            return newQuantity === 0
              ? null
              : { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter(Boolean) as Product[]
    );
  };

  const getTotalAmount = () => {
    return cart.reduce(
      (total, item) => total + item.price * (item.quantity ?? 1),
      0
    );
  };

  const handleCheckout = async () => {
    if (!currentStudent) {
      toast({
        title: "Error",
        description: "Pilih siswa terlebih dahulu",
        variant: "destructive",
      });
      return;
    }
    if (!cashier) {
      toast({ title: "Data kasir tidak ditemukan", variant: "destructive" });
      return;
    }
    const total = getTotalAmount();
    if (currentStudent.saldo < total) {
      toast({
        title: "Saldo Tidak Cukup",
        description: `Saldo siswa: ${formatCurrency(
          currentStudent.saldo
        )}, Total: ${formatCurrency(total)}`,
        variant: "destructive",
      });
      return;
    }
    try {
      // Kirim transaksi ke backend
      const res = await fetch(`/api/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: currentStudent.id, // gunakan id siswa
          cashierId: cashier.id, // gunakan id kasir hasil fetch
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity ?? 1,
            price: item.price,
          })),
          paymentMethod: "QR_CODE", // atau "CASH" sesuai kebutuhan
          notes: "",
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan transaksi");
      // Fetch saldo terbaru
      await fetchStudentByNIS(currentStudent.nis);
      setCart([]);
      toast({
        title: "Transaksi Berhasil",
        description: `Total: ${formatCurrency(total)}`,
      });
    } catch {
      toast({ title: "Gagal menyimpan transaksi", variant: "destructive" });
    }
  };

  const filteredProducts =
    selectedCategory === "ALL"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-emerald-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-700 p-2 rounded-full">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Kasir POS</h1>
                <p className="text-gray-600">Operator: {user.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge
                variant="secondary"
                className="px-3 py-1 bg-emerald-100 text-emerald-800 border-emerald-200"
              >
                Shift: 08:00 - 16:00
              </Badge>
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
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Student & Cart */}
          <div className="lg:col-span-1 space-y-6">
            {/* Student Scanner */}
            <Card className="border-emerald-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-emerald-800">
                  <User className="h-5 w-5" />
                  <span>Identifikasi Siswa</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleScanStudent}
                  className="w-full bg-emerald-700 hover:bg-emerald-800"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Scan QR Code
                </Button>

                <div className="flex space-x-2">
                  <Input
                    placeholder="Masukkan NIS"
                    value={nisInput}
                    onChange={(e) => setNisInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearchByNIS()}
                    className="border-emerald-300 focus:border-emerald-500"
                  />
                  <Button
                    onClick={handleSearchByNIS}
                    variant="outline"
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                  >
                    Cari
                  </Button>
                </div>

                {currentStudent && (
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                    <h3 className="font-semibold text-emerald-800">
                      {currentStudent.name}
                    </h3>
                    <p className="text-sm text-emerald-600">
                      NIS: {currentStudent.nis}
                    </p>
                    <p className="text-sm text-emerald-600">
                      Kelas: {currentStudent.class}
                    </p>
                    <p className="font-bold text-emerald-700 mt-2">
                      Saldo: {formatCurrency(currentStudent.saldo)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shopping Cart */}
            <Card className="border-emerald-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-emerald-800">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Keranjang Belanja</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Keranjang kosong
                  </p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between bg-emerald-50 p-3 rounded border border-emerald-200"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="border-t border-emerald-200 pt-3 mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold">Total:</span>
                        <span className="font-bold text-lg text-emerald-700">
                          {formatCurrency(getTotalAmount())}
                        </span>
                      </div>

                      <Button
                        onClick={handleCheckout}
                        className="w-full bg-emerald-700 hover:bg-emerald-800"
                        disabled={!currentStudent || cart.length === 0}
                      >
                        <Receipt className="h-4 w-4 mr-2" />
                        Checkout
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Products */}
          <div className="lg:col-span-2">
            <Card className="border-emerald-200">
              <CardHeader>
                <CardTitle className="text-emerald-800">
                  Daftar Produk
                </CardTitle>
                <CardDescription>
                  Pilih produk untuk ditambahkan ke keranjang
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Redesign filter kategori produk */}
                <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                  {[
                    { label: "Semua", value: "ALL" },
                    { label: "Makanan Berat", value: "MAKANAN_BERAT" },
                    { label: "Makanan Ringan", value: "MAKANAN_RINGAN" },
                    { label: "Minuman", value: "MINUMAN" },
                    { label: "Snack", value: "SNACK" },
                    { label: "Lainnya", value: "LAINNYA" },
                  ].map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`px-4 py-2 rounded-full font-semibold border transition-colors whitespace-nowrap ${
                        selectedCategory === cat.value
                          ? "bg-emerald-700 text-white border-emerald-700 shadow"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                {/* Render produk sesuai kategori */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {filteredProducts.length === 0 ? (
                    <div className="text-gray-500 text-center col-span-full">
                      Tidak ada produk.
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <Card
                        key={product.id}
                        className="border-emerald-200 shadow-sm hover:shadow-lg transition-shadow rounded-xl flex items-center p-3"
                      >
                        {/* Gambar produk atau ikon */}
                        <div className="flex-shrink-0 w-16 h-16 bg-emerald-50 rounded-lg flex items-center justify-center mr-4">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-14 h-14 object-cover rounded-md"
                            />
                          ) : (
                            <ShoppingCart className="h-8 w-8 text-emerald-400" />
                          )}
                        </div>
                        {/* Info produk */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-emerald-800 truncate text-lg">
                              {product.name}
                            </span>
                            <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700 ml-2">
                              {product.category}
                            </span>
                          </div>
                          <div className="font-bold text-lg text-emerald-700 mb-1">
                            {formatCurrency(product.price)}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                product.stock > 5 ? "secondary" : "destructive"
                              }
                              className={
                                product.stock > 5
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700"
                              }
                            >
                              Stok: {product.stock}
                            </Badge>
                          </div>
                        </div>
                        {/* Tombol tambah */}
                        <div className="ml-4 flex-shrink-0">
                          <Button
                            onClick={() => addToCart(product)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-full p-3"
                            size="icon"
                          >
                            <Plus className="h-5 w-5" />
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Tambahkan riwayat transaksi siswa */}
      {currentStudent && (
        <Card className="border-emerald-200 mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-emerald-800">
              <Receipt className="h-5 w-5" />
              <span>Riwayat Transaksi Siswa</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studentTransactions.length === 0 ? (
                <div className="text-gray-500 text-center">
                  Belum ada transaksi.
                </div>
              ) : (
                studentTransactions.slice(0, 5).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-emerald-100 bg-white shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="h-4 w-4 text-emerald-500" />
                        <span className="font-bold text-emerald-800 truncate">
                          {t.student?.name}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {t.transactionItems && t.transactionItems.length > 0 ? (
                          t.transactionItems.map((item: any, idx: number) => (
                            <span
                              key={idx}
                              className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-xs border border-emerald-100"
                            >
                              {item.product?.name || item.name} x{item.quantity}
                            </span>
                          ))
                        ) : (
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CashierDashboard;
