"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { useTranslation } from "../../hooks/useTranslation";
import type { RouteContext } from "../../components/routerTypes";
import Swal from "sweetalert2";
import { listPublicServices } from "@/services/servicesCatalog";
import { createOffer, getTechnicianOffers, updateOffer } from "@/services/offers";

interface Props extends Partial<RouteContext> {}

export default function TechnicianServiceDetails({ setCurrentPage, ...context }: Props) {
  const { locale } = useTranslation();
  const isAr = locale === 'ar';
  const currency = isAr ? 'ر.س' : 'SAR';
  const technicianId = (context as any)?.user?.id || null;

  const [service, setService] = useState<any | null>(null);
  const [myOffers, setMyOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [offerPrice, setOfferPrice] = useState<string>("");
  const [offerDays, setOfferDays] = useState<string>("");
  const [offerMessage, setOfferMessage] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [myOffer, setMyOffer] = useState<any | null>(null);

  // Load selected service by id using backend public services
  useEffect(() => {
    (async () => {
      try {
        if (typeof window === 'undefined') { setLoading(false); return; }
        const id = window.localStorage.getItem('selected_technician_service_id') || window.localStorage.getItem('selected_service_id');
        if (!id) { setLoading(false); return; }
        const { ok, data } = await listPublicServices();
        if (ok && Array.isArray(data)) {
          const found = (data as any[]).find((s:any) => String(s.id) === String(id));
          setService(found || null);
        } else {
          setService(null);
        }
      } finally { setLoading(false); }
    })();
  }, []);

  // Load my offers and determine if submitted
  useEffect(() => {
    (async () => {
      try {
        if (!service || !technicianId) { setHasSubmitted(false); setMyOffers([]); return; }
        const { ok, data } = await getTechnicianOffers(String(technicianId));
        const offers = ok && Array.isArray(data) ? (data as any[]) : [];
        setMyOffers(offers);
        const exists = offers.some((o:any)=> String(o.targetType).toLowerCase()==='service' && String(o.serviceId)===String(service.id));
        setHasSubmitted(exists);
      } catch { setHasSubmitted(false); setMyOffers([]); }
    })();
  }, [service, technicianId]);

  // If we have an existing offer, preload for edit when requested later
  useEffect(() => {
    try {
      if (!service || !technicianId) { setEditingOfferId(null); setIsEditing(false); setMyOffer(null); return; }
      const offer = myOffers.find((o:any)=> String(o.targetType).toLowerCase()==='service' && String(o.serviceId)===String(service.id));
      if (offer) {
        setMyOffer(offer);
      } else {
        setMyOffer(null);
      }
    } catch { setMyOffer(null); }
  }, [service, technicianId, myOffers]);

  // Track my existing offer for this service based on backend-loaded offers
  useEffect(() => {
    try {
      if (!service || !technicianId) { setMyOffer(null); return; }
      const offer = myOffers.find((o:any)=> String(o.targetType).toLowerCase()==='service' && String(o.serviceId)===String(service.id));
      setMyOffer(offer || null);
      if (!editingOfferId && !isEditing && offer) setEditingOfferId(String(offer.id));
    } catch { setMyOffer(null); }
  }, [service, technicianId, hasSubmitted, myOffers, editingOfferId, isEditing]);

  const labelForServiceType = (t?: string) => {
    switch ((t || '').toLowerCase()) {
      case 'plumber':
        return isAr ? 'سباك' : 'Plumber';
      case 'electrician':
        return isAr ? 'كهربائي' : 'Electrician';
      case 'carpenter':
        return isAr ? 'نجار' : 'Carpenter';
      case 'painter':
        return isAr ? 'دهان' : 'Painter';
      case 'gypsum':
      case 'gypsum_installer':
        return isAr ? 'جبس' : 'Gypsum Installer';
      case 'marble':
      case 'marble_installer':
        return isAr ? 'رخام' : 'Marble Installer';
      default:
        return t || (isAr ? 'خدمة' : 'Service');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header currentPage="technician-service-details" setCurrentPage={setCurrentPage} {...context} />
        <div className="container mx-auto px-4 py-8">{isAr ? 'جارٍ التحميل...' : 'Loading...'}</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Header currentPage="technician-service-details" setCurrentPage={setCurrentPage} {...context} />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6 text-muted-foreground">{isAr ? 'تعذّر العثور على الخدمة.' : 'Service not found.'}</CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header currentPage="technician-service-details" setCurrentPage={setCurrentPage} {...context} />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{labelForServiceType(service.type)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="text-muted-foreground">{isAr ? 'الأجر اليومي' : 'Daily wage'}: {currency} {Number(service.dailyWage || 0).toLocaleString(isAr ? 'ar-EG' : 'en-US')}</div>
                <div className="text-muted-foreground">{isAr ? 'المدة (أيام)' : 'Duration (days)'}: {Number(service.days || 0)}</div>
                <div className="font-semibold">{currency} {Number(service.total || (Number(service.dailyWage||0)*Number(service.days||0))).toLocaleString(isAr ? 'ar-EG' : 'en-US')}</div>
                {!!service.description && <div className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{service.description}</div>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{isAr ? 'تفاصيل إضافية' : 'Additional Details'}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                {service.location && <div>{(isAr ? 'الموقع: ' : 'Location: ') + service.location}</div>}
                {service.phone && <div>{(isAr ? 'الهاتف: ' : 'Phone: ') + service.phone}</div>}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: submit request */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{isAr ? 'ملخص' : 'Summary'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{isAr ? 'القيمة التقديرية' : 'Estimated Value'}</span>
                  <span className="font-semibold">{currency} {Number(service.total || (Number(service.dailyWage||0)*Number(service.days||0))).toLocaleString(isAr ? 'ar-EG' : 'en-US')}</span>
                </div>
                <Separator />
                <div className="text-xs text-muted-foreground">{isAr ? 'يمكنك تقديم عرض لهذه الخدمة من خلال تعبئة الحقول أدناه.' : 'You can submit a proposal by filling the fields below.'}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{isEditing ? (isAr ? 'تعديل عرضي' : 'Edit My Offer') : (hasSubmitted ? (isAr ? 'تم الإرسال' : 'Submitted') : (isAr ? 'تقديم عرض' : 'Submit Proposal'))}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* If already submitted and not editing: hide form and show summary with edit button */}
                {hasSubmitted && !isEditing ? (
                  <div className="space-y-3 text-sm">
                    {myOffer ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">{isAr ? 'السعر المقدم' : 'Submitted Price'}</span>
                          <span className="font-semibold">{currency} {Number(myOffer.price || 0).toLocaleString(isAr ? 'ar-EG' : 'en-US')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">{isAr ? 'الأيام' : 'Days'}</span>
                          <span className="font-semibold">{Number(myOffer.days || 0)}</span>
                        </div>
                        {!!myOffer.message && (
                          <div className="text-muted-foreground whitespace-pre-wrap">
                            {myOffer.message}
                          </div>
                        )}
                      </>
                    ) : null}
                    <div className="pt-2">
                      <Button className="w-full" variant="outline" onClick={() => {
                        const offer = myOffer;
                        if (offer) {
                          setOfferPrice(String(offer.price ?? ''));
                          setOfferDays(String(offer.days ?? ''));
                          setOfferMessage(String(offer.message ?? ''));
                          setEditingOfferId(String(offer.id));
                        }
                        setIsEditing(true);
                      }}>
                        {isAr ? 'تعديل عرضي' : 'Edit my offer'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {(() => { return null; })()}
                <div className="grid gap-2">
                  <Label>{isAr ? 'السعر المقترح' : 'Proposed Price'}</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={offerPrice}
                    onChange={(e)=> setOfferPrice(e.target.value)}
                    min={Number((service?.total ?? service?.dailyWage) || 0)}
                    max={Number((((service?.total ?? service?.dailyWage) || 0) * 2))}
                    step="any"
                    placeholder={(() => {
                      const base = Number((service?.total ?? service?.dailyWage) || 0);
                      const min = base;
                      const max = base * 2;
                      const numLocale = isAr ? 'ar-EG' : 'en-US';
                      return isAr
                        ? `الحد الأدنى ${Number(min).toLocaleString(numLocale)} والحد الأقصى ${Number(max).toLocaleString(numLocale)}`
                        : `Min ${Number(min).toLocaleString(numLocale)} • Max ${Number(max).toLocaleString(numLocale)}`;
                    })()}
                  />
                  {(() => {
                    const base = Number((service?.total ?? service?.dailyWage) || 0);
                    const min = base;
                    const max = base * 2;
                    const v = Number(offerPrice);
                    const invalid = offerPrice !== '' && (!isFinite(v) || v < min || v > max);
                    if (!invalid) return null;
                    return (
                      <div className="text-xs text-red-600">
                        {isAr
                          ? `السعر يجب أن يكون بين ${currency} ${min.toLocaleString('ar-EG')} و ${currency} ${max.toLocaleString('ar-EG')}`
                          : `Price must be between ${currency} ${min.toLocaleString('en-US')} and ${currency} ${max.toLocaleString('en-US')}`}
                      </div>
                    );
                  })()}
                </div>
                <div className="grid gap-2">
                  <Label>{isAr ? 'المدة (أيام)' : 'Duration (days)'}</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={offerDays}
                    onChange={(e)=> setOfferDays(e.target.value)}
                    min={1}
                    max={Number(service?.days || undefined)}
                    placeholder={(() => {
                      const maxDays = Number(service?.days || 0);
                      return maxDays > 0
                        ? (isAr ? `بين 1 و ${maxDays}` : `Between 1 and ${maxDays}`)
                        : (isAr ? 'بحد أدنى 1' : 'Minimum 1');
                    })()}
                  />
                  {(() => {
                    const maxDays = Number(service?.days || Infinity);
                    const v = Number(offerDays);
                    const invalid = offerDays !== '' && (!Number.isFinite(v) || v < 1 || (Number.isFinite(maxDays) && v > maxDays));
                    if (!invalid) return null;
                    return (
                      <div className="text-xs text-red-600">
                        {Number.isFinite(maxDays)
                          ? (isAr ? `عدد الأيام يجب أن يكون بين 1 و ${maxDays}` : `Days must be between 1 and ${maxDays}`)
                          : (isAr ? 'عدد الأيام يجب ألا يقل عن 1' : 'Days must be at least 1')}
                      </div>
                    );
                  })()}
                </div>
                <div className="grid gap-2">
                  <Label>{isAr ? 'رسالة' : 'Message'}</Label>
                  <Input value={offerMessage} onChange={(e)=> setOfferMessage(e.target.value)} placeholder={isAr ? 'أدخل رسالة قصيرة' : 'Enter a short message'} />
                </div>
                <Button
                  className="w-full"
                  disabled={(() => {
                    if (saving) return true;
                    if (!isEditing && hasSubmitted) return true;
                    const base = Number((service?.total ?? service?.dailyWage) || 0);
                    const minP = base, maxP = base * 2;
                    const vP = Number(offerPrice);
                    const maxD = Number(service?.days || Infinity);
                    const vD = Number(offerDays);
                    const validP = offerPrice !== '' && isFinite(vP) && vP >= minP && vP <= maxP;
                    const validD = offerDays !== '' && Number.isFinite(vD) && vD >= 1 && (!Number.isFinite(maxD) || vD <= maxD);
                    return !(validP && validD);
                  })()}
                  onClick={() => {
                    if (!isEditing && hasSubmitted) {
                      Swal.fire({ icon: 'info', title: isAr ? 'تم الإرسال مسبقاً' : 'Already Submitted', text: isAr ? 'لا يمكنك إرسال عرض آخر لهذه الخدمة.' : 'You have already submitted a proposal for this service.' });
                      return;
                    }
                    if (!technicianId) {
                      Swal.fire({ icon: 'warning', title: isAr ? 'تسجيل الدخول مطلوب' : 'Login required', text: isAr ? 'الرجاء تسجيل الدخول كفني لتقديم العروض.' : 'Please log in as a technician to submit proposals.' });
                      return;
                    }
                    // Validate ranges
                    const basePrice = Number((service?.total ?? service?.dailyWage) || 0);
                    const minPrice = basePrice;
                    const maxPrice = basePrice * 2;
                    const priceNum = Number(offerPrice);
                    const daysNum = Number(offerDays);
                    const numLocale = isAr ? 'ar-EG' : 'en-US';
                    if (!isFinite(priceNum) || priceNum < minPrice || priceNum > maxPrice) {
                      Swal.fire({
                        icon: 'error',
                        title: isAr ? 'قيمة السعر غير صحيحة' : 'Invalid price',
                        text: isAr
                          ? `يجب أن يكون السعر بين ${currency} ${minPrice.toLocaleString(numLocale)} و ${currency} ${maxPrice.toLocaleString(numLocale)}`
                          : `Price must be between ${currency} ${minPrice.toLocaleString(numLocale)} and ${currency} ${maxPrice.toLocaleString(numLocale)}`,
                      });
                      return;
                    }
                    const maxDays = Number(service?.days || Infinity);
                    if (!Number.isFinite(daysNum) || daysNum < 1 || (Number.isFinite(maxDays) && daysNum > maxDays)) {
                      Swal.fire({
                        icon: 'error',
                        title: isAr ? 'قيمة الأيام غير صحيحة' : 'Invalid days',
                        text: Number.isFinite(maxDays)
                          ? (isAr ? `عدد الأيام يجب أن يكون بين 1 و ${maxDays}` : `Days must be between 1 and ${maxDays}`)
                          : (isAr ? 'عدد الأيام يجب ألا يقل عن 1' : 'Days must be at least 1'),
                      });
                      return;
                    }
                    (async () => {
                      try {
                        setSaving(true);
                        if (isEditing && myOffer && myOffer.id) {
                          const up = await updateOffer(Number(myOffer.id), { targetType: 'service', serviceId: Number(service.id), price: priceNum, days: daysNum, message: offerMessage || '' });
                          if (up.ok) {
                            setIsEditing(false);
                            // refresh offers
                            try {
                              if (technicianId) {
                                const { ok, data } = await getTechnicianOffers(String(technicianId));
                                if (ok && Array.isArray(data)) setMyOffers(data as any[]);
                              }
                            } catch {}
                            Swal.fire({ icon: 'success', title: isAr ? 'تم تحديث العرض' : 'Offer updated', timer: 1600, showConfirmButton: false });
                          }
                        } else {
                          const cr = await createOffer({ targetType: 'service', serviceId: Number(service.id), price: priceNum, days: daysNum, message: offerMessage || '' });
                          if (cr.ok) {
                            setHasSubmitted(true);
                            try {
                              if (technicianId) {
                                const { ok, data } = await getTechnicianOffers(String(technicianId));
                                if (ok && Array.isArray(data)) setMyOffers(data as any[]);
                              }
                            } catch {}
                            Swal.fire({ icon: 'success', title: isAr ? 'تم إرسال العرض' : 'Proposal submitted', timer: 1800, showConfirmButton: false });
                          }
                        }
                      } finally {
                        setSaving(false);
                      }
                    })();
                  }}
                >
                  {saving
                    ? (isAr ? 'جارٍ الحفظ...' : 'Saving...')
                    : isEditing
                      ? (isAr ? 'حفظ التعديلات' : 'Save Changes')
                      : (hasSubmitted ? (isAr ? 'تم الإرسال' : 'Submitted') : (isAr ? 'إرسال العرض' : 'Send Proposal'))}
                </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
