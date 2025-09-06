import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import type { RouteContext } from '../../components/Router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Store, Search, Filter, Plus, Edit, Trash2, MapPin, Mail, Phone, ArrowRight, CheckCircle, Ban } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { getUsers, setUserStatus, MockUser } from '../../lib/authMock';
import { listVendors, listPendingVendorUsers, approveVendor as apiApproveVendor, suspendVendor as apiSuspendVendor } from '@/services/vendors';
import { sendEmail } from '../../lib/emailMock';
import { success as successAlert, warning as warningAlert } from '../../utils/alerts';

// Simple local mock store for vendors (localStorage-backed)
interface VendorRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  status: 'active' | 'pending' | 'suspended';
  productsCount: number;
  notes?: string;
  joinDate: string;
}

const STORAGE_KEY = 'admin_vendors_mock';

function readVendors(): VendorRow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const seed: VendorRow[] = [
    { id: 1, name: 'متجر الجودة', email: 'quality@shop.com', phone: '0551234567', location: 'الرياض', status: 'active', productsCount: 123, joinDate: '2024-01-10' },
    { id: 2, name: 'قطع غيار بلس', email: 'plus@parts.com', phone: '0557654321', location: 'جدة', status: 'pending', productsCount: 35, joinDate: '2024-01-12' },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

function writeVendors(rows: VendorRow[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rows)); } catch {}
}

