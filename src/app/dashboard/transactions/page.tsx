'use client';

import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProductOption { _id: string; name: string; sku: string; }
interface LogItem {
  _id: string;
  type: string;
  product: ProductOption;
  batch?: { batchNumber: string };
  quantity: number;
  reason?: string;
  createdAt: string;
}

export default function TransactionsPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<LogItem | null>(null);
  const [editReason, setEditReason] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    reason: '',
    performedBy: 'Admin Console'
  });

  async function loadData() {
    setLoading(true);
    try {
      const logRes = await fetch('/api/transactions');
      if (!logRes.ok) {
        const errJson = await logRes.json().catch(() => null);
        console.error('Transactions API error:', logRes.status, errJson);
      } else {
        const logJson = await logRes.json();
        if (logJson.success) {
          setLogs(logJson.data);
        } else {
          console.error('Transactions API responded with error:', logJson.error);
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
            setFormData(prev => ({ ...prev, productId: prodJson.data[0]._id }));
          }
        } else {
          console.error('Products API responded with error:', prodJson.error);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openEditDialog(log: LogItem) {
    setEditingTransaction(log);
    setEditReason(log.reason || '');
    setEditOpen(true);
  }

  function closeEditDialog() {
    setEditingTransaction(null);
    setEditReason('');
    setEditOpen(false);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTransaction) return;

    try {
      const res = await fetch(`/api/transactions/${editingTransaction._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: editReason }),
      });
      const json = await res.json();
      if (json.success) {
        closeEditDialog();
        await loadData();
      } else {
        alert(`Error updating transaction: ${json.error}`);
      }
    } catch (err) {
      console.error('Failed to update transaction:', err);
    }
  }

  async function handleDeleteTransaction(transactionId: string) {
    const confirmed = window.confirm('Delete this transaction record? This will remove the audit line from history.');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/transactions/${transactionId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        await loadData();
      } else {
        alert(`Error deleting transaction: ${json.error}`);
      }
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  }

  useEffect(() => {
    void (async () => {
      await loadData();
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        setOpen(false);
        loadData();
        setFormData(prev => ({ ...prev, quantity: 1, reason: '' }));
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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Transactions Log</h2>
          <p className="text-slate-500 text-sm">Review full inventory logs or execute an operational deduction entry.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={
            <Button>
              📤 Record Stock Out (Dispatch)
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Stock Dispatch Request</DialogTitle>
                <DialogDescription>Deduct inventory amounts. System pulls from matching oldest batches automatically.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="product">Target Product</Label>
                  <select id="product" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.productId} onChange={(e) => setFormData({...formData, productId: e.target.value})}>
                    {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="qty">Quantity to Remove</Label>
                  <Input id="qty" type="number" min="1" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reason">Reason / Purpose</Label>
                  <Input id="reason" required value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} placeholder="e.g. Dispatched to Field Section B" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Approve and Deduct</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={editOpen} onOpenChange={(isOpen) => { if (!isOpen) closeEditDialog(); else setEditOpen(isOpen); }}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleEditSubmit}>
              <DialogHeader>
                <DialogTitle>Edit Transaction Note</DialogTitle>
                <DialogDescription>Adjust the reason text stored in the transaction audit line.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="reason-edit">Reason / Notes</Label>
                  <Input id="reason-edit" required value={editReason} onChange={(e) => setEditReason(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeEditDialog}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Historical System Audit Log</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500 animate-pulse">Parsing ledger history logs...</p>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <p className="text-sm text-slate-500">No transaction operations saved to historical ledger yet.</p>
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Operation</TableHead>
                      <TableHead>Product Identity</TableHead>
                      <TableHead>Source Lot</TableHead>
                      <TableHead className="text-right">Volume Shift</TableHead>
                      <TableHead>Allocation Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log._id}>
                        <TableCell className="text-slate-500 text-xs">{new Date(log.createdAt).toLocaleString()}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-50 text-red-700">
                            {log.type}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">{log.product?.name || 'Unknown'}</TableCell>
                        <TableCell className="font-mono text-xs font-bold text-slate-500">{log.batch?.batchNumber || 'Global Adj.'}</TableCell>
                        <TableCell className="text-right font-semibold text-red-600">-{log.quantity}</TableCell>
                        <TableCell className="text-slate-600 text-sm truncate max-w-[200px] sm:max-w-[200px]">{log.reason}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="xs" onClick={() => openEditDialog(log)}>Edit</Button>
                          <Button variant="destructive" size="xs" onClick={() => handleDeleteTransaction(log._id)}>Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="space-y-3 md:hidden">
                {logs.map((log) => (
                  <div key={log._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</p>
                      <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                        {log.type}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2">
                      <p className="text-sm font-semibold text-slate-900">{log.product?.name || 'Unknown'}</p>
                      <p className="text-sm text-slate-600">Lot: {log.batch?.batchNumber || 'Global Adj.'}</p>
                      <p className="text-sm text-slate-600">Volume Shift: <span className="font-semibold text-red-600">-{log.quantity}</span></p>
                      <p className="text-sm text-slate-600 truncate">{log.reason}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button variant="outline" size="xs" onClick={() => openEditDialog(log)}>Edit</Button>
                        <Button variant="destructive" size="xs" onClick={() => handleDeleteTransaction(log._id)}>Delete</Button>
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