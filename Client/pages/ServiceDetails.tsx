import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { useTranslation } from "../hooks/useTranslation";
import type { RouteContext } from "../components/routerTypes";
import { getServiceById, deleteService as apiDeleteService } from "@/services/servicesCatalog";
import { Info, Package, Calendar, ClipboardList, Check, X } from "lucide-react";
import { getUsers } from "../lib/authMock";

interface ServiceDetailsProps extends Partial<RouteContext> {}

type Service = {
  id: string;
  type: string;
  dailyWage: number;
  days: number;
  total: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

const SERVICE_TYPES = [
  { id: 'plumber', ar: 'سباك', en: 'Plumber' },
  { id: 'electrician', ar: 'كهربائي', en: 'Electrician' },
  { id: 'carpenter', ar: 'نجار', en: 'Carpenter' },
  { id: 'painter', ar: 'نقاش', en: 'Painter' },
  { id: 'gypsum_installer', ar: 'فني تركيب جيبس بورد', en: 'Gypsum Board Installer' },
  { id: 'marble_installer', ar: 'فني تركيب رخام', en: 'Marble Installer' },
];

export default function ServiceDetails({ setCurrentPage, ...context }: ServiceDetailsProps) {
  const { locale } = useTranslation();
  const currency = locale === 'ar' ? 'ر.س' : 'SAR';
  const numLocale = locale === 'ar' ? 'ar-EG' : 'en-US';
  const [service, setService] = useState<Service | null>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const usersById = useMemo(() => {
    try {
      const arr = getUsers();
      const map: Record<string, string> = {};
      arr.forEach((u:any) => { map[u.id] = u.name || u.email || u.id; });
      return map;
    } catch { return {}; }
  }, []);

  // Load selected service by id: backend first, then fallback to localStorage
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (typeof window === 'undefined') return;
        const id = window.localStorage.getItem('selected_service_id');
        if (!id) return;
        // Try backend
        try {
          const { ok, data } = await getServiceById(id);
          if (!cancelled && ok && data) {
            setService(data as any);
          }
        } catch {}
        // Fallback to local list if still null
        if (!cancelled && !service) {
          const raw = window.localStorage.getItem('user_services');
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              const found = list.find((s: any) => String(s.id) === String(id));
              if (found) setService(found as Service);
            }
          }
        }
        // Load technician requests (proposals) for this service (local only)
        try {
          const pRaw = window.localStorage.getItem('technician_requests');
          const plist = pRaw ? JSON.parse(pRaw) : [];
          const filtered = Array.isArray(plist) ? plist.filter((p:any)=> p.targetType === 'service' && String(p.serviceId) === String(id)) : [];
          if (!cancelled) setProposals(filtered);
        } catch {}
      } catch {}
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const typeLabel = useMemo(() => {
    if (!service) return '';
    const item = SERVICE_TYPES.find(s => s.id === service.type);
    return item ? (locale === 'ar' ? item.ar : item.en) : service.type;
  }, [service, locale]);

  const deleteService = async () => {
    try {
      if (!service) return;
      // Try backend deletion first
      try { await apiDeleteService(service.id as any); } catch {}
      // Fallback: remove from local storage
      const raw = window.localStorage.getItem('user_services');
      const list = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list)) {
        const next = list.filter((s: any) => String(s.id) !== String(service.id));
        window.localStorage.setItem('user_services', JSON.stringify(next));
      }
    } catch {}
    setCurrentPage && setCurrentPage('projects');
  };

  if (!service) {
    return (
      <div className="min-h-screen bg-background" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <Header currentPage="projects" setCurrentPage={setCurrentPage as any} {...context} />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Info className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium">{locale === 'ar' ? 'لا توجد تفاصيل متاحة لهذه الخدمة.' : 'No details available for this service.'}</p>
              <div className="pt-1">
                <Button onClick={() => setCurrentPage && setCurrentPage('projects')} className="inline-flex items-center gap-1">
                  {locale === 'ar' ? 'رجوع' : 'Back'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer setCurrentPage={setCurrentPage as any} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <Header currentPage="projects" setCurrentPage={setCurrentPage as any} {...context} />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main details */}
          <Card className="lg:col-span-2 overflow-hidden shadow-sm">
            <div className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-primary" />
                  <h1 className="text-2xl font-bold">{locale === 'ar' ? 'تفاصيل الخدمة' : 'Service Details'}</h1>
                </div>
              </div>
              {/* Quick summary chips */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="outline" className="rounded-full text-xs">{typeLabel}</Badge>
                {Number(service.days) > 0 && (
                  <Badge variant="outline" className="rounded-full text-xs">{locale==='ar' ? `الأيام: ${service.days}` : `Days: ${service.days}`}</Badge>
                )}
                <Badge variant="outline" className="rounded-full text-xs">{locale==='ar' ? `اليومية: ${currency} ${Number(service.dailyWage||0).toLocaleString(numLocale)}` : `Daily: ${currency} ${Number(service.dailyWage||0).toLocaleString(numLocale)}`}</Badge>
                <Badge variant="outline" className="rounded-full text-xs">{locale==='ar' ? `الإجمالي: ${currency} ${Number(service.total||0).toLocaleString(numLocale)}` : `Total: ${currency} ${Number(service.total||0).toLocaleString(numLocale)}`}</Badge>
              </div>
            </div>
            <CardContent className="p-6 space-y-6">
              {/* Info grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border p-4 bg-background shadow-sm">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" /> {locale==='ar' ? 'نوع الفني' : 'Technician Type'}
                  </div>
                  <div className="mt-1 font-medium">{typeLabel}</div>
                </div>
                <div className="rounded-lg border p-4 bg-background shadow-sm">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" /> {locale==='ar' ? 'اليومية' : 'Daily Wage'}
                  </div>
                  <div className="mt-1 font-medium">{currency} {Number(service.dailyWage || 0).toLocaleString(numLocale)}</div>
                </div>
                <div className="rounded-lg border p-4 bg-background shadow-sm">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> {locale==='ar' ? 'الأيام' : 'Days'}
                  </div>
                  <div className="mt-1 font-medium">{Number(service.days || 0)}</div>
                </div>
                <div className="rounded-lg border p-4 bg-background shadow-sm">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" /> {locale==='ar' ? 'الإجمالي' : 'Total'}
                  </div>
                  <div className="mt-1 font-semibold text-primary">{currency} {Number(service.total || 0).toLocaleString(numLocale)}</div>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">{locale === 'ar' ? 'الوصف' : 'Description'}</div>
                {service.description ? (
                  <div className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/30 border rounded-md p-3">{service.description}</div>
                ) : (
                  <div className="text-sm text-muted-foreground">{locale === 'ar' ? 'لا يوجد وصف مضاف.' : 'No description provided.'}</div>
                )}
                <div className="text-xs text-muted-foreground">
                  {service.createdAt ? (locale === 'ar' ? `أُنشئت: ${new Date(service.createdAt).toLocaleString('ar-EG')}` : `Created: ${new Date(service.createdAt).toLocaleString('en-US')}`) : null}
                  {service.updatedAt ? (locale === 'ar' ? ` • آخر تحديث: ${new Date(service.updatedAt).toLocaleString('ar-EG')}` : ` • Updated: ${new Date(service.updatedAt).toLocaleString('en-US')}`) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar: proposals */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{locale === 'ar' ? 'عروض مقدّمة' : 'Submitted Proposals'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{locale === 'ar' ? 'عدد العروض' : 'Total'}</span>
                  <Badge variant="outline">{proposals.length}</Badge>
                </div>
                {proposals.length === 0 ? (
                  <div className="text-sm text-muted-foreground">{locale === 'ar' ? 'لا توجد عروض حتى الآن.' : 'No proposals yet.'}</div>
                ) : (
                  <div className="space-y-3">
                    {proposals.map((pp: any) => (
                      <div key={pp.id} className="border rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">{usersById[String(pp.technicianId)] || (locale==='ar' ? 'فني' : 'Technician')}</div>
                          <Badge variant={pp.status==='accepted'? 'secondary' : pp.status==='rejected'? 'destructive' : 'outline'} className="text-xs capitalize">{locale==='ar' ? (pp.status==='pending'?'معلق': pp.status==='accepted'?'مقبول':'مرفوض') : pp.status}</Badge>
                        </div>
                        <div className="text-sm">{locale === 'ar' ? 'السعر' : 'Price'}: {currency} {Number(pp.price||0).toLocaleString(numLocale)}</div>
                        <div className="text-sm text-muted-foreground">{locale === 'ar' ? 'المدة' : 'Days'}: {Number(pp.days||0)}</div>
                        {pp.message && <div className="mt-1 text-xs bg-muted/20 rounded p-2">{pp.message}</div>}
                        {pp.status === 'pending' && (
                          <div className="mt-2 flex items-center gap-2">
                            <Button size="sm" className="flex-1" onClick={() => {
                              try {
                                const raw = window.localStorage.getItem('technician_requests');
                                const list = raw ? JSON.parse(raw) : [];
                                const next = list.map((x:any)=> x.id===pp.id ? { ...x, status: 'accepted' } : x);
                                window.localStorage.setItem('technician_requests', JSON.stringify(next));
                                setProposals((prev)=> prev.map((x:any)=> x.id===pp.id ? { ...x, status: 'accepted' } : x));
                                // Notify technician about acceptance
                                try {
                                  const nraw = window.localStorage.getItem('app_notifications');
                                  const nlist = nraw ? JSON.parse(nraw) : [];
                                  const numLocale = locale==='ar' ? 'ar-EG' : 'en-US';
                                  const title = locale==='ar' ? 'تم قبول عرضك' : 'Your proposal was accepted';
                                  const desc = locale==='ar'
                                    ? `تم قبول عرضك بقيمة ${currency} ${Number(pp.price||0).toLocaleString(numLocale)} لمدة ${Number(pp.days||0)} يوم`
                                    : `Your offer of ${currency} ${Number(pp.price||0).toLocaleString(numLocale)} for ${Number(pp.days||0)} days was accepted`;
                                  const notif = {
                                    id: `ntf_${Date.now()}`,
                                    type: 'proposal-status',
                                    recipientId: pp.technicianId,
                                    recipientRole: 'technician',
                                    title,
                                    desc,
                                    createdAt: new Date().toISOString(),
                                    meta: { targetType: 'service', targetId: (service as any)?.id, proposalId: pp.id, status: 'accepted' }
                                  };
                                  const combined = Array.isArray(nlist) ? [notif, ...nlist] : [notif];
                                  window.localStorage.setItem('app_notifications', JSON.stringify(combined));
                                } catch {}
                              } catch {}
                            }}>
                              <Check className="w-4 h-4 ml-1" /> {locale === 'ar' ? 'قبول' : 'Accept'}
                            </Button>
                            <Button size="sm" variant="destructive" className="flex-1 bg-red-600 hover:bg-red-700 text-white border border-red-600" onClick={() => {
                              try {
                                const raw = window.localStorage.getItem('technician_requests');
                                const list = raw ? JSON.parse(raw) : [];
                                const next = list.map((x:any)=> x.id===pp.id ? { ...x, status: 'rejected' } : x);
                                window.localStorage.setItem('technician_requests', JSON.stringify(next));
                                setProposals((prev)=> prev.map((x:any)=> x.id===pp.id ? { ...x, status: 'rejected' } : x));
                                // Notify technician about rejection
                                try {
                                  const nraw = window.localStorage.getItem('app_notifications');
                                  const nlist = nraw ? JSON.parse(nraw) : [];
                                  const numLocale = locale==='ar' ? 'ar-EG' : 'en-US';
                                  const title = locale==='ar' ? 'تم رفض عرضك' : 'Your proposal was rejected';
                                  const desc = locale==='ar'
                                    ? `تم رفض عرضك بقيمة ${currency} ${Number(pp.price||0).toLocaleString(numLocale)} لمدة ${Number(pp.days||0)} يوم`
                                    : `Your offer of ${currency} ${Number(pp.price||0).toLocaleString(numLocale)} for ${Number(pp.days||0)} days was rejected`;
                                  const notif = {
                                    id: `ntf_${Date.now()}`,
                                    type: 'proposal-status',
                                    recipientId: pp.technicianId,
                                    recipientRole: 'technician',
                                    title,
                                    desc,
                                    createdAt: new Date().toISOString(),
                                    meta: { targetType: 'service', targetId: (service as any)?.id, proposalId: pp.id, status: 'rejected' }
                                  };
                                  const combined = Array.isArray(nlist) ? [notif, ...nlist] : [notif];
                                  window.localStorage.setItem('app_notifications', JSON.stringify(combined));
                                } catch {}
                              } catch {}
                            }}>
                              <X className="w-4 h-4 ml-1" /> {locale === 'ar' ? 'رفض' : 'Reject'}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer setCurrentPage={setCurrentPage as any} />
    </div>
  );
}
