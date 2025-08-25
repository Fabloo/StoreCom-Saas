
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
    return (
        <div className="grid gap-6">
          <CardHeader className="px-0">
            <CardTitle>Admin Settings</CardTitle>
            <CardDescription>Manage your account and platform-wide settings.</CardDescription>
          </CardHeader>
          <div className="grid gap-6 md:grid-cols-2">
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
    )
}
