import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  Star,
  Eye,
  ArrowUpDown,
  Grid,
  List,
  Tag,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Slider } from "../components/ui/slider";
import { Checkbox } from "../components/ui/checkbox";
import { Separator } from "../components/ui/separator";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useTranslation } from "../hooks/useTranslation";
import type { RouteContext } from "../components/routerTypes";
import { getOpenProjects, getProjects } from "@/services/projects";

// Mock data removed; show only user-added projects
const mockProjects: any[] = [];

const projectCategories = [
  { id: "web", name: { ar: "ويب", en: "Web" }, count: 24 },
  { id: "mobile", name: { ar: "موبايل", en: "Mobile" }, count: 12 },
  { id: "dashboard", name: { ar: "لوحات تحكم", en: "Dashboards" }, count: 7 },
  { id: "store", name: { ar: "متاجر", en: "Stores" }, count: 9 },
];

const stacks = [
  "React",
  "Next.js",
  "Tailwind",
  "Node.js",
  "Express",
  "Flutter",
  "Firebase",
  "D3",
];

// Project builder dictionaries
// Updated product types per user request: only Door, Window, Railing
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

interface ProjectsProps extends Partial<RouteContext> {}

export default function Projects({ setCurrentPage, ...rest }: ProjectsProps) {
  const { t, locale } = useTranslation();
  const currency = locale === "ar" ? "ر.س" : "SAR";
  const isLoggedIn = Boolean((rest as any)?.user);
  const currentUserId = (rest as any)?.user?.id ? String((rest as any).user.id) : '';
  const isVendor = ((rest as any)?.user?.role === 'vendor');

  const [projects, setProjects] = useState(mockProjects);
  const [filtered, setFiltered] = useState(mockProjects);
  const [openProjects, setOpenProjects] = useState<any[]>([]);
  const [browseProjects, setBrowseProjects] = useState<any[]>([]);

  // Builder state
  const [ptype, setPtype] = useState<string>('');
  const [material, setMaterial] = useState<string>('');
  const [width, setWidth] = useState<number>(0); // meters
  const [height, setHeight] = useState<number>(0); // meters
  const [quantity, setQuantity] = useState<number>(0);
  const [pricePerMeter, setPricePerMeter] = useState<number>(0); // SAR per m²
  const [autoPrice, setAutoPrice] = useState<boolean>(true);
  const [selectedAcc, setSelectedAcc] = useState<string[]>([]);
  const [description, setDescription] = useState<string>("");
  const [total, setTotal] = useState<number>(0);
  type Builder = {
    id: string;
    ptype: string;
    material: string;
    width: number;
    height: number;
    quantity: number;
    autoPrice: boolean;
    pricePerMeter: number;
    selectedAcc: string[];
    description: string;
  };
  const blankBuilder = (): Builder => ({
    id: `b-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
    ptype: '',
    material: '',
    width: 0,
    height: 0,
    quantity: 0,
    autoPrice: true,
    pricePerMeter: 0,
    selectedAcc: [],
    description: '',
  });
  const [additionalBuilders, setAdditionalBuilders] = useState<Builder[]>([]);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [userServices, setUserServices] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [showBuilder, setShowBuilder] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState([0, 20000]);
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  // Dynamic user-projects filters
  const [fType, setFType] = useState<string>('');
  const [fMaterial, setFMaterial] = useState<string>('');
  const [fAcc, setFAcc] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);

  // Load saved user projects from localStorage
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      // Map old product types to the new limited set
      const allowedTypes = new Set(productTypes.map(p => p.id));
      const typeMap: Record<string, string> = {
        double_aluminum_door: 'door',
        normal_aluminum_door: 'door',
        steel_door: 'door',
        laser_door: 'door',
        double_window: 'window',
        fixed: 'window',
        double_fixed: 'window',
        securit: 'window',
        railing: 'railing',
        structure: 'railing',
      };

      const migrateProject = (p: any) => {
        const origType = p?.type || p?.ptype || '';
        const mapped = typeMap[origType] || (allowedTypes.has(origType) ? origType : undefined);
        if (!mapped) return null; // drop unsupported old entries
        const selAcc = Array.isArray(p?.selectedAcc)
          ? p.selectedAcc
          : Array.isArray(p?.accessories)
            ? p.accessories.map((a: any) => a?.id).filter(Boolean)
            : [];
        return { ...p, type: mapped, selectedAcc: selAcc };
      };

      const raw = window.localStorage.getItem('user_projects');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          let migrated = parsed.map(migrateProject).filter(Boolean) as any[];
          // If logged-in and not vendor: assign missing ownerId to current user (local migration)
          if (currentUserId && !isVendor) {
            let changed = false;
            migrated = migrated.map((p:any) => {
              // Assign missing ownerId or previously guest-owned projects to current user
              if (!p.ownerId || String(p.ownerId) === 'guest') {
                changed = true;
                return { ...p, ownerId: currentUserId };
              }
              return p;
            });
            if (changed) {
              // Persist migration while preserving structure
              window.localStorage.setItem('user_projects', JSON.stringify(migrated));
            }
          }
          // For vendors, show all projects; otherwise only owned
          const list = isVendor ? migrated : (currentUserId ? migrated.filter((p:any)=> String(p.ownerId||'') === currentUserId) : []);
          setUserProjects(list);
        }
      }

      // Load services list
      try {
        const rawServices = window.localStorage.getItem('user_services');
        if (rawServices) {
          const parsedS = JSON.parse(rawServices);
          if (Array.isArray(parsedS)) setUserServices(parsedS as any[]);
        }
      } catch {}

      const migrateBuilder = (b: any) => {
        const origType = b?.ptype || b?.type || '';
        const mapped = typeMap[origType] || (allowedTypes.has(origType) ? origType : undefined);
        if (!mapped) return null;
        return { ...b, ptype: mapped };
      };

      const rawBuilders = window.localStorage.getItem('builders_forms');
      if (rawBuilders) {
        const parsedB = JSON.parse(rawBuilders);
        if (Array.isArray(parsedB)) {
          const migratedB = parsedB.map(migrateBuilder).filter(Boolean);
          setAdditionalBuilders(migratedB as any[]);
          window.localStorage.setItem('builders_forms', JSON.stringify(migratedB));
        }
      }
      setHydrated(true);
    } catch {}
  }, [currentUserId, isVendor]);

  // Fetch open projects from backend (read-only showcase)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { ok, data } = await getOpenProjects();
        if (ok && Array.isArray(data) && !cancelled) {
          const list = data.map((p: any) => ({
            id: p.id,
            title: p.title || (locale==='ar'? 'مشروع':'Project'),
            description: p.description || '',
            createdAt: p.createdAt || new Date().toISOString(),
            views: (p.views ?? 0),
            budget: (p as any).budget ?? 0,
          }));
          setOpenProjects(list);
        }
      } catch {}
    };
    load();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch paged projects for browsing (first page)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { ok, data } = await getProjects({ page: 1, pageSize: 9, sortBy: 'createdAt', sortDirection: 'desc' });
        if (ok && data && (data as any).items && !cancelled) {
          const items = (data as any).items as any[];
          const mapped = items.map((p:any) => ({
            id: p.id,
            title: p.title || (locale==='ar'? 'مشروع':'Project'),
            description: p.description || '',
            createdAt: p.createdAt || new Date().toISOString(),
            views: (p.views ?? 0),
            budget: (p as any).budget ?? 0,
          }));
          setBrowseProjects(mapped);
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [locale]);

  // Persist user projects to localStorage whenever they change (after hydration)
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      if (!hydrated) return;
      if (isVendor) {
        // Vendor sees full list; persist as-is
        window.localStorage.setItem('user_projects', JSON.stringify(userProjects));
      } else {
        // Non-vendor: merge own projects with others to preserve others' data
        const raw = window.localStorage.getItem('user_projects');
        const existing = raw ? JSON.parse(raw) : [];
        let others: any[] = [];
        if (Array.isArray(existing)) {
          others = existing.filter((p:any)=> String(p.ownerId||'') !== currentUserId);
        }
        const merged = [...others, ...userProjects];
        window.localStorage.setItem('user_projects', JSON.stringify(merged));
      }
    } catch {}
  }, [userProjects, hydrated, currentUserId, isVendor]);

  // Persist additional builders
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      if (!hydrated) return;
      window.localStorage.setItem('builders_forms', JSON.stringify(additionalBuilders));
    } catch {}
  }, [additionalBuilders, hydrated]);

  // Persist user services
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      if (!hydrated) return;
      window.localStorage.setItem('user_services', JSON.stringify(userServices));
    } catch {}
  }, [userServices, hydrated]);

  const SERVICE_TYPES = [
    { id: 'plumber', ar: 'سباك', en: 'Plumber' },
    { id: 'electrician', ar: 'كهربائي', en: 'Electrician' },
    { id: 'carpenter', ar: 'نجار', en: 'Carpenter' },
    { id: 'painter', ar: 'نقاش', en: 'Painter' },
    { id: 'gypsum_installer', ar: 'فني تركيب جيبس بورد', en: 'Gypsum Board Installer' },
    { id: 'marble_installer', ar: 'فني تركيب رخام', en: 'Marble Installer' },
  ];

  // Build normalized dataset from userProjects for filters
  const normalizedUserProjects = (userProjects || []).map((up:any) => {
    const typeId = up.ptype || up.type || '';
    const matId = up.material || '';
    const totalPrice = typeof up.total === 'number' ? up.total : 0;
    const accIds: string[] = Array.isArray(up.selectedAcc)
      ? up.selectedAcc
      : Array.isArray(up.accessories)
        ? up.accessories.map((a:any)=> a?.id).filter(Boolean)
        : [];
    return { ...up, _typeId: typeId, _materialId: matId, _total: totalPrice, _accIds: accIds };
  });

  // Derive filter options and min/max from data
  const { typeOptions, materialOptions, accessoryOptions, minTotal, maxTotal } = (() => {
    const tSet = new Set<string>();
    const mSet = new Set<string>();
    const aSet = new Set<string>();
    let minT = Number.POSITIVE_INFINITY;
    let maxT = 0;
    normalizedUserProjects.forEach(p => {
      if (p._typeId) tSet.add(p._typeId);
      if (p._materialId) mSet.add(p._materialId);
      (p._accIds || []).forEach((id:string) => aSet.add(id));
      if (typeof p._total === 'number') {
        minT = Math.min(minT, p._total);
        maxT = Math.max(maxT, p._total);
      }
    });
    if (!Number.isFinite(minT)) minT = 0;
    return {
      typeOptions: Array.from(tSet),
      materialOptions: Array.from(mSet),
      accessoryOptions: Array.from(aSet),
      minTotal: minT,
      maxTotal: maxT,
    };
  })();

  // Initialize priceRange when data changes
  useEffect(() => {
    setPriceRange([minTotal, maxTotal]);
  }, [minTotal, maxTotal]);

  // Compute filtered user projects based on dynamic filters
  const filteredUserProjects = normalizedUserProjects.filter((p:any) => {
    if (fType && p._typeId !== fType) return false;
    if (fMaterial && p._materialId !== fMaterial) return false;
    if (fAcc.length > 0) {
      const hasAll = fAcc.every(id => p._accIds.includes(id));
      if (!hasAll) return false;
    }
    if (priceRange) {
      const [minP, maxP] = priceRange;
      if (typeof p._total === 'number') {
        if (p._total < minP || p._total > maxP) return false;
      }
    }
    // Optional: search term applies to description and type label
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const typeLabel = productTypes.find(pt=>pt.id===p._typeId)?.[locale==='ar'?'ar':'en'] || '';
      const matLabel = materials.find(m=>m.id===p._materialId)?.[locale==='ar'?'ar':'en'] || '';
      const desc = (p.description || '').toLowerCase();
      if (!typeLabel.toLowerCase().includes(q) && !matLabel.toLowerCase().includes(q) && !desc.includes(q)) return false;
    }
    return true;
  });

  useEffect(() => {
    let list = projects;

    // search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.name[locale].toLowerCase().includes(q) ||
          p.client[locale].toLowerCase().includes(q) ||
          p.category[locale].toLowerCase().includes(q) ||
          p.subCategory[locale].toLowerCase().includes(q)
      );
    }

    // category
    if (selectedCategory) {
      list = list.filter((p) =>
        p.category[locale] === selectedCategory ||
        p.subCategory[locale] === selectedCategory
      );
    }

    // stack filter
    if (selectedStacks.length > 0) {
      list = list.filter((p) => selectedStacks.every((s) => p.stack.includes(s)));
    }

    // budget
    list = list.filter((p) => p.budget >= budgetRange[0] && p.budget <= budgetRange[1]);

    // sort
    switch (sortBy) {
      case "price-low":
        list = [...list].sort((a, b) => a.budget - b.budget);
        break;
      case "price-high":
        list = [...list].sort((a, b) => b.budget - a.budget);
        break;
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        list = [...list].sort((a, b) => b.year - a.year);
        break;
      default:
        break;
    }

    setFiltered(list);
  }, [projects, searchTerm, selectedCategory, selectedStacks, budgetRange, sortBy, locale]);

  // Fixed price per m² per product type (SAR)
  const fixedPricePerType: Record<string, number> = {
    door: 500,
    window: 400,
    railing: 380,
  };

  useEffect(() => {
    if (autoPrice) {
      if (!ptype) {
        setPricePerMeter(0);
        return;
      }
      const calc = fixedPricePerType[ptype] ?? 0;
      setPricePerMeter(calc);
    }
  }, [autoPrice, ptype]);

  const isComplete = Boolean(ptype) && Boolean(material) && width > 0 && height > 0 && quantity > 0 && pricePerMeter > 0;

  const isCompleteB = (b: Builder) => Boolean(b.ptype) && Boolean(b.material) && b.width > 0 && b.height > 0 && b.quantity > 0 && b.pricePerMeter > 0;

  const computeTotal = (w:number, h:number, ppm:number, qty:number, accIds:string[]) => {
    const area = Math.max(0, w) * Math.max(0, h);
    const accessoriesCost = accIds.map(id => accessoriesCatalog.find(a => a.id === id)?.price || 0).reduce((a,b)=>a+b,0);
    const subtotal = area * ppm;
    const totalOne = subtotal + accessoriesCost;
    return Math.max(0, Math.round(totalOne * Math.max(1, qty)));
  };

  useEffect(() => {
    if (!isComplete) {
      setTotal(0);
      return;
    }
    const area = Math.max(0, width) * Math.max(0, height); // m²
    const accessoriesCost = selectedAcc
      .map(id => accessoriesCatalog.find(a => a.id === id)?.price || 0)
      .reduce((a, b) => a + b, 0);
    const subtotal = area * pricePerMeter;
    const totalOne = subtotal + accessoriesCost;
    setTotal(Math.max(0, Math.round(totalOne * Math.max(1, quantity))));
  }, [width, height, pricePerMeter, selectedAcc, quantity, isComplete]);

  const toggleAccessory = (id: string, checked: boolean) => {
    setSelectedAcc(prev => checked ? Array.from(new Set([...prev, id])) : prev.filter(x => x !== id));
  };

  const resetBuilder = () => {
    setPtype('');
    setMaterial('');
    setWidth(0);
    setHeight(0);
    setQuantity(0);
    setSelectedAcc([]);
    setAutoPrice(true);
    setPricePerMeter(0);
    setTotal(0);
    setDescription("");
  };

  const addBlankBuilderBelow = () => {
    const newB: Builder = {
      id: `b-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      ptype,
      material,
      width,
      height,
      quantity,
      autoPrice,
      pricePerMeter,
      selectedAcc: [...selectedAcc],
      description,
    };
    setAdditionalBuilders(prev => [...prev, newB]);
    resetBuilder();
  };

  const updateBuilder = (id: string, patch: Partial<Builder>) => {
    setAdditionalBuilders(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b));
  };

  const toggleAccessoryB = (id: string, accId: string, checked: boolean) => {
    setAdditionalBuilders(prev => prev.map(b => {
      if (b.id !== id) return b;
      const next = checked ? Array.from(new Set([...b.selectedAcc, accId])) : b.selectedAcc.filter(x => x !== accId);
      return { ...b, selectedAcc: next };
    }));
  };

  const autoPriceFor = (_materialId:string, typeId:string) => {
    if (!typeId) return 0;
    return fixedPricePerType[typeId] ?? 0;
  };

  const addBuilderFrom = (base: Builder) => {
    const clone: Builder = {
      id: `b-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      ptype: base.ptype,
      material: base.material,
      width: base.width,
      height: base.height,
      quantity: base.quantity,
      autoPrice: base.autoPrice,
      pricePerMeter: base.pricePerMeter,
      selectedAcc: [...base.selectedAcc],
      description: base.description,
    };
    setAdditionalBuilders(prev => [...prev, clone]);
  };

  const confirmProject = () => {
    const area = Math.max(0, width) * Math.max(0, height);
    const acc = accessoriesCatalog.filter(a => selectedAcc.includes(a.id));
    if (editingId) {
      setUserProjects(prev => prev.map(p => p.id === editingId ? {
        ...p,
        type: ptype,
        material,
        width,
        height,
        area,
        quantity,
        pricePerMeter,
        accessories: acc,
        total,
        updatedAt: new Date().toISOString(),
      } : p));
      setEditingId(null);
      resetBuilder();
      setShowBuilder(false);
      return;
    }
    const proj = {
      id: `u-${Date.now()}`,
      ownerId: currentUserId || 'guest',
      type: ptype,
      material,
      width,
      height,
      area,
      quantity,
      pricePerMeter,
      accessories: acc,
      description,
      total,
      createdAt: new Date().toISOString(),
    };
    setUserProjects(prev => [proj, ...prev]);
    resetBuilder();
    setShowBuilder(false);
  };

  const ProjectCard = ({ p }: { p: any }) => (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4">
        <div className="relative mb-4">
          <ImageWithFallback src={p.image} alt={p.name[locale]} className="w-full h-48 object-cover rounded-lg" />
          {p.isFeatured && (
            <Badge className="absolute top-2 right-2 bg-primary">{locale === 'ar' ? 'مميز' : 'Featured'}</Badge>
          )}
        </div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-medium text-lg">{p.name[locale]}</h3>
            <p className="text-sm text-muted-foreground">{p.client[locale]}</p>
          </div>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="w-4 h-4" />
            <span className="text-sm">{p.rating}</span>
          </div>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Tag className="w-4 h-4" /> {p.category[locale]} • {p.subCategory[locale]}</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-primary font-semibold">
            {currency} {p.budget.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')}
          </span>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-1" /> {locale === 'ar' ? 'التفاصيل' : 'Details'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <Header currentPage="projects" setCurrentPage={setCurrentPage as any} {...(rest as any)} />

      <div className="container mx-auto px-4 py-8">
        {/* Open Projects (backend) */}
        {openProjects.length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">{locale==='ar' ? 'مشاريع مفتوحة للمناقصات' : 'Open Projects for Bidding'}</h2>
                <span className="text-sm text-muted-foreground">{openProjects.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {openProjects.map((op) => (
                  <Card key={op.id} className="border rounded-lg">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-medium line-clamp-1">{op.title}</h3>
                          {op.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{op.description}</p>
                          )}
                        </div>
                        <Badge variant="secondary">{op.views} {locale==='ar' ? 'مشاهدة' : 'views'}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">{String(op.createdAt).slice(0,10)}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {/* Browse Projects (paged from backend) */}
        {browseProjects.length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">{locale==='ar' ? 'تصفح المشاريع' : 'Browse Projects'}</h2>
                <span className="text-sm text-muted-foreground">{browseProjects.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {browseProjects.map((bp) => (
                  <Card key={bp.id} className="border rounded-lg cursor-pointer" onClick={() => {
                    try { localStorage.setItem('selected_project_id', String(bp.id)); } catch {}
                    setCurrentPage && setCurrentPage('project-details');
                  }}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-medium line-clamp-1">{bp.title}</h3>
                          {bp.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{bp.description}</p>
                          )}
                        </div>
                        <Badge variant="secondary">{bp.views} {locale==='ar' ? 'مشاهدة' : 'views'}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">{String(bp.createdAt).slice(0,10)}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {!isLoggedIn && (
          <Card className="mb-6">
            <CardContent className="p-4 text-sm text-muted-foreground">
              {locale==='ar' ? 'يرجى تسجيل الدخول لإنشاء وعرض مشاريعك الخاصة. لن يستطيع الزوار مشاهدة مشاريع المستخدمين.' : 'Please sign in to create and view your own projects. Guests cannot view users’ projects.'}
            </CardContent>
          </Card>
        )}
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">{t('projects') || (locale==='ar' ? 'المشاريع' : 'Projects')}</h1>
            <p className="text-muted-foreground">{locale==='ar' ? 'استكشف مشاريعنا السابقة باستخدام الفلاتر والبحث' : 'Explore our past projects with rich filters and search'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
              <Grid className="w-4 h-4 mr-1" /> {locale==='ar' ? 'شبكة' : 'Grid'}
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
              <List className="w-4 h-4 mr-1" /> {locale==='ar' ? 'قائمة' : 'List'}
            </Button>
          </div>
        </div>

        {/* Project Builder */}
        {(showBuilder || !!editingId) && (
          <Card className="mb-8">
            <CardContent className="p-4 md:p-6 space-y-4">
              <h2 className="text-xl font-semibold">
                {editingId ? (locale==='ar' ? 'تعديل مشروع' : 'Edit Project') : (locale==='ar' ? 'بناء مشروع جديد' : 'Build a New Project')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* نوع المنتج */}
                <div>
                  <label className="block text-sm mb-1">{locale==='ar' ? 'نوع المنتج' : 'Product Type'}</label>
                  <Select value={ptype} onValueChange={setPtype}>
                    <SelectTrigger>
                      <SelectValue placeholder={locale==='ar' ? 'اختر النوع' : 'Select type'} />
                    </SelectTrigger>
                    <SelectContent>
                      {productTypes.map(pt => (
                        <SelectItem key={pt.id} value={pt.id}>{locale==='ar' ? pt.ar : pt.en}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* الخامة */}
                <div>
                  <label className="block text-sm mb-1">{locale==='ar' ? 'الخامة' : 'Material'}</label>
                  <Select value={material} onValueChange={setMaterial}>
                    <SelectTrigger>
                      <SelectValue placeholder={locale==='ar' ? 'اختر الخامة' : 'Select material'} />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map(m => (
                        <SelectItem key={m.id} value={m.id}>{locale==='ar' ? m.ar : m.en}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* الأبعاد */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm mb-1">{locale==='ar' ? 'العرض (متر)' : 'Width (m)'}</label>
                    <Input type="number" min={0} step={0.01} value={Number.isFinite(width) ? width : 0} onChange={(e) => setWidth(parseFloat(e.target.value || '0'))} placeholder={locale==='ar' ? '0.00' : '0.00'} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">{locale==='ar' ? 'الطول (متر)' : 'Height (m)'}</label>
                    <Input type="number" min={0} step={0.01} value={Number.isFinite(height) ? height : 0} onChange={(e) => setHeight(parseFloat(e.target.value || '0'))} placeholder={locale==='ar' ? '0.00' : '0.00'} />
                  </div>
                </div>
                {/* سعر المتر */}
                <div className="grid grid-cols-2 gap-2 items-end">
                  <div>
                    <label className="block text-sm mb-1">{locale==='ar' ? 'سعر المتر المربع' : 'Price per m²'}</label>
                    <Input type="number" min={0} step={1} value={Number.isFinite(pricePerMeter) ? pricePerMeter : 0} onChange={(e)=> { setPricePerMeter(parseFloat(e.target.value || '0')); setAutoPrice(false); }} disabled={autoPrice} placeholder={locale==='ar' ? '0' : '0'} />
                    <div className="text-xs text-muted-foreground mt-1">
                      {(() => {
                        const area = Math.max(0,width) * Math.max(0,height);
                        const accCost = selectedAcc.map(id => accessoriesCatalog.find(a => a.id === id)?.price || 0).reduce((a,b)=>a+b,0);
                        const subtotal = area * (pricePerMeter || 0);
                        const totalOne = subtotal + accCost;
                        const totalCalc = Math.max(0, Math.round(totalOne * Math.max(1, quantity)));
                        return `${locale==='ar' ? 'الحد الأدنى (الإجمالي المحسوب)' : 'Minimum (computed total)'}: ${currency} ${totalCalc.toLocaleString(locale==='ar'?'ar-EG':'en-US')}`;
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <Checkbox checked={autoPrice} onCheckedChange={(v) => setAutoPrice(!!v)} />
                    <span className="text-sm text-muted-foreground">{locale==='ar' ? 'حساب تلقائي' : 'Auto-calculate'}</span>
                  </div>
                </div>
                {/* الكمية */}
                <div>
                  <label className="block text-sm mb-1">{locale==='ar' ? 'الكمية' : 'Quantity'}</label>
                  <Input type="number" min={1} step={1} value={Number.isFinite(quantity) ? quantity : 0} onChange={(e) => setQuantity(parseInt(e.target.value || '0', 10) || 0)} placeholder={locale==='ar' ? '0' : '0'} />
                </div>
                {/* ملحقات */}
                <div className="md:col-span-2 lg:col-span-2">
                  <label className="block text-sm mb-2">{locale==='ar' ? 'ملحقات إضافية' : 'Additional Accessories'}</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {accessoriesCatalog.map(acc => (
                      <label key={acc.id} className="flex items-center gap-2 rounded-md border p-2">
                        <Checkbox checked={selectedAcc.includes(acc.id)} onCheckedChange={(v) => toggleAccessory(acc.id, !!v)} />
                        <span className="text-sm">
                          {locale==='ar' ? acc.ar : acc.en} <span className="text-muted-foreground">- {currency} {acc.price}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* وصف المشروع */}
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm mb-1">{locale==='ar' ? 'وصف المشروع (اختياري)' : 'Project Description (optional)'}</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full border rounded-md p-2 bg-background"
                    placeholder={locale==='ar' ? 'اكتب وصفاً مختصراً للمشروع...' : 'Write a brief description of your project...'}
                  />
                </div>
              </div>

              {/* زر إضافة نسخة جديدة من الفورم */}
              <div className="flex justify-start mt-2">
                <Button onClick={addBlankBuilderBelow} className="flex items-center gap-1" variant="outline">
                  <Plus className="w-4 h-4" /> {locale==='ar' ? 'إضافة مشروع' : 'Add Project'}
                </Button>
              </div>

              {/* Summary */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-2">
                <div className="text-sm text-muted-foreground">
                  {locale==='ar' ? 'المساحة' : 'Area'}: {(Math.max(0,width)*Math.max(0,height)).toFixed(2)} m² • {locale==='ar' ? 'سعر المتر' : 'Price/m²'}: {currency} {pricePerMeter}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-lg font-semibold">
                    {locale==='ar' ? 'الإجمالي التقديري' : 'Estimated Total'}: <span className="text-primary">{currency} {(total || 0).toLocaleString(locale==='ar'?'ar-EG':'en-US')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingId && (
                      <Button variant="outline" onClick={() => { setEditingId(null); resetBuilder(); }}>
                        {locale==='ar' ? 'إلغاء' : 'Cancel'}
                      </Button>
                    )}
                    <Button onClick={confirmProject} disabled={!isComplete} className={!isComplete ? 'opacity-50 cursor-not-allowed' : ''}>
                      {editingId ? (locale==='ar' ? 'حفظ التعديلات' : 'Save Changes') : (locale==='ar' ? 'تأكيد' : 'Confirm')}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Builder Forms */}
        {(showBuilder || !!editingId) && additionalBuilders.length > 0 && (
          <div className="space-y-6 mb-8">
            {additionalBuilders.map((b) => {
              const bAutoPrice = b.autoPrice ? autoPriceFor(b.material, b.ptype) : b.pricePerMeter;
              const effectivePPM = b.autoPrice ? bAutoPrice : b.pricePerMeter;
              const bTotal = isCompleteB({ ...b, pricePerMeter: effectivePPM }) ? computeTotal(b.width, b.height, effectivePPM, b.quantity, b.selectedAcc) : 0;
              return (
                <Card key={b.id}>
                  <CardContent className="p-4 md:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{locale==='ar' ? 'مشروع إضافي' : 'Additional Project'}</h3>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => addBuilderFrom(b)}>
                          <Plus className="w-4 h-4" /> {locale==='ar' ? 'إضافة مشروع' : 'Add Project'}
                        </Button>
                        <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700 text-white border border-red-600" onClick={() => setAdditionalBuilders(prev => prev.filter(x => x.id !== b.id))}>
                          {locale==='ar' ? 'حذف الفورم' : 'Remove Form'}
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm mb-1">{locale==='ar' ? 'نوع المنتج' : 'Product Type'}</label>
                        <Select value={b.ptype} onValueChange={(v)=> updateBuilder(b.id, { ptype: v, pricePerMeter: b.autoPrice ? autoPriceFor(b.material, v) : b.pricePerMeter })}>
                          <SelectTrigger>
                            <SelectValue placeholder={locale==='ar' ? 'اختر النوع' : 'Select type'} />
                          </SelectTrigger>
                          <SelectContent>
                            {productTypes.map(pt => (
                              <SelectItem key={pt.id} value={pt.id}>{locale==='ar' ? pt.ar : pt.en}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm mb-1">{locale==='ar' ? 'الخامة' : 'Material'}</label>
                        <Select value={b.material} onValueChange={(v)=> updateBuilder(b.id, { material: v, pricePerMeter: b.autoPrice ? autoPriceFor(v, b.ptype) : b.pricePerMeter })}>
                          <SelectTrigger>
                            <SelectValue placeholder={locale==='ar' ? 'اختر الخامة' : 'Select material'} />
                          </SelectTrigger>
                          <SelectContent>
                            {materials.map(m => (
                              <SelectItem key={m.id} value={m.id}>{locale==='ar' ? m.ar : m.en}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm mb-1">{locale==='ar' ? 'العرض (متر)' : 'Width (m)'}</label>
                          <Input type="number" min={0} step={0.01} value={Number.isFinite(b.width) ? b.width : 0} onChange={(e)=> updateBuilder(b.id, { width: parseFloat(e.target.value || '0') })} placeholder={locale==='ar' ? '0.00' : '0.00'} />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">{locale==='ar' ? 'الطول (متر)' : 'Height (m)'}</label>
                          <Input type="number" min={0} step={0.01} value={Number.isFinite(b.height) ? b.height : 0} onChange={(e)=> updateBuilder(b.id, { height: parseFloat(e.target.value || '0') })} placeholder={locale==='ar' ? '0.00' : '0.00'} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 items-end">
                        <div>
                          <label className="block text-sm mb-1">{locale==='ar' ? 'سعر المتر المربع' : 'Price per m²'}</label>
                          <Input type="number" min={0} step={1} value={Number.isFinite(effectivePPM) ? effectivePPM : 0} onChange={(e)=> updateBuilder(b.id, { pricePerMeter: parseFloat(e.target.value || '0'), autoPrice: false })} disabled={b.autoPrice} placeholder={locale==='ar' ? '0' : '0'} />
                          <div className="text-xs text-muted-foreground mt-1">
                            {locale==='ar' ? 'الحد الأدنى (الإجمالي المحسوب)' : 'Minimum (computed total)'}: {currency} {bTotal.toLocaleString(locale==='ar'?'ar-EG':'en-US')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-6">
                          <Checkbox checked={b.autoPrice} onCheckedChange={(v) => updateBuilder(b.id, { autoPrice: !!v, pricePerMeter: !!v ? autoPriceFor(b.material, b.ptype) : effectivePPM })} />
                          <span className="text-sm text-muted-foreground">{locale==='ar' ? 'حساب تلقائي' : 'Auto-calculate'}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm mb-1">{locale==='ar' ? 'الكمية' : 'Quantity'}</label>
                        <Input type="number" min={1} step={1} value={Number.isFinite(b.quantity) ? b.quantity : 0} onChange={(e)=> updateBuilder(b.id, { quantity: parseInt(e.target.value || '0', 10) || 0 })} placeholder={locale==='ar' ? '0' : '0'} />
                      </div>
                      <div className="md:col-span-2 lg:col-span-2">
                        <label className="block text-sm mb-2">{locale==='ar' ? 'ملحقات إضافية' : 'Additional Accessories'}</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {accessoriesCatalog.map(acc => (
                            <label key={acc.id} className="flex items-center gap-2 rounded-md border p-2">
                              <Checkbox checked={b.selectedAcc.includes(acc.id)} onCheckedChange={(v) => toggleAccessoryB(b.id, acc.id, !!v)} />
                              <span className="text-sm">
                                {locale==='ar' ? acc.ar : acc.en} <span className="text-muted-foreground">- {currency} {acc.price}</span>
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-sm mb-1">{locale==='ar' ? 'وصف المشروع (اختياري)' : 'Project Description (optional)'}</label>
                        <textarea value={b.description} onChange={(e)=> updateBuilder(b.id, { description: e.target.value })} rows={3} className="w-full border rounded-md p-2 bg-background" placeholder={locale==='ar' ? 'اكتب وصفاً مختصراً للمشروع...' : 'Write a brief description of your project...'} />
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-2">
                      <div className="text-sm text-muted-foreground">
                        {locale==='ar' ? 'المساحة' : 'Area'}: {(Math.max(0,b.width)*Math.max(0,b.height)).toFixed(2)} m² • {locale==='ar' ? 'سعر المتر' : 'Price/m²'}: {currency} {effectivePPM}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-lg font-semibold">
                          {locale==='ar' ? 'الإجمالي التقديري' : 'Estimated Total'}: <span className="text-primary">{currency} {bTotal.toLocaleString(locale==='ar'?'ar-EG':'en-US')}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Grand total across all forms */}
        {(showBuilder || !!editingId) && (
        <div className="mb-8">
          {(() => {
            const mainTotal = total || 0;
            const addTotals = additionalBuilders.map(b => {
              const ppm = b.autoPrice ? autoPriceFor(b.material, b.ptype) : b.pricePerMeter;
              return isCompleteB({ ...b, pricePerMeter: ppm }) ? computeTotal(b.width, b.height, ppm, b.quantity, b.selectedAcc) : 0;
            }).reduce((a,b)=>a+b,0);
            const grand = mainTotal + addTotals;
            return (
              <div className="flex items-center justify-between p-4 rounded-md border bg-muted/30">
                <div className="text-sm text-muted-foreground">{locale==='ar' ? 'الإجمالي الكلي لكل المشاريع في النموذج' : 'Grand total for all form projects'}</div>
                <div className="text-xl font-bold text-primary">{currency} {grand.toLocaleString(locale==='ar'?'ar-EG':'en-US')}</div>
              </div>
            );
          })()}
        </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`${t('search')} ${t('in')} ${t('projects') || (locale==='ar'?'المشاريع':'Projects')}...`}
              className="pl-10 pr-10"
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={locale==='ar' ? 'الترتيب' : 'Sort by'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">{t('relevance') || (locale==='ar'?'الصلة':'Relevance')}</SelectItem>
              <SelectItem value="price-low">{t('priceLowToHigh') || (locale==='ar'?'السعر من الأقل للأعلى':'Price: Low to High')}</SelectItem>
              <SelectItem value="price-high">{t('priceHighToLow') || (locale==='ar'?'السعر من الأعلى للأقل':'Price: High to Low')}</SelectItem>
              <SelectItem value="rating">{t('topRated') || (locale==='ar'?'الأعلى تقييماً':'Top Rated')}</SelectItem>
              <SelectItem value="newest">{t('newest') || (locale==='ar'?'الأحدث':'Newest')}</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-1" /> {t('filters') || (locale==='ar'?'الفلاتر':'Filters')}
          </Button>

          {!isVendor && (
            <Button
              onClick={() => {
                if (!isLoggedIn) {
                  (rest as any)?.setReturnTo?.('projects-builder');
                  setCurrentPage && setCurrentPage('login');
                  return;
                }
                setCurrentPage && setCurrentPage('projects-builder');
              }}
              className="flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> {locale==='ar' ? 'إضافة مشروع' : 'Add Project'}
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
            <Card className="p-4">
              <CardContent className="space-y-6">
                {/* Type */}
                <div>
                  <h3 className="font-semibold mb-3">{locale==='ar' ? 'نوع المنتج' : 'Product Type'}</h3>
                  <Select value={fType} onValueChange={setFType}>
                    <SelectTrigger>
                      <SelectValue placeholder={locale==='ar' ? 'الكل' : 'All'} />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((tid) => (
                        <SelectItem key={tid} value={tid}>{productTypes.find(pt=>pt.id===tid)?.[locale==='ar'?'ar':'en'] || tid}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Material */}
                <div>
                  <h3 className="font-semibold mb-3">{locale==='ar' ? 'الخامة' : 'Material'}</h3>
                  <Select value={fMaterial} onValueChange={setFMaterial}>
                    <SelectTrigger>
                      <SelectValue placeholder={locale==='ar' ? 'الكل' : 'All'} />
                    </SelectTrigger>
                    <SelectContent>
                      {materialOptions.map((mid) => (
                        <SelectItem key={mid} value={mid}>{materials.find(m=>m.id===mid)?.[locale==='ar'?'ar':'en'] || mid}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Accessories */}
                <div>
                  <h3 className="font-semibold mb-3">{locale==='ar' ? 'الملحقات' : 'Accessories'}</h3>
                  <div className="space-y-2">
                    {accessoryOptions.map((aid) => (
                      <label key={aid} className="flex items-center gap-2">
                        <Checkbox checked={fAcc.includes(aid)} onCheckedChange={(v) => {
                          const checked = !!v;
                          setFAcc(prev => checked ? Array.from(new Set([...prev, aid])) : prev.filter(x=>x!==aid));
                        }} />
                        <span>{accessoriesCatalog.find(a=>a.id===aid)?.[locale==='ar'?'ar':'en'] || aid}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Total price range */}
                <div>
                  <h3 className="font-semibold mb-3">{locale==='ar' ? 'الإجمالي' : 'Total Price'}</h3>
                  <Slider value={priceRange} min={minTotal} max={maxTotal} step={Math.max(1, Math.round((maxTotal-minTotal)/20) || 1)} onValueChange={(v:any)=> setPriceRange([v[0], v[1]])} />
                  <div className="mt-2 text-sm text-muted-foreground">
                    {currency} {priceRange[0]} - {currency} {priceRange[1]}
                  </div>
                </div>

                <Button variant="ghost" className="w-full" onClick={() => {
                  setFType('');
                  setFMaterial('');
                  setFAcc([]);
                  setPriceRange([minTotal, maxTotal]);
                }}>
                  <ArrowUpDown className="w-4 h-4 mr-1" /> {t('resetFilters') || (locale==='ar'?'إعادة تعيين الفلاتر':'Reset filters')}
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Results */}
          <section>
            {/* Services Section removed - services should be visible under Vendor Services only */}

            {/* User Projects */}
            {filteredUserProjects.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">{locale==='ar' ? 'المشاريع' : ' Projects'}</h3>
                <div className="space-y-3">
                  {filteredUserProjects.map((up) => (
                    <Card key={up.id}>
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div>
                          <div className="font-medium">{locale==='ar' ? 'نوع' : 'Type'}: {productTypes.find(p=>p.id===(up.ptype || up.type))?.[locale==='ar'?'ar':'en']}</div>
                          <div className="text-sm text-muted-foreground">
                            {locale==='ar' ? 'خامة' : 'Material'}: {materials.find(m=>m.id===up.material)?.[locale==='ar'?'ar':'en']} • {up.width}×{up.height} m • {locale==='ar' ? 'الكمية' : 'Qty'}: {up.quantity}
                          </div>
                          {up.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {locale==='ar' ? 'الوصف' : 'Description'}: {up.description}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {locale==='ar' ? 'ملحقات' : 'Accessories'}: {(() => {
                              const accNames = Array.isArray(up.accessories)
                                ? up.accessories.map((a:any)=> (locale==='ar'?a.ar:a.en))
                                : Array.isArray(up.selectedAcc)
                                  ? up.selectedAcc.map((id:string)=>{ const acc = accessoriesCatalog.find(a=>a.id===id); return acc ? (locale==='ar'?acc.ar:acc.en) : null; }).filter(Boolean as any)
                                  : [];
                              return accNames.length>0 ? (accNames as string[]).join(', ') : (locale==='ar'?'بدون':'None');
                            })()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">{locale==='ar' ? 'الإجمالي' : 'Total'}</div>
                          <div className="text-lg font-semibold text-primary">{currency} {up.total.toLocaleString(locale==='ar'?'ar-EG':'en-US')}</div>
                          <div className="mt-2 flex items-center gap-2 justify-end">
                            <Button size="sm" variant="outline" onClick={() => {
                              try { window.localStorage.setItem('selected_project_id', String(up.id)); } catch {}
                              setCurrentPage && setCurrentPage('project-details');
                              window?.scrollTo?.({ top: 0, behavior: 'smooth' });
                            }} aria-label={locale==='ar' ? 'التفاصيل' : 'Details'}>
                              <Eye className="w-4 h-4 ml-1" /> {locale==='ar' ? 'التفاصيل' : 'Details'}
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => {
                              try {
                                const draft = {
                                  id: up.id,
                                  ptype: up.ptype || up.type || '',
                                  psubtype: up.psubtype || 'normal',
                                  material: up.material || '',
                                  color: up.color || 'white',
                                  width: up.width || 0,
                                  height: up.height || 0,
                                  quantity: up.quantity || 1,
                                  // normalize accessories ids
                                  selectedAcc: Array.isArray(up.selectedAcc)
                                    ? up.selectedAcc
                                    : Array.isArray(up.accessories)
                                      ? up.accessories.map((a:any)=>a?.id).filter(Boolean)
                                      : [],
                                  description: up.description || ''
                                };
                                window.localStorage.setItem('edit_project_draft', JSON.stringify(draft));
                                // Also store additional items to open multiple forms in builder
                                if (Array.isArray((up as any).items) && (up as any).items.length > 0) {
                                  const itemsDraft = (up as any).items.map((it:any) => ({
                                    id: it.id || Math.random().toString(36).slice(2),
                                    ptype: it.ptype || it.type || '',
                                    psubtype: it.psubtype || 'normal',
                                    material: it.material || '',
                                    color: it.color || 'white',
                                    width: Number(it.width) || 0,
                                    height: Number(it.height) || 0,
                                    quantity: Number(it.quantity) || 1,
                                    autoPrice: true,
                                    pricePerMeter: Number(it.pricePerMeter) || 0,
                                    selectedAcc: Array.isArray(it.selectedAcc) ? it.selectedAcc : [],
                                    description: it.description || '',
                                  }));
                                  window.localStorage.setItem('edit_project_items_draft', JSON.stringify(itemsDraft));
                                } else {
                                  window.localStorage.removeItem('edit_project_items_draft');
                                }
                              } catch {}
                              setCurrentPage && setCurrentPage('projects-builder');
                              window?.scrollTo?.({ top: 0, behavior: 'smooth' });
                            }} aria-label={locale==='ar' ? 'تعديل' : 'Edit'}>
                              <Pencil className="w-4 h-4 ml-1" /> {locale==='ar' ? 'تعديل' : 'Edit'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="bg-red-600 hover:bg-red-700 text-white border border-red-600"
                              onClick={() => setUserProjects(prev => prev.filter(p => p.id !== up.id))}
                              aria-label={locale==='ar' ? 'حذف' : 'Delete'}
                            >
                              <Trash2 className="w-4 h-4 ml-1" /> {locale==='ar' ? 'حذف' : 'Delete'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Removed non-user results section (only user-added projects remain) */}
          </section>
        </div>
      </div>

      <Footer setCurrentPage={setCurrentPage as any} />
    </div>
  );
}
