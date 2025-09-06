import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useTranslation } from "../hooks/useTranslation";
import type { RouteContext } from "../components/routerTypes";
import { Separator } from "../components/ui/separator";
import { getAdminTechnicianOptions } from "../lib/adminOptions";
import { createService, updateService } from "@/services/servicesCatalog";

interface AddServiceProps extends Partial<RouteContext> {}

const SERVICE_TYPES = [
  { id: "plumber", ar: "سباك", en: "Plumber" },
  { id: "electrician", ar: "كهربائي", en: "Electrician" },
  { id: "carpenter", ar: "نجار", en: "Carpenter" },
  { id: "painter", ar: "نقاش", en: "Painter" },
  { id: "gypsum_installer", ar: "فني تركيب جيبس بورد", en: "Gypsum Board Installer" },
  { id: "marble_installer", ar: "فني تركيب رخام", en: "Marble Installer" },
];

// Minimum daily wages per service type
const MIN_WAGE: Record<string, number> = {
  plumber: 200,
  electrician: 200,
  carpenter: 300,
  painter: 250,
  gypsum_installer: 450,
  marble_installer: 350,
};

export default function AddService({ setCurrentPage, ...rest }: AddServiceProps) {
  const { t, locale } = useTranslation();
  const currency = locale === "ar" ? "ر.س" : "SAR";

  const [stype, setStype] = useState<string>("");
  const [techOptions, setTechOptions] = useState<string[]>([]);
  const [dailyWage, setDailyWage] = useState<number>(0);
  const [days, setDays] = useState<number>(1);
  const [description, setDescription] = useState<string>("");
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const total = useMemo(() => Math.max(0, Math.round((dailyWage || 0) * Math.max(0, days || 0))), [dailyWage, days]);

  const minForSelected = useMemo(() => (stype ? (MIN_WAGE[stype] || 0) : 0), [stype]);

  const skipNextTypeMinRef = useRef<boolean>(false);
  // When changing type, reset to min, but if we're initializing edit, keep existing if >= min
  useEffect(() => {
    if (!stype) return;
    const min = MIN_WAGE[stype] || 0;
    if (skipNextTypeMinRef.current) {
      setDailyWage((prev) => (Number.isFinite(prev as any) ? Math.max(min, Number(prev)) : min));
      skipNextTypeMinRef.current = false;
    } else {
      setDailyWage(min);
    }
  }, [stype]);

  // Save service via backend first; fallback to localStorage
  const saveService = async () => {
    try {
      if (typeof window === "undefined") return;
      // Read current user for requester info
      let currentUser: any = null;
      try {
        const uRaw = window.localStorage.getItem('mock_current_user');
        currentUser = uRaw ? JSON.parse(uRaw) : null;
      } catch {}
      // Prepare payload for backend
      const payload = { type: stype, dailyWage, days, total, description } as any;
      let apiOk = false;
      try {
        if (editingServiceId) {
          const r = await updateService(editingServiceId, payload);
          apiOk = !!r.ok;
        } else {
          const r = await createService(payload);
          apiOk = !!r.ok;
        }
      } catch {
        apiOk = false;
      }

      // Fallback to local storage if backend failed
      if (!apiOk) {
        const raw = window.localStorage.getItem("user_services");
        const list = raw ? (JSON.parse(raw) as any[]) : [];
        if (editingServiceId) {
          const updated = list.map((it:any) => {
            if (String(it.id) !== String(editingServiceId)) return it;
            const withUser = {
              customerName: it.customerName ?? (currentUser?.name || currentUser?.username || currentUser?.email || null),
              userId: it.userId ?? (currentUser?.id ?? null),
              user: it.user ?? (currentUser ? { id: currentUser.id, name: currentUser.name || currentUser.username || currentUser.email } : undefined),
            };
            return { ...it, type: stype, dailyWage, days, total, description, updatedAt: new Date().toISOString(), ...withUser };
          });
          window.localStorage.setItem("user_services", JSON.stringify(updated));
          window.localStorage.removeItem('edit_service_id');
        } else {
          const item = {
            id: `s-${Date.now()}`,
            type: stype,
            dailyWage,
            days,
            total,
            description,
            createdAt: new Date().toISOString(),
            // requester info for vendor views
            customerName: currentUser?.name || currentUser?.username || currentUser?.email || null,
            userId: currentUser?.id ?? null,
            user: currentUser ? { id: currentUser.id, name: currentUser.name || currentUser.username || currentUser.email } : undefined,
          };
          window.localStorage.setItem("user_services", JSON.stringify([item, ...list]));
        }
      }
      // Navigate to vendor services page after saving
      setCurrentPage && setCurrentPage("vendor-services");
    } catch {}
  };

  const canSubmit = Boolean(stype) && dailyWage >= (minForSelected || 0) && days >= 1;

  // Load draft for editing if edit_service_id is set
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      // Initialize technician options from admin with fallback
      const initAdmin = () => {
        const specs = getAdminTechnicianOptions().specialties || [];
        if (Array.isArray(specs) && specs.length) {
          setTechOptions(specs);
        } else {
          // fallback to static SERVICE_TYPES (Arabic/English labels)
          setTechOptions(SERVICE_TYPES.map(s => (locale === 'ar' ? s.ar : s.en)));
        }
      };
      initAdmin();
      const onAdminUpdate = () => initAdmin();
      window.addEventListener('admin_options_updated', onAdminUpdate as any);
      const editId = window.localStorage.getItem('edit_service_id');
      if (!editId) return;
      const raw = window.localStorage.getItem('user_services');
      if (!raw) return;
      const list = JSON.parse(raw);
      if (!Array.isArray(list)) return;
      const found = list.find((s:any) => String(s.id) === String(editId));
      if (!found) return;
      setEditingServiceId(String(found.id));
      // set type first; tell the type effect to keep existing wage if it's >= min
      skipNextTypeMinRef.current = true;
      setDailyWage(Number(found.dailyWage || 0));
      setStype(found.type || '');
      // days/description
      setDays(Number(found.days || 1));
      setDescription(String(found.description || ''));
      return () => {
        window.removeEventListener('admin_options_updated', onAdminUpdate as any);
      };
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-background" dir={locale === "ar" ? "rtl" : "ltr"}>
      <Header currentPage="add-service" setCurrentPage={setCurrentPage as any} {...(rest as any)} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{locale === 'ar' ? 'إضافة خدمة' : 'Add Service'}</h1>
            <p className="text-muted-foreground text-sm">{locale === 'ar' ? 'أدخل تفاصيل الخدمة لحساب السعر تلقائياً' : 'Enter service details to auto-calculate the price'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setCurrentPage && setCurrentPage("vendor-services")}>{locale === 'ar' ? 'رجوع' : 'Back'}</Button>
            <Button onClick={saveService} disabled={!canSubmit} className={!canSubmit ? 'opacity-50 cursor-not-allowed' : ''}>
              {locale === 'ar' ? 'حفظ الخدمة' : 'Save Service'}
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4 md:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-1">{locale === 'ar' ? 'نوع الفني' : 'Technician Type'}</label>
                <Select value={stype} onValueChange={setStype}>
                  <SelectTrigger>
                    <SelectValue placeholder={locale === 'ar' ? 'اختر النوع' : 'Select type'} />
                  </SelectTrigger>
                  <SelectContent>
                    {techOptions.length > 0
                      ? techOptions.map((name) => (
                          <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))
                      : SERVICE_TYPES.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {locale === 'ar' ? s.ar : s.en}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm mb-1">{locale === 'ar' ? 'اليومية' : 'Daily Wage'}</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={""}
                    value={Number.isFinite(dailyWage) ? dailyWage : 0}
                    onChange={(e)=> {
                      const onlyDigits = (e.target.value || '').replace(/[^0-9.]/g, '');
                      const raw = parseFloat(onlyDigits || '0');
                      const min = minForSelected || 0;
                      setDailyWage(Number.isFinite(raw) ? Math.max(min, raw) : min);
                    }}
                    placeholder={minForSelected ? String(minForSelected) : (locale==='ar' ? '0' : '0')}
                  />
                  <span className="text-sm text-muted-foreground">{currency}</span>
                </div>
                {/* Removed minimum helper text under daily wage input as requested */}
              </div>
              <div>
                <label className="block text-sm mb-1">{locale === 'ar' ? 'عدد الأيام (الدوام)' : 'Duration (days)'}</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={Number.isFinite(days) && days < 1 ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  value={Number.isFinite(days) ? days : 0}
                  onChange={(e)=> {
                    const onlyDigits = (e.target.value || '').replace(/[^0-9]/g, '');
                    const val = parseInt(onlyDigits || '0', 10) || 0;
                    setDays(Math.max(0, val));
                  }}
                  placeholder={locale==='ar' ? '1' : '1'}
                />
                {Number.isFinite(days) && days < 1 && (
                  <div className="text-xs mt-1 text-red-600">
                    {locale === 'ar' ? 'يجب أن يكون عدد الأيام 1 على الأقل.' : 'Days must be at least 1.'}
                  </div>
                )}
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm mb-1">{locale === 'ar' ? 'وصف الخدمة (اختياري)' : 'Service Description (optional)'}</label>
                <textarea rows={3} className="w-full border rounded-md p-2 bg-background" value={description} onChange={(e)=> setDescription(e.target.value)} placeholder={locale==='ar' ? 'اكتب وصفاً مختصراً للخدمة...' : 'Brief description of the service...'} />
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {locale === 'ar' ? 'السعر الكلي' : 'Total Price'} = {locale === 'ar' ? 'اليومية' : 'Daily'} × {locale === 'ar' ? 'الأيام' : 'Days'}
              </div>
              <div className="text-xl font-semibold">
                {currency} {total.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer setCurrentPage={setCurrentPage as any} />
    </div>
  );
}
