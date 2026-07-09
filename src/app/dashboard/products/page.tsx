'use client';

import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define the precise categories you specified earlier
const CATEGORIES = [
  'Inorganic', 
  'Weed Control Chemicals', 
  'Liquid', 
  'Granular', 
  'Pesticides', 
  'Pollinators', 
  'Others'
];

interface ProductItem {
  _id: string;
  name: string;
  sku: string;
  category: string;
  npkRatio: { nitrogen: number; phosphorus: number; potassium: number };
  minThreshold: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Inorganic',
    nitrogen: 0,
    phosphorus: 0,
    potassium: 0,
    minThreshold: 10,
    supplier: '65f8c3a2b1a4c927f8e4d2a1' // Dummy Object ID for testing until Supplier schema is populated
  });

  // Fetch all products from your Next.js API
  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        console.error('Products API error:', res.status, errJson);
        return;
      }

      const json = await res.json();
      if (!json.success) {
        console.error('Products API responded with error:', json.error);
        return;
      }

      setProducts(json.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void (async () => {
      await fetchProducts();
    })();
  }, []);

  // Handle Form Submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Format payload to match your Mongoose Schema nesting
    const payload = {
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      npkRatio: {
        nitrogen: Number(formData.nitrogen),
        phosphorus: Number(formData.phosphorus),
        potassium: Number(formData.potassium),
      },
      minThreshold: Number(formData.minThreshold),
      supplier: formData.supplier
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setOpen(false); // Close dialog modal
        fetchProducts(); // Refresh layout grid table data
        // Reset form variables
        setFormData({
          name: '', sku: '', category: 'Inorganic',
          nitrogen: 0, phosphorus: 0, potassium: 0, minThreshold: 10,
          supplier: '65f8c3a2b1a4c927f8e4d2a1'
        });
      } else {
        alert(`Error: ${json.error}`);
      }
    } catch (err) {
      console.error("Form transmission failed:", err);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Product Catalog</h2>
          <p className="text-slate-500 text-sm">Define base profiles, NPK attributes, and classifications here.</p>
        </div>

        {/* Form Modal Popup */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button />
            }
          >
            + Add New Product
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Register New Product</DialogTitle>
                <DialogDescription>
                  Create a master entry for a fertilizer or chemical type.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Premium Urea" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sku">SKU Code</Label>
                  <Input id="sku" required value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} placeholder="e.g. UREA-46" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <select 
                    id="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                {/* NPK Parameters Grouped */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="grid gap-1">
                    <Label htmlFor="nitrogen">N (%)</Label>
                    <Input id="nitrogen" type="number" min="0" value={formData.nitrogen} onChange={(e) => setFormData({...formData, nitrogen: Number(e.target.value)})} />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="phosphorus">P (%)</Label>
                    <Input id="phosphorus" type="number" min="0" value={formData.phosphorus} onChange={(e) => setFormData({...formData, phosphorus: Number(e.target.value)})} />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="potassium">K (%)</Label>
                    <Input id="potassium" type="number" min="0" value={formData.potassium} onChange={(e) => setFormData({...formData, potassium: Number(e.target.value)})} />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="threshold">Low Stock Warning Limit</Label>
                  <Input id="threshold" type="number" min="0" value={formData.minThreshold} onChange={(e) => setFormData({...formData, minThreshold: Number(e.target.value)})} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Save Product Blueprint</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="gap-2">
          <div>
            <CardTitle className="text-base font-semibold">Registered Products ({products.length})</CardTitle>
            <CardDescription>Browse fertilizer and chemical profiles with category, NPK breakdown, and replenishment thresholds.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-slate-500 animate-pulse">Loading product inventory matrix...</p>
          ) : products.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg border-slate-200">
              <p className="text-sm text-slate-500">No products configured yet. Click '+ Add New Product' to register your first profile.</p>
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-500 uppercase tracking-wide text-xs">SKU</TableHead>
                      <TableHead className="text-slate-500 uppercase tracking-wide text-xs">Product Name</TableHead>
                      <TableHead className="text-slate-500 uppercase tracking-wide text-xs">Category</TableHead>
                      <TableHead className="text-slate-500 uppercase tracking-wide text-xs">NPK Composition</TableHead>
                      <TableHead className="text-right text-slate-500 uppercase tracking-wide text-xs">Alert Threshold</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell className="font-mono text-xs font-semibold text-slate-700">{product.sku}</TableCell>
                        <TableCell className="font-medium text-slate-900">{product.name}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800">
                            {product.category}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium text-slate-700">{product.npkRatio.nitrogen}-{product.npkRatio.phosphorus}-{product.npkRatio.potassium}</TableCell>
                        <TableCell className="text-right text-slate-600 font-mono">{product.minThreshold} units</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="space-y-3 md:hidden">
                {products.map((product) => (
                  <div key={product._id} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
                    <div className="bg-white px-4 py-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                        <div>
                          <p className="text-xs font-semibold uppercase text-slate-500">SKU</p>
                          <p className="font-mono text-sm font-semibold text-slate-900">{product.sku}</p>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                          {product.category}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">Product</p>
                          <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">NPK Ratio</p>
                          <p className="text-sm font-semibold text-slate-900">{product.npkRatio.nitrogen}-{product.npkRatio.phosphorus}-{product.npkRatio.potassium}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3 sm:col-span-2">
                          <p className="text-xs text-slate-500">Low Stock Alert Level</p>
                          <p className="text-sm font-semibold text-slate-900">{product.minThreshold} units</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}