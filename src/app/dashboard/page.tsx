'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DashboardData {
  metrics: {
    totalProducts: number;
    activeBatchCount: number;
    totalStockVolume: number;
    lowStockCount: number;
    expiringCount: number;
  };
  alerts: {
    lowStock: Array<{ _id: string; name: string; sku: string; currentVolume: number; threshold: number }>;
    expiringSoon: Array<{ _id: string; batchNumber: string; productName: string; expiryDate: string; daysLeft: number }>;
  };
}

export default function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch('/api/summary');
        const json = await res.json();
        if (json.success) setData(json.data || json); // Handle payload formatting adjustments safely
      } catch (err) {
        console.error("Failed to compile dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  if (loading) return <p className="text-sm text-slate-500 animate-pulse">Assembling system status matrix data...</p>;
  if (!data) return <p className="text-sm text-red-500">Error loading summary matrix metrics.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center mb-2">Current Stock Status</h2>
        <p className="text-slate-500 text-sm text-center">Track your stock levels and get live warnings for low or expiring items.</p>
      </div>

      {/* 🚀 Metrics Grid Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold uppercase text-slate-500 text-center">Master Product Catalog</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold tracking-tight text-slate-900 text-center">{data.metrics.totalProducts} Profiles</p></CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold uppercase text-slate-500 text-center">Warehouse Batches</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold tracking-tight text-slate-900 text-center">{data.metrics.activeBatchCount} Lots</p></CardContent>
        </Card>
        <Card className={`border-l-4 ${data.metrics.lowStockCount > 0 ? 'border-l-amber-500 animate-pulse' : 'border-l-slate-300'}`}>
          <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold uppercase text-slate-500 text-center">Low Stock Flags</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold tracking-tight text-slate-900 text-center">{data.metrics.lowStockCount} Products</p></CardContent>
        </Card>
        <Card className={`border-l-4 ${data.metrics.expiringCount > 0 ? 'border-l-rose-500' : 'border-l-slate-300'}`}>
          <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold uppercase text-slate-500 text-center">Expiry Risk Alerts</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold tracking-tight text-slate-900 text-center">{data.metrics.expiringCount} Batches</p></CardContent>
        </Card>
      </div>

      {/* ⚠️ Alerts Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
        {/* Low Stock Watchlist */}
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold text-amber-800 flex items-center gap-2 ">⚠️ Critical Stock Watchlist</CardTitle></CardHeader>
          <CardContent>
            {data.alerts.lowStock.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">All products are healthy and sit well above minimum safe volume levels.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Current Inventory</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.alerts.lowStock.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-mono text-xs font-bold text-slate-600">{item.sku}</TableCell>
                      <TableCell className="font-medium text-slate-900">{item.name}</TableCell>
                      <TableCell className="text-right text-amber-600 font-bold">{item.currentVolume} / <span className="text-slate-400 text-xs font-normal">Min {item.threshold}</span></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Expiry Timeline Warnings */}
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold text-rose-800 flex items-center gap-2">⏳ Expiration Watchlist (&lt; 30 Days)</CardTitle></CardHeader>
          <CardContent>
            {data.alerts.expiringSoon.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">No active warehouse shipments are approaching expiration limits currently.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lot Code</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.alerts.expiringSoon.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-mono text-xs font-bold text-slate-600">{item.batchNumber}</TableCell>
                      <TableCell className="font-medium text-slate-900">{item.productName}</TableCell>
                      <TableCell className="text-right">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${item.daysLeft <= 0 ? 'bg-red-100 text-red-800' : 'bg-rose-100 text-rose-800'}`}>
                          {item.daysLeft <= 0 ? 'EXPIRED' : `${item.daysLeft} days remaining`}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}