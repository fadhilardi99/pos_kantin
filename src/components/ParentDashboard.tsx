import { useState } from "react";
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

interface User {
  name: string;
  // Add other properties if needed
}

interface ParentDashboardProps {
  user: User;
  onLogout: () => void;
}

const ParentDashboard = ({ user, onLogout }: ParentDashboardProps) => {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [topUpAmount, setTopUpAmount] = useState("");

  // Demo data untuk anak-anak yang terdaftar
  const [children] = useState([
    {
      id: 1,
      name: "Ahmad Rizki",
      nis: "2024001",
      class: "XII IPA 1",
      saldo: 50000,
    },
    {
      id: 2,
      name: "Siti Rizka",
      nis: "2024002",
      class: "X IPS 2",
      saldo: 35000,
    },
  ]);

  // Demo data histori top up
  const [topUpHistory] = useState([
    {
      id: 1,
      date: "2024-01-15",
      student: "Ahmad Rizki",
      amount: 50000,
      method: "Transfer Bank",
      status: "success",
    },
    {
      id: 2,
      date: "2024-01-12",
      student: "Siti Rizka",
      amount: 25000,
      method: "Cash",
      status: "success",
    },
    {
      id: 3,
      date: "2024-01-10",
      student: "Ahmad Rizki",
      amount: 30000,
      method: "Transfer Bank",
      status: "success",
    },
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleTopUp = () => {
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

    // Simulate top up process
    toast({
      title: "Top Up Berhasil",
      description: `Berhasil top up ${formatCurrency(
        amount
      )} ke akun ${selectedStudent}`,
    });

    setSelectedStudent("");
    setTopUpAmount("");
  };

  const quickTopUpAmounts = [10000, 25000, 50000, 100000];

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
                      {formatCurrency(105000)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Jumlah Top Up:</span>
                    <span className="font-bold">3 kali</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rata-rata:</span>
                    <span className="font-bold">{formatCurrency(35000)}</span>
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
                  <Select defaultValue="transfer">
                    <SelectTrigger className="border-emerald-300 focus:border-emerald-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transfer">Transfer Bank</SelectItem>
                      <SelectItem value="cash">Tunai ke Sekolah</SelectItem>
                      <SelectItem value="ewallet">E-Wallet</SelectItem>
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
                  <span>Riwayat Top Up</span>
                </CardTitle>
                <CardDescription>
                  Histori semua transaksi top up yang telah dilakukan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topUpHistory.map((history) => (
                    <div
                      key={history.id}
                      className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {history.student}
                            </p>
                            <p className="text-sm text-gray-600">
                              Metode: {history.method}
                            </p>
                            <p className="text-xs text-gray-500">
                              {history.date}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-700">
                          +{formatCurrency(history.amount)}
                        </p>
                        <Badge
                          variant={
                            history.status === "success"
                              ? "default"
                              : "destructive"
                          }
                          className="bg-emerald-100 text-emerald-800 border-emerald-200"
                        >
                          {history.status === "success" ? "Berhasil" : "Gagal"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

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
      </div>
    </div>
  );
};

export default ParentDashboard;
