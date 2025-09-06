import { RouteContext } from "../components/Router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Percent,
  Clock,
  Star,
  Flame,
  TrendingUp,
  Users,
  ShoppingCart,
  Gift,
  Zap,
  Timer,
  Crown,
  Heart,
  Share,
  Filter,
  Search,
  Package,
} from "lucide-react";
import Swal from "sweetalert2";
import { useTranslation } from "../hooks/useTranslation";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Offers({ setCurrentPage, isInWishlist, addToWishlist, removeFromWishlist, ...context }: Partial<RouteContext>) {
  const { t, locale } = useTranslation();
  const isVendor = (context as any)?.user?.role === 'vendor';
  const currency = locale === 'ar' ? 'ر.س' : 'SAR';
  const daysLeftText = (n: number) => (locale === 'ar' ? `باقي ${n} أيام` : `${n} days left`);

  // يجب أن تكون جميع المصفوفات هنا
  const featuredOffers = [
    {
      id: 1,
      title: t("winterOfferTitle"),
      description: t("winterOfferDesc"),
      discount: "50%",
      originalPrice: "500",
      salePrice: "250",
      category: t("generalParts"),
      timeLeft: daysLeftText(5),
      claimed: 234,
      totalAvailable: 500,
      rating: 4.8,
      featured: true,
      type: "flash",
    },
    {
      id: 2,
      title: t("michelinTiresTitle"),
      description: t("michelinTiresDesc"),
      discount: "25%",
      originalPrice: "800",
      salePrice: "600",
      category: t("tiresWheelsTitle"),
      timeLeft: daysLeftText(10),
      claimed: 89,
      totalAvailable: 200,
      rating: 4.9,
      featured: true,
      type: "bundle",
    },
    {
      id: 3,
      title: t("maintenanceBundleTitle"),
      description: t("maintenanceBundleDesc"),
      discount: "35%",
      originalPrice: "300",
      salePrice: "195",
      category: t("maintenanceBundles"),
      timeLeft: daysLeftText(3),
      claimed: 167,
      totalAvailable: 300,
      rating: 4.7,
      featured: true,
      type: "service",
    },
  ];

  

  const flashDeals = [
    {
      id: 1,
      name: t("oilFilterKN"),
      originalPrice: 85,
      salePrice: 51,
      discount: 40,
      timeLeft: "2:45:30",
      sold: 23,
      available: 50,
      rating: 4.6,
      image: "car parts filter",
    },
    {
      id: 2,
      name: t("bremboCeramicBrakes"),
      originalPrice: 450,
      salePrice: 315,
      discount: 30,
      timeLeft: "1:23:15",
      sold: 8,
      available: 25,
      rating: 4.8,
      image: "car brake pads",
    },
    {
      id: 3,
      name: t("acDelcoBattery"),
      originalPrice: 280,
      salePrice: 196,
      discount: 30,
      timeLeft: "4:12:45",
      sold: 15,
      available: 40,
      rating: 4.5,
      image: "car battery",
    },
  ];

  const loyaltyOffers = [
    {
      tier: t("goldMembership"),
      discount: "15%",
      benefits: [t("freeShipping"), t("freeReturn30"), t("prioritySupport")],
      minSpend: "2,000 ر.س",
      color: "bg-yellow-50 border-yellow-200",
      icon: Crown,
    },
    {
      tier: t("silverMembership"),
      discount: "10%",
      benefits: [t("freeShippingOver200"), t("freeReturn15")],
      minSpend: "1,000 ر.س",
      color: "bg-gray-50 border-gray-200",
      icon: Star,
    },
    {
      tier: t("bronzeMembership"),
      discount: "5%",
      benefits: [t("rewardPoints"), t("exclusiveOffers")],
      minSpend: "500 ر.س",
      color: "bg-orange-50 border-orange-200",
      icon: Gift,
    },
  ];

  const getProgressPercentage = (claimed: number, total: number) => {
    return (claimed / total) * 100;
  };

  return (
    <div className="min-h-screen bg-background" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <Header {...context} />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Flame className="h-8 w-8 text-red-500 mr-2" />
            <h1 className="text-4xl font-bold">{t("offers")}</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            {t("discoverBestOffers")}
          </p>
        </div>

        {/* Featured Offers */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <Zap className="h-6 w-6 text-yellow-500 mr-2" />
              {t("featuredOffersTitle")}
            </h2>
            <Badge variant="destructive" className="animate-pulse">
              <Timer className="h-3 w-3 mr-1" />
              {t("limitedOffers")}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredOffers.map((offer) => (
              <Card key={offer.id} className="relative overflow-hidden">
                {offer.featured && (
                  <div className="absolute top-0 left-0 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 text-xs font-bold">
                    {t("featuredBadge")}
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="font-bold">
                    -{offer.discount}
                  </Badge>
                </div>

                <CardHeader className="pb-2">
                  <div className="h-48 bg-muted rounded-lg mb-4 flex items-center justify-center">
                    <Package className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">{offer.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {offer.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-primary">
                        {offer.salePrice} {currency}
                      </span>
                      <span className="text-sm line-through text-muted-foreground mr-2">
                        {offer.originalPrice} {currency}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm">{offer.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        {locale === 'ar'
                          ? `تم بيع ${offer.claimed} من ${offer.totalAvailable}`
                          : `Sold ${offer.claimed} of ${offer.totalAvailable}`}
                      </span>
                      <span className="flex items-center text-red-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {offer.timeLeft}
                      </span>
                    </div>
                    <Progress
                      value={getProgressPercentage(
                        offer.claimed,
                        offer.totalAvailable
                      )}
                      className="h-2"
                    />
                  </div>

                  <div className="flex space-x-2 space-x-reverse">
                    <Button
                      className="flex-1"
                      onClick={() => setCurrentPage && setCurrentPage("product-details")}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {t("buyNow")}
                    </Button>
                    {!isVendor && (
                      <Button
                          variant="ghost"
                          size="icon"
                          className={(isInWishlist && isInWishlist(String(offer.id))) ? 'text-red-500' : ''}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            if (!isInWishlist || !isInWishlist(String(offer.id))) {
                              // Add to wishlist
                              addToWishlist && addToWishlist({
                                id: String(offer.id),
                                name: offer.title,
                                price: parseFloat(offer.salePrice),
                                brand: offer.category,
                                originalPrice: parseFloat(offer.originalPrice),
                                image: "", // Offer doesn't have image property, using empty string
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
                              removeFromWishlist && removeFromWishlist(String(offer.id));
                              
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
                          <Heart className={`h-4 w-4 ${(isInWishlist && isInWishlist(String(offer.id))) ? 'fill-current' : ''}`} />
                        </Button>
                    )}
                    <Button variant="outline" size="icon">
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        

        {/* Tabs for Different Offer Types */}
        <Tabs defaultValue="flash" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-muted/40 p-1 rounded-lg shadow-sm">
            <TabsTrigger
              value="flash"
              className="rounded-md px-3 py-2 font-medium text-foreground/80 hover:text-foreground transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border data-[state=active]:border-primary data-[state=active]:shadow"
            >
              {t("flashDeals")}
            </TabsTrigger>
            <TabsTrigger
              value="bundle"
              className="rounded-md px-3 py-2 font-medium text-foreground/80 hover:text-foreground transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border data-[state=active]:border-primary data-[state=active]:shadow"
            >
              {t("bundledOffers")}
            </TabsTrigger>
            <TabsTrigger
              value="loyalty"
              className="rounded-md px-3 py-2 font-medium text-foreground/80 hover:text-foreground transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border data-[state=active]:border-primary data-[state=active]:shadow"
            >
              {t("loyaltyProgram")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flash" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                  {t("flashDeals")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {flashDeals.map((deal) => (
                    <Card key={deal.id} className="relative overflow-hidden">
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
                        -{deal.discount}%
                      </div>
                      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 text-xs rounded">
                        {deal.timeLeft}
                      </div>

                      <CardHeader className="pb-2">
                        <div className="h-32 bg-muted rounded-lg mb-2 flex items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-base">{deal.name}</CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-primary">
                              {deal.salePrice} {currency}
                            </span>
                            <span className="text-sm line-through text-muted-foreground mr-2">
                              {deal.originalPrice} {currency}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 mr-1" />
                            <span className="text-xs">{deal.rating}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>تم بيع {deal.sold}</span>
                            <span>متبقي {deal.available - deal.sold}</span>
                          </div>
                          <Progress
                            value={(deal.sold / deal.available) * 100}
                            className="h-1"
                          />
                        </div>

                        <Button size="sm" className="w-full">
                          {t("buyFast")}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bundle" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="h-5 w-5 text-green-500 mr-2" />
                  {t("bundledOffers")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-2 border-green-200">
                      <CardHeader>
                        <CardTitle className="text-green-700">
                          حزمة الصيانة الكاملة
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          فلتر زيت + فلتر هواء + فلتر وقود + زيت محرك
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span>السعر الأصلي:</span>
                            <span className="line-through">450 ر.س</span>
                          </div>
                          <div className="flex justify-between text-green-600">
                            <span className="font-bold">سعر الحزمة:</span>
                            <span className="font-bold">315 ر.س</span>
                          </div>
                          <div className="flex justify-between text-green-600">
                            <span>توفر:</span>
                            <span className="font-bold">135 ر.س (30%)</span>
                          </div>
                          {!isVendor && (
                            <Button className="w-full">{t("addToCart")}</Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-blue-200">
                      <CardHeader>
                        <CardTitle className="text-blue-700">
                          عرض الإطارات الرباعي
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          اشتر 3 إطارات واحصل على الرابع مجاناً
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span>سعر 4 إطارات:</span>
                            <span className="line-through">1,200 ر.س</span>
                          </div>
                          <div className="flex justify-between text-blue-600">
                            <span className="font-bold">ادفع لـ 3 فقط:</span>
                            <span className="font-bold">900 ر.س</span>
                          </div>
                          <div className="flex justify-between text-blue-600">
                            <span>توفر:</span>
                            <span className="font-bold">300 ر.س (25%)</span>
                          </div>
                          {!isVendor && (
                            <Button className="w-full">{t("addToCart")}</Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loyalty" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="h-5 w-5 text-yellow-500 mr-2" />
                  {t("loyaltyProgram")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {loyaltyOffers.map((tier, index) => {
                    const IconComponent = tier.icon;
                    return (
                      <Card key={index} className={`${tier.color} border-2`}>
                        <CardHeader className="text-center">
                          <div className="mx-auto mb-2">
                            <IconComponent className="h-8 w-8" />
                          </div>
                          <CardTitle>{tier.tier}</CardTitle>
                          <div className="text-2xl font-bold">
                            {tier.discount}
                          </div>
                          <p className="text-sm">خصم دائم على جميع المشتريات</p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">
                                الحد الأدنى للإنفاق
                              </p>
                              <p className="font-bold">{tier.minSpend}</p>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">المزايا:</h4>
                              <ul className="space-y-1">
                                {tier.benefits.map((benefit, i) => (
                                  <li
                                    key={i}
                                    className="text-xs flex items-center"
                                  >
                                    <Star className="h-3 w-3 mr-1 text-yellow-400" />
                                    {benefit}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <Button variant="outline" className="w-full">
                              {t("subscribeNow")}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          
        </Tabs>
      </div>

      <Footer setCurrentPage={setCurrentPage ?? (() => {})} />
    </div>
  );
}
