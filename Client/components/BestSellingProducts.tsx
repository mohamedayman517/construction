import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { RouteContext } from './Router';
import { useTranslation } from '../hooks/useTranslation';
import { formatCurrency } from '../utils/vendorHelpers';
import Swal from 'sweetalert2';

const products = [
  {
    id: 1,
    name: 'فلتر زيت أصلي تويوتا كامري',
    nameEn: 'Genuine Toyota Camry Oil Filter',
    price: 85,
    originalPrice: 120,
    rating: 4.8,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1752774579270-523a9e91e6d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBlbmdpbmUlMjBwYXJ0cyUyMGF1dG9tb3RpdmV8ZW58MXx8fHwxNzU0MDYzODU0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    badge: 'الأكثر مبيعاً',
    badgeEn: 'Best Seller',
    badgeColor: 'bg-red-500'
  },
  {
    id: 2,
    name: 'إطار ميشلان 225/60R16',
    nameEn: 'Michelin Tire 225/60R16',
    price: 450,
    originalPrice: 520,
    rating: 4.9,
    reviews: 203,
    image: 'https://images.unsplash.com/photo-1710009437292-77d057fd47f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjB0aXJlcyUyMHdoZWVscyUyMGF1dG9tb3RpdmV8ZW58MXx8fHwxNzU0MDYzODU3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    badge: 'خصم 15%',
    badgeEn: '15% Off',
    badgeColor: 'bg-green-500'
  },
  {
    id: 3,
    name: 'بطارية دلكو 70 أمبير',
    nameEn: 'Delco Battery 70 Ah',
    price: 280,
    originalPrice: 350,
    rating: 4.7,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1621992906830-b3f3aabac38b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBlbGVjdHJpY2FsJTIwcGFydHMlMjBiYXR0ZXJ5fGVufDF8fHx8MTc1NDA2Mzg2NHww&ixlib=rb-4.1.0&q=80&w=1080',
    badge: 'ضمانة سنتين',
    badgeEn: '2-Year Warranty',
    badgeColor: 'bg-blue-500'
  },
  {
    id: 4,
    name: 'طقم عدد الكترونية 120 قطعة',
    nameEn: 'Electronic Tool Kit 120 pcs',
    price: 320,
    originalPrice: 380,
    rating: 4.6,
    reviews: 145,
    image: 'https://images.unsplash.com/photo-1727413434026-0f8314c037d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXRvbW90aXZlJTIwdG9vbHMlMjBnYXJhZ2UlMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzU0MDYzODYxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    badge: 'جودة ممتازة',
    badgeEn: 'Premium Quality',
    badgeColor: 'bg-purple-500'
  }
];

export default function BestSellingProducts({ setSelectedProduct, setCurrentPage, isInWishlist, addToWishlist, removeFromWishlist, addToCart, setSearchFilters, user }: Partial<RouteContext>) {
  const { t, locale } = useTranslation();
  const isVendor = user?.role === 'vendor';
  const handleProductClick = (product: any) => {
    setSelectedProduct && setSelectedProduct(product);
    setCurrentPage && setCurrentPage('product-details');
  };
  return (
    <section className="py-16 bg-white" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('bestSellingTitle')}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('bestSellingDescription')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer" onClick={() => handleProductClick(product)}>
              <div className="relative">
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={product.image}
                    alt={locale === 'en' ? (product.nameEn ?? product.name) : product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                </div>
                <Badge className={`absolute top-2 right-2 ${product.badgeColor} text-white`}>
                  {locale === 'en' ? (product.badgeEn ?? product.badge) : product.badge}
                </Badge>
                {!isVendor && (
                  <Button
                      size="icon"
                      variant="ghost"
                      className={`absolute top-2 left-2 bg-white/80 hover:bg-white ${(isInWishlist && isInWishlist(String(product.id))) ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        if (!isInWishlist || !isInWishlist(String(product.id))) {
                          // Add to wishlist
                          addToWishlist && addToWishlist({
                            id: String(product.id),
                            name: locale === 'en' ? (product.nameEn ?? product.name) : product.name,
                            price: product.price,
                            brand: locale === 'en' ? product.nameEn : product.name,
                            originalPrice: product.originalPrice,
                            image: product.image,
                            inStock: true
                          });
                          
                          Swal.fire({
                            title: locale === 'en' ? 'Added to wishlist' : 'تمت الإضافة إلى المفضلة',
                            icon: 'success',
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 3000
                          });
                        } else {
                          // Remove from wishlist
                          removeFromWishlist && removeFromWishlist(String(product.id));
                          
                          Swal.fire({
                            title: locale === 'en' ? 'Removed from wishlist' : 'تمت الإزالة من المفضلة',
                            icon: 'info',
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 3000
                          });
                        }
                      }}
                    >
                      <Heart className={`h-4 w-4 ${(isInWishlist && isInWishlist(String(product.id))) ? 'fill-current' : ''}`} />
                    </Button>
                )}
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">{locale === 'en' ? (product.nameEn ?? product.name) : product.name}</h3>
                
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">({product.reviews})</span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-lg">{formatCurrency(product.price, locale === 'en' ? 'en' : 'ar')}</span>
                  <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.originalPrice, locale === 'en' ? 'en' : 'ar')}</span>
                </div>

                {!isVendor && (
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart && addToCart({
                        id: String(product.id),
                        name: locale === 'en' ? (product.nameEn ?? product.name) : product.name,
                        price: product.price,
                        image: product.image,
                        quantity: 1,
                        inStock: true,
                      });
                      Swal.fire({
                        title: locale === 'en' ? 'Added to cart' : 'تمت الإضافة إلى السلة',
                        icon: 'success',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 2000,
                      });
                    }}
                  >
                    <ShoppingCart className="w-4 h-4 ml-1" />
                    {t('addToCart')}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg" onClick={() => {
            // Clear any pre-applied filters to show all products
            setSearchFilters && setSearchFilters(null);
            setCurrentPage && setCurrentPage('products');
          }}>
            {t('viewAllProducts')}
          </Button>
        </div>
      </div>
    </section>
  );
}
