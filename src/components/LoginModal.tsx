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
import { signIn } from "next-auth/react";

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
  const [loginError, setLoginError] = useState("");

  // Hapus semua kode terkait quick login/demo (termasuk Card demo, demoUsers, handleQuickLogin)
  // Redesign tampilan agar hanya ada login manual:
  // - Logo/ikon
  // - Judul
  // - Input role
  // - Input username/email/NIS
  // - Input password
  // - Error message jika ada
  // - Tombol login

  const handleManualLogin = async () => {
    setLoginError("");
    if (selectedRole && loginData.identifier && loginData.password) {
      const res = await signIn("credentials", {
        redirect: false,
        email: loginData.identifier,
        password: loginData.password,
        role: selectedRole,
      });
      if (res?.ok) {
        // reload atau fetch session baru
        window.location.reload();
      } else {
        setLoginError("Login gagal. Email, password, atau role tidak sesuai.");
      }
    }
  };

  const isDev = process.env.NODE_ENV !== "production";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogTitle className="sr-only">Sistem POS Kantin - Login</DialogTitle>
        <div className="flex flex-col items-center justify-center p-8 bg-white">
          <div className="mb-6 flex flex-col items-center">
            <div className="bg-green-700 p-4 rounded-2xl mb-3">
              <BarChart3 className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-1">
              Login ke Sistem POS Kantin
            </h2>
            <p className="text-green-700 text-sm">
              Masukkan kredensial Anda untuk masuk
            </p>
          </div>
          {loginError && (
            <div className="text-red-600 text-center font-semibold mb-2">
              {loginError}
            </div>
          )}
          <div className="space-y-6 w-full">
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
                  <SelectItem value="STUDENT">👨‍🎓 Siswa</SelectItem>
                  <SelectItem value="CASHIER">🛒 Kasir</SelectItem>
                  <SelectItem value="ADMIN">👨‍💼 Admin</SelectItem>
                  <SelectItem value="PARENT">👨‍👩‍👧‍👦 Orang Tua</SelectItem>
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
              disabled={
                !selectedRole || !loginData.identifier || !loginData.password
              }
            >
              🚀 Masuk ke Sistem
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
