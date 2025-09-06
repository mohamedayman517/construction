import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Eye } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import type { RouteContext } from "../../components/routerTypes";
import { getUsers } from "../../lib/authMock";
import { listVendorServices } from "@/services/servicesCatalog";

type Props = Partial<RouteContext>;

export default function VendorServices({ setCurrentPage, ...context }: Props) {
  const { locale } = useTranslation();
  const currency = locale === "ar" ? "ر.س" : "SAR";
  // Safe navigation fallback to avoid undefined setter issues
  const safeSetCurrentPage = setCurrentPage ?? (() => {});

  const [userServices, setUserServices] = useState<any[]>([]);
  const [techRequests, setTechRequests] = useState<any[]>([]);
  const vendorId = (context as any)?.user?.id;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      // try backend first
      try {
        const { ok, data } = await listVendorServices({ vendorId: 'me' });
        if (ok && Array.isArray(data) && !cancelled) {
          setUserServices(data as any[]);
          return;
        }
      } catch {}
      // fallback to local storage
      try {
        if (typeof window === "undefined") return;
        const raw = window.localStorage.getItem("user_services");
        const list = raw ? JSON.parse(raw) : [];
        if (Array.isArray(list)) {
          const filtered = vendorId ? list.filter((s:any)=> String(s.userId) === String(vendorId)) : list;
          if (!cancelled) setUserServices(filtered);
        }
      } catch {}
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Load technician requests (applications) to vendor services
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = window.localStorage.getItem("technician_requests");
      const list = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list)) setTechRequests(list.filter((x:any)=> x?.targetType === 'service'));
    } catch {}
  }, []);

  const techNameById = (id: string | number) => {
    try {
      const users = getUsers();
      const u = users.find(u => String(u.id) === String(id));
      return u?.name || `#${id}`;
    } catch { return `#${id}`; }
  };

  const labelForServiceType = (id: string) => {
    const map: any = {
      plumber: { ar: "سباك", en: "Plumber" },
      electrician: { ar: "كهربائي", en: "Electrician" },
      carpenter: { ar: "نجار", en: "Carpenter" },
      painter: { ar: "نقاش", en: "Painter" },
      gypsum_installer: { ar: "فني تركيب جيبس بورد", en: "Gypsum Board Installer" },
      marble_installer: { ar: "فني تركيب رخام", en: "Marble Installer" },
    };
    return map[id]?.[locale === "ar" ? "ar" : "en"] || id;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header currentPage="vendor-services" setCurrentPage={safeSetCurrentPage} {...context} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{locale === 'ar' ? 'خدماتي' : 'My Services'}</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => safeSetCurrentPage('vendor-dashboard')}>
              {locale === 'ar' ? 'لوحة التاجر' : 'Vendor Dashboard'}
            </Button>
            <Button onClick={() => safeSetCurrentPage('add-service')}>
              {locale === 'ar' ? 'إضافة خدمة' : 'Add Service'}
            </Button>
            <Button variant="secondary" onClick={() => safeSetCurrentPage('vendor-service-applicants')}>
              {locale === 'ar' ? 'عرض المتقدمين' : 'View Applicants'}
            </Button>
          </div>
        </div>

        {userServices.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-muted-foreground">
              {locale === 'ar' ? 'لا توجد خدمات بعد.' : 'No services yet.'}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userServices.map((s:any) => (
              <Card key={s.id}>
                <CardHeader>
                  <CardTitle className="text-base">{labelForServiceType(s.type)}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="text-muted-foreground">
                    {locale === 'ar' ? 'اليومية' : 'Daily wage'}: {currency} {Number(s.dailyWage || 0).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                  </div>
                  <div className="text-muted-foreground">
                    {locale === 'ar' ? 'الأيام' : 'Days'}: {Number(s.days || 0)}
                  </div>
                  <div className="font-semibold">
                    {currency} {Number(s.total || 0).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                  </div>
                  {!!s.description && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.description}</div>
                  )}
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Vendor should navigate to the public ServiceDetails page
                        try { window.localStorage.setItem('selected_service_id', String(s.id)); } catch {}
                        safeSetCurrentPage('service-details');
                      }}
                    >
                      {locale === 'ar' ? 'تفاصيل' : 'Details'}
                    </Button>
                  </div>
                  {/* Technician applicants */}
                  {(() => {
                    const applicants = techRequests.filter((x:any)=> String(x.serviceId) === String(s.id));
                    if (applicants.length === 0) {
                      return (
                        <div className="mt-3 text-xs text-muted-foreground">
                          {locale === 'ar' ? 'لا يوجد متقدمون بعد.' : 'No applicants yet.'}
                        </div>
                      );
                    }
                    return (
                      <div className="mt-3">
                        <div className="text-sm font-medium mb-2">
                          {locale === 'ar' ? 'المتقدمون' : 'Applicants'} ({applicants.length})
                        </div>
                        <div className="space-y-2 max-h-40 overflow-auto pr-1">
                          {applicants.map((a:any) => (
                            <div key={a.id} className="rounded border p-2 bg-muted/20">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-xs">{techNameById(a.technicianId)}</div>
                                <div className="text-xs text-muted-foreground">
                                  {currency} {Number(a.price || 0).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')} • {locale==='ar' ? `${Number(a.days||0)} يوم` : `${Number(a.days||0)} days`}
                                </div>
                              </div>
                              {!!a.message && (
                                <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{a.message}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer setCurrentPage={safeSetCurrentPage} />
    </div>
  );
}
