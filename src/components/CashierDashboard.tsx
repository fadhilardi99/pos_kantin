import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
  Camera,
  X,
  CheckCircle,
  AlertCircle,
  Upload,
  FileImage,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Html5QrcodeScanner } from "html5-qrcode";
import { BrowserQRCodeReader } from "@zxing/browser";
import useSWR from "swr";

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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const CashierDashboard = ({ user, onLogout }: CashierDashboardProps) => {
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [cart, setCart] = useState<Product[]>([]);
  const [nisInput, setNisInput] = useState("");
  const [studentTransactions, setStudentTransactions] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [cashier, setCashier] = useState<Cashier | null>(null);

  // QR Scanner states
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [scannedData, setScannedData] = useState<string>("");
  const [scanning, setScanning] = useState(false);
  const [scannerError, setScannerError] = useState<string>("");
  const [scannerMode, setScannerMode] = useState<"camera" | "upload">("camera");
  const qrScannerRef = useRef<HTMLDivElement>(null);
  const scannerInstanceRef = useRef<Html5QrcodeScanner | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pakai SWR untuk products dan transactions
  const {
    data: products = [],
    isLoading: loadingProducts,
    error: errorProducts,
    mutate: mutateProducts,
  } = useSWR("/api/products", fetcher, { refreshInterval: 10000 });

  const { data: allTransactions = [], mutate: mutateTransactions } = useSWR(
    "/api/transactions",
    fetcher,
    { refreshInterval: 10000 }
  );

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

  // QR Scanner effect
  useEffect(() => {
    if (qrScannerOpen && scanning && scannerMode === "camera") {
      // Start scanner when modal opens and camera mode is selected
      setTimeout(() => {
        startQRScanner();
      }, 100);
    } else {
      // Stop scanner when modal closes or mode changes
      stopQRScanner();
    }

    // Cleanup on unmount
    return () => {
      stopQRScanner();
    };
  }, [qrScannerOpen, scanning, scannerMode]);

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
      // Filter transactions berdasarkan studentId dari data SWR
      const filtered = allTransactions.filter(
        (t: any) => t.student?.id === studentId
      );
      setStudentTransactions(filtered);
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

  // QR Scanner functions
  const handleScanQRCode = () => {
    setQrScannerOpen(true);
    setScanning(false);
    setScannedData("");
    setScannerError("");
    setScannerMode("camera");
  };

  const processScannedQRCode = (qrData: string) => {
    try {
      // Decode QR data
      const decodedData = JSON.parse(atob(qrData));

      // Validate QR data structure
      if (
        !decodedData.studentId ||
        !decodedData.studentName ||
        !decodedData.nis
      ) {
        throw new Error("Data QR code tidak valid");
      }

      // Check if QR is for purchase
      if (decodedData.type !== "PURCHASE_QR") {
        throw new Error("QR code bukan untuk pembelian");
      }

      // Set current student from QR data
      setCurrentStudent({
        id: decodedData.studentId,
        name: decodedData.studentName,
        nis: decodedData.nis,
        saldo: Number(decodedData.saldo) || 0,
        class: decodedData.class || "-",
      });

      // Fetch latest student data and transactions
      fetchStudentByNIS(decodedData.nis);
      fetchStudentTransactions(decodedData.studentId);

      setQrScannerOpen(false);
      setScanning(false);
      setScannedData("");
      setScannerError("");

      toast({
        title: "QR Code Berhasil Di-scan",
        description: `Siswa: ${
          decodedData.studentName
        } - Saldo: ${formatCurrency(Number(decodedData.saldo) || 0)}`,
      });
    } catch (error) {
      console.error("Error processing QR code:", error);
      toast({
        title: "QR Code Tidak Valid",
        description: "QR code tidak dapat diproses atau format tidak sesuai",
        variant: "destructive",
      });
      setScanning(false);
      setScannerError("QR code tidak valid atau format tidak sesuai");
    }
  };

  const startQRScanner = () => {
    if (!qrScannerRef.current) return;

    try {
      // Clean up previous scanner
      if (scannerInstanceRef.current) {
        scannerInstanceRef.current.clear();
      }

      // Create new scanner
      scannerInstanceRef.current = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 256, height: 256 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2,
        },
        false
      );

      // Start scanning
      scannerInstanceRef.current.render(
        (decodedText: string) => {
          // Success callback
          processScannedQRCode(decodedText);
        },
        (errorMessage: string) => {
          // Only show error if not NotFoundException
          if (
            errorMessage &&
            !errorMessage.includes("NotFoundException") &&
            !errorMessage.includes("no MultiFormat Readers")
          ) {
            setScannerError(errorMessage);
          } else {
            setScannerError(""); // Clear error for NotFoundException
          }
        }
      );
    } catch (error) {
      console.error("Error starting QR scanner:", error);
      setScannerError(
        "Gagal mengakses kamera. Pastikan izin kamera diberikan."
      );
    }
  };

  const stopQRScanner = () => {
    if (scannerInstanceRef.current) {
      scannerInstanceRef.current.clear();
      scannerInstanceRef.current = null;
    }
  };

  // File upload functions
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "File Tidak Valid",
        description: "Pilih file gambar (JPG, PNG, GIF)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Terlalu Besar",
        description: "Ukuran file maksimal 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      // Read file as image
      const imageUrl = URL.createObjectURL(file);
      const img = document.createElement("img");
      img.src = imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Use zxing-js/browser to decode QR code from image
      const codeReader = new BrowserQRCodeReader();
      const result = await codeReader.decodeFromImageElement(img);
      if (!result || !result.getText()) {
        throw new Error("QR code tidak ditemukan pada gambar");
      }
      processScannedQRCode(result.getText());
      toast({
        title: "QR Code Terdeteksi",
        description: "QR code berhasil dibaca dari gambar",
      });
    } catch (err: any) {
      toast({
        title: "Gagal Membaca QR Code",
        description:
          err?.message ||
          "QR code tidak valid atau tidak ditemukan pada gambar",
        variant: "destructive",
      });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
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
          studentId: currentStudent.id,
          cashierId: cashier.id,
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity ?? 1,
            price: item.price,
          })),
          paymentMethod: "QR_CODE",
          notes: "",
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan transaksi");

      // Refresh data setelah checkout
      mutateTransactions();
      mutateProducts(); // Refresh products untuk update stock

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
      : products.filter((p: any) => p.category === selectedCategory);

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
                  onClick={handleScanQRCode}
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
                    filteredProducts.map((product: any) => (
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

      {/* QR Scanner Modal */}
      <Dialog open={qrScannerOpen} onOpenChange={setQrScannerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>Scan QR Code Siswa</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!scanning ? (
              // Mode selection
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Pilih Metode Scan QR Code
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Camera Mode */}
                  <Button
                    onClick={() => {
                      setScannerMode("camera");
                      setScanning(true);
                    }}
                    className={`h-24 flex flex-col items-center justify-center space-y-2 ${
                      scannerMode === "camera"
                        ? "bg-emerald-700 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Camera className="h-8 w-8" />
                    <span className="text-sm font-medium">Kamera</span>
                    <span className="text-xs opacity-75">Scan langsung</span>
                  </Button>

                  {/* Upload Mode */}
                  <Button
                    onClick={() => {
                      setScannerMode("upload");
                      handleUploadClick();
                    }}
                    className={`h-24 flex flex-col items-center justify-center space-y-2 ${
                      scannerMode === "upload"
                        ? "bg-emerald-700 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Upload className="h-8 w-8" />
                    <span className="text-sm font-medium">Upload</span>
                    <span className="text-xs opacity-75">Upload gambar</span>
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Pilih metode yang paling sesuai dengan kebutuhan Anda
                  </p>
                </div>
              </div>
            ) : scannerMode === "camera" ? (
              // Camera Scanner
              <div className="text-center space-y-4">
                {/* QR Scanner Container */}
                <div className="relative bg-black rounded-lg overflow-hidden">
                  {/* Scanner View */}
                  <div
                    ref={qrScannerRef}
                    id="qr-reader"
                    className="w-full h-80"
                  ></div>

                  {/* Overlay with scanning frame */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="flex items-center justify-center h-full">
                      <div className="w-64 h-64 border-2 border-emerald-400 rounded-lg relative">
                        {/* Corner indicators */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-l-2 border-t-2 border-emerald-400"></div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-r-2 border-t-2 border-emerald-400"></div>
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-2 border-b-2 border-emerald-400"></div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-2 border-b-2 border-emerald-400"></div>

                        {/* Scanning line animation */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400">
                          <div className="w-1/3 h-full bg-white animate-ping"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    <Camera className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Scan QR Code Siswa
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Posisikan QR code dalam kotak di atas
                  </p>

                  {scannerError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-700">
                          {scannerError}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Upload Mode
              <div className="text-center space-y-4">
                <div className="bg-gray-100 p-8 rounded-lg border-2 border-dashed border-gray-300">
                  <FileImage className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Upload Gambar QR Code
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Pilih file gambar yang berisi QR code siswa
                  </p>

                  <Button
                    onClick={handleUploadClick}
                    className="bg-emerald-700 hover:bg-emerald-800"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Pilih File
                  </Button>

                  <p className="text-xs text-gray-400 mt-2">
                    Format: JPG, PNG, GIF (Max: 5MB)
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setQrScannerOpen(false);
                setScanning(false);
                setScannedData("");
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden file input for upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default CashierDashboard;
