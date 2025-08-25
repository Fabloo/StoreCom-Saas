import type { Metadata } from 'next';
import './globals.css';
import { cn } from "@/lib/utils";
import { SidebarProvider } from '@/components/ui/sidebar';
import { SideNav } from '@/components/layout/sidenav';
import { MainContent } from '@/components/layout/main-content';
import { Toaster } from "@/components/ui/toaster";
import React from 'react';
import { Shell } from '@/components/layout/Shell';

export const metadata: Metadata = {
  title: 'Storecom',
  description: 'The Local SEO Operating System for multi-location brands.',
};

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
    )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn(
        "min-h-screen bg-background font-body antialiased"
      )}>
        <Shell>
          {children}
        </Shell>
        <Toaster />
      </body>
    </html>
  );
}
