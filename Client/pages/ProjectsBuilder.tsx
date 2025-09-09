import React, { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import type { RouteContext } from '../components/routerTypes';
import { useTranslation } from '../hooks/useTranslation';
import { createProject as apiCreateProject, updateProject as apiUpdateProject } from '@/services/projects';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

// Product types (IDs must match Projects.tsx)
const productTypes = [
  { id: 'door', ar: 'باب', en: 'Door' },
  { id: 'window', ar: 'شباك', en: 'Window' },
  { id: 'railing', ar: 'دربزين', en: 'Railing' },
];

// Subtypes for product (requested: عادي / وسط / دبل)
const productSubtypes = [
  { id: 'normal', ar: 'عادي', en: 'Normal' },
  { id: 'center', ar: 'وسط', en: 'Center' },
  { id: 'double', ar: 'دبل', en: 'Double' },
];

const materials = [
  { id: 'aluminum', ar: 'ألمنيوم', en: 'Aluminum' },
  { id: 'steel', ar: 'صاج', en: 'Steel' },
  { id: 'laser', ar: 'ليزر', en: 'Laser' },
  { id: 'glass', ar: 'زجاج', en: 'Glass' },
];

// Colors to choose from
const colors = [
  { id: 'white', ar: 'أبيض', en: 'White' },
  { id: 'black', ar: 'أسود', en: 'Black' },
  { id: 'silver', ar: 'فضي', en: 'Silver' },
  { id: 'bronze', ar: 'برونزي', en: 'Bronze' },
  { id: 'gray', ar: 'رمادي', en: 'Gray' },
  { id: 'beige', ar: 'بيج', en: 'Beige' },
];

const accessoriesCatalog = [
  { id: 'brass_handle', ar: 'أوكرة نحاس', en: 'Brass Handle', price: 20 },
  { id: 'stainless_handle', ar: 'أوكرة سلستين', en: 'Stainless Handle', price: 15 },
  { id: 'aluminum_lock', ar: 'كالون الومنيوم', en: 'Aluminum Lock', price: 40 },
  { id: 'computer_lock', ar: 'قفل كمبيوتر', en: 'Computer Lock', price: 60 },
  { id: 'window_knob', ar: 'مقبض شباك', en: 'Window Knob', price: 20 },
];

// Fixed price per m² per product type (must match Projects.tsx)
const fixedPricePerType: Record<string, number> = {
  door: 500,
  window: 400,
  railing: 380,
};

// Cost modifiers
const subtypeFactor: Record<string, number> = {
  normal: 1.0,
  center: 1.1,
  double: 1.2,
};
const colorFactor: Record<string, number> = {
  white: 1.00,
  black: 1.05,
  silver: 1.07,
  bronze: 1.10,
  gray: 1.05,
  beige: 1.05,
};

function computedPPM(ptype: string, psubtype: string, color: string) {
  const base = ptype ? (fixedPricePerType[ptype] ?? 0) : 0;
  const sf = subtypeFactor[psubtype] ?? 1;
  const cf = colorFactor[color] ?? 1;
  return Math.round(base * sf * cf);
}

function computeTotal(w:number, h:number, ppm:number, qty:number, accIds:string[]) {
  const area = Math.max(0, w) * Math.max(0, h);
  const accCost = accIds
    .map(id => accessoriesCatalog.find(a => a.id === id)?.price || 0)
    .reduce((a,b)=>a+b,0);
  const subtotal = area * (ppm || 0);
  const totalOne = subtotal + accCost;
  return Math.max(0, Math.round(totalOne * Math.max(1, qty)));
}

export default function ProjectsBuilder({ setCurrentPage, ...rest }: RouteContext) {
  const { t, locale } = useTranslation();
  const currency = locale === 'ar' ? 'ر.س' : 'SAR';

  const [ptype, setPtype] = useState('');
  const [psubtype, setPsubtype] = useState('');
  const [material, setMaterial] = useState('');
  const [color, setColor] = useState('');
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [days, setDays] = useState<number>(1);
  const [pricePerMeter, setPricePerMeter] = useState<number>(0);
  const [autoPrice, setAutoPrice] = useState<boolean>(true);
  const [selectedAcc, setSelectedAcc] = useState<string[]>([]);
  const [description, setDescription] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  type Builder = {
    id: string;
    ptype: string;
    psubtype: string;
    material: string;
    color: string;
    width: number;
    height: number;
    quantity: number;
    days: number;
    autoPrice: boolean;
    pricePerMeter: number;
    selectedAcc: string[];
    description?: string;
  };
  const [additionalBuilders, setAdditionalBuilders] = useState<Builder[]>([]);

  useEffect(() => {
    // Always auto-calc PPM based on type, subtype, color
    const ppm = computedPPM(ptype, psubtype, color);
    setPricePerMeter(ppm);
  }, [ptype, psubtype, color]);

  // Prefill from edit draft if exists
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('edit_project_draft');
      if (!raw) return;
      const d = JSON.parse(raw);
      setEditingId(d.id || null);
      setPtype(d.ptype || '');
      setPsubtype(d.psubtype || 'normal');
      setMaterial(d.material || '');
      setColor(d.color || 'white');
      setWidth(Number(d.width) || 0);
      setHeight(Number(d.height) || 0);
      setQuantity(Number(d.quantity) || 1);
      setDays(Number(d.days) || 1);
      setSelectedAcc(Array.isArray(d.selectedAcc) ? d.selectedAcc : []);
      setDescription(d.description || '');
      // keep auto calc for ppm via effect
      window.localStorage.removeItem('edit_project_draft');
      // Load additional items draft if present
      const itemsRaw = window.localStorage.getItem('edit_project_items_draft');
      if (itemsRaw) {
        const items = JSON.parse(itemsRaw);
        if (Array.isArray(items)) {
          // Normalize into Builder shape
          const normalized = items.map((b:any) => ({
            id: b.id || Math.random().toString(36).slice(2),
            ptype: b.ptype || '',
            psubtype: b.psubtype || 'normal',
            material: b.material || '',
            color: b.color || 'white',
            width: Number(b.width) || 0,
            height: Number(b.height) || 0,
            quantity: Number(b.quantity) || 1,
            days: Number(b.days) || 1,
            autoPrice: true,
            pricePerMeter: Number(b.pricePerMeter) || 0,
            selectedAcc: Array.isArray(b.selectedAcc) ? b.selectedAcc : [],
            description: b.description || '',
          })) as Builder[];
          setAdditionalBuilders(normalized);
        }
        window.localStorage.removeItem('edit_project_items_draft');
      }
    } catch {}
  }, []);

  // Keep additional builders' days in sync with main days
  useEffect(() => {
    setAdditionalBuilders((prev) => prev.map((b) => ({ ...b, days })));
  }, [days]);

  const isComplete = Boolean(ptype) && Boolean(material) && width > 0 && height > 0 && quantity > 0 && pricePerMeter > 0;

  const total = useMemo(() => computeTotal(width, height, pricePerMeter, quantity, selectedAcc), [width, height, pricePerMeter, quantity, selectedAcc]);
  const totalExtra = useMemo(() => {
    return additionalBuilders.reduce((sum, b) => {
      const ppm = computedPPM(b.ptype, b.psubtype, b.color);
      return sum + computeTotal(b.width, b.height, ppm, b.quantity, b.selectedAcc);
    }, 0);
  }, [additionalBuilders]);
  const grandTotal = useMemo(() => total + totalExtra, [total, totalExtra]);

  function toggleAccessory(id: string, checked: boolean) {
    setSelectedAcc((prev) => {
      if (checked) return Array.from(new Set([...prev, id]));
      return prev.filter((x) => x !== id);
    });
  }

  function toggleAccessoryFor(index: number, id: string, checked: boolean) {
    setAdditionalBuilders((prev) => {
      const copy = [...prev];
      const acc = copy[index].selectedAcc;
      copy[index] = {
        ...copy[index],
        selectedAcc: checked ? Array.from(new Set([...acc, id])) : acc.filter((x) => x !== id),
      };
      return copy;
    });
  }

  const addClonedForm = () => {
    // Add a BLANK form to let user add many items easily
    const newForm: Builder = {
      id: Math.random().toString(36).slice(2),
      ptype: '',
      psubtype: '',
      material: '',
      color: '',
      width: 0,
      height: 0,
      quantity: 1,
      days: days,
      autoPrice: true,
      pricePerMeter: 0,
      selectedAcc: [],
      description: '',
    };
    setAdditionalBuilders((prev) => [...prev, newForm]);
  };

  const removeForm = (index: number) => {
    setAdditionalBuilders((prev) => prev.filter((_, i) => i !== index));
  };

  const confirmProject = () => {
    if (!isComplete) return;
    // Build main project
    const mainPPM = pricePerMeter;
    const mainTotal = computeTotal(width, height, mainPPM, quantity, selectedAcc);
    // Build additional items (not as separate projects)
    const items = additionalBuilders.map((b) => {
      const ppm = computedPPM(b.ptype, b.psubtype, b.color);
      return {
        id: Math.random().toString(36).slice(2),
        ptype: b.ptype,
        psubtype: b.psubtype,
        material: b.material,
        color: b.color,
        width: b.width,
        height: b.height,
        quantity: b.quantity,
        days: b.days,
        autoPrice: b.autoPrice,
        pricePerMeter: ppm,
        selectedAcc: b.selectedAcc,
        description: b.description || '',
        total: computeTotal(b.width, b.height, ppm, b.quantity, b.selectedAcc),
        createdAt: Date.now(),
      };
    });
    // Attach current user info so vendors can see the requester name
    let currentUser: any = null;
    try {
      const uRaw = window.localStorage.getItem('mock_current_user');
      currentUser = uRaw ? JSON.parse(uRaw) : null;
    } catch {}

    // Map to backend CreateProjectDto
    const payload: any = {
      title: description ? (locale==='ar' ? 'مشروع' : 'Project') : undefined,
      description,
      type: ptype,
      psubtype,
      material,
      color,
      width,
      height,
      quantity,
      days,
      pricePerMeter: mainPPM,
      total: grandTotal,
      items,
    };
    (async () => {
      try {
        if (editingId) {
          await apiUpdateProject(editingId, payload);
        } else {
          await apiCreateProject(payload);
        }
      } catch {}
      setCurrentPage && setCurrentPage('projects');
    })();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage="projects-builder" setCurrentPage={setCurrentPage as any} {...(rest as any)} />
      <main className="container mx-auto px-4 py-6 flex-1">
        <h1 className="text-2xl font-bold mb-4">{locale==='ar' ? 'إضافة مشروع' : 'Add Project'}</h1>
        <Card className="mb-8">
          <CardContent className="p-4 md:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-1">{locale==='ar' ? ' المنتج' : 'Product Type'}</label>
                <Select value={ptype} onValueChange={setPtype}>
                  <SelectTrigger>
                    <SelectValue placeholder={locale==='ar' ? 'اختر النوع' : 'Select type'} />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map(pt => (
                      <SelectItem key={pt.id} value={pt.id}>{locale==='ar' ? pt.ar : pt.en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm mb-1">{locale==='ar' ? 'النوع' : 'Subtype'}</label>
                <Select value={psubtype} onValueChange={setPsubtype}>
                  <SelectTrigger>
                    <SelectValue placeholder={locale==='ar' ? 'اختر النوع (عادي/وسط/دبل)' : 'Select subtype'} />
                  </SelectTrigger>
                  <SelectContent>
                    {productSubtypes.map(st => (
                      <SelectItem key={st.id} value={st.id}>{locale==='ar' ? st.ar : st.en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm mb-1">{locale==='ar' ? 'الخامة' : 'Material'}</label>
                <Select value={material} onValueChange={setMaterial}>
                  <SelectTrigger>
                    <SelectValue placeholder={locale==='ar' ? 'اختر الخامة' : 'Select material'} />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map(m => (
                      <SelectItem key={m.id} value={m.id}>{locale==='ar' ? m.ar : m.en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm mb-1">{locale==='ar' ? 'اللون' : 'Color'}</label>
                <Select value={color} onValueChange={setColor}>
                  <SelectTrigger>
                    <SelectValue placeholder={locale==='ar' ? 'اختر اللون' : 'Select color'} />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map(c => (
                      <SelectItem key={c.id} value={c.id}>{locale==='ar' ? c.ar : c.en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm mb-1">{locale==='ar' ? 'العرض (متر)' : 'Width (m)'}</label>
                  <Input type="text" inputMode="decimal" value={Number.isFinite(width) ? width : ''} onChange={(e) => setWidth(parseFloat(e.target.value || '0'))} placeholder={locale==='ar' ? '0.00' : '0.00'} />
                </div>
                <div>
                  <label className="block text-sm mb-1">{locale==='ar' ? 'الطول (متر)' : 'Height (m)'}</label>
                  <Input type="text" inputMode="decimal" value={Number.isFinite(height) ? height : ''} onChange={(e) => setHeight(parseFloat(e.target.value || '0'))} placeholder={locale==='ar' ? '0.00' : '0.00'} />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">{locale==='ar' ? 'سعر المتر المربع' : 'Price per m²'}</label>
                <Input type="number" min={0} step={1} value={Number.isFinite(pricePerMeter) ? pricePerMeter : 0} disabled placeholder={locale==='ar' ? '0' : '0'} />
              </div>
              <div>
                <label className="block text-sm mb-1">{locale==='ar' ? 'الكمية' : 'Quantity'}</label>
                <Input type="number" min={1} step={1} value={Number.isFinite(quantity) ? quantity : 0} onChange={(e) => setQuantity(parseInt(e.target.value || '0', 10) || 0)} placeholder={locale==='ar' ? '0' : '0'} />
              </div>
              <div>
                <label className="block text-sm mb-1">{locale==='ar' ? 'أيام التنفيذ' : 'Days to complete'}</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={String(Number.isFinite(days) ? days : 1)}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9]/g, '');
                    const n = Math.max(1, parseInt(v || '1', 10) || 1);
                    setDays(n);
                  }}
                  placeholder={locale==='ar' ? 'عدد الأيام' : 'Days'}
                />
              </div>
              
              <div className="md:col-span-2 lg:col-span-2">
                <label className="block text-sm mb-2">{locale==='ar' ? 'ملحقات إضافية' : 'Additional Accessories'}</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {accessoriesCatalog.map(acc => (
                    <label key={acc.id} className="flex items-center gap-2 rounded-md border p-2">
                      <Checkbox checked={selectedAcc.includes(acc.id)} onCheckedChange={(v) => toggleAccessory(acc.id, !!v)} />
                      <span className="text-sm">
                        {locale==='ar' ? acc.ar : acc.en} <span className="text-muted-foreground">- {currency} {acc.price}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm mb-1">{locale==='ar' ? 'وصف المنتج (اختياري)' : 'Project Description (optional)'}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full border rounded-md p-2 bg-background"
                  placeholder={locale==='ar' ? 'اكتب وصفاً مختصراً للمشروع...' : 'Write a brief description of your project...'}
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <Button type="button" variant="secondary" onClick={addClonedForm} className="mt-2 flex items-center gap-1">
                  <Plus className="w-4 h-4" /> {locale==='ar' ? 'إضافة منتج' : 'Add Product'}
                </Button>
              </div>
            </div>

            {/* Actions moved to bottom under the last form */}
          </CardContent>
        </Card>

        {/* Additional Cloned Forms */}
        {additionalBuilders.length > 0 && (
          <div className="space-y-6 mt-6">
            {additionalBuilders.map((b, idx) => {
              const ppm = computedPPM(b.ptype, b.psubtype, b.color);
              const bTotal = computeTotal(b.width, b.height, ppm, b.quantity, b.selectedAcc);
              return (
                <Card key={b.id} className="p-4">
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{locale==='ar' ? `منتج إضافي #${idx+1}` : `Additional Item #${idx+1}`}</h3>
                      <Button variant="outline" onClick={() => removeForm(idx)}>
                        {locale==='ar' ? 'حذف' : 'Remove'}
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm mb-1">{locale==='ar' ? 'نوع المنتج' : 'Product Type'}</label>
                        <Select value={b.ptype} onValueChange={(v) => setAdditionalBuilders((prev)=>{ const c=[...prev]; c[idx] = { ...c[idx], ptype: v }; return c; })}>
                          <SelectTrigger>
                            <SelectValue placeholder={locale==='ar' ? 'اختر النوع' : 'Select type'} />
                          </SelectTrigger>
                          <SelectContent>
                            {productTypes.map((pt) => (
                              <SelectItem key={pt.id} value={pt.id}>{locale==='ar' ? pt.ar : pt.en}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm mb-1">{locale==='ar' ? 'النوع' : 'Subtype'}</label>
                        <Select value={b.psubtype} onValueChange={(v) => setAdditionalBuilders((prev)=>{ const c=[...prev]; c[idx] = { ...c[idx], psubtype: v }; return c; })}>
                          <SelectTrigger>
                            <SelectValue placeholder={locale==='ar' ? 'اختر النوع (عادي/وسط/دبل)' : 'Select subtype'} />
                          </SelectTrigger>
                          <SelectContent>
                            {productSubtypes.map((st) => (
                              <SelectItem key={st.id} value={st.id}>{locale==='ar' ? st.ar : st.en}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm mb-1">{locale==='ar' ? 'الخامة' : 'Material'}</label>
                        <Select value={b.material} onValueChange={(v) => setAdditionalBuilders((prev)=>{ const c=[...prev]; c[idx] = { ...c[idx], material: v }; return c; })}>
                          <SelectTrigger>
                            <SelectValue placeholder={locale==='ar' ? 'اختر الخامة' : 'Select material'} />
                          </SelectTrigger>
                          <SelectContent>
                            {materials.map((m) => (
                              <SelectItem key={m.id} value={m.id}>{locale==='ar' ? m.ar : m.en}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm mb-1">{locale==='ar' ? 'اللون' : 'Color'}</label>
                        <Select value={b.color} onValueChange={(v) => setAdditionalBuilders((prev)=>{ const c=[...prev]; c[idx] = { ...c[idx], color: v }; return c; })}>
                          <SelectTrigger>
                            <SelectValue placeholder={locale==='ar' ? 'اختر اللون' : 'Select color'} />
                          </SelectTrigger>
                          <SelectContent>
                            {colors.map((c) => (
                              <SelectItem key={c.id} value={c.id}>{locale==='ar' ? c.ar : c.en}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm mb-1">{locale==='ar' ? 'العرض (متر)' : 'Width (m)'}</label>
                          <Input type="text" inputMode="decimal" value={Number.isFinite(b.width) ? b.width : ''} onChange={(e)=> setAdditionalBuilders((prev)=>{ const c=[...prev]; c[idx] = { ...c[idx], width: parseFloat(e.target.value || '0') }; return c; })} />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">{locale==='ar' ? 'الطول (متر)' : 'Height (m)'}</label>
                          <Input type="text" inputMode="decimal" value={Number.isFinite(b.height) ? b.height : ''} onChange={(e)=> setAdditionalBuilders((prev)=>{ const c=[...prev]; c[idx] = { ...c[idx], height: parseFloat(e.target.value || '0') }; return c; })} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm mb-1">{locale==='ar' ? 'سعر المتر المربع' : 'Price per m²'}</label>
                        <Input type="number" min={0} step={1} value={ppm} disabled />
                      </div>
                      
                      <div>
                        <label className="block text-sm mb-1">{locale==='ar' ? 'الكمية' : 'Quantity'}</label>
                        <Input type="number" min={1} step={1} value={Number.isFinite(b.quantity) ? b.quantity : 0} onChange={(e)=> setAdditionalBuilders((prev)=>{ const c=[...prev]; c[idx] = { ...c[idx], quantity: parseInt(e.target.value || '0', 10) || 0 }; return c; })} />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">{locale==='ar' ? 'أيام التنفيذ' : 'Days to complete'}</label>
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={String(Number.isFinite(b.days) ? b.days : 1)}
                          onChange={(e)=> {/* disabled */}}
                          disabled
                          readOnly
                          placeholder={locale==='ar' ? 'عدد الأيام' : 'Days'}
                        />
                      </div>
                      <div className="md:col-span-2 lg:col-span-2">
                        <label className="block text-sm mb-2">{locale==='ar' ? 'ملحقات إضافية' : 'Additional Accessories'}</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {accessoriesCatalog.map(acc => (
                            <label key={acc.id} className="flex items-center gap-2 rounded-md border p-2">
                              <Checkbox checked={b.selectedAcc.includes(acc.id)} onCheckedChange={(v) => toggleAccessoryFor(idx, acc.id, !!v)} />
                              <span className="text-sm">
                                {locale==='ar' ? acc.ar : acc.en} <span className="text-muted-foreground">- {currency} {acc.price}</span>
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-sm mb-1">{locale==='ar' ? 'وصف المنتج (اختياري)' : 'Item Description (optional)'}</label>
                        <textarea
                          value={b.description || ''}
                          onChange={(e)=> setAdditionalBuilders((prev)=>{ const c=[...prev]; c[idx] = { ...c[idx], description: e.target.value }; return c; })}
                          rows={3}
                          className="w-full border rounded-md p-2 bg-background"
                          placeholder={locale==='ar' ? 'وصف مختصر...' : 'Brief description...'}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Grand Total at the very end */}
        <div className="mt-6">
          <div className="flex items-center justify-between p-4 rounded-md border bg-muted/40">
            <div className="text-sm text-muted-foreground">
              {locale==='ar' ? 'الإجمالي التقديري بعد كل الاختيارات' : 'Estimated total after all selections'}
            </div>
            <div className="text-xl font-bold text-primary">
              {currency} {grandTotal.toLocaleString(locale==='ar'?'ar-EG':'en-US')}
            </div>
          </div>
        </div>

        {/* Bottom Actions under the last form */}
        <div className="flex items-center justify-between mt-4">
          <Button variant="outline" onClick={() => setCurrentPage && setCurrentPage('projects')}>
            {locale==='ar' ? 'رجوع للمشاريع' : 'Back to Projects'}
          </Button>
          <div className="flex items-center gap-3">
            <Button onClick={confirmProject} disabled={!isComplete} className={!isComplete ? 'opacity-50 cursor-not-allowed' : ''}>
              {locale==='ar' ? 'تأكيد' : 'Confirm'}
            </Button>
          </div>
        </div>
      </main>
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}
