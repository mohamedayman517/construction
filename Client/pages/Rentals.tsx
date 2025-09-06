import { useEffect, useMemo, useState } from 'react';
import { Search, Grid, List, Tag, Eye, Pencil, Trash2, Plus } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useTranslation } from '../hooks/useTranslation';
import type { RouteContext } from '../components/routerTypes';
import { Dialog, DialogTrigger } from '../components/ui/dialog';
import RentalForm from '../components/vendor/RentalForm';
import { confirmDialog } from '../utils/alerts';

interface RentalsProps extends Partial<RouteContext> {}

export default function Rentals({ setCurrentPage, ...rest }: RentalsProps) {
  const { locale } = useTranslation();
  const currency = locale === 'ar' ? 'ر.س' : 'SAR';

  const [rentals, setRentals] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRental, setEditingRental] = useState<any>(null);

  const isVendor = !!(rest as any)?.user && (rest as any)?.user?.role === 'vendor';

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const raw = window.localStorage.getItem('user_rentals');
      const list = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list)) setRentals(list);
    } catch {}
  }, []);

  const filtered = useMemo(() => {
    if (!searchTerm) return rentals;
    const q = searchTerm.toLowerCase();
    return rentals.filter((r:any) => {
      const name = (r.nameAr || r.nameEn || r.name || '').toString().toLowerCase();
      const cat = (r.category || '').toString().toLowerCase();
      const status = (r.status || '').toString().toLowerCase();
      return name.includes(q) || cat.includes(q) || status.includes(q);
    });
  }, [rentals, searchTerm]);

  const mapRentalToProduct = (r: any, locale: string) => {
    const nameObj = r.nameAr || r.nameEn ? { ar: r.nameAr || r.name || '', en: r.nameEn || r.name || '' } : r.name || '';
    const brandObj = r.brandAr || r.brandEn ? { ar: r.brandAr || '—', en: r.brandEn || '—' } : (r.brand || '—');
    const categoryObj = r.categoryAr || r.categoryEn ? { ar: r.categoryAr || r.category || '—', en: r.categoryEn || r.category || '—' } : (r.category || '—');
    return {
      id: String(r.id ?? ''),
      name: nameObj,
      brand: brandObj,
      category: categoryObj,
      subCategory: r.subCategory || '',
      price: Number(r.price ?? 0),
      originalPrice: Number(r.originalPrice ?? r.price ?? 0),
      rating: Number(r.rating ?? 4.5),
      reviewCount: Number(r.reviewCount ?? 0),
      images: r.images && Array.isArray(r.images) && r.images.length > 0 ? r.images : [r.image || ''],
      image: r.image || '',
      inStock: r.inStock !== false,
      stockCount: Number(r.stockCount ?? 10),
      isNew: Boolean(r.isNew ?? false),
      isOnSale: Boolean(r.isOnSale ?? false),
      compatibility: r.compatibility || [],
      partNumber: r.partNumber || '',
      warranty: r.warranty || (locale === 'ar' ? '3 أشهر' : '3 months'),
      description: r.descriptionAr || r.descriptionEn ? { ar: r.descriptionAr || r.description || '', en: r.descriptionEn || r.description || '' } : (r.description || ''),
      specifications: r.specifications || r.specs || {},
      features: r.features || [],
      addonInstallation: r.addonInstallation || undefined,
    };
  };

  const RentalCard = ({ r }: { r: any }) => (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4">
        <div className="relative mb-4">
          <ImageWithFallback src={r.image} alt={(r.nameAr||r.nameEn||r.name)||''} className="w-full h-48 object-cover rounded-lg" />
          {r.status === 'active' && (
            <Badge className="absolute top-2 right-2 bg-primary">{locale==='ar' ? 'نشط' : 'Active'}</Badge>
          )}
        </div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-medium text-lg">{r.nameAr || r.nameEn || r.name}</h3>
            <p className="text-sm text-muted-foreground">{r.category || (locale==='ar'?'بدون فئة':'Uncategorized')}</p>
          </div>
          {isVendor && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingRental(r)}
                title={locale==='ar'?'تعديل':'Edit'}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => handleDeleteRental(r.id)}
                title={locale==='ar'?'حذف':'Delete'}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Tag className="w-4 h-4" /> {(r.status==='active') ? (locale==='ar'?'منشور':'Published') : (locale==='ar'?'مسودة':'Draft')}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-primary font-semibold">
            {currency} {(Number(r.price||0)).toLocaleString(locale==='ar'?'ar-EG':'en-US')}
          </span>
          {!isVendor && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                try {
                  (rest as any)?.setSelectedProduct && (rest as any).setSelectedProduct(mapRentalToProduct(r, locale));
                } catch {}
                if (setCurrentPage) setCurrentPage('rental-details');
                if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <Eye className="w-4 h-4 mr-1" /> {locale==='ar' ? 'التفاصيل' : 'Details'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const handleAddRental = (data: any) => {
    const genId = `r-${Date.now()}`;
    const newItem = {
      ...data,
      id: genId,
      name: data?.nameAr || data?.name || '',
      nameAr: data?.nameAr || '',
      nameEn: data?.nameEn || '',
      brand: data?.brand || 'عام',
      category: data?.category || '',
      price: Number(data?.price || 0),
      originalPrice: Number(data?.originalPrice || data?.price || 0),
      stock: Number(data?.stock || 1),
      status: data?.status || 'active',
      image: data?.image || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=200',
      images: Array.isArray(data?.images) ? data.images : [],
      createdAt: new Date().toISOString().split('T')[0],
      sales: 0,
      views: 0,
    };
    try {
      const raw = localStorage.getItem('user_rentals');
      const list = raw ? (JSON.parse(raw) as any[]) : [];
      localStorage.setItem('user_rentals', JSON.stringify([newItem, ...list]));
    } catch {}
    setRentals(prev => [newItem, ...prev]);
    setIsAddDialogOpen(false);
  };

  const handleEditRental = (data: any) => {
    setRentals(prev => prev.map(p => p.id === data.id ? { ...p, ...data } : p));
    try {
      const raw = localStorage.getItem('user_rentals');
      const list = raw ? (JSON.parse(raw) as any[]) : [];
      const idx = list.findIndex((it: any) => it.id === data.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...data };
        localStorage.setItem('user_rentals', JSON.stringify(list));
      }
    } catch {}
    setEditingRental(null);
  };

  const handleDeleteRental = async (id: string) => {
    const ok = await confirmDialog(
      locale === 'en' ? 'Are you sure you want to delete this rental?' : 'هل أنت متأكد من حذف هذا التأجير؟',
      locale === 'en' ? 'Delete' : 'حذف',
      locale === 'en' ? 'Cancel' : 'إلغاء',
      locale === 'ar'
    );
    if (!ok) return;
    setRentals(prev => prev.filter(p => p.id !== id));
    try {
      const raw = localStorage.getItem('user_rentals');
      const list = raw ? (JSON.parse(raw) as any[]) : [];
      localStorage.setItem('user_rentals', JSON.stringify(list.filter((it: any) => it.id !== id)));
    } catch {}
  };

  return (
    <div className="min-h-screen bg-background" dir={locale==='ar'?'rtl':'ltr'}>
      <Header currentPage="rentals" setCurrentPage={setCurrentPage as any} {...(rest as any)} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">{locale==='ar' ? 'التأجير' : 'Rentals'}</h1>
            <p className="text-muted-foreground">{locale==='ar' ? 'تصفح عناصر التأجير التي أضفتها' : 'Browse the rental items you added'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
              <Grid className="w-4 h-4 mr-1" /> {locale==='ar' ? 'شبكة' : 'Grid'}
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
              <List className="w-4 h-4 mr-1" /> {locale==='ar' ? 'قائمة' : 'List'}
            </Button>
            {isVendor && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="ml-2">
                    <Plus className="w-4 h-4 ml-1" /> {locale==='ar' ? 'إضافة تأجير جديد' : 'Add New Rental'}
                  </Button>
                </DialogTrigger>
                <RentalForm onSave={handleAddRental} onCancel={() => setIsAddDialogOpen(false)} />
              </Dialog>
            )}
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative max-w-xl">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={locale==='ar' ? 'ابحث في التأجير...' : 'Search rentals...'}
                value={searchTerm}
                onChange={(e)=> setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">
            {locale==='ar' ? 'لا توجد عناصر تأجير بعد.' : 'No rental items yet.'}
          </div>
        ) : (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filtered.map((r:any) => (
                <RentalCard key={r.id} r={r} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((r:any) => (
                <Card key={r.id}>
                  <CardContent className="p-4 flex gap-4 items-center">
                    <div className="w-32 h-24 overflow-hidden rounded-md border bg-gray-50">
                      <ImageWithFallback src={r.image} alt={(r.nameAr||r.nameEn||r.name)||''} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{r.nameAr || r.nameEn || r.name}</div>
                          <div className="text-sm text-muted-foreground">{r.category || (locale==='ar'?'بدون فئة':'Uncategorized')}</div>
                        </div>
                        <div className="text-primary font-semibold">{currency} {(Number(r.price||0)).toLocaleString(locale==='ar'?'ar-EG':'en-US')}</div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {(r.status==='active') ? (locale==='ar'?'منشور':'Published') : (locale==='ar'?'مسودة':'Draft')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isVendor && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingRental(r)}
                            title={locale==='ar'?'تعديل':'Edit'}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={() => handleDeleteRental(r.id)}
                            title={locale==='ar'?'حذف':'Delete'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {!isVendor && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            try {
                              (rest as any)?.setSelectedProduct && (rest as any).setSelectedProduct(mapRentalToProduct(r, locale));
                            } catch {}
                            if (setCurrentPage) setCurrentPage('rental-details');
                            if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" /> {locale==='ar' ? 'التفاصيل' : 'Details'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}
        {isVendor && editingRental && (
          <Dialog open={!!editingRental} onOpenChange={() => setEditingRental(null)}>
            <RentalForm product={editingRental} onSave={handleEditRental} onCancel={() => setEditingRental(null)} />
          </Dialog>
        )}
      </div>

      <Footer setCurrentPage={setCurrentPage as any} />
    </div>
  );
}
