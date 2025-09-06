"use client";
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Eye, ShoppingCart, DollarSign, Users, Calendar, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { RouteContext } from '../../components/Router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useTranslation } from '../../hooks/useTranslation';

type VendorAnalyticsProps = Partial<RouteContext>;

// Mock analytics data
const salesData = [
  { month: 'يناير', sales: 4000, orders: 12, views: 1200, customers: 45 },
  { month: 'فبراير', sales: 3000, orders: 15, views: 1800, customers: 52 },
  { month: 'مارس', sales: 5000, orders: 18, views: 2100, customers: 61 },
  { month: 'أبريل', sales: 4500, orders: 20, views: 2400, customers: 68 },
  { month: 'مايو', sales: 6000, orders: 25, views: 2800, customers: 75 },
  { month: 'يونيو', sales: 7500, orders: 30, views: 3200, customers: 82 }
];

const categoryData = [
  { name: 'فلاتر', value: 35, sales: 15400 },
  { name: 'إطارات', value: 25, sales: 11200 },
  { name: 'زيوت', value: 20, sales: 8900 },
  { name: 'مكابح', value: 12, sales: 5600 },
  { name: 'إضاءة', value: 8, sales: 3200 }
];

const topProducts = [
  { name: 'فلتر زيت محرك تويوتا كامري', views: 1250, orders: 145, conversion: 11.6, revenue: 12325 },
  { name: 'إطار ميشلين بريمير 225/65R17', views: 2100, orders: 89, conversion: 4.2, revenue: 40050 },
  { name: 'بطارية AC Delco 60 أمبير', views: 890, orders: 67, conversion: 7.5, revenue: 12060 },
  { name: 'مصابيح LED فيليبس للمقدمة', views: 1890, orders: 234, conversion: 12.4, revenue: 22230 }
];

const customerData = [
  { month: 'يناير', new: 12, returning: 33, total: 45 },
  { month: 'فبراير', new: 15, returning: 37, total: 52 },
  { month: 'مارس', new: 18, returning: 43, total: 61 },
  { month: 'أبريل', new: 20, returning: 48, total: 68 },
  { month: 'مايو', new: 22, returning: 53, total: 75 },
  { month: 'يونيو', new: 25, returning: 57, total: 82 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function VendorAnalytics({ setCurrentPage, ...context }: VendorAnalyticsProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const { t, locale } = useTranslation();
  // Provide a safe fallback to satisfy components requiring a non-optional setter
  const safeSetCurrentPage = setCurrentPage ?? (() => {});

  const currentMonth = new Date().toLocaleDateString(locale === 'en' ? 'en' : 'ar', { month: 'long' });
  const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
  const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0);
  const totalViews = salesData.reduce((sum, item) => sum + item.views, 0);
  const averageOrderValue = totalSales / totalOrders;
  const conversionRate = (totalOrders / totalViews) * 100;

  const getGrowthPercentage = (data: any[], key: string) => {
    if (data.length < 2) return 0;
    const current = data[data.length - 1][key];
    const previous = data[data.length - 2][key];
    return ((current - previous) / previous) * 100;
  };

  const salesGrowth = getGrowthPercentage(salesData, 'sales');
  const ordersGrowth = getGrowthPercentage(salesData, 'orders');
  const viewsGrowth = getGrowthPercentage(salesData, 'views');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header currentPage="vendor-analytics" setCurrentPage={setCurrentPage} {...context} />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t('vendorAnalyticsTitle')}</h1>
            <p className="text-muted-foreground">{t('vendorAnalyticsSubtitle')}</p>
          </div>
          
          <div className="flex gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('selectPeriod')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">{t('periodLastMonth')}</SelectItem>
                <SelectItem value="3months">{t('periodLast3Months')}</SelectItem>
                <SelectItem value="6months">{t('periodLast6Months')}</SelectItem>
                <SelectItem value="1year">{t('periodLastYear')}</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Download className="h-4 w-4 ml-2" />
              {t('exportReport')}
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('vaTotalSales')}</p>
                  <h3 className="text-2xl font-bold">{totalSales.toLocaleString(locale === 'en' ? 'en' : 'ar')} {locale === 'en' ? 'SAR' : 'ر.س'}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    {salesGrowth >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs ${salesGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {salesGrowth >= 0 ? '+' : ''}{salesGrowth.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('vaTotalOrders')}</p>
                  <h3 className="text-2xl font-bold">{totalOrders}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    {ordersGrowth >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs ${ordersGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {ordersGrowth >= 0 ? '+' : ''}{ordersGrowth.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('vaTotalViews')}</p>
                  <h3 className="text-2xl font-bold">{totalViews.toLocaleString(locale === 'en' ? 'en' : 'ar')}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    {viewsGrowth >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs ${viewsGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {viewsGrowth >= 0 ? '+' : ''}{viewsGrowth.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('vaAvgOrderValue')}</p>
                  <h3 className="text-2xl font-bold">{Math.round(averageOrderValue).toLocaleString(locale === 'en' ? 'en' : 'ar')} {locale === 'en' ? 'SAR' : 'ر.س'}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{t('vaPerOrder')}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('vaConversionRate')}</p>
                  <h3 className="text-2xl font-bold">{conversionRate.toFixed(1)}%</h3>
                  <p className="text-xs text-muted-foreground mt-1">{t('vaFromViews')}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="sales" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sales">{t('vaTabSales')}</TabsTrigger>
            <TabsTrigger value="products">{t('vaTabProducts')}</TabsTrigger>
            <TabsTrigger value="customers">{t('vaTabCustomers')}</TabsTrigger>
            <TabsTrigger value="categories">{t('vaTabCategories')}</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('vaSalesTrend')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          `${(value as number).toLocaleString(locale === 'en' ? 'en' : 'ar')} ${name === 'sales' ? (locale === 'en' ? 'SAR' : 'ر.س') : ''}`,
                          name === 'sales' ? t('vaTotalSales') : t('vaOrdersLabel')
                        ]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('vaOrdersAndViews')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="orders" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                        name={t('vaOrdersLabel')}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="views" 
                        stroke="#ffc658" 
                        strokeWidth={2}
                        name={t('vaViewsLabel')}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('vaTopProductsPerformance')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{product.name}</h4>
                        <div className="grid grid-cols-4 gap-4 mt-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">{t('vaViewsLabel')}: </span>
                            <span className="font-medium">{product.views.toLocaleString(locale === 'en' ? 'en' : 'ar')}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t('vaOrdersLabel')}: </span>
                            <span className="font-medium">{product.orders}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t('vaConversionLabel')}: </span>
                            <span className="font-medium">{product.conversion}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t('vaRevenueLabel')}: </span>
                            <span className="font-medium text-primary">{product.revenue.toLocaleString(locale === 'en' ? 'en' : 'ar')} {locale === 'en' ? 'SAR' : 'ر.س'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('vaCustomersStats')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={customerData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="new" fill="#8884d8" name={locale === 'en' ? 'New Customers' : 'عملاء جدد'} />
                    <Bar dataKey="returning" fill="#82ca9d" name={locale === 'en' ? 'Returning Customers' : 'عملاء عائدون'} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('vaSalesByCategory')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('vaRevenueByCategory')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryData.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span>{category.name}</span>
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{category.sales.toLocaleString(locale === 'en' ? 'en' : 'ar')} {locale === 'en' ? 'SAR' : 'ر.س'}</div>
                          <div className="text-sm text-muted-foreground">{category.value}% {t('vaOfSales')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        <Footer setCurrentPage={safeSetCurrentPage} />
      </div>
    </div>
  );
}