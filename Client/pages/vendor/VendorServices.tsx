import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Eye } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import type { RouteContext } from "../../components/routerTypes";
import { listVendorServices } from "@/services/servicesCatalog";

type Props = Partial<RouteContext>;

export default function VendorServices({ setCurrentPage, ...context }: Props) {
  const { locale } = useTranslation();
  const currency = locale === "ar" ? "ر.س" : "SAR";
  // Safe navigation fallback to avoid undefined setter issues
  const safeSetCurrentPage = setCurrentPage ?? (() => {});

  const [userServices, setUserServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { ok, data } = await listVendorServices({ vendorId: 'me' });
        if (ok && Array.isArray(data) && !cancelled) setUserServices(data as any[]);
      } catch {}
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);


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
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{labelForServiceType(s.type)}</CardTitle>
                    <Badge className={!s.isApproved ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}>
                      {locale === 'ar' ? (!s.isApproved ? 'قيد المراجعة' : 'معتمد') : (!s.isApproved ? 'Pending' : 'Approved')}
                    </Badge>
                  </div>
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
                  {!s.isApproved && (
                    <div className="text-xs text-muted-foreground">
                      {locale === 'ar' ? 'هذه الخدمة بانتظار موافقة الأدمن قبل ظهورها للجمهور.' : 'This service is pending admin approval before it appears publicly.'}
                    </div>
                  )}
                  {/* Applicants section removed - dynamic only via backend if needed */}
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
