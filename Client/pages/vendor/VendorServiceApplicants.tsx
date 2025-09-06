import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import type { RouteContext } from "../../components/routerTypes";
import { useTranslation } from "../../hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { getUsers } from "../../lib/authMock";
import Swal from "sweetalert2";

interface Props extends Partial<RouteContext> {}

export default function VendorServiceApplicants({ setCurrentPage, ...context }: Props) {
  const { locale } = useTranslation();
  const isAr = locale === "ar";
  const currency = isAr ? "ر.س" : "SAR";
  const vendorId = (context as any)?.user?.id || null;

  const [services, setServices] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const sRaw = window.localStorage.getItem('user_services');
      const allServices = sRaw ? JSON.parse(sRaw) : [];
      const rRaw = window.localStorage.getItem('technician_requests');
      const allReqs = rRaw ? JSON.parse(rRaw) : [];
      const filteredServices = Array.isArray(allServices)
        ? (vendorId ? allServices.filter((s:any)=> String(s.userId) === String(vendorId)) : allServices)
        : [];
      const filteredReqs = Array.isArray(allReqs)
        ? allReqs.filter((r:any)=> r?.targetType === 'service')
        : [];
      setServices(filteredServices);
      setRequests(filteredReqs);
    } catch {}
  }, [vendorId]);

  const users = useMemo(()=>{
    try { return getUsers(); } catch { return []; }
  }, []);

  const techName = (id: any) => users.find((u:any)=> String(u.id)===String(id))?.name || `#${id}`;

  const labelForServiceType = (id?: string) => {
    const map: any = {
      plumber: { ar: "سباك", en: "Plumber" },
      electrician: { ar: "كهربائي", en: "Electrician" },
      carpenter: { ar: "نجار", en: "Carpenter" },
      painter: { ar: "نقاش", en: "Painter" },
      gypsum_installer: { ar: "فني تركيب جيبس بورد", en: "Gypsum Board Installer" },
      marble_installer: { ar: "فني تركيب رخام", en: "Marble Installer" },
    };
    if (!id) return isAr ? 'خدمة' : 'Service';
    return map[id]?.[isAr ? 'ar' : 'en'] || id;
  };

  // Group requests by serviceId but keep a flat list too
  const requestsByService = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const r of requests) {
      const key = String(r.serviceId);
      if (!map[key]) map[key] = [];
      map[key].push(r);
    }
    return map;
  }, [requests]);

  const myServiceIds = new Set(services.map((s:any)=> String(s.id)));
  const myRequests = useMemo(()=> requests.filter((r:any)=> myServiceIds.has(String(r.serviceId))), [requests, services]);

  const updateStatus = async (reqId: string, status: 'accepted' | 'rejected') => {
    const confirmText = status === 'accepted' ? (isAr ? 'قبول هذا المتقدم؟' : 'Accept this applicant?') : (isAr ? 'رفض هذا المتقدم؟' : 'Reject this applicant?');
    const ok = await Swal.fire({ title: confirmText, icon: 'question', showCancelButton: true, confirmButtonText: isAr ? 'تأكيد' : 'Confirm', cancelButtonText: isAr ? 'إلغاء' : 'Cancel' });
    if (!ok.isConfirmed) return;
    try {
      const raw = window.localStorage.getItem('technician_requests');
      const list = raw ? JSON.parse(raw) : [];
      const next = Array.isArray(list) ? list.map((x:any)=> x.id===reqId ? { ...x, status } : x) : [];
      window.localStorage.setItem('technician_requests', JSON.stringify(next));
      // Refresh in-memory state
      setRequests(next.filter((r:any)=> r?.targetType==='service'));
      Swal.fire({ icon: 'success', title: status==='accepted' ? (isAr ? 'تم القبول' : 'Accepted') : (isAr ? 'تم الرفض' : 'Rejected'), timer: 1200, showConfirmButton: false });
    } catch {}
  };

  return (
    <div className="min-h-screen bg-background">
      <Header {...context} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{isAr ? 'المتقدمون على الخدمات' : 'Service Applicants'}</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={()=> setCurrentPage && setCurrentPage('vendor-services')}>
              {isAr ? 'خدماتي' : 'My Services'}
            </Button>
            <Button variant="outline" onClick={()=> setCurrentPage && setCurrentPage('vendor-dashboard')}>
              {isAr ? 'لوحة التاجر' : 'Vendor Dashboard'}
            </Button>
          </div>
        </div>

        {services.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-muted-foreground">
              {isAr ? 'لا توجد خدمات لعرض المتقدمين عليها.' : 'You have no services to show applicants for.'}
            </CardContent>
          </Card>
        ) : myRequests.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-muted-foreground">
              {isAr ? 'لا يوجد متقدمون حالياً.' : 'No applicants yet.'}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {services.map((s:any) => {
              const list = requestsByService[String(s.id)] || [];
              if (list.length === 0) return null;
              return (
                <Card key={s.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                      <span>{labelForServiceType(s.type)}</span>
                      {typeof s.days !== 'undefined' && (
                        <Badge variant="secondary">{isAr ? `${Number(s.days||0)} يوم` : `${Number(s.days||0)} days`}</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {list.map((r:any) => (
                        <div key={r.id} className="rounded border p-3 bg-muted/20">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm flex items-center gap-2">
                              <span>{techName(r.technicianId)}</span>
                              {r.status && (
                                <Badge variant="secondary" className={`text-[10px] ${r.status==='accepted' ? 'bg-green-100 text-green-700' : r.status==='rejected' ? 'bg-red-100 text-red-700' : ''}`}>
                                  {r.status==='accepted' ? (isAr ? 'مقبول' : 'Accepted') : r.status==='rejected' ? (isAr ? 'مرفوض' : 'Rejected') : (isAr ? 'قيد الانتظار' : 'Pending')}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {currency} {Number(r.price||0).toLocaleString(isAr?'ar-EG':'en-US')} • {isAr ? `${Number(r.days||0)} يوم` : `${Number(r.days||0)} days`}
                            </div>
                          </div>
                          {!!r.message && (
                            <div className="text-xs text-muted-foreground mt-1">{r.message}</div>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-[10px] text-muted-foreground">
                              {isAr ? 'تاريخ' : 'Date'}: {new Date(r.createdAt).toLocaleString(isAr?'ar-EG':'en-US')}
                            </div>
                            <div className="flex gap-2">
                              {r.status !== 'accepted' && (
                                <Button size="sm" onClick={()=> updateStatus(r.id, 'accepted')}>
                                  {isAr ? 'قبول' : 'Accept'}
                                </Button>
                              )}
                              {r.status !== 'rejected' && (
                                <Button size="sm" variant="ghost" className="text-red-600" onClick={()=> updateStatus(r.id, 'rejected')}>
                                  {isAr ? 'رفض' : 'Reject'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <Footer setCurrentPage={setCurrentPage as any} />
    </div>
  );
}
