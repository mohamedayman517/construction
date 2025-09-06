import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import type { RouteContext } from '../../components/Router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Package, Search, Filter, Plus, Edit, Trash2, Store, Tag, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/services/products';

interface ProductRow {
  id: number;
  name: string;
  sku: string;
  vendor: string;
  price: number;
  stock: number;
  notes?: string;
  createdAt: string;
}

export default function AdminProducts({ setCurrentPage, ...context }: Partial<RouteContext>) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [search, setSearch] = useState('');
  // status filter disabled (no backend field). Keep UI minimal
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<ProductRow>>({ name: '', sku: '', vendor: '', price: 0, stock: 0, notes: '' });

  useEffect(() => { reload(); }, []);
  const reload = async () => {
    try {
      const { ok, data } = await getProducts({ page: 1, pageSize: 200 });
      if (ok && data && Array.isArray((data as any).items)) {
        const backendRows: ProductRow[] = (data as any).items.map((p: any, idx: number) => ({
          id: Number(p.id) || Date.now() + idx,
          name: p.name || p.title || '',
          sku: p.partNumber || '',
          vendor: p.brand || '',
          price: Number(p.price || 0),
          stock: Number((p as any).stock ?? 0),
          createdAt: (p as any).createdAt || new Date().toISOString().slice(0,10),
        }));
        setRows(backendRows);
      } else {
        setRows([]);
      }
    } catch {
      setRows([]);
    }
  };

  const filtered = rows.filter(r => {
    const s = search.trim().toLowerCase();
    const matches = !s || r.name.toLowerCase().includes(s) || r.sku.toLowerCase().includes(s) || r.vendor.toLowerCase().includes(s);
    return matches;
  });

  const openCreate = () => { setEditId(null); setForm({ name: '', sku: '', vendor: '', price: 0, stock: 0, notes: '' }); setFormOpen(true); };
  const openEdit = (r: ProductRow) => { setEditId(r.id); setForm({ ...r }); setFormOpen(true); };

  const submit = async () => {
    if (!form.name || !form.sku) return;
    const payload = {
      name: String(form.name),
      description: form.notes || '',
      price: Number(form.price || 0),
      stock: Number(form.stock || 0),
      brand: form.vendor || '',
      partNumber: form.sku || '',
      imageUrl: undefined,
      categoryId: undefined,
    } as any;
    if (editId) {
      await updateProduct(editId, payload);
    } else {
      await createProduct(payload);
    }
    setFormOpen(false); setEditId(null); await reload();
  };

  const removeRow = async (r: ProductRow) => { await deleteProduct(r.id); await reload(); };

  return (
    <div className="min-h-screen bg-background">
      <Header {...context} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button variant="outline" onClick={() => setCurrentPage && setCurrentPage('admin-dashboard')} className="mr-4">
              <ArrowRight className="ml-2 h-4 w-4" />
              {t('backToDashboard')}
            </Button>
          </div>
          <h1 className="mb-2">{t('manageProducts')}</h1>
          <p className="text-muted-foreground">{t('adminProductsSubtitle')}</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center"><Filter className="mr-2 h-5 w-5" />{t('searchAndFilterProducts')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t('searchByNameSkuOrStore')} value={search} onChange={e=>setSearch(e.target.value)} className="pr-10" />
              </div>
              <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />{t('addProduct')}</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Package className="mr-2 h-5 w-5" />{t('products')} ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filtered.map(r => (
                <div key={r.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4 space-x-reverse w-full min-w-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center"><Tag className="h-6 w-6 text-primary" /></div>
                    <div className="space-y-1 min-w-0 w-full">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium break-words max-w-full leading-snug">{r.name}</h3>
                        <Badge variant={r.stock>0? 'default': 'secondary'}>
                          {r.stock>0 ? (t('inStock')||'In Stock') : (t('outOfStock')||'Out of Stock')}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center break-words"><Tag className="mr-1 h-3 w-3" />{r.sku}</div>
                        <div className="flex items-center break-words"><Store className="mr-1 h-3 w-3" />{r.vendor}</div>
                        <span className="break-words">{t('price')}: {r.price} SAR</span>
                        <span className="break-words">{t('stock')}: {r.stock}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" variant="outline" onClick={()=>openEdit(r)}><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" onClick={()=>removeRow(r)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
            {filtered.length===0 && (
              <div className="text-center py-8 text-muted-foreground">{t('noResults')}</div>
            )}
          </CardContent>
        </Card>

        <Dialog open={formOpen} onOpenChange={(o: boolean)=>{ setFormOpen(o); if(!o) setEditId(null); }}>
          <DialogContent className="max-w-lg bg-white/95 backdrop-blur-sm border border-white/20">
            <DialogHeader><DialogTitle>{editId? t('editProduct') : t('addProduct')}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{t('productName')}</Label>
                <Input value={form.name||''} onChange={e=>setForm(f=>({...f, name:e.target.value}))} />
              </div>
              <div>
                <Label>{t('partNumber')}</Label>
                <Input value={form.sku||''} onChange={e=>setForm(f=>({...f, sku:e.target.value}))} />
              </div>
              <div>
                <Label>{t('vendor')}</Label>
                <Input value={form.vendor||''} onChange={e=>setForm(f=>({...f, vendor:e.target.value}))} />
              </div>
              <div>
                <Label>{t('currentPrice')}</Label>
                <Input type="number" value={String(form.price||0)} onChange={e=>setForm(f=>({...f, price: Number(e.target.value||0)}))} />
              </div>
              <div>
                <Label>{t('statusLabel')}</Label>
                <Select value={undefined as any} onValueChange={()=>{}}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="na">{t('statusLabel')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('availableQuantity')}</Label>
                <Input type="number" value={String(form.stock||0)} onChange={e=>setForm(f=>({...f, stock: Number(e.target.value||0)}))} />
              </div>
              <div className="md:col-span-2">
                <Label>{t('notesLabel')}</Label>
                <Textarea value={form.notes||''} onChange={e=>setForm(f=>({...f, notes:e.target.value}))} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={()=>setFormOpen(false)}>{t('cancel')}</Button>
              <Button onClick={submit}>{editId? t('saveChanges') : t('addProduct')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
