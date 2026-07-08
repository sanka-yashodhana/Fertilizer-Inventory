import React from 'react';
import Link from 'next/link';
import AuthControls from '@/components/AuthControls';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col justify-between">
        <div>
          <Link href="/"><h2 className="text-xl font-bold tracking-wider mb-8 text-emerald-400">🌱 FertiTrack</h2></Link>
          <nav className="space-y-2">
            <Link href="/dashboard" className="block px-4 py-2.5 rounded hover:bg-slate-800 transition">Dashboard Overview</Link>
            <Link href="/dashboard/products" className="block px-4 py-2.5 rounded hover:bg-slate-800 transition font-medium text-emerald-300">Product Catalog</Link>
            <Link href="/dashboard/batches" className="block px-4 py-2.5 rounded hover:bg-slate-800 transition">Stock Batches</Link>
            <Link href="/dashboard/transactions" className="block px-4 py-2.5 rounded hover:bg-slate-800 transition">Transactions Log</Link>
          </nav>
        </div>
        <div className="text-xs text-slate-400 border-t border-slate-800 pt-4">
          Inventory System v1.0
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8">
          <h1 className="font-semibold text-slate-800 text-lg">Inventory Management Console</h1>
          <AuthControls />
        </header>
        
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}