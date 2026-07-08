'use client';

import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProductOption {
  _id: string;
  name: string;
  sku: string;
}

interface BatchItem {
  _id: string;
  batchNumber: string;
  product: ProductOption;
  quantityReceived: number;
  currentQuantity: number;
  unit: string;
  costPrice: number;
  expiryDate: string;
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    batchNumber: '',
    product: '',
    quantityReceived: 0,
    unit: 'bags',
    costPrice: 0,
    manufactureDate: '',
    expiryDate: '',
    storageLocation: ''
  });

  async function loadData() {
    setLoading(true);
    try {
      const batchRes = await fetch('/api/batches');
      if (!batchRes.ok) {
        const errJson = await batchRes.json().catch(() => null);
        console.error('Batches API error:', batchRes.status, errJson);
      } else {
        const batchJson = await batchRes.json();
        if (batchJson.success) {
          setBatches(batchJson.data);
        } else {
          console.error('Batches API responded with error:', batchJson.error);
        }
      }

      const prodRes = await fetch('/api/products');
      if (!prodRes.ok) {
        const errJson = await prodRes.json().catch(() => null);
        console.error('Products API error:', prodRes.status, errJson);
      } else {
        const prodJson = await prodRes.json();
        if (prodJson.success) {
          setProducts(prodJson.data);
          if (prodJson.data.length > 0) {
            setFormData(prev => ({ ...prev, product: prodJson.data[0]._id }));
          }
        } else {
          console.error('Products API responded with error:', prodJson.error);
        }
      }
    } catch (err) {
      console.error('Data load failed:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        setOpen(false);
        loadData();
        setFormData({
          batchNumber: '', product: products[0]?._id || '', quantityReceived: 0,
          unit: 'bags', costPrice: 0, manufactureDate: '', expiryDate: '', storageLocation: ''
        });
      } else {
        alert(`Error: ${json.error}`);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Stock Batches</h2>
          <p className="text-slate-500 text-sm">Track physical incoming deliveries, costs, and expirations.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" />
            }
          >
            📥 Stock In New Batch
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Stock In Shipment</DialogTitle>
                <DialogDescription>Log an incoming delivery linked to a product identity.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="product">Select Product Identity</Label>
                  <select 
                    id="product"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.product}
                    onChange={(e) => setFormData({...formData, product: e.target.value})}
                  >
                    {products.map(p => (
                      <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="batchNumber">Batch / Lot Number</Label>
                  <Input id="batchNumber" required value={formData.batchNumber} onChange={(e) => setFormData({...formData, batchNumber: e.target.value})} placeholder="e.g. BAT-2026-001" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="grid gap-1">
                    <Label htmlFor="qty">Qty Received</Label>
                    <Input id="qty" type="number" min="1" value={formData.quantityReceived} onChange={(e) => setFormData({...formData, quantityReceived: Number(e.target.value)})} />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="unit">Unit</Label>
                    <select id="unit" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})}>
                      <option value="bags">Bags</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="liters">Liters</option>
                    </select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cost">Cost Price per Unit</Label>
                  <Input id="cost" type="number" min="0" value={formData.costPrice} onChange={(e) => setFormData({...formData, costPrice: Number(e.target.value)})} placeholder="LKR / Unit" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="grid gap-1">
                    <Label htmlFor="mfg">Mfg. Date</Label>
                    <Input id="mfg" type="date" value={formData.manufactureDate} onChange={(e) => setFormData({...formData, manufactureDate: e.target.value})} />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="exp">Exp. Date</Label>
                    <Input id="exp" type="date" value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Commit Stock In</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Active Warehoused Batches ({batches.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500 animate-pulse">Loading active warehouse batches...</p>
          ) : batches.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <p className="text-sm text-slate-500">No physical batches registered yet.</p>
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch No</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Available Stock</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Expiration Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batches.map((b) => {
                      const isExpired = new Date() > new Date(b.expiryDate);
                      return (
                        <TableRow key={b._id}>
                          <TableCell className="font-mono text-xs font-bold text-slate-600">{b.batchNumber}</TableCell>
                          <TableCell className="font-medium text-slate-900">{b.product?.name || 'Unknown Product'}</TableCell>
                          <TableCell className="font-semibold text-slate-700">
                            {b.currentQuantity} / {b.quantityReceived} {b.unit}
                          </TableCell>
                          <TableCell>${b.costPrice}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isExpired ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              {isExpired ? 'Expired' : `Expires ${new Date(b.expiryDate).toLocaleDateString()}`}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="space-y-3 md:hidden">
                {batches.map((b) => {
                  const isExpired = new Date() > new Date(b.expiryDate);
                  return (
                    <div key={b._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase text-slate-500">Batch</p>
                          <p className="font-mono text-sm font-semibold text-slate-900">{b.batchNumber}</p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${isExpired ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {isExpired ? 'Expired' : `Expires ${new Date(b.expiryDate).toLocaleDateString()}`}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2">
                        <p className="text-sm font-semibold text-slate-900">{b.product?.name || 'Unknown Product'}</p>
                        <p className="text-sm text-slate-600">Stock: {b.currentQuantity}/{b.quantityReceived} {b.unit}</p>
                        <p className="text-sm text-slate-600">Cost: ${b.costPrice}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}