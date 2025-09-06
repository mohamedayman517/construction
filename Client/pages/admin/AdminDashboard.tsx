import { RouteContext } from '../../components/Router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  Users, 
  Store, 
  Package, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Ban,
  Eye,
  Edit,
  Trash2,
  Plus,
  Settings,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import Header from '../../components/Header';
import { useTranslation } from '../../hooks/useTranslation';

type Trend = 'up' | 'down';

const pendingApprovals = [
  {
    id: 1,
    type: 'vendor',
    name: 'متجر قطع السيارات المتقدم',
    submittedBy: 'أحمد محمد',
    date: '2024-01-15',
    status: 'pending'
  },
  {
    id: 2,
    type: 'product',
    name: 'مكابح سيراميك عالية الأداء',
    submittedBy: 'متجر الجودة',
    date: '2024-01-14',
    status: 'pending'
  },
  {
    id: 3,
    type: 'report',
    name: 'شكوى من العميل - جودة المنتج',
    submittedBy: 'سالم الأحمد',
    date: '2024-01-13',
    status: 'urgent'
  }
];

const recentUsers = [
  {
    id: 1,
    name: 'محمد العلي',
    email: 'mohammed@example.com',
    role: 'customer',
    joinDate: '2024-01-15',
    status: 'active'
  },
  {
    id: 2,
    name: 'فاطمة أحمد',
    email: 'fatima@example.com',
    role: 'vendor',
    joinDate: '2024-01-14',
    status: 'pending'
  },
  {
    id: 3,
    name: 'علي محمود',
    email: 'ali@example.com',
    role: 'technician',
    joinDate: '2024-01-13',
    status: 'active'
  }
];

// Removed system alerts mock and section per request

export default function AdminDashboard({ setCurrentPage, ...context }: Partial<RouteContext>) {
  const { t } = useTranslation();
  const statsData: Array<{ title: string; value: string; change: string; icon: any; trend: Trend }> = [
    {
      title: t('totalUsers'),
      value: '15,847',
      change: '+12.5%',
      icon: Users,
      trend: 'up',
    },
    {
      title: t('activeVendors'),
      value: '1,234',
      change: '+8.2%',
      icon: Store,
      trend: 'up',
    },
    {
      title: t('listedProducts'),
      value: '45,678',
      change: '+5.1%',
      icon: Package,
      trend: 'up',
    },
    {
      title: t('totalRevenue'),
      value: '2,456,789 ر.س',
      change: '+15.3%',
      icon: DollarSign,
      trend: 'up',
    },
  ];
  return (
    <div className="min-h-screen bg-background">
      <Header {...context} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2">{t('adminDashboardTitle')}</h1>
          <p className="text-muted-foreground">{t('adminDashboardSubtitle')}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className={`flex items-center text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend === 'up' ? (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )}
                  {stat.change}
                  <span className="text-muted-foreground mr-1">{t('fromLastMonth')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Pending Approvals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                {t('pendingApproval')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingApprovals.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{t('by')} {item.submittedBy}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant={item.status === 'urgent' ? 'destructive' : 'secondary'}>
                        {item.status === 'urgent' ? t('urgent') : t('pendingStatus')}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" variant="outline">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Ban className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start"
                variant="outline"
                onClick={() => setCurrentPage && setCurrentPage('admin-users')}
              >
                <Users className="mr-2 h-4 w-4" />
                {t('manageUsers')}
              </Button>
              <Button 
                className="w-full justify-start"
                variant="outline"
                onClick={() => setCurrentPage && setCurrentPage('admin-vendors')}
              >
                <Store className="mr-2 h-4 w-4" />
                {t('manageVendors')}
              </Button>
              <Button 
                className="w-full justify-start"
                variant="outline"
                onClick={() => setCurrentPage && setCurrentPage('admin-products')}
              >
                <Package className="mr-2 h-4 w-4" />
                {t('manageProducts')}
              </Button>
              <Button 
                className="w-full justify-start"
                variant="outline"
                onClick={() => setCurrentPage && setCurrentPage('admin-reports')}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                {t('reportsAndAnalytics')}
              </Button>
              <Button 
                className="w-full justify-start"
                variant="outline"
                onClick={() => setCurrentPage && setCurrentPage('admin-settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                {t('systemSettings')}
              </Button>
              <Button 
                className="w-full justify-start"
                variant="outline"
                onClick={() => setCurrentPage && setCurrentPage('admin-sections')}
              >
                {/* Reuse Package icon for sections list */}
                <Package className="mr-2 h-4 w-4" />
                الأقسام
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">{t('newUsers')}</TabsTrigger>
            <TabsTrigger value="analytics">{t('analytics')}</TabsTrigger>
            <TabsTrigger value="financial">{t('financial')}</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('recentlyRegisteredUsers')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant="outline">
                              {user.role === 'customer' ? t('customer') : 
                               user.role === 'vendor' ? t('vendor') : t('technician')}
                            </Badge>
                            <Badge 
                              className="mr-2"
                              variant={user.status === 'active' ? 'default' : 'secondary'}
                            >
                              {user.status === 'active' ? t('activeStatus') : t('pendingStatus')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Package className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('userGrowth')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{t('customers')}</span>
                        <span>85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{t('vendors')}</span>
                        <span>60%</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{t('technicians')}</span>
                        <span>25%</span>
                      </div>
                      <Progress value={25} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('salesPerformance')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('dailySales')}</span>
                      <span className="font-medium">45,200 ر.س</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('weeklySales')}</span>
                      <span className="font-medium">315,400 ر.س</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('monthlySales')}</span>
                      <span className="font-medium">1,256,800 ر.س</span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-4">
                      <span className="font-medium">{t('yearlyTotal')}</span>
                      <span className="font-medium text-green-600">15,084,200 ر.س</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>الإيرادات الشهرية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,456,789 ر.س</div>
                  <p className="text-sm text-muted-foreground">+15.3% من الشهر الماضي</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>عمولات المنصة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">245,678 ر.س</div>
                  <p className="text-sm text-muted-foreground">10% من إجمالي المبيعات</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>المدفوعات المعلقة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">89,456 ر.س</div>
                  <p className="text-sm text-muted-foreground">للبائعين</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System tab removed per request */}
        </Tabs>
      </div>
    </div>
  );
}