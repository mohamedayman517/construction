import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Filter, Package, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogTrigger } from '../../components/ui/dialog';
import { RouteContext } from '../../components/Router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductForm from '../../components/vendor/ProductForm';
import ProductItem from '../../components/vendor/ProductItem';
import { productCategories, productBrands } from '../../data/vendorMockData';
import { getMyProducts, createProduct, updateProduct, deleteProduct } from '@/services/products';
import { useTranslation } from '../../hooks/useTranslation';
import { confirmDialog } from '../../utils/alerts';

type VendorProductsProps = Partial<RouteContext>;

export default function VendorProducts({ setCurrentPage, setSelectedProduct, ...context }: VendorProductsProps) {
  const { locale } = useTranslation();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  // Safe navigation fallback to avoid TS issues and preserve SPA context
  const safeSetCurrentPage = setCurrentPage ?? (() => {});
  // Load products: use backend (my products)
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { ok, data } = await getMyProducts();
        if (ok && Array.isArray(data)) {
          const list = data.map((p: any) => ({
            id: p.id,
            name: p.name || p.title || '',
            nameAr: p.nameAr || p.name || '',
            nameEn: p.nameEn || p.name || '',
            brand: p.brand || 'عام',
            category: (p.category?.name) || '',
            subCategoryAr: '',
            subCategoryEn: '',
            price: Number(p.price || 0),
            originalPrice: Number(p.originalPrice || p.price || 0),
            stock: Number(p.stock ?? 0),
            status: p.status || 'active',
            image: p.imageUrl || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=200',
            images: Array.isArray(p.images) ? p.images : (p.imageUrl ? [p.imageUrl] : []),
            isNew: Boolean(p.isNew),
            isOnSale: Boolean(p.isOnSale),
            partNumber: p.partNumber || '',
            partLocation: (p as any).partLocation || '',
            descriptionAr: p.descriptionAr || '',
            descriptionEn: p.descriptionEn || p.description || '',
            createdAt: p.createdAt || new Date().toISOString().split('T')[0],
            sales: (p as any).sales || 0,
            views: (p as any).views || 0,
          }));
          if (!cancelled) setProducts(list);
          return;
        }
      } catch {}
      if (!cancelled) setProducts([]);
    };

    load();
    return () => { cancelled = true; };
  }, []);

  // Filter products based on search and filters
  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.includes(searchTerm) ||
        product.partNumber.includes(searchTerm) ||
        product.brand.includes(searchTerm)
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (selectedStatus && selectedStatus !== 'all') {
      filtered = filtered.filter(product => product.status === selectedStatus);
    }

    if (selectedBrand && selectedBrand !== 'all') {
      filtered = filtered.filter(product => product.brand === selectedBrand);
    }

    setFilteredProducts(filtered);
  };

  // Update filters when dependencies change
  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, selectedStatus, selectedBrand, products]);

  // Export current filtered products to CSV
  const handleExportCSV = () => {
    const headers = [
      'id','nameAr','nameEn','brand','category','subCategoryAr','subCategoryEn','price','originalPrice','stock','status','partNumber','partLocation','descriptionAr','descriptionEn','addonInstallEnabled','addonInstallFee','image','images'
    ];
    const rows = filteredProducts.map((p: any) => [
      p.id,
      p.nameAr || p.name || '',
      p.nameEn || '',
      p.brand || '',
      p.category || '',
      p.subCategoryAr || (p.subCategory?.ar) || '',
      p.subCategoryEn || (p.subCategory?.en) || '',
      String(p.price ?? ''),
      String(p.originalPrice ?? ''),
      String(p.stock ?? ''),
      p.status || '',
      p.partNumber || '',
      p.partLocation || '',
      p.descriptionAr || (p.description?.ar) || '',
      p.descriptionEn || (p.description?.en) || '',
      String(!!p.addonInstallEnabled),
      String(p.addonInstallFee ?? p.addonInstallation?.feePerUnit ?? ''),
      p.image || '',
      Array.isArray(p.images) ? p.images.join(';') : ''
    ]);
    const escape = (s: any) => {
      const v = String(s ?? '');
      return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}` + '"' : v;
    };
    const csv = [headers.join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendor-products-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import products from CSV (simple comma-separated values)
  const handleImportCSV = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
      if (lines.length <= 1) return;
      const headers = lines[0].split(',').map(h => h.trim());
      const idx = (key: string) => headers.findIndex(h => h.toLowerCase() === key.toLowerCase());
      for (let i = 1; i < lines.length; i++) {
        const raw = lines[i];
        // simple CSV split (does not support complex quoted commas fully)
        const cols = raw.split(',');
        const get = (key: string) => {
          const j = idx(key);
          return j >= 0 ? (cols[j] ?? '').replace(/^\"|\"$/g, '').replace(/\"\"/g, '"') : '';
        };
        const imagesStr = get('images');
        const productData: any = {
          nameAr: get('nameAr') || get('name') || '',
          nameEn: get('nameEn') || '',
          brand: get('brand') || 'عام',
          category: get('category') || '',
          subCategoryAr: get('subCategoryAr') || '',
          subCategoryEn: get('subCategoryEn') || '',
          price: Number(get('price') || 0),
          originalPrice: Number(get('originalPrice') || 0),
          stock: Number(get('stock') || 0),
          status: get('status') || 'active',
          partNumber: get('partNumber') || '',
          partLocation: get('partLocation') || '',
          descriptionAr: get('descriptionAr') || '',
          descriptionEn: get('descriptionEn') || '',
          addonInstallEnabled: get('addonInstallEnabled') === 'true',
          addonInstallFee: Number(get('addonInstallFee') || 0),
          image: get('image') || '',
          images: imagesStr ? imagesStr.split(';').filter(Boolean) : [],
          isActive: (get('status') || 'active') === 'active',
          isNew: false,
          isOnSale: false,
        };
        handleAddProduct(productData);
      }
    } catch {}
  };

  const reload = async () => {
    try {
      const { ok, data } = await getMyProducts();
      if (ok && Array.isArray(data)) {
        const list = data.map((p: any) => ({
          id: p.id,
          name: p.name || '',
          nameAr: p.nameAr || p.name || '',
          nameEn: p.nameEn || p.name || '',
          brand: p.brand || 'عام',
          category: (p.category?.name) || '',
          price: Number(p.price || 0),
          originalPrice: Number(p.originalPrice || p.price || 0),
          stock: Number(p.stock ?? 0),
          status: p.status || 'active',
          image: p.imageUrl || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=200',
          images: Array.isArray(p.images) ? p.images : (p.imageUrl ? [p.imageUrl] : []),
        }));
        setProducts(list);
      } else setProducts([]);
    } catch { setProducts([]); }
  };

  const handleAddProduct = async (productData: any) => {
    await createProduct({
      name: productData?.nameAr || productData?.name || '',
      description: productData?.descriptionAr || productData?.descriptionEn || '',
      price: Number(productData?.price || 0),
      stock: Number(productData?.stock || 0),
      brand: productData?.brand || 'عام',
      partNumber: productData?.partNumber || '',
      imageUrl: productData?.image || (Array.isArray(productData?.images) ? productData.images[0] : ''),
      categoryId: undefined,
    });
    setIsAddDialogOpen(false);
    await reload();
  };

  const handleEditProduct = async (productData: any) => {
    await updateProduct(productData.id, {
      name: productData?.nameAr || productData?.name || '',
      description: productData?.descriptionAr || productData?.descriptionEn || '',
      price: Number(productData?.price || 0),
      stock: Number(productData?.stock || 0),
      brand: productData?.brand || 'عام',
      partNumber: productData?.partNumber || '',
      imageUrl: productData?.image || (Array.isArray(productData?.images) ? productData.images[0] : ''),
      categoryId: undefined,
    });
    setEditingProduct(null);
    await reload();
  };

  const handleDeleteProduct = async (productId: string) => {
    const ok = await confirmDialog(
      locale === 'en' ? 'Are you sure you want to delete this product?' : 'هل أنت متأكد من حذف هذا المنتج؟',
      locale === 'en' ? 'Delete' : 'حذف',
      locale === 'en' ? 'Cancel' : 'إلغاء',
      locale === 'ar'
    );
    if (!ok) return;
    await deleteProduct(Number(productId));
    await reload();
  };

  const handleViewProduct = (product: any) => {
    // Stay within vendor context: open edit dialog instead of routing to public product details
    setEditingProduct(product);
  };

  const getStatsCards = () => {
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'active').length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const draftProducts = products.filter(p => p.status === 'draft').length;

    return [
      { title: locale === 'en' ? 'Total Products' : 'إجمالي المنتجات', value: totalProducts, icon: Package, color: 'text-blue-500' },
      { title: locale === 'en' ? 'Active Products' : 'المنتجات النشطة', value: activeProducts, icon: Package, color: 'text-green-500' },
      { title: locale === 'en' ? 'Out of Stock' : 'نفد المخزون', value: outOfStock, icon: AlertCircle, color: 'text-red-500' },
      { title: locale === 'en' ? 'Drafts' : 'المسودات', value: draftProducts, icon: Package, color: 'text-yellow-500' }
    ];
  };

  return (
    <div className="min-h-screen bg-background">
      <Header currentPage="vendor-products" setCurrentPage={safeSetCurrentPage} {...context} />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{locale === 'en' ? 'Product Management' : 'إدارة المنتجات'}</h1>
            <p className="text-muted-foreground">{locale === 'en' ? 'Manage your products and track sales' : 'إدارة منتجاتك ومتابعة المبيعات'}</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                {locale === 'en' ? 'Add New Product' : 'إضافة منتج جديد'}
              </Button>
            </DialogTrigger>
            <ProductForm 
              onSave={handleAddProduct}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </Dialog>
          <div className="flex items-center gap-2">
            <input
              ref={importInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImportCSV(f).then(() => { if (importInputRef.current) importInputRef.current.value = ''; });
              }}
            />
            <Button variant="outline" onClick={() => importInputRef.current?.click()}>
              {locale === 'en' ? 'Import CSV' : 'استيراد CSV'}
            </Button>
            <Button variant="secondary" onClick={handleExportCSV}>
              {locale === 'en' ? 'Export CSV' : 'تصدير CSV'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {getStatsCards().map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                  </div>
                  <div className={`h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={locale === 'en' ? 'Search products...' : 'ابحث عن المنتجات...'}
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
                    {productCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={locale === 'en' ? 'Brand' : 'العلامة التجارية'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{locale === 'en' ? 'All Brands' : 'جميع العلامات'}</SelectItem>
                    {productBrands.map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
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
                    <SelectItem value="out_of_stock">{locale === 'en' ? 'Out of Stock' : 'نفد المخزون'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>{locale === 'en' ? 'Products' : 'المنتجات'} ({filteredProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">{locale === 'en' ? 'No products' : 'لا توجد منتجات'}</h3>
                <p className="text-muted-foreground">{locale === 'en' ? 'Start by adding your first product' : 'ابدأ بإضافة منتجك الأول'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map(product => (
                  <ProductItem
                    key={product.id}
                    product={product}
                    onEdit={setEditingProduct}
                    onDelete={handleDeleteProduct}
                    onView={handleViewProduct}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Edit Product Dialog */}
        {editingProduct && (
          <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
            <ProductForm 
              product={editingProduct}
              onSave={handleEditProduct}
              onCancel={() => setEditingProduct(null)}
            />
          </Dialog>
        )}
      </div>
      
      <Footer setCurrentPage={safeSetCurrentPage} />
    </div>
  );
}