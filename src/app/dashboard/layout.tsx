"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthControls from '@/components/AuthControls';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard Overview' },
  { href: '/dashboard/products', label: 'Product Catalog' },
  { href: '/dashboard/batches', label: 'Stock Batches' },
  { href: '/dashboard/transactions', label: 'Transactions Log' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (href: string) => pathname === href || (href !== '/dashboard' && pathname?.startsWith(href));
  const navClass = (href: string) => isActive(href)
    ? 'rounded-full px-4 py-2 text-sm font-medium text-white bg-emerald-600 shadow-sm shadow-emerald-500/20'
    : 'rounded-full px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700';
  const drawerClass = (href: string) => isActive(href)
    ? 'block rounded-lg px-4 py-3 text-sm font-medium text-white bg-slate-800 shadow-lg shadow-slate-900/20'
    : 'block rounded-lg px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-slate-700';

  return (
    <div className="relative min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 bg-slate-900 border-b border-slate-200">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
            >
              ☰
            </button>
            <Link href="/" className="text-2xl font-bold tracking-wider text-green-500">
              🌱 Green Agro
            </Link>
          </div>

          <nav className="hidden items-center gap-3 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={navClass(link.href)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <AuthControls />
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-64px)] flex-col overflow-hidden md:flex-row">
        <div
          className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-300 md:hidden ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setDrawerOpen(false)}
        />

        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-slate-900 p-6 text-white transition-transform duration-300 md:hidden ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="mb-6 flex items-center justify-between">
            <span className="text-lg font-semibold text-green-500">🌱 Green Agro</span>
            <button
              type="button"
              className="rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close navigation menu"
            >
              ✕
            </button>
          </div>
          <nav className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={drawerClass(link.href)}
                onClick={() => setDrawerOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 border-t border-slate-700 pt-4 text-xs text-slate-400">
            Inventory System v1.0
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}