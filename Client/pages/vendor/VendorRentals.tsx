import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Package } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogTrigger } from '../../components/ui/dialog';
import { RouteContext } from '../../components/Router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import RentalForm from '../../components/vendor/RentalForm';
import ProductItem from '../../components/vendor/ProductItem';
import { useTranslation } from '../../hooks/useTranslation';
import { confirmDialog } from '../../utils/alerts';

// This page mirrors VendorProducts but for rentals. It reuses ProductForm and ProductItem for speed.

type VendorRentalsProps = Partial<RouteContext>;

export default function VendorRentals({ setCurrentPage, ...context }: VendorRentalsProps) {
  const { locale } = useTranslation();
  const [rentals, setRentals] = useState<any[]>([]);
  const [filteredRentals, setFilteredRentals] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRental, setEditingRental] = useState<any>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const safeSetCurrentPage = setCurrentPage ?? (() => {});

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user_rentals');
      const list = raw ? (JSON.parse(raw) as any[]) : [];
      setRentals(list);
    } catch {}
  }, []);

  useEffect(() => {
    let filtered = rentals;
    if (searchTerm) {
      filtered = filtered.filter((r: any) =>
        (r.name || '').includes(searchTerm) ||
        (r.partNumber || '').includes(searchTerm) ||
        (r.brand || '').includes(searchTerm)
      );
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((r: any) => r.category === selectedCategory);
    }
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((r: any) => r.status === selectedStatus);
    }
    setFilteredRentals(filtered);
  }, [searchTerm, selectedCategory, selectedStatus, rentals]);

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
    <div className="min-h-screen bg-background">
      <Header currentPage="vendor-rentals" setCurrentPage={safeSetCurrentPage} {...context} />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{locale === 'en' ? 'Rental Management' : 'إدارة التأجير'}</h1>
            <p className="text-muted-foreground">{locale === 'en' ? 'Manage your rentals' : 'إدارة خدمات التأجير'}</p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                {locale === 'en' ? 'Add New Rental' : 'إضافة تأجير جديد'}
              </Button>
            </DialogTrigger>
            <RentalForm 
              onSave={handleAddRental}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={locale === 'en' ? 'Search rentals...' : 'ابحث في التأجير...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={locale === 'en' ? 'Category' : 'الفئة'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{locale === 'en' ? 'All Categories' : 'جميع الفئات'}</SelectItem>
                    {/* Categories are free-form for now */}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder={locale === 'en' ? 'Status' : 'الحالة'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{locale === 'en' ? 'All Statuses' : 'جميع الحالات'}</SelectItem>
                    <SelectItem value="active">{locale === 'en' ? 'Active' : 'نشط'}</SelectItem>
                    <SelectItem value="draft">{locale === 'en' ? 'Draft' : 'مسودة'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rentals List */}
        <Card>
          <CardHeader>
            <CardTitle>{locale === 'en' ? 'Rentals' : 'التأجير'} ({filteredRentals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRentals.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">{locale === 'en' ? 'No rentals' : 'لا توجد عناصر تأجير'}</h3>
                <p className="text-muted-foreground">{locale === 'en' ? 'Start by adding your first rental' : 'ابدأ بإضافة أول عنصر تأجير لك'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRentals.map(rental => (
                  <ProductItem
                    key={rental.id}
                    product={rental}
                    onEdit={setEditingRental}
                    onDelete={handleDeleteRental}
                    onView={setEditingRental}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Rental Dialog */}
        {editingRental && (
          <Dialog open={!!editingRental} onOpenChange={() => setEditingRental(null)}>
            <RentalForm 
              product={editingRental}
              onSave={handleEditRental}
              onCancel={() => setEditingRental(null)}
            />
          </Dialog>
        )}
      </div>

      <Footer setCurrentPage={safeSetCurrentPage} />
    </div>
  );
}
