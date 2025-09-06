import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import type { RouteContext } from '../../components/routerTypes';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Separator } from '../../components/ui/separator';
import { Package, Layers, Ruler, Boxes, ClipboardList, Calendar, Send, ArrowRight, Info } from 'lucide-react';

interface Props extends Partial<RouteContext> {}

export default function VendorProjectDetails({ setCurrentPage, ...context }: Props) {
  const { locale } = useTranslation();
  const currency = locale === 'ar' ? 'ر.س' : 'SAR';

  const [project, setProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [offerPrice, setOfferPrice] = useState<string>('');
  const [offerDays, setOfferDays] = useState<string>('');
  const [offerMessage, setOfferMessage] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);
  const [myProposal, setMyProposal] = useState<any | null>(null);

  const labelForProductType = (id?: string) => {
    if (!id) return '';
    const map: any = {
      door: { ar: 'باب', en: 'Door' },
      window: { ar: 'شباك', en: 'Window' },
      railing: { ar: 'دربزين', en: 'Railing' },
    };
    return map[id]?.[locale === 'ar' ? 'ar' : 'en'] || id;
  };
  const labelForMaterial = (id?: string) => {
    if (!id) return '';
    const map: any = {
      aluminum: { ar: 'ألمنيوم', en: 'Aluminum' },
      steel: { ar: 'صاج', en: 'Steel' },
      laser: { ar: 'ليزر', en: 'Laser-cut' },
      glass: { ar: 'سكريت', en: 'Glass (Securit)' },
    };
    return map[id]?.[locale === 'ar' ? 'ar' : 'en'] || id;
  };

  // Load selected project id from localStorage
  useEffect(() => {
    try {
      const id = localStorage.getItem('selected_vendor_project_id');
      const raw = localStorage.getItem('user_projects');
      if (!id || !raw) return;
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        const found = list.find((p: any) => String(p.id) === String(id));
        setProject(found || null);
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  // Check if current vendor already submitted a proposal for this project
  useEffect(() => {
    try {
      if (!project) { setHasSubmitted(false); return; }
      const vendorId = (context as any)?.user?.id;
      const raw = window.localStorage.getItem('vendor_proposals');
      const list = raw ? JSON.parse(raw) : [];
      const exists = Array.isArray(list)
        ? list.some((x:any) => x.targetType==='project' && String(x.targetId)===String(project.id) && (!!vendorId ? x.vendorId===vendorId : true))
        : false;
      setHasSubmitted(exists);
      if (Array.isArray(list) && vendorId) {
        const mine = list.find((x:any) => x.targetType==='project' && String(x.targetId)===String(project.id) && x.vendorId===vendorId);
        setMyProposal(mine || null);
        if (mine && !editingProposalId) setEditingProposalId(String(mine.id));
      } else {
        setMyProposal(null);
        setEditingProposalId(null);
      }
    } catch { setHasSubmitted(false); }
  }, [project, (context as any)?.user?.id]);

  const itemsArray = useMemo(() => Array.isArray(project?.items) ? project!.items : [], [project]);

  // Compute customer's baseline total (minimum acceptable price)
  const baseTotal: number = useMemo(() => {
    const p: any = project;
    if (!p) return 0;
    if (typeof p.total === 'number') return Math.max(0, Number(p.total));
    const area = Math.max(0, Number(p.width || 0)) * Math.max(0, Number(p.height || 0));
    const accessoriesCost = Array.isArray(p.accessories)
      ? p.accessories.map((a: any) => Number(a?.price || 0)).reduce((a: number, b: number) => a + b, 0)
      : 0;
    const pricePerM = Number(p.pricePerMeter || 0);
    const qty = Math.max(1, Number(p.quantity || 1));
    const subtotalOne = (area * pricePerM) + accessoriesCost;
    return Math.max(0, Math.round(subtotalOne * qty));
  }, [project]);

  const minPrice = baseTotal;
  const maxPrice = Math.max(minPrice, minPrice * 2);
  const formatMoney = (n: number) => {
    try { return n.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US'); } catch { return String(n); }
  };

  const back = () => setCurrentPage && setCurrentPage('vendor-projects');

  return (
    <div className="min-h-screen bg-background" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <Header {...context} />

      <div className="container mx-auto px-4 py-8">
        {loading && (
          <Card className="max-w-3xl mx-auto animate-pulse">
            <CardContent className="p-6 space-y-4">
              <div className="h-6 w-40 bg-muted rounded" />
              <div className="h-24 bg-muted rounded" />
            </CardContent>
          </Card>
        )}

        {!loading && !project && (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Info className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium">{locale==='ar' ? 'لا توجد تفاصيل متاحة لهذا المشروع.' : 'No details available for this project.'}</p>
              <div className="pt-1">
                <Button onClick={back} className="inline-flex items-center gap-1">
                  {locale==='ar' ? 'رجوع للمشاريع' : 'Back to Projects'} <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && project && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main details */}
            <Card className="lg:col-span-2 overflow-hidden shadow-sm">
              <div className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="w-6 h-6 text-primary" />
                    <h1 className="text-2xl font-bold">{locale==='ar' ? 'تفاصيل المشروع' : 'Project Details'}</h1>
                  </div>
                </div>

                {/* Quick summary chips */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {!!(project.ptype || project.type) && (
                    <Badge variant="outline" className="rounded-full text-xs">
                      {labelForProductType(project.ptype || project.type)}
                    </Badge>
                  )}
                  {!!project.material && (
                    <Badge variant="outline" className="rounded-full text-xs">{labelForMaterial(project.material)}</Badge>
                  )}
                  <Badge variant="outline" className="rounded-full text-xs">
                    {(project.width||0)} × {(project.height||0)} m
                  </Badge>
                  <Badge variant="outline" className="rounded-full text-xs">
                    {locale==='ar' ? `الكمية: ${project.quantity||0}` : `Quantity: ${project.quantity||0}`}
                  </Badge>
                  {Number(project?.days) > 0 && (
                    <Badge variant="outline" className="rounded-full text-xs">
                      {locale==='ar' ? `الأيام: ${project.days}` : `Days: ${project.days}`}
                    </Badge>
                  )}
                </div>
              </div>
              <CardContent className="p-6 space-y-6">
                {/* Info grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg border p-4 bg-background shadow-sm">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Package className="w-4 h-4" /> {locale==='ar' ? 'نوع المنتج' : 'Product Type'}
                    </div>
                    <div className="mt-1 font-medium">{labelForProductType(project.ptype || project.type) || '-'}</div>
                  </div>
                  <div className="rounded-lg border p-4 bg-background shadow-sm">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Layers className="w-4 h-4" /> {locale==='ar' ? 'الخامة' : 'Material'}
                    </div>
                    <div className="mt-1 font-medium">{labelForMaterial(project.material) || '-'}</div>
                  </div>
                  <div className="rounded-lg border p-4 bg-background shadow-sm">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Ruler className="w-4 h-4" /> {locale==='ar' ? 'الأبعاد (متر)' : 'Dimensions (m)'}
                    </div>
                    <div className="mt-1 font-medium">{(project.width||0)} × {(project.height||0)}<span className="text-muted-foreground text-xs ms-1">m</span></div>
                  </div>
                  <div className="rounded-lg border p-4 bg-background shadow-sm">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Boxes className="w-4 h-4" /> {locale==='ar' ? 'الكمية' : 'Quantity'}
                    </div>
                    <div className="mt-1 font-medium">{project.quantity || 0}</div>
                  </div>
                  <div className="rounded-lg border p-4 bg-background shadow-sm">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> {locale==='ar' ? 'المدة (أيام)' : 'Duration (days)'}
                    </div>
                    <div className="mt-1 font-medium">{Number(project?.days) > 0 ? project.days : '-'}</div>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">{locale==='ar' ? 'الوصف' : 'Description'}</div>
                  {project.description ? (
                    <div className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/30 border rounded-md p-3">
                      {project.description}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">{locale==='ar' ? 'لا يوجد وصف مضاف.' : 'No description provided.'}</div>
                  )}
                </div>

                {/* Additional items */}
                {itemsArray.length > 0 && (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      {locale==='ar' ? 'عناصر إضافية ضمن هذا المشروع' : 'Additional items in this project'}
                    </div>
                    <div className="space-y-4">
                      {itemsArray.map((it: any, idx: number) => (
                        <div key={it?.id || idx} className="rounded-lg border p-4 bg-background shadow-sm">
                          {!!(it?.ptype || it?.type) && (
                            <div className="text-sm font-medium mb-2">
                              {locale==='ar' ? 'النوع: ' : 'Type: '} {labelForProductType(it?.ptype || it?.type)}
                            </div>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div>
                              <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Ruler className="w-4 h-4" /> {locale==='ar' ? 'الأبعاد (متر)' : 'Dimensions (m)'}
                              </div>
                              <div className="mt-1 font-medium">{(it?.width||0)} × {(it?.height||0)}<span className="text-muted-foreground text-xs ms-1">m</span></div>
                            </div>
                            <div>
                              <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Boxes className="w-4 h-4" /> {locale==='ar' ? 'الكمية' : 'Quantity'}
                              </div>
                              <div className="mt-1 font-medium">{it?.quantity || 0}</div>
                            </div>
                            <div>
                              <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> {locale==='ar' ? 'المدة (أيام)' : 'Duration (days)'}
                              </div>
                              <div className="mt-1 font-medium">{Number(it?.days) > 0 ? it.days : '-'}</div>
                            </div>
                            <div>
                              <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <ClipboardList className="w-4 h-4" /> {locale==='ar' ? 'سعر المتر المربع' : 'Price per m²'}
                              </div>
                              <div className="mt-1 font-medium">{it?.pricePerMeter || 0} {currency}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sidebar: submit proposal */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{locale==='ar' ? 'صاحب الطلب' : 'Customer'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    {(project?.customerName || project?.userName || project?.user?.name) || (locale==='ar' ? 'غير معروف' : 'Unknown')}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{isEditing ? (locale==='ar' ? 'تعديل عرضي' : 'Edit My Offer') : (hasSubmitted ? (locale==='ar' ? 'تم الإرسال' : 'Submitted') : (locale==='ar' ? 'تقديم عرض' : 'Submit Proposal'))}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hasSubmitted && !isEditing ? (
                    <div className="space-y-3 text-sm">
                      {myProposal ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">{locale==='ar' ? 'السعر المقدم' : 'Submitted Price'}</span>
                            <span className="font-semibold">{currency} {formatMoney(Number(myProposal.price||0))}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">{locale==='ar' ? 'الأيام' : 'Days'}</span>
                            <span className="font-semibold">{Number(myProposal.days||0)}</span>
                          </div>
                          {!!myProposal.message && (
                            <div className="text-muted-foreground whitespace-pre-wrap">{myProposal.message}</div>
                          )}
                        </>
                      ) : null}
                      <div className="pt-2">
                        <Button className="w-full" variant="outline" onClick={() => {
                          const p = myProposal;
                          if (p) {
                            setOfferPrice(String(p.price ?? ''));
                            setOfferDays(String(p.days ?? ''));
                            setOfferMessage(String(p.message ?? ''));
                            setEditingProposalId(String(p.id));
                          }
                          setIsEditing(true);
                        }}>
                          {locale==='ar' ? 'تعديل عرضي' : 'Edit my offer'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-2">
                        <label className="text-sm">{locale==='ar' ? 'السعر المقترح' : 'Proposed Price'}</label>
                        <Input
                          type="number"
                          inputMode="decimal"
                          min={minPrice || 0}
                          max={maxPrice || undefined}
                          placeholder={locale==='ar'
                            ? `الحد الأدنى: ${currency} ${formatMoney(minPrice)} • الحد الأقصى: ${currency} ${formatMoney(maxPrice)}`
                            : `Min: ${currency} ${formatMoney(minPrice)} • Max: ${currency} ${formatMoney(maxPrice)}`}
                          value={offerPrice}
                          onChange={(e)=> setOfferPrice(e.target.value)}
                        />
                        {(() => {
                          const v = Number(offerPrice);
                          const invalid = offerPrice !== '' && (!isFinite(v) || v < (minPrice||0) || v > (maxPrice||Number.POSITIVE_INFINITY));
                          if (invalid) {
                            return (
                              <span className="text-xs text-red-600">
                                {locale==='ar'
                                  ? `السعر يجب أن يكون بين ${currency} ${formatMoney(minPrice)} و ${currency} ${formatMoney(maxPrice)}`
                                  : `Price must be between ${currency} ${formatMoney(minPrice)} and ${currency} ${formatMoney(maxPrice)}`}
                              </span>
                            );
                          }
                          return (
                            <span className="text-xs text-muted-foreground">
                              {locale==='ar'
                                ? `يمكنك تقديم عرض بين ${currency} ${formatMoney(minPrice)} و ${currency} ${formatMoney(maxPrice)}`
                                : `You can offer between ${currency} ${formatMoney(minPrice)} and ${currency} ${formatMoney(maxPrice)}`}
                            </span>
                          );
                        })()}
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm">{locale==='ar' ? 'المدة (أيام)' : 'Duration (days)'}</label>
                        <Input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={Number(project?.days) > 0 ? Number(project?.days) : undefined}
                          placeholder={Number(project?.days) > 0
                            ? (locale==='ar' ? `من 1 إلى ${Number(project?.days)} يوم` : `From 1 to ${Number(project?.days)} days`)
                            : (locale==='ar' ? 'أقل قيمة: 1 يوم' : 'Minimum: 1 day')}
                          value={offerDays}
                          onChange={(e)=>setOfferDays(e.target.value)}
                        />
                        {(() => {
                          const v = Number(offerDays);
                          const maxD = Number(project?.days) > 0 ? Number(project?.days) : Infinity;
                          const invalid = offerDays !== '' && (!Number.isFinite(v) || v < 1 || v > maxD);
                          if (invalid) {
                            return (
                              <span className="text-xs text-red-600">
                                {Number.isFinite(maxD)
                                  ? (locale==='ar' ? `عدد الأيام يجب أن يكون بين 1 و ${maxD}` : `Days must be between 1 and ${maxD}`)
                                  : (locale==='ar' ? 'عدد الأيام يجب ألا يقل عن 1' : 'Days must be at least 1')}
                              </span>
                            );
                          }
                          return (
                            <span className="text-xs text-muted-foreground">
                              {Number(project?.days) > 0
                                ? (locale==='ar' ? `لا يمكن تجاوز ${Number(project?.days)} يوم` : `Cannot exceed ${Number(project?.days)} days`)
                                : (locale==='ar' ? 'أقل مدة مسموحة هي يوم واحد' : 'Minimum allowed duration is 1 day')}
                            </span>
                          );
                        })()}
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm">{locale==='ar' ? 'رسالة' : 'Message'}</label>
                        <Textarea rows={4} placeholder={locale==='ar' ? 'عرّف بنفسك وقدّم تفاصيل العرض' : 'Introduce yourself and provide details of your offer'} value={offerMessage} onChange={(e)=>setOfferMessage(e.target.value)} />
                      </div>
                      <Button
                        className="w-full"
                        disabled={(() => {
                          if (saving || !project) return true;
                          const vP = Number(offerPrice);
                          const vD = Number(offerDays);
                          const validP = offerPrice !== '' && isFinite(vP) && vP >= (minPrice||0) && vP <= (maxPrice||Number.POSITIVE_INFINITY);
                          const maxD = Number(project?.days) > 0 ? Number(project?.days) : Infinity;
                          const validD = offerDays !== '' && Number.isFinite(vD) && vD >= 1 && vD <= maxD;
                          return !(validP && validD);
                        })()}
                        onClick={() => {
                          if (!project) return;
                          // Strict validation (no clamping)
                          const vP = Number(offerPrice);
                          const vD = Number(offerDays);
                          if (!isFinite(vP) || vP < (minPrice||0) || vP > (maxPrice||Number.POSITIVE_INFINITY)) {
                            Swal.fire({
                              icon: 'error',
                              title: locale==='ar' ? 'قيمة السعر غير صحيحة' : 'Invalid price',
                              text: locale==='ar'
                                ? `يجب أن يكون السعر بين ${currency} ${formatMoney(minPrice)} و ${currency} ${formatMoney(maxPrice)}`
                                : `Price must be between ${currency} ${formatMoney(minPrice)} and ${currency} ${formatMoney(maxPrice)}`,
                            });
                            return;
                          }
                          const maxD = Number(project?.days) > 0 ? Number(project?.days) : Infinity;
                          if (!Number.isFinite(vD) || vD < 1 || vD > maxD) {
                            Swal.fire({
                              icon: 'error',
                              title: locale==='ar' ? 'قيمة الأيام غير صحيحة' : 'Invalid days',
                              text: Number.isFinite(maxD)
                                ? (locale==='ar' ? `عدد الأيام يجب أن يكون بين 1 و ${maxD}` : `Days must be between 1 and ${maxD}`)
                                : (locale==='ar' ? 'عدد الأيام يجب ألا يقل عن 1' : 'Days must be at least 1'),
                            });
                            return;
                          }
                          try {
                            setSaving(true);
                            const raw = window.localStorage.getItem('vendor_proposals');
                            const list = raw ? JSON.parse(raw) : [];
                            if (isEditing && editingProposalId && Array.isArray(list)) {
                              const next = list.map((x:any)=> x.id===editingProposalId ? { ...x, price: vP, days: vD, message: offerMessage || '' } : x);
                              window.localStorage.setItem('vendor_proposals', JSON.stringify(next));
                              setMyProposal((prev:any)=> prev ? { ...prev, price: vP, days: vD, message: offerMessage || '' } : prev);
                              setIsEditing(false);
                              Swal.fire({ icon: 'success', title: locale==='ar' ? 'تم تحديث العرض' : 'Offer updated', timer: 1600, showConfirmButton: false });
                            } else {
                              const proposal = {
                                id: `prop_${Date.now()}`,
                                targetType: 'project' as const,
                                targetId: project.id,
                                targetSnapshot: project,
                                price: vP,
                                days: vD,
                                message: offerMessage,
                                vendorId: (context as any)?.user?.id || null,
                                status: 'pending',
                                createdAt: new Date().toISOString(),
                              };
                              // final guard to avoid duplicates
                              const exists = Array.isArray(list) && list.some((x:any)=> x.targetType==='project' && String(x.targetId)===String(project.id) && x.vendorId === ((context as any)?.user?.id || null));
                              if (!exists) list.push(proposal);
                              window.localStorage.setItem('vendor_proposals', JSON.stringify(list));
                              setHasSubmitted(true);
                              setMyProposal(proposal);
                              setEditingProposalId(String(proposal.id));
                              // Create notification to project owner
                              try {
                                const recipientId = project.userId || project.user?.id || null;
                                const vendorName = (context as any)?.user?.name || (context as any)?.user?.username || (context as any)?.user?.email || (locale==='ar' ? 'بائع' : 'Vendor');
                                const title = locale==='ar' ? 'تم تقديم عرض على مشروعك' : 'New proposal on your project';
                                const numLocale = locale==='ar' ? 'ar-EG' : 'en-US';
                                const desc = locale==='ar'
                                  ? `${vendorName} قدّم عرضًا بقيمة ${currency} ${Number(offerPrice).toLocaleString(numLocale)} لمدة ${Number(offerDays)} يوم`
                                  : `${vendorName} submitted an offer of ${currency} ${Number(offerPrice).toLocaleString(numLocale)} for ${Number(offerDays)} days`;
                                const nraw = window.localStorage.getItem('app_notifications');
                                const nlist = nraw ? JSON.parse(nraw) : [];
                                const notif = {
                                  id: `ntf_${Date.now()}`,
                                  type: 'proposal',
                                  recipientId,
                                  recipientRole: 'user',
                                  title,
                                  desc,
                                  createdAt: new Date().toISOString(),
                                  meta: { targetType: 'project', targetId: project.id }
                                };
                                const combined = Array.isArray(nlist) ? [notif, ...nlist] : [notif];
                                window.localStorage.setItem('app_notifications', JSON.stringify(combined));
                              } catch {}
                              Swal.fire({ icon: 'success', title: locale==='ar' ? 'تم إرسال العرض' : 'Proposal Sent', timer: 1800, showConfirmButton: false });
                            }
                          } finally {
                            setSaving(false);
                          }
                        }}
                      >
                        <Send className="mr-2 h-4 w-4" /> {saving ? (locale==='ar' ? 'جارٍ الحفظ...' : 'Saving...') : (isEditing ? (locale==='ar' ? 'حفظ التعديلات' : 'Save Changes') : (locale==='ar' ? 'إرسال العرض' : 'Send Proposal'))}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Footer setCurrentPage={setCurrentPage as any} />
    </div>
  );
}
