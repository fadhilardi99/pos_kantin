import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ShoppingCart, BarChart3, CreditCard } from "lucide-react";

type UserData =
  | { name: string; nis: string; saldo: number; role: "student" }
  | { name: string; id: string; role: "cashier" }
  | { name: string; id: string; role: "admin" }
  | { name: string; id: string; role: "parent" };

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: UserData) => void;
}

const LoginModal = ({ isOpen, onClose, onLogin }: LoginModalProps) => {
  const [selectedRole, setSelectedRole] = useState("");
  const [loginData, setLoginData] = useState({ identifier: "", password: "" });

  // Demo users untuk testing
  const demoUsers: {
    student: { name: string; nis: string; saldo: number; role: "student" };
    cashier: { name: string; id: string; role: "cashier" };
    admin: { name: string; id: string; role: "admin" };
    parent: { name: string; id: string; role: "parent" };
  } = {
    student: {
      name: "Ahmad Rizki",
      nis: "2024001",
      saldo: 50000,
      role: "student",
    },
    cashier: { name: "Siti Kasir", id: "KSR001", role: "cashier" },
    admin: { name: "Pak Admin", id: "ADM001", role: "admin" },
    parent: { name: "Ibu Wati", id: "PRT001", role: "parent" },
  };

  const handleQuickLogin = (role: string) => {
    const userData = demoUsers[role as keyof typeof demoUsers];
    onLogin(userData);
  };

  const handleManualLogin = () => {
    if (selectedRole && loginData.identifier) {
      const userData = {
        ...demoUsers[selectedRole as keyof typeof demoUsers],
        identifier: loginData.identifier,
      };
      onLogin(userData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">Sistem POS Kantin - Login</DialogTitle>
        <div className="flex">
          {/* Left Side - Header & Quick Login */}
          <div className="flex-1 bg-gradient-to-br from-green-700 to-green-600 p-8 text-white">
            <div className="h-full flex flex-col justify-center">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">
                  🏫 Sistem POS Kantin
                </h1>
                <p className="text-green-100 text-lg">
                  Silakan pilih role untuk masuk ke sistem
                </p>
              </div>

              {/* Quick Demo Login */}
              <div>
                <h3 className="text-xl font-semibold mb-6 text-center flex items-center justify-center">
                  <span className="mr-2">⚡</span>
                  Login Cepat (Demo)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card
                    className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-110 border-2 hover:border-green-300 bg-white/10 backdrop-blur-sm"
                    onClick={() => handleQuickLogin("student")}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                        <Users className="h-7 w-7 text-white" />
                      </div>
                      <p className="font-semibold text-white text-lg">Siswa</p>
                      <p className="text-green-100 text-sm">Ahmad Rizki</p>
                      <p className="text-green-200 font-medium text-xs">
                        Saldo: Rp 50.000
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-110 border-2 hover:border-yellow-300 bg-white/10 backdrop-blur-sm"
                    onClick={() => handleQuickLogin("cashier")}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                        <ShoppingCart className="h-7 w-7 text-white" />
                      </div>
                      <p className="font-semibold text-white text-lg">Kasir</p>
                      <p className="text-green-100 text-sm">Siti Kasir</p>
                      <p className="text-green-200 font-medium text-xs">
                        KSR001
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-110 border-2 hover:border-amber-300 bg-white/10 backdrop-blur-sm"
                    onClick={() => handleQuickLogin("admin")}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                        <BarChart3 className="h-7 w-7 text-white" />
                      </div>
                      <p className="font-semibold text-white text-lg">Admin</p>
                      <p className="text-green-100 text-sm">Pak Admin</p>
                      <p className="text-green-200 font-medium text-xs">
                        ADM001
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-110 border-2 hover:border-amber-300 bg-white/10 backdrop-blur-sm"
                    onClick={() => handleQuickLogin("parent")}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                        <CreditCard className="h-7 w-7 text-white" />
                      </div>
                      <p className="font-semibold text-white text-lg">
                        Orang Tua
                      </p>
                      <p className="text-green-100 text-sm">Ibu Wati</p>
                      <p className="text-green-200 font-medium text-xs">
                        PRT001
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Manual Login Form */}
          <div className="flex-1 p-8 bg-amber-50">
            <div className="h-full flex flex-col justify-center">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-green-800 mb-2">
                  🔐 Login Manual
                </h2>
                <p className="text-green-700">
                  Masukkan kredensial Anda untuk masuk ke sistem
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label
                    htmlFor="role"
                    className="text-green-700 font-medium text-sm"
                  >
                    Pilih Role
                  </Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue placeholder="Pilih role Anda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">👨‍🎓 Siswa</SelectItem>
                      <SelectItem value="cashier">🛒 Kasir</SelectItem>
                      <SelectItem value="admin">👨‍💼 Admin</SelectItem>
                      <SelectItem value="parent">👨‍👩‍👧‍👦 Orang Tua</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="identifier"
                    className="text-green-700 font-medium text-sm"
                  >
                    {selectedRole === "student" ? "NIS" : "Email/Username"}
                  </Label>
                  <Input
                    id="identifier"
                    type="text"
                    placeholder={
                      selectedRole === "student"
                        ? "Masukkan NIS"
                        : "Masukkan email atau username"
                    }
                    value={loginData.identifier}
                    onChange={(e) =>
                      setLoginData({ ...loginData, identifier: e.target.value })
                    }
                    className="mt-2 h-12"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="password"
                    className="text-green-700 font-medium text-sm"
                  >
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Masukkan password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    className="mt-2 h-12"
                  />
                </div>

                <Button
                  onClick={handleManualLogin}
                  className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-4 rounded-lg transition-all duration-200 hover:shadow-lg text-lg"
                  disabled={!selectedRole || !loginData.identifier}
                >
                  🚀 Masuk ke Sistem
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
