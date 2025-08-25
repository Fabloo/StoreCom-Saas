"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Store, Users, LogOut } from "lucide-react";
import Link from "next/link";
import { logout } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <CardHeader className="px-0">
          <CardTitle>Super Admin Dashboard</CardTitle>
          <CardDescription>Platform-wide management of brands, stores, and users.</CardDescription>
        </CardHeader>
        <Button onClick={handleLogout} variant="outline" size="sm">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building className="h-5 w-5" /> Manage Brands</CardTitle>
            <CardDescription>Onboard new brands, view existing ones, and manage brand-level settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/brands">
              <Button variant="outline">View Brands</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" /> Manage Stores</CardTitle>
            <CardDescription>View and manage all store locations across all brands.</CardDescription>
          </CardHeader>
          <CardContent>
             <Link href="/stores">
              <Button variant="outline">View Stores</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Manage Users</CardTitle>
            <CardDescription>Add new users and assign them to the appropriate brand dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
             <Link href="/admin/users">
              <Button variant="outline">View Users</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
