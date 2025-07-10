"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const renderDashboardContent = () => {
    switch (session.user?.role) {
      case "ADMIN":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>Kelola sistem kantin sekolah</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Selamat datang, {session.user.name}!</p>
              <p>Role: Administrator</p>
              <div className="mt-4 space-y-2">
                <Button className="w-full">Kelola Produk</Button>
                <Button className="w-full">Kelola User</Button>
                <Button className="w-full">Laporan Transaksi</Button>
              </div>
            </CardContent>
          </Card>
        );
      case "CASHIER":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Cashier Dashboard</CardTitle>
              <CardDescription>Transaksi dan kasir</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Selamat datang, {session.user.name}!</p>
              <p>Role: Cashier</p>
              <div className="mt-4 space-y-2">
                <Button className="w-full">Transaksi Baru</Button>
                <Button className="w-full">Riwayat Transaksi</Button>
                <Button className="w-full">Kelola Stok</Button>
              </div>
            </CardContent>
          </Card>
        );
      case "STUDENT":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Student Dashboard</CardTitle>
              <CardDescription>Dashboard siswa</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Selamat datang, {session.user.name}!</p>
              <p>Role: Student</p>
              <div className="mt-4 space-y-2">
                <Button className="w-full">Lihat Menu</Button>
                <Button className="w-full">Riwayat Pembelian</Button>
                <Button className="w-full">Top Up Saldo</Button>
              </div>
            </CardContent>
          </Card>
        );
      case "PARENT":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Parent Dashboard</CardTitle>
              <CardDescription>Dashboard orang tua</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Selamat datang, {session.user.name}!</p>
              <p>Role: Parent</p>
              <div className="mt-4 space-y-2">
                <Button className="w-full">Monitor Anak</Button>
                <Button className="w-full">Top Up Saldo</Button>
                <Button className="w-full">Riwayat Transaksi</Button>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
              <CardDescription>Selamat datang di sistem kantin</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Selamat datang, {session.user.name}!</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dashboard Kantin</h1>
          <Button onClick={() => signOut()} variant="outline">
            Logout
          </Button>
        </div>
        {renderDashboardContent()}
      </div>
    </div>
  );
}
