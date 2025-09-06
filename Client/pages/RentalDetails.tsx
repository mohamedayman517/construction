import { useState } from 'react';
import {
  ArrowRight,
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Check,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { RouteContext } from '../components/Router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useTranslation } from '../hooks/useTranslation';
import { WishlistItem } from '../components/Router';

interface RentalDetailsProps {
  currentPage?: string;
  setCurrentPage?: (page: string) => void;
  selectedProduct?: any;
  addToCart?: (item: any) => void;
  isInWishlist?: (id: string) => boolean;
  addToWishlist?: (item: WishlistItem) => void;
  removeFromWishlist?: (id: string) => void;
}

export default function RentalDetails({
  currentPage,
  setCurrentPage,
  selectedProduct,
  addToCart,
  isInWishlist,
  addToWishlist,
  removeFromWishlist,
  ...rest
}: RentalDetailsProps & Partial<RouteContext>) {
  const { t, locale } = useTranslation();
  const isVendor = ((rest as any)?.user?.role) === 'vendor';
  const currency = locale === 'ar' ? 'ر.س' : 'SAR';
  const getText = (val: any): string => {
    if (val && typeof val === 'object') {
      return val[locale] ?? val.ar ?? val.en ?? '';
    }
    return String(val ?? '');
  };
  const [quantity, setQuantity] = useState(1);
  const [installSelected, setInstallSelected] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [userComment, setUserComment] = useState('');

  // Use product-details defaults if not provided, to keep UI parity
  const product = selectedProduct || {
    id: '1',
    name: 'فلتر زيت محرك تويوتا كامري',
    brand: 'تويوتا',
    category: 'فلاتر',
    subCategory: 'فلاتر الزيت',
    price: 85,
    originalPrice: 120,
    rating: 4.5,
    reviewCount: 128,
    images: [
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600',
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600',
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600',
    ],
    inStock: true,
    stockCount: 15,
    isNew: false,
    isOnSale: true,
    compatibility: [
      'تويوتا كامري 2015-2022',
      'تويوتا أفالون 2016-2021',
      'لكزس ES 350 2015-2020',
    ],
    partNumber: 'TOY-OF-2015',
    warranty: '6 أشهر',
    description:
      'فلتر زيت عالي الجودة مصنوع من أفضل المواد لضمان حماية محرك سيارتك. يتميز بكفاءة عالية في تنقية الزيت وإزالة الشوائب.',
    specifications: {
      'رقم القطعة': 'TOY-OF-2015',
      'العلامة التجارية': 'تويوتا الأصلية',
      'نوع الفلتر': 'فلتر زيت',
      مادة: 'ورق مطوي عالي الجودة',
      'مقاومة الحرارة': 'حتى 150 درجة مئوية',
      'فترة الاستبدال': 'كل 10,000 كم',
      'بلد المنشأ': 'اليابان',
    },
    features: [
      'حماية فائقة للمحرك',
      'كفاءة تنقية عالية تصل إلى 99%',
      'مقاوم للحرارة العالية',
      'سهولة في التركيب',
      'متوافق مع زيوت المحرك الاصطناعية',
      'ضمان الجودة من الشركة المصنعة',
    ],
    installationTips: [
      'تأكد من تفريغ الزيت القديم بالكامل',
      'نظف مكان تركيب الفلتر جيداً',
      'ادهن حلقة الإحكام بطبقة رقيقة من الزيت',
      'اربط الفلتر يدوياً ثم أضف 3/4 دورة إضافية',
      'تحقق من عدم وجود تسريب بعد تشغيل المحرك',
    ],
  };

  const isWishlisted = isInWishlist && isInWishlist(product?.id || '1');

  const images = product.images || [product.image, product.image, product.image];
  const discountPercentage =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const normalizedInStock = product.inStock !== false && ((product.stockCount ?? 1) > 0);
  const normalizedStockCount = product.stockCount ?? 99;

  const textName = getText(product?.name || '').toLowerCase();
  const textCat = getText(product?.category || '').toLowerCase();
  const textSub = getText(product?.subCategory || '').toLowerCase();
  const isDoorLike = /باب|door/.test(textName) || /باب|door/.test(textCat) || /باب|door/.test(textSub);
  const isWindowLike = /شباك|نافذة|window/.test(textName) || /شباك|نافذة|window/.test(textCat) || /شباك|نافذة|window/.test(textSub);
  const doorWindowIds = new Set(['wd-1','mw-1','aw-1']);
  const vendorInstallEnabled = !!(product as any)?.addonInstallation?.enabled;
  const vendorInstallFee = Number((product as any)?.addonInstallation?.feePerUnit ?? 50);
  const fallbackInstall = doorWindowIds.has(product?.id || '') || isDoorLike || isWindowLike;
  const showInstallOption = vendorInstallEnabled ? true : fallbackInstall;
  const INSTALL_FEE_PER_UNIT = vendorInstallEnabled ? vendorInstallFee : 50;
  const priceWithAddon = product.price + (showInstallOption && installSelected ? INSTALL_FEE_PER_UNIT : 0);
  const subtotal = priceWithAddon * quantity;

  const handleAddToCart = () => {
    if (addToCart) {
      addToCart({
        id: product.id,
        name: getText(product.name),
        price: priceWithAddon,
        image: images[0],
        partNumber: product.partNumber,
        quantity,
        inStock: normalizedInStock,
        maxQuantity: normalizedStockCount,
        originalPrice: product.originalPrice,
        brand: getText(product.brand),
        addonInstallation: showInstallOption && installSelected ? {
          enabled: true,
          feePerUnit: INSTALL_FEE_PER_UNIT,
          totalFee: INSTALL_FEE_PER_UNIT * quantity,
          label: locale === 'ar' ? 'خدمة تركيب مع ضمان جودة' : 'Installation service with quality guarantee'
        } : { enabled: false }
      });
    }
    if (setCurrentPage) setCurrentPage('cart');
  };

  const handleBuyNow = () => {
    if (addToCart) {
      addToCart({
        id: product.id,
        name: getText(product.name),
        price: priceWithAddon,
        image: images[0],
        partNumber: product.partNumber,
        quantity,
        inStock: normalizedInStock,
        maxQuantity: normalizedStockCount,
        originalPrice: product.originalPrice,
        brand: getText(product.brand),
        addonInstallation: showInstallOption && installSelected ? {
          enabled: true,
          feePerUnit: INSTALL_FEE_PER_UNIT,
          totalFee: INSTALL_FEE_PER_UNIT * quantity,
          label: locale === 'ar' ? 'خدمة تركيب مع ضمان جودة' : 'Installation service with quality guarantee'
        } : { enabled: false }
      });
    }
    if (setCurrentPage) setCurrentPage('checkout');
  };

  return (
    <div className="min-h-screen bg-background" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <Header currentPage="rental-details" setCurrentPage={setCurrentPage!} {...(rest as any)} />

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb mirrors product but goes to rentals */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button onClick={() => setCurrentPage && setCurrentPage('home')} className="hover:text-primary">
            {t('home')}
          </button>
          <ChevronLeft className="h-4 w-4" />
          <button onClick={() => setCurrentPage && setCurrentPage('rentals')} className="hover:text-primary">
            {locale === 'ar' ? 'التأجير' : 'Rentals'}
          </button>
          <ChevronLeft className="h-4 w-4" />
          <span>{getText(product.category)}</span>
          <ChevronLeft className="h-4 w-4" />
          <span className="text-foreground">{getText(product.name)}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative">
              <ImageWithFallback
                src={images[selectedImageIndex]}
                alt={getText(product.name)}
                className="w-full h-96 object-cover rounded-lg"
              />
              {product.isNew && (
                <Badge className="absolute top-4 right-4 bg-green-500">{locale === 'en' ? 'New' : 'جديد'}</Badge>
              )}
              {product.isOnSale && (
                <Badge className="absolute top-4 left-4 bg-red-500">
                  {locale === 'en' ? 'Discount' : 'خصم'} {discountPercentage}%
                </Badge>
              )}
              {images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90"
                    onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                    disabled={selectedImageIndex === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90"
                    onClick={() => setSelectedImageIndex(Math.min(images.length - 1, selectedImageIndex + 1))}
                    disabled={selectedImageIndex === images.length - 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 border-2 rounded-lg overflow-hidden ${index === selectedImageIndex ? 'border-primary' : 'border-gray-200'}`}
                    aria-label={`thumbnail-${index + 1}`}
                  >
                    <ImageWithFallback src={img} alt={`${getText(product.name)} - ${index + 1}`} className="w-20 h-20 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">{getText(product.name)}</h1>
              <p className="text-muted-foreground mb-4">
                {locale === 'en' ? 'Brand' : 'العلامة التجارية'}: {getText(product.brand)}
              </p>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm">{product.rating}</span>
                <span className="text-sm text-muted-foreground">({product.reviewCount} Reviews)</span>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-primary">{product.price} {currency}</span>
                {product.originalPrice > product.price && (
                  <span className="text-xl text-muted-foreground line-through">{product.originalPrice} {currency}</span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${normalizedInStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {normalizedInStock ? `${t('available')} (${normalizedStockCount})` : t('outOfStock')}
                </span>
                <span className="text-sm text-muted-foreground">{t('partNumber')}: {product.partNumber}</span>
              </div>
            </div>

            {/* Quantity and actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">{t('quantity')}:</label>
                <div className="flex items-center border rounded-lg">
                  <Button variant="ghost" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                  <Button variant="ghost" size="sm" onClick={() => setQuantity(quantity + 1)} disabled={quantity >= normalizedStockCount}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {showInstallOption && (
                <div className="flex items-start gap-3 rounded-md border p-3 bg-muted/40">
                  <input id="install-addon" type="checkbox" className="mt-1" checked={installSelected} onChange={(e) => setInstallSelected(e.target.checked)} />
                  <label htmlFor="install-addon" className="text-sm cursor-pointer">
                    <span className="font-medium">{locale === 'ar' ? 'خدمة تركيب احترافية' : 'Professional installation service'}</span>
                    <span className="mx-1">•</span>
                    <span className="text-primary font-semibold">{INSTALL_FEE_PER_UNIT} {currency}</span>
                    <div className="text-xs text-muted-foreground mt-1">{locale === 'ar' ? 'تقديم الخدمة بمعايير عالية مع ضمان جودة الخدمة.' : 'Delivered with high standards and a quality guarantee.'}</div>
                    {installSelected && (
                      <div className="text-xs mt-1">
                        {locale === 'ar' ? `إجمالي خدمة التركيب: ${INSTALL_FEE_PER_UNIT * quantity} ${currency} ( ${quantity} × ${INSTALL_FEE_PER_UNIT} )` : `Installation total: ${INSTALL_FEE_PER_UNIT * quantity} ${currency} ( ${quantity} × ${INSTALL_FEE_PER_UNIT} )`}
                      </div>
                    )}
                  </label>
                </div>
              )}

              <div className="flex items-center justify-between text-sm bg-muted/30 rounded-md px-3 py-2">
                <span className="text-muted-foreground">{locale === 'ar' ? 'الإجمالي (يشمل التركيب إن وجد)' : 'Subtotal (incl. installation if selected)'}</span>
                <span className="font-semibold text-primary">{subtotal} {currency}</span>
              </div>

              <div className="flex gap-4">
                {!isVendor && (
                  <Button className="flex-1" onClick={handleAddToCart} disabled={!normalizedInStock}>
                    <ShoppingCart className="h-4 w-4 ml-2" />
                    {t('addToCart')}
                  </Button>
                )}
                {!isVendor && (
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!isWishlisted) {
                        addToWishlist && addToWishlist({
                          id: product?.id || '1',
                          name: getText(product?.name),
                          price: product?.price || 0,
                          brand: getText(product?.brand),
                          originalPrice: product?.originalPrice,
                          image: product?.images?.[0] || '',
                          partNumber: product?.partNumber,
                          inStock: product?.inStock || false,
                        });
                        Swal.fire({
                          title: locale === 'en' ? 'Added to wishlist' : 'تمت الإضافة إلى المفضلة',
                          icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
                        });
                      } else {
                        removeFromWishlist && removeFromWishlist(product?.id || '1');
                        Swal.fire({
                          title: locale === 'en' ? 'Removed from wishlist' : 'تمت الإزالة من المفضلة',
                          icon: 'info', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
                        });
                      }
                    }}
                    className={isWishlisted ? 'text-red-500 border-red-500' : ''}
                  >
                    <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  </Button>
                )}
                <Button variant="outline">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              <Button variant="secondary" className="w-full" onClick={handleBuyNow} disabled={!normalizedInStock}>
                {t('buyNow')}
              </Button>
            </div>

            {/* Key features */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <Truck className="h-8 w-8 text-primary mb-2" />
                    <span className="text-sm">{locale === 'en' ? 'Free Shipping' : 'شحن مجاني'}</span>
                    <span className="text-xs text-muted-foreground">{locale === 'en' ? `For orders over 200 ${currency}` : `للطلبات أكثر من 200 ${currency}`}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Shield className="h-8 w-8 text-primary mb-2" />
                    <span className="text-sm">{locale === 'en' ? `Warranty ${getText(product.warranty)}` : `ضمان ${getText(product.warranty)}`}</span>
                    <span className="text-xs text-muted-foreground">{locale === 'en' ? 'Manufacturer warranty' : 'ضمان الشركة المصنعة'}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <RotateCcw className="h-8 w-8 text-primary mb-2" />
                    <span className="text-sm">{t('returnPolicy')}</span>
                    <span className="text-xs text-muted-foreground">30 {t('days') || 'days'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="description">{t('description')}</TabsTrigger>
            <TabsTrigger value="specifications">{t('specifications')}</TabsTrigger>
            <TabsTrigger value="compatibility">{t('compatibility') || 'Compatibility'}</TabsTrigger>
            <TabsTrigger value="reviews">{t('reviews')} ({product.reviewCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <p className="mb-6">{getText(product.description)}</p>
                <h3 className="font-medium mb-4">{t('features')}</h3>
                <ul className="space-y-2">
                  {product.features?.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {product.installationTips && (
                  <>
                    <h3 className="font-medium mb-4 mt-6">{locale === 'ar' ? 'نصائح التركيب' : 'Installation Tips'}</h3>
                    <ol className="space-y-2">
                      {product.installationTips.map((tip: string, index: number) => (
                        <li key={index} className="flex gap-2">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground text-sm rounded-full flex items-center justify-center">{index + 1}</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ol>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid gap-4">
                  {Object.entries(product.specifications || {}).map(([key, value]: [string, unknown]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <span className="font-medium">{key}</span>
                      <span className="text-muted-foreground">{typeof value === 'object' && value !== null ? getText(value as any) : String(value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compatibility" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium mb-4">{t('compatibility') || 'Compatibility'}:</h3>
                <div className="grid gap-2">
                  {product.compatibility?.map((car: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{typeof car === 'object' && car !== null ? getText(car) : String(car)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('reviews')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[{id:'1',userName:'أحمد محمد',rating:5,date:'2024-01-15',comment:'منتج ممتاز، جودة عالية وسعر مناسب. التركيب سهل والأداء ممتاز.',verified:true},{id:'2',userName:'محمد علي',rating:4,date:'2024-01-10',comment:'جيد جداً، لكن التوصيل تأخر قليلاً. المنتج نفسه ممتاز.',verified:true},{id:'3',userName:'فاطمة أحمد',rating:5,date:'2024-01-05',comment:'راضية تماماً عن المنتج، يعمل بكفاءة عالية.',verified:false}].map((review:any)=> (
                      <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{review.userName}</span>
                              {review.verified && (<Badge variant="secondary" className="text-xs">{t('verifiedBuyer') || 'Verified Buyer'}</Badge>)}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                        <p className="text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Add review */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('addReview') || 'Add a review'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {[1,2,3,4,5].map((i) => (
                        <button key={i} onClick={() => setUserRating(i)} aria-label={`rate-${i}`}>
                          <Star className={`h-5 w-5 ${userRating && i <= userRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                    <textarea className="w-full border rounded-md p-2 text-sm" rows={3} placeholder={t('writeMessage')} value={userComment} onChange={(e) => setUserComment(e.target.value)} />
                    <Button disabled={!userRating || userComment.trim().length < 3}>{t('submit') || 'Submit'}</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer setCurrentPage={setCurrentPage as any} />
    </div>
  );
}