export default function AdminVendors({ setCurrentPage, ...context }: Partial<RouteContext>) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<VendorRow[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | VendorRow['status']>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<VendorRow>>({ name: '', email: '', phone: '', location: '', status: 'pending', productsCount: 0, notes: '' });
  const [pendingVendors, setPendingVendors] = useState<MockUser[]>([]);

  useEffect(() => { setRows(readVendors()); loadPendingVendors(); tryFetchVendorsFromBackend(); }, []);
  const reload = () => setRows(readVendors());
  const tryFetchVendorsFromBackend = async () => {
    try {
      const res = await listVendors();
      if (res.ok && Array.isArray(res.data)) {
        // Map backend vendors to local VendorRow shape and merge with local
        const remote = (res.data || []).map((v:any, idx:number) => ({
          id: Number(v.id) || Date.now()+idx,
          name: v.name || '',
          email: v.email || '',
          phone: v.phone || '',
          location: v.location || '',
          status: (String(v.status||'active').toLowerCase() as any) || 'active',
          productsCount: Number(v.productsCount||0),
          notes: '',
          joinDate: v.joinDate || new Date().toISOString().slice(0,10),
        } as VendorRow));
        const local = readVendors();
        const merged = [
          ...local,
          ...remote.filter(r => !local.some(l => l.id === r.id))
        ];
        setRows(merged);
      }
    } catch {}
  };
  const loadPendingVendors = () => {
    // try backend pending users first
    (async () => {
      try {
        const res = await listPendingVendorUsers();
        if (res.ok && Array.isArray(res.data)) {
          setPendingVendors(res.data as any);
          return;
        }
      } catch {}
      const list = getUsers().filter(u => u.role === 'vendor' && (u.status || 'active') === 'pending');
      setPendingVendors(list);
    })();
  };

  const filtered = rows.filter(r => {
    const s = search.trim().toLowerCase();
    const matches = !s || r.name.toLowerCase().includes(s) || r.email.toLowerCase().includes(s);
    const statusOk = status === 'all' || r.status === status;
    return matches && statusOk;
  });

  const openCreate = () => { setEditId(null); setForm({ name: '', email: '', phone: '', location: '', status: 'pending', productsCount: 0, notes: '' }); setFormOpen(true); };
  const openEdit = (r: VendorRow) => { setEditId(r.id); setForm({ ...r }); setFormOpen(true); };

  const submit = () => {
    if (!form.name || !form.email) return;
    const data = readVendors();
    if (editId) {
      const idx = data.findIndex(x => x.id === editId);
      if (idx !== -1) {
        data[idx] = { ...(data[idx]), ...form, id: editId } as VendorRow;
      }
    } else {
      const id = Date.now();
      data.push({
        id,
        name: String(form.name),
        email: String(form.email),
        phone: String(form.phone || ''),
        location: String(form.location || ''),
        status: (form.status as VendorRow['status']) || 'pending',
        productsCount: Number(form.productsCount || 0),
        notes: String(form.notes || ''),
        joinDate: new Date().toISOString().slice(0,10),
      });
    }
    writeVendors(data);
    setFormOpen(false); setEditId(null); reload();
  };

  const setRowStatus = (r: VendorRow, s: VendorRow['status']) => { const d = readVendors(); const i = d.findIndex(x=>x.id===r.id); if (i!==-1){ d[i].status=s; writeVendors(d); reload(); } };
  const removeRow = (r: VendorRow) => { const d = readVendors().filter(x=>x.id!==r.id); writeVendors(d); reload(); };
  const approveVendor = async (u: MockUser) => {
    // try backend first, fallback to local
    let ok = false;
    try { const r = await apiApproveVendor(u.id); ok = r.ok; } catch {}
    if (!ok) setUserStatus(u.id, 'active');
    // Compose login link and email
    const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '';
    const loginUrl = origin ? `${origin}/#login` : '#login';
    const subject = (t('vendorApprovedSubject') as any) || 'تمت الموافقة على حسابك';
    const bodyAr = `مرحباً ${u.name},\n\nتمت الموافقة على حسابك كبائع. يمكنك الآن تسجيل الدخول.\nاضغط هنا لتسجيل الدخول: ${loginUrl}\n\nمع تحياتنا.`;
    const bodyEn = `Hello ${u.name},\n\nYour vendor account has been approved. You can now log in.\nClick here to login: ${loginUrl}\n\nBest regards.`;
    const body = `${bodyAr}\n\n---\n${bodyEn}`;
    sendEmail(u.email, subject, body);
    await successAlert(t('activatedSuccessfully') || 'تم التفعيل بنجاح', true);
    loadPendingVendors();
  };
  const rejectVendor = async (u: MockUser) => {
    let ok = false;
    try { const r = await apiSuspendVendor(u.id); ok = r.ok; } catch {}
    if (!ok) setUserStatus(u.id, 'suspended');
    await warningAlert(t('suspendedSuccessfully') || 'تم التعليق', true);
    loadPendingVendors();
  };

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
          <h1 className="mb-2">{t('manageVendorsTitle')}</h1>
          <p className="text-muted-foreground">{t('manageVendorsSubtitle')}</p>
        </div>

        {/* Pending vendor approvals from auth store */}
        {pendingVendors.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center"><Store className="mr-2 h-5 w-5" />{t('pendingVendors') || 'طلبات بائعين قيد المراجعة'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingVendors.map(u => (
                  <div key={u.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg">
                    <div className="space-y-0.5 w-full min-w-0">
                      <div className="font-medium break-words max-w-full leading-snug">{u.name}</div>
                      <div className="text-sm text-muted-foreground break-words">{u.email}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={()=>approveVendor(u)}><CheckCircle className="h-4 w-4 mr-1" />{t('approve') || 'موافقة'}</Button>
                      <Button size="sm" variant="outline" onClick={()=>rejectVendor(u)}><Ban className="h-4 w-4 mr-1" />{t('reject') || 'رفض'}</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center"><Filter className="mr-2 h-5 w-5" />{t('searchAndFilter')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t('searchByNameOrEmail')} value={search} onChange={e=>setSearch(e.target.value)} className="pr-10" />
              </div>
              <Select value={status} onValueChange={(v:any)=>setStatus(v)}>
                <SelectTrigger><SelectValue placeholder={t('statusLabel')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allStatuses')}</SelectItem>
                  <SelectItem value="active">{t('activeStatus')}</SelectItem>
                  <SelectItem value="pending">{t('pendingStatus')}</SelectItem>
                  <SelectItem value="suspended">{t('suspendedStatus')}</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />{t('addVendor')}</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Store className="mr-2 h-5 w-5" />{t('vendors')} ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filtered.map(r => (
                <div key={r.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4 space-x-reverse w-full min-w-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center"><Store className="h-6 w-6 text-primary" /></div>
                    <div className="space-y-1 w-full min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium break-words max-w-full leading-snug">{r.name}</h3>
                        <Badge variant={r.status==='active'?'default': r.status==='pending'? 'secondary':'destructive'}>
                          {r.status==='active'? t('activeStatus') : r.status==='pending' ? t('pendingStatus') : t('suspendedStatus')}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center break-words"><Phone className="mr-1 h-3 w-3" />{r.phone}</div>
                        <div className="flex items-center break-words"><MapPin className="mr-1 h-3 w-3" />{r.location}</div>
                        <span className="break-words">{t('productsCountLabel')}: {r.productsCount}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {r.status==='active' ? (
                      <Button size="sm" variant="outline" onClick={()=>setRowStatus(r,'suspended')}><Ban className="h-4 w-4" /></Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={()=>setRowStatus(r,'active')}><CheckCircle className="h-4 w-4" /></Button>
                    )}
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

        <Dialog open={formOpen} onOpenChange={(o)=>{ setFormOpen(o); if(!o) setEditId(null); }}>
          <DialogContent className="max-w-lg bg-white/95 backdrop-blur-sm border border-white/20">
            <DialogHeader><DialogTitle>{editId? t('editVendor') : t('addVendor')}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{t('storeName')}</Label>
                <Input value={form.name||''} onChange={e=>setForm(f=>({...f, name:e.target.value}))} />
              </div>
              <div>
                <Label>{t('email')}</Label>
                <Input type="email" value={form.email||''} onChange={e=>setForm(f=>({...f, email:e.target.value}))} />
              </div>
              <div>
                <Label>{t('phoneNumber')}</Label>
                <Input value={form.phone||''} onChange={e=>setForm(f=>({...f, phone:e.target.value}))} />
              </div>
              <div>
                <Label>{t('locationLabel')}</Label>
                <Input value={form.location||''} onChange={e=>setForm(f=>({...f, location:e.target.value}))} />
              </div>
              <div>
                <Label>{t('statusLabel')}</Label>
                <Select value={(form.status as any)||'pending'} onValueChange={(v:any)=>setForm(f=>({...f, status:v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t('activeStatus')}</SelectItem>
                    <SelectItem value="pending">{t('pendingStatus')}</SelectItem>
                    <SelectItem value="suspended">{t('suspendedStatus')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('productsCountLabel')}</Label>
                <Input type="number" value={String(form.productsCount||0)} onChange={e=>setForm(f=>({...f, productsCount: Number(e.target.value||0)}))} />
              </div>
              <div className="md:col-span-2">
                <Label>{t('notesLabel')}</Label>
                <Textarea value={form.notes||''} onChange={e=>setForm(f=>({...f, notes:e.target.value}))} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={()=>setFormOpen(false)}>{t('cancel')}</Button>
              <Button onClick={submit}>{editId? t('save') : t('addVendor')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
