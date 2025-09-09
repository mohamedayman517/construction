import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import type { RouteContext } from '../components/routerTypes';
import { useTranslation } from '../hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Ruler, Package, Layers, Boxes, ClipboardList, Calendar, ArrowRight, Edit3, Info, Check, X, Send } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import Swal from 'sweetalert2';
import { getProjectById, getProjectBids, createBid, acceptBid, rejectBid, type BidDto } from '@/services/projects';

// Keep catalogs in sync with ProjectsBuilder/Projects
const productTypes = [
  { id: 'door', ar: 'باب', en: 'Door' },
  { id: 'window', ar: 'شباك', en: 'Window' },
  { id: 'railing', ar: 'دربزين', en: 'Railing' },
];
const materials = [
  { id: 'aluminum', ar: 'ألمنيوم', en: 'Aluminum' },
  { id: 'steel', ar: 'صاج', en: 'Steel' },
  { id: 'laser', ar: 'ليزر', en: 'Laser-cut' },
  { id: 'glass', ar: 'سكريت', en: 'Glass (Securit)' },
];
const accessoriesCatalog = [
  { id: 'brass_handle', ar: 'أوكرة نحاس', en: 'Brass Handle', price: 20 },
  { id: 'stainless_handle', ar: 'أوكرة سلستين', en: 'Stainless Handle', price: 15 },
  { id: 'aluminum_lock', ar: 'كالون الومنيوم', en: 'Aluminum Lock', price: 40 },
  { id: 'computer_lock', ar: 'قفل كمبيوتر', en: 'Computer Lock', price: 60 },
  { id: 'window_knob', ar: 'مقبض شباك', en: 'Window Knob', price: 20 },
];

interface ProjectDetailsProps extends Partial<RouteContext> {}

