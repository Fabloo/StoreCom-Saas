
'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  ClipboardCheck,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Sparkles,
  Store,
  Building,
  ClipboardList,
  Phone,
  Shield,
  Globe,
  ImageIcon,
  Link as LinkIcon,
  Briefcase,
  Megaphone,
  MapPin,
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { ReactNode } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/stores', label: 'Stores', icon: Store },
  { href: '/brand', label: 'Brand', icon: Building },
  { href: '/google-business', label: 'Google Business', icon: MapPin },
  { href: '/reviews', label: 'Reviews', icon: MessageSquare },
  // { href: '/enquiries', label: 'Enquiries', icon: ClipboardList },
  // { href: '/gmb-post', label: 'GMB Post', icon: Megaphone },
  // { href: '/ivr-calls', label: 'IVR Calls', icon: Phone },
  // { href: '/ai-content', label: 'Content AI', icon: Sparkles },
  // { href: '/rank-tracker', label: 'Rank Tracker', icon: Activity },
  // { href: '/audits', label: 'Audits', icon: ClipboardCheck },
];

const bottomNavItems = [
    { href: '/settings', label: 'Admin', icon: Shield },
]

export function SideNav({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        {children}
      </SidebarHeader>
      <SidebarMenu className="flex-1">
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href}>
              <SidebarMenuButton
                isActive={pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/')}
                tooltip={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarFooter>
        <Separator className="my-2" />
         {bottomNavItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href}>
              <SidebarMenuButton
                isActive={pathname.startsWith(item.href)}
                tooltip={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
        <div className="p-2 space-y-2 group-data-[collapsible=icon]:hidden">
            <div className="border rounded-lg p-4 bg-secondary/50">
                <h3 className="font-semibold text-sm">Upgrade to Pro</h3>
                <p className="text-xs text-muted-foreground mt-1">Unlock AI features and advanced analytics.</p>
                <Button size="sm" className="w-full mt-3 bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Upgrade
                </Button>
            </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
