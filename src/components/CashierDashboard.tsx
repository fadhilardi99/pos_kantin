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
};

interface CashierDashboardProps {
  user: { name: string }; // or your actual user type
  onLogout: () => void;
}

const CashierDashboard = ({ user, onLogout }: CashierDashboardProps) => {
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [cart, setCart] = useState<Product[]>([]);
  const [nisInput, setNisInput] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);

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

  const handleScanStudent = () => {
    // Demo scan - dalam implementasi nyata akan menggunakan QR scanner
    const demoStudent = {
      name: "Ahmad Rizki",
      nis: "2024001",
      saldo: 50000,
      class: "XII IPA 1",
    };
    setCurrentStudent(demoStudent);
    toast({
      title: "Siswa Ditemukan",
      description: `${demoStudent.name} - Saldo: ${formatCurrency(
        demoStudent.saldo
      )}`,
    });
  };

  const handleSearchByNIS = () => {
    if (nisInput.trim()) {
      const demoStudent = {
        name: "Ahmad Rizki",
        nis: nisInput,
        saldo: 50000,
        class: "XII IPA 1",
      };
      setCurrentStudent(demoStudent);
      setNisInput("");
      toast({
        title: "Siswa Ditemukan",
        description: `${demoStudent.name} - Saldo: ${formatCurrency(
          demoStudent.saldo
        )}`,
      });
    }
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

  const handleCheckout = () => {
    if (!currentStudent) {
      toast({
        title: "Error",
        description: "Pilih siswa terlebih dahulu",
        variant: "destructive",
      });
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

    // Proses checkout
    setCurrentStudent({
      ...currentStudent,
      saldo: currentStudent.saldo - total,
    });
    setCart([]);

    toast({
      title: "Transaksi Berhasil",
      description: `Total: ${formatCurrency(
        total
      )}. Sisa saldo: ${formatCurrency(currentStudent.saldo - total)}`,
    });
  };

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
                <Tabs defaultValue="all" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3 bg-emerald-50 border-emerald-200">
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white"
                    >
                      Semua
                    </TabsTrigger>
                    <TabsTrigger
                      value="makanan"
                      className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white"
                    >
                      Makanan
                    </TabsTrigger>
                    <TabsTrigger
                      value="minuman"
                      className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white"
                    >
                      Minuman
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-4">
                    {loadingProducts ? (
                      <p className="text-center py-8">Loading products...</p>
                    ) : errorProducts ? (
                      <p className="text-center py-8 text-red-500">
                        {errorProducts}
                      </p>
                    ) : (
                      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {products.map((product) => (
                          <Card
                            key={product.id}
                            className="hover:shadow-lg transition-shadow border-emerald-200"
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold">
                                  {product.name}
                                </h3>
                                <Badge
                                  variant={
                                    product.stock > 10
                                      ? "secondary"
                                      : "destructive"
                                  }
                                  className="bg-emerald-100 text-emerald-800 border-emerald-200"
                                >
                                  Stok: {product.stock}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {product.category}
                              </p>
                              <p className="font-bold text-emerald-700 mb-3">
                                {formatCurrency(product.price)}
                              </p>
                              <Button
                                onClick={() => addToCart(product)}
                                className="w-full bg-emerald-700 hover:bg-emerald-800"
                                disabled={product.stock === 0}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="makanan">
                    {loadingProducts ? (
                      <p className="text-center py-8">Loading products...</p>
                    ) : errorProducts ? (
                      <p className="text-center py-8 text-red-500">
                        {errorProducts}
                      </p>
                    ) : (
                      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {products
                          .filter((p) => p.category === "Makanan Berat")
                          .map((product) => (
                            <Card
                              key={product.id}
                              className="hover:shadow-lg transition-shadow border-emerald-200"
                            >
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-semibold">
                                    {product.name}
                                  </h3>
                                  <Badge
                                    variant={
                                      product.stock > 10
                                        ? "secondary"
                                        : "destructive"
                                    }
                                    className="bg-emerald-100 text-emerald-800 border-emerald-200"
                                  >
                                    Stok: {product.stock}
                                  </Badge>
                                </div>
                                <p className="font-bold text-emerald-700 mb-3">
                                  {formatCurrency(product.price)}
                                </p>
                                <Button
                                  onClick={() => addToCart(product)}
                                  className="w-full bg-emerald-700 hover:bg-emerald-800"
                                  disabled={product.stock === 0}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Tambah
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="minuman">
                    {loadingProducts ? (
                      <p className="text-center py-8">Loading products...</p>
                    ) : errorProducts ? (
                      <p className="text-center py-8 text-red-500">
                        {errorProducts}
                      </p>
                    ) : (
                      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {products
                          .filter((p) => p.category === "Minuman")
                          .map((product) => (
                            <Card
                              key={product.id}
                              className="hover:shadow-lg transition-shadow border-emerald-200"
                            >
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-semibold">
                                    {product.name}
                                  </h3>
                                  <Badge
                                    variant={
                                      product.stock > 10
                                        ? "secondary"
                                        : "destructive"
                                    }
                                    className="bg-emerald-100 text-emerald-800 border-emerald-200"
                                  >
                                    Stok: {product.stock}
                                  </Badge>
                                </div>
                                <p className="font-bold text-emerald-700 mb-3">
                                  {formatCurrency(product.price)}
                                </p>
                                <Button
                                  onClick={() => addToCart(product)}
                                  className="w-full bg-emerald-700 hover:bg-emerald-800"
                                  disabled={product.stock === 0}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Tambah
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
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

export default CashierDashboard;
