'use client';

import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      const json = await res.json();
      if (json.success) setProducts(json.data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
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
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              + Add New Product
            </Button>
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
                <div className="grid grid-cols-3 gap-2">
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
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Save Product Blueprint</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Registered Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500 animate-pulse">Loading product inventory matrix...</p>
          ) : products.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg border-slate-200">
              <p className="text-sm text-slate-500">No products configured yet. Click '+ Add New Product' to register your first profile.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>NPK Composition (N-P-K)</TableHead>
                  <TableHead className="text-right">Alert Level Min</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell className="font-mono text-xs font-bold text-slate-600">{product.sku}</TableCell>
                    <TableCell className="font-medium text-slate-900">{product.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                        {product.category}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-slate-700">
                      {product.npkRatio.nitrogen}-{product.npkRatio.phosphorus}-{product.npkRatio.potassium}
                    </TableCell>
                    <TableCell className="text-right text-slate-600 font-mono">{product.minThreshold} units</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}