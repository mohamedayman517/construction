"use client";

import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import Header from "../../components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Eye, Send } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import type { RouteContext } from "../../components/routerTypes";

interface Props extends Partial<RouteContext> {}

export default function TechnicianProjects({ setCurrentPage, ...context }: Props) {
  const { locale } = useTranslation();
  const isAr = locale === 'ar';
  const currency = isAr ? "ر.س" : "SAR";
  const technicianId = (context as any)?.user?.id || null;

  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [offerPrice, setOfferPrice] = useState<string>("");
  const [offerDays, setOfferDays] = useState<string>("");
  const [offerMessage, setOfferMessage] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Build a fast lookup for already-submitted project IDs by this technician
  const submittedProjects = useMemo(() => {
    try {
      const raw = window.localStorage.getItem('technician_requests');
      const list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) return new Set<string>();
      return new Set<string>(
        list
          .filter((x:any)=> x.targetType==='project' && (!technicianId || x.technicianId === technicianId))
          .map((x:any)=> String(x.targetId))
      );
    } catch { return new Set<string>(); }
  }, [technicianId, userProjects.length]);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = window.localStorage.getItem("user_projects");
      const list = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list)) setUserProjects(list);
    } catch {}
  }, []);

  const labelForProductType = (id: string) => {
    const map: any = {
      door: { ar: "باب", en: "Door" },
      window: { ar: "شباك", en: "Window" },
      railing: { ar: "دربزين", en: "Railing" },
    };
    return map[id]?.[isAr ? "ar" : "en"] || id;
  };
  const labelForMaterial = (id: string) => {
    const map: any = {
      aluminum: { ar: "ألمنيوم", en: "Aluminum" },
      steel: { ar: "صاج", en: "Steel" },
      laser: { ar: "ليزر", en: "Laser-cut" },
      glass: { ar: "سكريت", en: "Glass (Securit)" },
    };
    return map[id]?.[isAr ? "ar" : "en"] || id;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header currentPage="technician-projects" setCurrentPage={setCurrentPage} {...context} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{isAr ? 'كل المشاريع' : 'All Projects'}</h1>
        </div>

        {userProjects.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-muted-foreground">
              {isAr ? 'لا توجد مشاريع بعد.' : 'No projects yet.'}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userProjects.map((p:any) => (
              <Card key={p.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {labelForProductType(p.ptype || p.type)}{p.material ? ` • ${labelForMaterial(p.material)}` : ''}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div className="text-muted-foreground">
                    {isAr ? 'الأبعاد' : 'Dimensions'}: {Number(p.width || 0)}×{Number(p.height || 0)}
                  </div>
                  <div className="text-muted-foreground">
                    {isAr ? 'الكمية' : 'Quantity'}: {Number(p.quantity || 0)}
                  </div>
                  <div className="font-semibold">
                    {currency} {Number(p.total || 0).toLocaleString(isAr ? 'ar-EG' : 'en-US')}
                  </div>
                  {!!p.description && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</div>
                  )}
                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        try {
                          window.localStorage.setItem('selected_technician_project_id', String(p.id));
                        } catch {}
                        setCurrentPage && setCurrentPage('technician-project-details');
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {isAr ? 'تفاصيل' : 'Details'}
                    </Button>
                    <Button
                      size="sm"
                      disabled={submittedProjects.has(String(p.id))}
                      onClick={() => {
                        if (submittedProjects.has(String(p.id))) {
                          Swal.fire({ icon: 'info', title: isAr ? 'تم الإرسال مسبقاً' : 'Already Submitted', text: isAr ? 'لا يمكنك إرسال عرض آخر لهذا المشروع.' : 'You have already submitted a proposal for this project.' });
                          return;
                        }
                        setSelectedProject(p);
                        setOfferPrice("");
                        setOfferDays("");
                        setOfferMessage("");
                        setProposalOpen(true);
                      }}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {submittedProjects.has(String(p.id)) ? (isAr ? 'تم الإرسال' : 'Submitted') : (isAr ? 'تقديم عرض' : 'Submit Proposal')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      {/* Proposal Dialog */}
      <Dialog open={proposalOpen} onOpenChange={setProposalOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>
              {isAr ? 'تقديم عرض للمشروع' : 'Submit Proposal for Project'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="price">{isAr ? 'السعر المقترح' : 'Proposed Price'}</Label>
              <Input
                id="price"
                type="number"
                inputMode="decimal"
                placeholder={isAr ? 'مثال: 2500' : 'e.g. 2500'}
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="days">{isAr ? 'المدة (أيام)' : 'Duration (days)'}</Label>
              <Input
                id="days"
                type="number"
                inputMode="numeric"
                placeholder={isAr ? 'مثال: 7' : 'e.g. 7'}
                value={offerDays}
                onChange={(e) => setOfferDays(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">{isAr ? 'رسالة' : 'Message'}</Label>
              <Textarea
                id="message"
                rows={4}
                placeholder={isAr ? 'عرّف بنفسك وقدّم تفاصيل العرض' : 'Introduce yourself and provide details of your offer'}
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={
                saving || !selectedProject || !offerPrice || !offerDays ||
                (selectedProject && submittedProjects.has(String(selectedProject.id)))
              }
              onClick={() => {
                if (!selectedProject) return;
                if (submittedProjects.has(String(selectedProject.id))) {
                  Swal.fire({ icon: 'info', title: isAr ? 'تم الإرسال مسبقاً' : 'Already Submitted', text: isAr ? 'لا يمكنك إرسال عرض آخر لهذا المشروع.' : 'You have already submitted a proposal for this project.' });
                  return;
                }
                try {
                  setSaving(true);
                  const request = {
                    id: `treq_${Date.now()}`,
                    targetType: 'project' as const,
                    targetId: selectedProject.id,
                    targetSnapshot: selectedProject,
                    price: Number(offerPrice),
                    days: Number(offerDays),
                    message: offerMessage,
                    technicianId,
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                  };
                  const raw = window.localStorage.getItem('technician_requests');
                  const list = raw ? JSON.parse(raw) : [];
                  const exists = Array.isArray(list) && list.some((x:any)=> x.targetType==='project' && String(x.targetId)===String(selectedProject.id) && (!technicianId || x.technicianId===technicianId));
                  if (!exists) list.push(request);
                  window.localStorage.setItem('technician_requests', JSON.stringify(list));

                  // Create notification for the project owner
                  try {
                    const recipientId = selectedProject.userId || selectedProject.user?.id || null;
                    const techName = (context as any)?.user?.name || (context as any)?.user?.username || (context as any)?.user?.email || (isAr ? 'فني' : 'Technician');
                    const title = isAr ? 'تم تقديم عرض على مشروعك' : 'New proposal on your project';
                    const numLocale = isAr ? 'ar-EG' : 'en-US';
                    const desc = isAr
                      ? `${techName} قدّم عرضًا بقيمة ${currency} ${Number(offerPrice).toLocaleString(numLocale)} لمدة ${Number(offerDays)} يوم`
                      : `${techName} submitted an offer of ${currency} ${Number(offerPrice).toLocaleString(numLocale)} for ${Number(offerDays)} days`;
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
                      meta: { targetType: 'project', targetId: selectedProject.id }
                    };
                    const combined = Array.isArray(nlist) ? [notif, ...nlist] : [notif];
                    window.localStorage.setItem('app_notifications', JSON.stringify(combined));
                  } catch {}

                  setProposalOpen(false);
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? (isAr ? 'جارٍ الحفظ...' : 'Saving...') : (isAr ? 'إرسال العرض' : 'Send Proposal')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
