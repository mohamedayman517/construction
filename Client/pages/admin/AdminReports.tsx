import React from 'react';
import Header from '../../components/Header';
import type { RouteContext } from '../../components/Router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Users, Package, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export default function AdminReports({ setCurrentPage, ...context }: Partial<RouteContext>) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <Header {...context} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button variant="outline" onClick={() => setCurrentPage && setCurrentPage('admin-dashboard')} className="mr-4">
              <ArrowRight className="ml-2 h-4 w-4" />
              {t('backToDashboard')}
            </Button>
          </div>
          <h1 className="mb-2">{t('reportsAndAnalytics')}</h1>
          <p className="text-muted-foreground">{t('adminReportsSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {t('totalRevenue')} <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,456,789 SAR</div>
              <div className="flex items-center text-xs text-green-600 mt-2">
                <TrendingUp className="mr-1 h-3 w-3" /> +15.3% {t('fromLastMonth')}
              </div>
              <div className="mt-4">
                <Progress value={72} className="h-2" />
                <div className="text-xs text-muted-foreground mt-2">72% {t('ofMonthlyTargetAchieved')}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {t('activeUsers')} <Users className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15,847</div>
              <div className="flex items-center text-xs text-green-600 mt-2">
                <TrendingUp className="mr-1 h-3 w-3" /> +12.5% {t('fromLastMonth')}
              </div>
              <div className="mt-4">
                <Progress value={58} className="h-2" />
                <div className="text-xs text-muted-foreground mt-2">58% {t('growthQTD')}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {t('listedProducts')} <Package className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45,678</div>
              <div className="flex items-center text-xs text-red-600 mt-2">
                <TrendingDown className="mr-1 h-3 w-3" /> -1.1% {t('fromLastMonth')}
              </div>
              <div className="mt-4">
                <Progress value={43} className="h-2" />
                <div className="text-xs text-muted-foreground mt-2">{t('newListingsThisMonth')}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><BarChart3 className="mr-2 h-5 w-5" /> {t('detailedAnalytics')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="sales" className="space-y-6">
              <TabsList>
                <TabsTrigger value="sales">{t('salesTab')}</TabsTrigger>
                <TabsTrigger value="users">{t('usersTab')}</TabsTrigger>
                <TabsTrigger value="inventory">{t('inventoryTab')}</TabsTrigger>
              </TabsList>
              <TabsContent value="sales">
                <p className="text-sm text-muted-foreground mb-4">{t('salesBreakdownDesc')}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm">{t('dailySales')}</div>
                    <div className="text-xl font-semibold">45,200 SAR</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm">{t('weeklySales')}</div>
                    <div className="text-xl font-semibold">315,400 SAR</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm">{t('monthlySales')}</div>
                    <div className="text-xl font-semibold">1,256,800 SAR</div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="users">
                <p className="text-sm text-muted-foreground mb-4">{t('userGrowthPerRole')}</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span>{t('customers')}</span><span>85%</span></div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span>{t('vendors')}</span><span>60%</span></div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span>{t('technicians')}</span><span>25%</span></div>
                    <Progress value={25} className="h-2" />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="inventory">
                <p className="text-sm text-muted-foreground mb-4">{t('inventoryHealthDesc')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm">{t('inStockItems')}</div>
                    <div className="text-xl font-semibold">32,145</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm">{t('lowStockAlerts')}</div>
                    <div className="text-xl font-semibold text-amber-600">1,284</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