export default function ProjectDetails({ setCurrentPage, goBack, ...rest }: ProjectDetailsProps) {
  const { locale } = useTranslation();
  const currency = locale === 'ar' ? 'ر.س' : 'SAR';

  const [project, setProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<BidDto[]>([]);
  const currentUserId = (rest as any)?.user?.id ? String((rest as any).user.id) : '';
  const isLoggedIn = Boolean((rest as any)?.user);
  const isVendor = ((rest as any)?.user?.role === 'vendor');

  // Vendor proposal form state
  const [offerPrice, setOfferPrice] = useState<string>('');
  const [offerDays, setOfferDays] = useState<string>('');
  const [offerMessage, setOfferMessage] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);
  const [myProposal, setMyProposal] = useState<BidDto | null>(null);

  // Load selected project by id: backend first, then localStorage fallback
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (typeof window === 'undefined') return;
        const id = localStorage.getItem('selected_project_id');
        if (!id) { setLoading(false); return; }
        // Try backend first
        try {
          const { ok, data } = await getProjectById(Number(id));
          if (!cancelled && ok && data) {
            setProject(data as any);
          }
        } catch {}
        // Fallback to localStorage list if still null
        if (!cancelled && !project) {
          const raw = localStorage.getItem('user_projects');
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              const found = list.find((p: any) => String(p.id) === String(id));
              if (found) {
                // Vendor can view any project; non-vendor must be owner
                if (!isLoggedIn) {
                  setProject(null);
                } else if (isVendor) {
                  setProject(found || null);
                } else if (found && String(found.ownerId || '') === currentUserId) {
                  setProject(found);
                } else {
                  setProject(null);
                }
              }
            }
          }
        }
        // Load bids (merchant proposals) from backend
        try {
          const pid = Number(localStorage.getItem('selected_project_id') || '0');
          if (pid) {
            const r = await getProjectBids(pid);
            if (!cancelled && r.ok && Array.isArray(r.data)) setProposals(r.data as BidDto[]);
          }
        } catch {}
      } catch {}
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track if this vendor already submitted a proposal for this project
  useEffect(() => {
    try {
      if (!project || !isVendor) { setHasSubmitted(false); setMyProposal(null); return; }
      const vendorId = (rest as any)?.user?.id; // currently not used in filtering
      const mine = proposals.find((b:any)=> String(b.projectId)===String(project.id) && (!!vendorId ? true : true));
      setHasSubmitted(!!mine);
      setMyProposal(mine || null);
      if (mine && !editingProposalId) setEditingProposalId(String(mine.id));
    } catch { setHasSubmitted(false); setMyProposal(null); }
  }, [project, (rest as any)?.user?.id, isVendor, proposals, editingProposalId]);

  const typeLabel = useMemo(() => productTypes.find(pt => pt.id === (project?.ptype || project?.type))?.[locale==='ar'?'ar':'en'] || '', [project, locale]);
  const materialLabel = useMemo(() => materials.find(m => m.id === project?.material)?.[locale==='ar'?'ar':'en'] || '', [project, locale]);
  const accessoriesNames = useMemo(() => {
    if (!project) return [] as string[];
    if (Array.isArray(project.accessories)) return project.accessories.map((a: any)=> (locale==='ar'?a.ar:a.en));
    if (Array.isArray(project.selectedAcc)) return project.selectedAcc.map((id: string)=>{
      const acc = accessoriesCatalog.find(a=>a.id===id);
      return acc ? (locale==='ar'?acc.ar:acc.en) : null;
    }).filter(Boolean) as string[];
    return [] as string[];
  }, [project, locale]);

  // Derived values for summary/breakdown
  const area = useMemo(() => (project ? (Number(project.width)||0) * (Number(project.height)||0) : 0), [project]);
  const pricePerMeter = useMemo(() => (project ? (Number(project.pricePerMeter)||0) : 0), [project]);
  const quantity = useMemo(() => (project ? (Number(project.quantity)||0) : 0), [project]);
  const subtotal = useMemo(() => Math.max(0, area * pricePerMeter), [area, pricePerMeter]);
  const accessoriesCost = useMemo(() => {
    if (!project) return 0;
    if (Array.isArray(project.accessories)) return project.accessories.reduce((s: number, a: any) => s + (Number(a.price)||0), 0);
    if (Array.isArray(project.selectedAcc)) return project.selectedAcc.reduce((s: number, id: string) => {
      const acc = accessoriesCatalog.find(a=>a.id===id); return s + (acc?.price||0);
    }, 0);
    return 0;
  }, [project]);

  // Main item total based on current project values
  const mainItemTotal = useMemo(() => {
    const qty = Math.max(1, quantity || 0);
    return Math.max(0, Math.round((subtotal + accessoriesCost) * qty));
  }, [subtotal, accessoriesCost, quantity]);

  // Additional items helpers
  const itemsArray = useMemo(() => Array.isArray(project?.items) ? project!.items : [], [project]);
  const itemsCount = useMemo(() => itemsArray.length, [itemsArray]);
  const addItemsTotal = useMemo(() => itemsArray.reduce((s: number, it: any) => s + (Number(it?.total)||0), 0), [itemsArray]);

  // Baseline totals and helpers for vendor price validation
  const baseTotal: number = useMemo(() => {
    const p: any = project;
    if (!p) return 0;
    if (typeof p.total === 'number') return Math.max(0, Number(p.total));
    return Math.max(0, (mainItemTotal || 0) + (addItemsTotal || 0));
  }, [project, mainItemTotal, addItemsTotal]);
  const minPrice = baseTotal;
  const maxPrice = Math.max(minPrice, minPrice * 2);
  const formatMoney = (n: number) => {
    try { return n.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US'); } catch { return String(n); }
  };

  const handleEdit = () => {
    if (!project) return;
    try {
      const draft = {
        id: project.id,
        ptype: project.ptype || project.type || '',
        psubtype: project.psubtype || 'normal',
        material: project.material || '',
        color: project.color || 'white',
        width: project.width || 0,
        height: project.height || 0,
        quantity: project.quantity || 1,
        days: Number(project.days) || 1,
        selectedAcc: Array.isArray(project.selectedAcc)
          ? project.selectedAcc
          : Array.isArray(project.accessories)
            ? project.accessories.map((a:any)=>a?.id).filter(Boolean)
            : [],
        description: project.description || ''
      };
      localStorage.setItem('edit_project_draft', JSON.stringify(draft));

      // Prepare additional items for builder
      if (Array.isArray(project.items) && project.items.length > 0) {
        const itemsDraft = project.items.map((it: any) => ({
          id: it.id || Math.random().toString(36).slice(2),
          ptype: it.ptype || it.type || '',
          psubtype: it.psubtype || 'normal',
          material: it.material || '',
          color: it.color || 'white',
          width: Number(it.width) || 0,
          height: Number(it.height) || 0,
          quantity: Number(it.quantity) || 1,
          days: Number(it.days) || 1,
          autoPrice: true,
          pricePerMeter: Number(it.pricePerMeter) || 0, // builder recalculates
          selectedAcc: Array.isArray(it.selectedAcc) ? it.selectedAcc : [],
          description: it.description || '',
        }));
        localStorage.setItem('edit_project_items_draft', JSON.stringify(itemsDraft));
      } else {
        localStorage.removeItem('edit_project_items_draft');
      }
    } catch {}
    setCurrentPage && setCurrentPage('projects-builder');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const back = () => {
    if (goBack) return goBack();
    setCurrentPage && setCurrentPage('projects');
  };

  return (
    <div className="min-h-screen bg-background" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <Header currentPage="project-details" setCurrentPage={setCurrentPage as any} {...(rest as any)} />

      <div className="container mx-auto px-4 py-8">
        {/* Loading/empty state */}
        {loading && (
          <Card className="max-w-2xl mx-auto animate-pulse">
            <CardContent className="p-6 space-y-4">
              <div className="h-6 w-40 bg-muted rounded" />
              <div className="h-24 bg-muted rounded" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-12 bg-muted rounded" />
                <div className="h-12 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && !project && (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Info className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium">
                {locale==='ar'
                  ? (isLoggedIn ? 'غير مصرح لك بعرض هذا المشروع.' : 'الرجاء تسجيل الدخول لعرض المشاريع.')
                  : (isLoggedIn ? 'You are not authorized to view this project.' : 'Please sign in to view projects.')
                }
              </p>
              {!isVendor && (
                <p className="text-sm text-muted-foreground">
                  {locale==='ar' ? 'هذه الصفحة تعرض فقط مشاريع المالك.' : 'This page only shows projects owned by the current user.'}
                </p>
              )}
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
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm">{typeLabel}</Badge>
                    {itemsCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {locale==='ar' ? `${itemsCount + 1} عناصر` : `${itemsCount + 1} items`}
                      </Badge>
                    )}
                  </div>
                  <div className="rounded-lg border p-4 bg-background shadow-sm">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> {locale==='ar' ? 'المدة (أيام)' : 'Duration (days)'}
                    </div>
                    <div className="mt-1 font-medium">{Number(project?.days) > 0 ? project.days : '-'}</div>
                  </div>
                </div>

                {/* Quick summary chips */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {materialLabel && (
                    <Badge variant="outline" className="rounded-full text-xs">{materialLabel}</Badge>
                  )}
                  <Badge variant="outline" className="rounded-full text-xs">
                    {(project.width||0)} × {(project.height||0)} m
                  </Badge>
                  <Badge variant="outline" className="rounded-full text-xs">
                    {locale==='ar' ? `الكمية: ${project.quantity||0}` : `Quantity: ${project.quantity||0}`}
                  </Badge>
                  <Badge variant="outline" className="rounded-full text-xs">
                    {locale==='ar' ? `سعر المتر: ${project.pricePerMeter||0}` : `Price per m²: ${project.pricePerMeter||0}`}
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
                      <Layers className="w-4 h-4" /> {locale==='ar' ? 'الخامة' : 'Material'}
                    </div>
                    <div className="mt-1 font-medium">{materialLabel || '-'}</div>
                  </div>
                  <div className="rounded-lg border p-4 bg-background shadow-sm">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Ruler className="w-4 h-4" /> {locale==='ar' ? 'الأبعاد (متر)' : 'Dimensions (m)'}
                    </div>
                    <div className="mt-1 font-medium">
                      {(project.width||0)} × {(project.height||0)}<span className="text-muted-foreground text-xs ms-1">m</span>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4 bg-background shadow-sm">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Boxes className="w-4 h-4" /> {locale==='ar' ? 'الكمية' : 'Quantity'}
                    </div>
                    <div className="mt-1 font-medium">{project.quantity || 0}</div>
                  </div>
                  <div className="rounded-lg border p-4 bg-background shadowسم">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" /> {locale==='ar' ? 'سعر المتر المربع' : 'Price per m²'}
                    </div>
                    <div className="mt-1 font-medium">{project.pricePerMeter || 0} {currency}</div>
                  </div>
                </div>

                <Separator />

                {/* Accessories */}
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">{locale==='ar' ? 'الملحقات' : 'Accessories'}</div>
                  {accessoriesNames.length>0 ? (
                    <div className="flex flex-wrap gap-2">
                      {accessoriesNames.map((name: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="rounded-full px-3 py-1 text-xs">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">{locale==='ar'?'بدون':'None'}</div>
                  )}
                </div>

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

                {/* Additional Items (from builder) */}
                {itemsCount > 0 && (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      {locale==='ar' ? 'عناصر إضافية ضمن هذا المشروع' : 'Additional items in this project'}
                    </div>
                    <div className="space-y-4">
                      {itemsArray.map((it: any, idx: number) => {
                        const itTypeLabel = productTypes.find(pt => pt.id === (it?.ptype || it?.type))?.[locale==='ar'?'ar':'en'] || '';
                        const itMaterialLabel = materials.find(m => m.id === it?.material)?.[locale==='ar'?'ar':'en'] || '';
                        const itAccessoriesNames: string[] = Array.isArray(it?.selectedAcc)
                          ? it.selectedAcc.map((id: string) => {
                              const acc = accessoriesCatalog.find(a => a.id === id);
                              return acc ? (locale==='ar'?acc.ar:acc.en) : null;
                            }).filter(Boolean) as string[]
                          : [];
                        return (
                          <div key={it?.id || idx} className="rounded-lg border p-4 bg-background shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="font-semibold">{locale==='ar' ? `عنصر #${idx+2}` : `Item #${idx+2}`}</div>
                              {itTypeLabel && <Badge variant="outline">{itTypeLabel}</Badge>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                              <div>
                                <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                  <Layers className="w-4 h-4" /> {locale==='ar' ? 'الخامة' : 'Material'}
                                </div>
                                <div className="mt-1 font-medium">{itMaterialLabel || '-'}</div>
                              </div>
                              <div>
                                <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                  <Ruler className="w-4 h-4" /> {locale==='ar' ? 'الأبعاد (متر)' : 'Dimensions (m)'}
                                </div>
                                <div className="mt-1 font-medium">
                                  {(it?.width||0)} × {(it?.height||0)}<span className="text-muted-foreground text-xs ms-1">m</span>
                                </div>
                              </div>
                              <div>
                                <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                  <Boxes className="w-4 h-4" /> {locale==='ar' ? 'الكمية' : 'Quantity'}
                                </div>
                                <div className="mt-1 font-medium">{it?.quantity || 0}</div>
                              </div>
                              <div>
                                <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                  <Calendar className="w-4 h-4" /> {locale==='ar' ? 'أيام التنفيذ' : 'Days to complete'}
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
                            {/* Item accessories */}
                            <div className="mt-3">
                              <div className="text-sm text-muted-foreground">{locale==='ar' ? 'الملحقات' : 'Accessories'}</div>
                              {itAccessoriesNames.length>0 ? (
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {itAccessoriesNames.map((name: string, i: number) => (
                                    <Badge key={i} variant="outline" className="rounded-full px-3 py-1 text-xs">{name}</Badge>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-sm text-muted-foreground">{locale==='ar'?'بدون':'None'}</div>
                              )}
                            </div>
                            {/* Item description */}
                            {it?.description && (
                              <div className="mt-3">
                                <div className="text-sm text-muted-foreground">{locale==='ar' ? 'الوصف' : 'Description'}</div>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/30 border rounded-md p-3">{it.description}</div>
                              </div>
                            )}
                            {/* Item total */}
                            <div className="mt-3 flex items-center justify-end">
                              <div className="text-sm">
                                <span className="text-muted-foreground me-2">{locale==='ar' ? 'إجمالي هذا العنصر:' : 'Item total:'}</span>
                                <span className="font-semibold">{currency} {(it?.total || 0).toLocaleString(locale==='ar'?'ar-EG':'en-US')}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Meta */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                  {project.createdAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> {locale==='ar' ? 'تم الإنشاء' : 'Created'}: {new Date(project.createdAt).toLocaleString(locale==='ar'?'ar-EG':'en-US')}
                    </div>
                  )}
                  {project.updatedAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> {locale==='ar' ? 'آخر تحديث' : 'Updated'}: {new Date(project.updatedAt).toLocaleString(locale==='ar'?'ar-EG':'en-US')}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button onClick={handleEdit} className="inline-flex items-center gap-2">
                    <Edit3 className="w-4 h-4" /> {locale==='ar' ? 'تعديل' : 'Edit'}
                  </Button>
                  <Button variant="outline" onClick={back} className="inline-flex items-center gap-2">
                    {locale==='ar' ? 'رجوع' : 'Back'} <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sidebar */}
            <div className="space-y-4">
              {isVendor ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {(project?.customerName || project?.userName || project?.user?.name)
                          ? (locale==='ar' ? 'صاحب الطلب' : 'Customer')
                          : (locale==='ar' ? 'تفاصيل' : 'Details')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        {(project?.customerName || project?.userName || project?.user?.name) || (locale==='ar' ? 'غير معروف' : 'Unknown')}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {isEditing
                          ? (locale==='ar' ? 'تعديل عرضي' : 'Edit My Offer')
                          : (hasSubmitted
                              ? (locale==='ar' ? 'تم الإرسال' : 'Submitted')
                              : (locale==='ar' ? 'تقديم عرض' : 'Submit Proposal')
                            )
                        }
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {hasSubmitted && !isEditing ? (
                        <div className="space-y-3 text-sm">
                          {myProposal && (
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
                          )}
                          <div className="pt-2">
                            <Button className="w-full" variant="outline" disabled>
                              {locale==='ar' ? 'تعديل عرضي' : 'Edit my offer'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="grid gap-2">
                            <label className="text-sm">{locale==='ar' ? 'السعر المقترح' : 'Proposed Price'}</label>
                            <Input
                              type="number"
                              inputMode="decimal"
                              min={minPrice || 0}
                              max={maxPrice || undefined}
                              placeholder={
                                locale==='ar'
                                  ? `الحد الأدنى: ${currency} ${formatMoney(minPrice)} • الحد الأقصى: ${currency} ${formatMoney(maxPrice)}`
                                  : `Min: ${currency} ${formatMoney(minPrice)} • Max: ${currency} ${formatMoney(maxPrice)}`
                              }
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
                              placeholder={
                                Number(project?.days) > 0
                                  ? (locale==='ar' ? `من 1 إلى ${Number(project?.days)} يوم` : `From 1 to ${Number(project?.days)} days`)
                                  : (locale==='ar' ? 'أقل قيمة: 1 يوم' : 'Minimum: 1 day')
                              }
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
                            <Textarea
                              rows={4}
                              placeholder={locale==='ar' ? 'عرّف بنفسك وقدّم تفاصيل العرض' : 'Introduce yourself and provide details of your offer'}
                              value={offerMessage}
                              onChange={(e)=>setOfferMessage(e.target.value)}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              disabled={(() => {
                                if (saving || hasSubmitted) return true;
                                const vP = Number(offerPrice);
                                const vD = Number(offerDays);
                                const validP = offerPrice !== '' && isFinite(vP) && vP >= (minPrice||0) && vP <= (maxPrice||Number.POSITIVE_INFINITY);
                                const maxD = Number(project?.days) > 0 ? Number(project?.days) : Infinity;
                                const validD = offerDays !== '' && Number.isFinite(vD) && vD >= 1 && vD <= maxD;
                                return !(validP && validD);
                              })()}
                              onClick={() => {
                                (async () => {
                                  try {
                                    setSaving(true);
                                    if (!project) return;
                                    const vP = Number(offerPrice);
                                    const vD = Number(offerDays);
                                    const res = await createBid(Number(project.id), { price: vP, days: vD, message: offerMessage });
                                    if (res.ok) {
                                      const r = await getProjectBids(Number(project.id));
                                      if (r.ok && Array.isArray(r.data)) setProposals(r.data as BidDto[]);
                                      setOfferPrice(''); setOfferDays(''); setOfferMessage('');
                                      setHasSubmitted(true);
                                      Swal.fire({ icon: 'success', title: locale==='ar' ? 'تم إرسال العرض' : 'Proposal submitted', timer: 1600, showConfirmButton: false });
                                    }
                                  } finally {
                                    setSaving(false);
                                  }
                                })();
                              }}
                            >
                              <Send className="mr-2 h-4 w-4" /> {saving ? (locale==='ar' ? 'جارٍ الحفظ...' : 'Saving...') : (isEditing ? (locale==='ar' ? 'حفظ التعديلات' : 'Save Changes') : (locale==='ar' ? 'إرسال العرض' : 'Send Proposal'))}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                // Owner/non-vendor: view and manage received proposals
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">{locale==='ar' ? 'عروض مقدّمة' : 'Submitted Proposals'}</h2>
                      <Badge variant="outline">{proposals.length}</Badge>
                    </div>
                    {proposals.length === 0 ? (
                      <div className="text-sm text-muted-foreground">{locale==='ar' ? 'لا توجد عروض حتى الآن.' : 'No proposals yet.'}</div>
                    ) : (
                      <div className="space-y-3">
                        {proposals.map((pp:any)=> (
                          <div key={pp.id} className="border rounded-md p-3">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium">{locale==='ar' ? 'السعر' : 'Price'}: {currency} {Number(pp.price||0).toLocaleString(locale==='ar'?'ar-EG':'en-US')}</div>
                              <Badge variant={pp.status==='accepted'? 'secondary' : pp.status==='rejected'? 'destructive' : 'outline'} className="text-xs capitalize">
                                {locale==='ar' ? (pp.status==='pending'?'معلق': pp.status==='accepted'?'مقبول':'مرفوض') : pp.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">{locale==='ar' ? 'المدة' : 'Days'}: {Number(pp.days||0)}</div>
                            {pp.message && <div className="mt-1 text-xs bg-muted/20 rounded p-2">{pp.message}</div>}
                            {pp.status === 'pending' && (
                              <div className="mt-2 flex items-center gap-2">
                                <Button size="sm" className="flex-1" onClick={async () => {
                                  try {
                                    const r = await acceptBid(Number(pp.id));
                                    if (r.ok && project) {
                                      const rd = await getProjectBids(Number(project.id));
                                      if (rd.ok && Array.isArray(rd.data)) setProposals(rd.data as BidDto[]);
                                    }
                                  } catch {}
                                }}>
                                  <Check className="w-4 h-4 ml-1" /> {locale==='ar' ? 'قبول' : 'Accept'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="flex-1 bg-red-600 hover:bg-red-700 text-white border border-red-600"
                                  onClick={async () => {
                                    try {
                                      const r = await rejectBid(Number(pp.id));
                                      if (r.ok && project) {
                                        const rd = await getProjectBids(Number(project.id));
                                        if (rd.ok && Array.isArray(rd.data)) setProposals(rd.data as BidDto[]);
                                      }
                                    } catch {}
                                  }}
                                >
                                  <X className="w-4 h-4 ml-1" /> {locale==='ar' ? 'رفض' : 'Reject'}
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer setCurrentPage={setCurrentPage as any} />
    </div>
  );
}