'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SideNav } from '@/components/layout/sidenav';
import { MainContent } from '@/components/layout/main-content';

function BrandLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-primary rounded-lg p-2 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 text-primary-foreground"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <h1 className="text-xl font-semibold font-headline">Storecom</h1>
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/';
  const segments = pathname.split('/').filter(Boolean);

  // Detect microsite route: exactly two top-level segments like /brand-slug/store-slug
  // Exclude known top-level app routes (admin/dashboard pages, auth, api, etc.)
  const excludedRoots = new Set([
    'admin',
    'brand',
    'brands',
    'stores',
    'store',
    'dashboard',
    'reviews',
    'settings',
    'gmb-post',
    'google-business',
    'rank-tracker',
    'enquiries',
    'audits',
    'login',
    'microsite-templates',
    'ai-content',
    'api',
  ]);

  const isMicrosite = segments.length === 2 && !excludedRoots.has(segments[0]);

  if (isMicrosite) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <SideNav>
        <BrandLogo />
      </SideNav>
      <MainContent>{children}</MainContent>
    </SidebarProvider>
  );
}



