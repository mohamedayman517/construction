import { useEffect, useMemo, useState } from "react";
import { RouteContext } from "../../components/Router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Eye,
  BarChart3,
  Settings,
  Store,
  Users,
  Star,
  Clock,
  XCircle,
  Truck,
  MessageSquare,
  Pencil,
  Trash2,
  Tag,
} from "lucide-react";
import Header from "../../components/Header";
import { useTranslation } from "../../hooks/useTranslation";
import { confirmDialog } from "../../utils/alerts";

// statsCards moved inside component to use translations

const recentOrders = [
  {
    id: "#12345",
    customer: "محمد العلي",
    product: "فلتر زيت محرك",
    amount: "120 ر.س",
    status: "pending",
    date: "2024-01-15",
  },
  {
    id: "#12346",
    customer: "فاطمة أحمد",
    product: "تيل فرامل سيراميك",
    amount: "350 ر.س",
    status: "shipped",
    date: "2024-01-14",
  },
  {
    id: "#12347",
    customer: "علي محمود",
    product: "بطارية سيارة",
    amount: "480 ر.س",
    status: "delivered",
    date: "2024-01-13",
  },
];

// Removed low stock sample data and alert section

// Removed inline notifications in favor of dedicated Notifications page

export default function VendorDashboard({ setCurrentPage, ...context }: Partial<RouteContext>) {
  const { t, locale } = useTranslation();
  const statsCards = [
    {
      title: t("totalProducts"),
      value: "156",
      change: t("changeUpThisMonth"),
      icon: Package,
      color: "text-blue-600",
      trend: "up",
    },
    {
      title: t("newOrders"),
      value: "23",
      change: t("changeUpToday"),
      icon: ShoppingCart,
      color: "text-green-600",
      trend: "up",
    },
    {
      title: t("monthlySales"),
      value: "45,230 ر.س",
      change: t("changeSalesFromLastMonth"),
      icon: DollarSign,
      color: "text-purple-600",
      trend: "up",
    },
    {
      title: t("storeRating"),
      value: "4.8",
      change: t("changeRatingThisMonth"),
      icon: Star,
      color: "text-yellow-600",
      trend: "up",
    },
  ];

  // وظائف التاجر (مترجمة)
  const vendorFunctions: Array<{
    icon: string;
    label: { ar: string; en: string };
    route?: string;
  }> = [
    {
      icon: "ShoppingCart",
      label: { ar: "عرض الطلبات والمبيعات", en: "View Orders & Sales" },
      route: "vendor-orders",
    },
    {
      icon: "Package",
      label: { ar: "إدارة المنتجات", en: "Manage Products" },
      route: "vendor-products",
    },
    {
      icon: "DollarSign",
      label: { ar: "النظام المحاسبي", en: "Accounting System" },
      route: "vendor-accounting",
    },
    {
      icon: "BarChart3",
      label: { ar: "الفواتير وتحليل الأرباح", en: "Invoices & Profit Analysis" },
      route: "vendor-analytics",
    },
    // View sections instead of add
    {
      icon: "Eye",
      label: { ar: "عرض المشاريع", en: "View Projects" },
      route: "vendor-projects",
    },
    {
      icon: "Eye",
      label: { ar: "عرض الخدمات", en: "View Services" },
      route: "vendor-services",
    },
    {
      icon: "Users",
      label: { ar: "عرض المتقدمين", en: "View Applicants" },
      route: "vendor-service-applicants",
    },
    {
      icon: "Plus",
      label: { ar: "إضافة خدمة", en: "Add Service" },
      route: "add-service",
    },
    {
      icon: "Tag",
      label: { ar: "التأجير", en: "Rentals" },
      route: "vendor-rentals",
    },
  ];

  // عرض المشاريع والخدمات من localStorage
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [userServices, setUserServices] = useState<any[]>([]);
  const [vendorProposals, setVendorProposals] = useState<any[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");
  const [editDays, setEditDays] = useState<string>("");
  const [editMessage, setEditMessage] = useState<string>("");
  const [editSaving, setEditSaving] = useState(false);
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const pRaw = window.localStorage.getItem("user_projects");
      const sRaw = window.localStorage.getItem("user_services");
      const p = pRaw ? JSON.parse(pRaw) : [];
      const s = sRaw ? JSON.parse(sRaw) : [];
      if (Array.isArray(p)) setUserProjects(p);
      if (Array.isArray(s)) setUserServices(s);
      // Load vendor proposals and filter by current vendor
      const vRaw = window.localStorage.getItem('vendor_proposals');
      const allProps = vRaw ? JSON.parse(vRaw) : [];
      const myId = (context as any)?.user?.id;
      const mine = Array.isArray(allProps) ? allProps.filter((pr: any) => !myId || pr.vendorId === myId) : [];
      setVendorProposals(mine);
    } catch {}
  }, []);

  // Helpers to derive constraints from target snapshot (project)
  const deriveProjectBaseTotal = (snap: any): number => {
    if (!snap) return 0;
    if (typeof snap.total === 'number') return Math.max(0, Number(snap.total));
    const area = Math.max(0, Number(snap.width || 0)) * Math.max(0, Number(snap.height || 0));
    const accessoriesCost = Array.isArray(snap.accessories)
      ? snap.accessories.map((a: any) => Number(a?.price || 0)).reduce((a: number, b: number) => a + b, 0)
      : 0;
    const pricePerM = Number(snap.pricePerMeter || 0);
    const qty = Math.max(1, Number(snap.quantity || 1));
    const subtotalOne = (area * pricePerM) + accessoriesCost;
    return Math.max(0, Math.round(subtotalOne * qty));
  };
  const editMinPrice = useMemo(() => {
    if (!editing) return 0;
    if (editing.targetType === 'project') return deriveProjectBaseTotal(editing.targetSnapshot);
    return 0;
  }, [editing]);
  const editMaxPrice = useMemo(() => Math.max(editMinPrice, editMinPrice * 2), [editMinPrice]);
  const editMaxDays = useMemo(() => {
    if (!editing) return Infinity;
    const d = Number(editing?.targetSnapshot?.days);
    return Number.isFinite(d) && d > 0 ? d : Infinity;
  }, [editing]);

  const currency = locale === "ar" ? "ر.س" : "SAR";
  const labelForProductType = (id: string) => {
    const map: any = {
      door: { ar: "باب", en: "Door" },
      window: { ar: "شباك", en: "Window" },
      railing: { ar: "دربزين", en: "Railing" },
    };
    return map[id]?.[locale === "ar" ? "ar" : "en"] || id;
  };
  const labelForMaterial = (id: string) => {
    const map: any = {
      aluminum: { ar: "ألمنيوم", en: "Aluminum" },
      steel: { ar: "صاج", en: "Steel" },
      laser: { ar: "ليزر", en: "Laser-cut" },
      glass: { ar: "سكريت", en: "Glass (Securit)" },
    };
    return map[id]?.[locale === "ar" ? "ar" : "en"] || id;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "default";
      case "shipped":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "delivered":
        return t("deliveredStatus");
      case "shipped":
        return t("shippedStatus");
      case "pending":
        return t("pendingOrderStatus");
      default:
        return status;
    }
  };

  // Proposal status helpers
  const proposalStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary' as const;
      case 'in_progress':
        return 'outline' as const;
      case 'completed':
        return 'default' as const;
      case 'closed':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };
  const proposalStatusLabel = (status: string) => {
    if (locale === 'ar') {
      switch (status) {
        case 'pending': return 'قيد الانتظار';
        case 'in_progress': return 'قيد التنفيذ';
        case 'completed': return 'مكتمل';
        case 'closed': return 'مغلق';
        default: return status;
      }
    }
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'closed': return 'Closed';
      default: return status;
    }
  };

  // Generic item status helpers (projects/services)
  const itemStatusVariant = (status?: string) => {
    switch ((status || '').toLowerCase()) {
      case 'pending': return 'secondary' as const;
      case 'in_progress':
      case 'in-progress': return 'outline' as const;
      case 'completed': return 'default' as const;
      case 'closed': return 'destructive' as const;
      case 'active': return 'default' as const;
      case 'draft': return 'secondary' as const;
      default: return 'secondary' as const;
    }
  };
  const itemStatusLabel = (status?: string) => {
    const s = (status || '').toLowerCase();
    if (locale === 'ar') {
      switch (s) {
        case 'pending': return 'قيد الانتظار';
        case 'in_progress':
        case 'in-progress': return 'قيد التنفيذ';
        case 'completed': return 'مكتمل';
        case 'closed': return 'مغلق';
        case 'active': return 'نشط';
        case 'draft': return 'مسودة';
        default: return status || '';
      }
    }
    switch (s) {
      case 'pending': return 'Pending';
      case 'in_progress':
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'closed': return 'Closed';
      case 'active': return 'Active';
      case 'draft': return 'Draft';
      default: return status || '';
    }
  };

  // Removed stock status color helper - section deleted

  return (
    <div className="min-h-screen bg-background">
      <Header {...context} />

      <div className="container mx-auto px-4 py-8">
        {/* Vendor welcome section */}
        <div className="mb-6">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">{locale==='ar' ? 'مرحباً' : 'Welcome'}</div>
                <div className="text-lg font-semibold">{(context as any)?.user?.name || (locale==='ar'?'التاجر':'Vendor')}</div>
                {(context as any)?.user?.email && (
                  <div className="text-xs text-muted-foreground mt-1">{(context as any)?.user?.email}</div>
                )}
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>{locale==='ar' ? 'المشاريع الظاهرة' : 'Visible Projects'}: {userProjects.length}</div>
                <div>{locale==='ar' ? 'الخدمات الظاهرة' : 'Visible Services'}: {userServices.length}</div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">{t("vendorFunctions")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {vendorFunctions.map((func, i) => {
              const Icon = require("lucide-react")[func.icon];
              return (
                <div
                  key={i}
                  className={`flex flex-col items-center p-4 bg-muted rounded-lg shadow-sm ${func.route ? 'cursor-pointer hover:bg-muted/80 transition' : ''}`}
                  onClick={() => func.route && setCurrentPage && setCurrentPage(func.route)}
                >
                  <Icon className="h-8 w-8 mb-2 text-primary" />
                  <span className="text-sm font-medium text-center">
                    {func.label[locale]}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Vendor Applications (Projects & Services) */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">{locale === 'ar' ? 'عروضي المقدمة' : 'My Applications'}</h2>
            {vendorProposals.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-muted-foreground">
                  {locale === 'ar' ? 'لا توجد عروض مقدمة بعد.' : 'No applications yet.'}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {vendorProposals.map((pr: any) => (
                  <Card key={pr.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-base">
                        <span>
                          {pr.targetType === 'project' ? (
                            <>
                              {labelForProductType(pr.targetSnapshot?.ptype || pr.targetSnapshot?.type)}
                              {pr.targetSnapshot?.material ? ` • ${labelForMaterial(pr.targetSnapshot.material)}` : ''}
                            </>
                          ) : (
                            <>
                              {labelForServiceType(pr.targetSnapshot?.type)}
                            </>
                          )}
                        </span>
                        <Badge variant={proposalStatusVariant(pr.status)}>{proposalStatusLabel(pr.status)}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">
                          {locale === 'ar' ? 'السعر' : 'Price'}: {currency} {Number(pr.price || 0).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                        </div>
                        <div className="text-muted-foreground">
                          {locale === 'ar' ? 'المدة' : 'Days'}: {Number(pr.days || 0)}
                        </div>
                      </div>
                      {!!pr.message && (
                        <div className="text-xs text-muted-foreground mt-2 line-clamp-2">{pr.message}</div>
                      )}
                      <div className="text-xs text-muted-foreground mt-2">
                        {locale === 'ar' ? 'تاريخ الإرسال' : 'Submitted'}: {new Date(pr.createdAt).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditing(pr);
                            setEditPrice(String(pr.price ?? ''));
                            setEditDays(String(pr.days ?? ''));
                            setEditMessage(String(pr.message ?? ''));
                            setEditOpen(true);
                          }}
                        >
                          <Pencil className="w-4 h-4 mr-1" /> {locale === 'ar' ? 'تعديل' : 'Edit'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white border-0"
                          onClick={async () => {
                            const ok = await confirmDialog(
                              locale === 'ar' ? 'هل تريد حذف هذا العرض؟' : 'Delete this proposal?',
                              locale === 'ar' ? 'نعم' : 'Yes',
                              locale === 'ar' ? 'إلغاء' : 'Cancel',
                              locale === 'ar'
                            );
                            if (!ok) return;
                            try {
                              const raw = window.localStorage.getItem('vendor_proposals');
                              const list = raw ? JSON.parse(raw) : [];
                              const filtered = Array.isArray(list) ? list.filter((x:any)=> x.id !== pr.id) : [];
                              window.localStorage.setItem('vendor_proposals', JSON.stringify(filtered));
                              setVendorProposals((prev)=> prev.filter((x:any)=> x.id !== pr.id));
                            } catch {}
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> {locale === 'ar' ? 'حذف' : 'Delete'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          {/* Removed welcome and overview description under My Applications */}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div
                  className={`flex items-center text-xs ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )}
                  {stat.change}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t("quickActions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* View Projects */}
              <Button
                className="w-full justify-start"
                variant="secondary"
                onClick={() => setCurrentPage && setCurrentPage("vendor-projects")}
              >
                <Eye className="mr-2 h-4 w-4" />
                {locale === 'ar' ? 'عرض المشاريع' : 'View Projects'}
              </Button>
              {/* View Services */}
              <Button
                className="w-full justify-start"
                variant="secondary"
                onClick={() => setCurrentPage && setCurrentPage("vendor-services")}
              >
                <Eye className="mr-2 h-4 w-4" />
                {locale === 'ar' ? 'عرض الخدمات' : 'View Services'}
              </Button>
              {/* View Service Applicants */}
              <Button
                className="w-full justify-start"
                variant="secondary"
                onClick={() => setCurrentPage && setCurrentPage("vendor-service-applicants")}
              >
                <Users className="mr-2 h-4 w-4" />
                {locale === 'ar' ? 'عرض المتقدمين' : 'View Applicants'}
              </Button>
              {/* Add Service */}
              <Button
                className="w-full justify-start"
                onClick={() => setCurrentPage && setCurrentPage("add-service")}
              >
                <Plus className="mr-2 h-4 w-4" />
                {locale === 'ar' ? 'إضافة خدمة' : 'Add Service'}
              </Button>
              {/* Rentals */}
              <Button
                className="w-full justify-start"
                onClick={() => setCurrentPage && setCurrentPage("vendor-rentals")}
              >
                <Tag className="mr-2 h-4 w-4" />
                {locale === 'ar' ? 'التأجير' : 'Rentals'}
              </Button>
              <Button
                className="w-full justify-start"
                onClick={() => setCurrentPage && setCurrentPage("vendor-products")}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("addNewProduct")}
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => setCurrentPage && setCurrentPage("vendor-orders")}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {t("manageOrders")}
              </Button>
              {/* Accounting System */}
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => setCurrentPage && setCurrentPage("vendor-accounting")}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                {locale === 'ar' ? 'النظام المحاسبي' : 'Accounting System'}
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => setCurrentPage && setCurrentPage("vendor-analytics")}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                {t("analyticsReports")}
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => setCurrentPage && setCurrentPage("vendor-settings")}
              >
                <Settings className="mr-2 h-4 w-4" />
                {t("storeSettings")}
              </Button>
            </CardContent>
          </Card>
        </div>

      

        {/* Detailed Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 gap-2">
            <TabsTrigger value="orders">{t("recentOrders")}</TabsTrigger>
            <TabsTrigger value="performance">{t("performance")}</TabsTrigger>
            <TabsTrigger value="customers">{t("customers")}</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{t("recentOrders")}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage && setCurrentPage("vendor-orders")}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    {t("viewAll")}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <ShoppingCart className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.customer}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.product}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{order.amount}</p>
                        <Badge variant={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {order.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("conversionRate")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{t("visitorsToCustomers")}</span>
                        <span>12%</span>
                      </div>
                      <Progress value={12} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{t("addToCart")}</span>
                        <span>35%</span>
                      </div>
                      <Progress value={35} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{t("completePurchase")}</span>
                        <span>68%</span>
                      </div>
                      <Progress value={68} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("averageOrderValue")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">285 ر.س</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t("thisMonth")}</span>
                      <span className="text-green-600">+15%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t("lastMonth")}</span>
                      <span>248 ر.س</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t("monthlyGoal")}</span>
                      <span>300 ر.س</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("newCustomers")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">127</div>
                  <p className="text-sm text-muted-foreground">
                    {t("thisMonth")}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("repeatCustomers")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">85%</div>
                  <p className="text-sm text-muted-foreground">
                    {t("returnRate")}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("averageRating")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="text-2xl font-bold">4.8</div>
                    <Star className="h-5 w-5 text-yellow-400 mr-1" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("from245Reviews")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Removed Goals tab content */}
        </Tabs>
      </div>
      {/* Edit Proposal Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>{locale === 'ar' ? 'تعديل العرض' : 'Edit Proposal'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm">{locale === 'ar' ? 'السعر المقترح' : 'Proposed Price'}</label>
              <Input
                type="number"
                inputMode="decimal"
                value={editPrice}
                onChange={(e)=> setEditPrice(e.target.value)}
                min={editMinPrice || 0}
                max={editMaxPrice || undefined}
                placeholder={locale === 'ar'
                  ? `الحد الأدنى: ${currency} ${editMinPrice.toLocaleString('ar-EG')} • الحد الأقصى: ${currency} ${editMaxPrice.toLocaleString('ar-EG')}`
                  : `Min: ${currency} ${editMinPrice.toLocaleString('en-US')} • Max: ${currency} ${editMaxPrice.toLocaleString('en-US')}`}
              />
              {(() => {
                const v = Number(editPrice);
                const invalid = editPrice !== '' && (!isFinite(v) || v < (editMinPrice||0) || v > (editMaxPrice||Number.POSITIVE_INFINITY));
                if (!invalid) return null;
                return (
                  <span className="text-xs text-red-600">
                    {locale === 'ar'
                      ? `السعر يجب أن يكون بين ${currency} ${editMinPrice.toLocaleString('ar-EG')} و ${currency} ${editMaxPrice.toLocaleString('ar-EG')}`
                      : `Price must be between ${currency} ${editMinPrice.toLocaleString('en-US')} and ${currency} ${editMaxPrice.toLocaleString('en-US')}`}
                  </span>
                );
              })()}
            </div>
            <div className="grid gap-2">
              <label className="text-sm">{locale === 'ar' ? 'المدة (أيام)' : 'Duration (days)'}</label>
              <Input
                type="number"
                inputMode="numeric"
                value={editDays}
                onChange={(e)=> setEditDays(e.target.value)}
                min={1}
                max={Number.isFinite(editMaxDays) ? Number(editMaxDays) : undefined}
                placeholder={Number.isFinite(editMaxDays)
                  ? (locale === 'ar' ? `من 1 إلى ${Number(editMaxDays)}` : `From 1 to ${Number(editMaxDays)}`)
                  : (locale === 'ar' ? 'أقل قيمة: 1 يوم' : 'Minimum: 1 day')}
              />
              {(() => {
                const v = Number(editDays);
                const invalid = editDays !== '' && (!Number.isFinite(v) || v < 1 || v > (Number.isFinite(editMaxDays) ? Number(editMaxDays) : Infinity));
                if (!invalid) return null;
                return (
                  <span className="text-xs text-red-600">
                    {Number.isFinite(editMaxDays)
                      ? (locale === 'ar' ? `عدد الأيام يجب أن يكون بين 1 و ${Number(editMaxDays)}` : `Days must be between 1 and ${Number(editMaxDays)}`)
                      : (locale === 'ar' ? 'عدد الأيام يجب ألا يقل عن 1' : 'Days must be at least 1')}
                  </span>
                );
              })()}
            </div>
            <div className="grid gap-2">
              <label className="text-sm">{locale === 'ar' ? 'رسالة' : 'Message'}</label>
              <Textarea rows={4} value={editMessage} onChange={(e)=> setEditMessage(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
            >
              {locale === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              disabled={(() => {
                if (editSaving || !editing) return true;
                const vP = Number(editPrice);
                const vD = Number(editDays);
                const validP = editPrice !== '' && isFinite(vP) && vP >= (editMinPrice||0) && vP <= (editMaxPrice||Number.POSITIVE_INFINITY);
                const validD = editDays !== '' && Number.isFinite(vD) && vD >= 1 && vD <= (Number.isFinite(editMaxDays) ? Number(editMaxDays) : Infinity);
                return !(validP && validD);
              })()}
              onClick={() => {
                if (!editing) return;
                const vP = Number(editPrice);
                const vD = Number(editDays);
                if (!isFinite(vP) || vP < (editMinPrice||0) || vP > (editMaxPrice||Number.POSITIVE_INFINITY)) return;
                if (!Number.isFinite(vD) || vD < 1 || vD > (Number.isFinite(editMaxDays) ? Number(editMaxDays) : Infinity)) return;
                try {
                  setEditSaving(true);
                  const raw = window.localStorage.getItem('vendor_proposals');
                  const list = raw ? JSON.parse(raw) : [];
                  const updated = Array.isArray(list)
                    ? list.map((x:any)=> x.id === editing.id ? { ...x, price: vP, days: vD, message: editMessage } : x)
                    : [];
                  window.localStorage.setItem('vendor_proposals', JSON.stringify(updated));
                  setVendorProposals((prev)=> prev.map((x:any)=> x.id === editing.id ? { ...x, price: vP, days: vD, message: editMessage } : x));
                  setEditOpen(false);
                } finally {
                  setEditSaving(false);
                }
              }}
            >
              {editSaving ? (locale === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (locale === 'ar' ? 'حفظ' : 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
