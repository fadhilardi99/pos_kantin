import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gray-800">
            Masuk ke Sistem POS
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Demo Login */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-center">
              Demo Login Cepat
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleQuickLogin("student")}
              >
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="font-medium text-blue-600">Siswa</p>
                  <p className="text-xs text-gray-500">Ahmad Rizki</p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleQuickLogin("cashier")}
              >
                <CardContent className="p-4 text-center">
                  <ShoppingCart className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="font-medium text-green-600">Kasir</p>
                  <p className="text-xs text-gray-500">Siti Kasir</p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleQuickLogin("admin")}
              >
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <p className="font-medium text-orange-600">Admin</p>
                  <p className="text-xs text-gray-500">Pak Admin</p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleQuickLogin("parent")}
              >
                <CardContent className="p-4 text-center">
                  <CreditCard className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="font-medium text-purple-600">Orang Tua</p>
                  <p className="text-xs text-gray-500">Ibu Wati</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Manual Login Form */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Login Manual
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="role">Pilih Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role Anda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Siswa</SelectItem>
                    <SelectItem value="cashier">Kasir</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="parent">Orang Tua</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="identifier">
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
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                />
              </div>

              <Button
                onClick={handleManualLogin}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!selectedRole || !loginData.identifier}
              >
                Masuk
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
