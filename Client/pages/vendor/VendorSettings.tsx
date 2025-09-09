"use client";
import { useEffect, useRef, useState } from 'react';
import { Save, Upload, Eye, EyeOff, Shield, Bell, Store, CreditCard, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { RouteContext } from '../../components/Router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useTranslation } from '../../hooks/useTranslation';
import { error as errorDialog, success as successDialog } from '../../utils/alerts';
import { getProfile, updateProfile } from '@/services/auth';

interface VendorSettingsProps extends RouteContext {}

export default function VendorSettings(props: VendorSettingsProps) {
  const { user, setCurrentPage } = props;
  const [mounted, setMounted] = useState(false);
  const { t, locale } = useTranslation();
  const defaultStoreInfo = (loc: string) => (
    loc === 'ar'
      ? {
          storeName: 'متجر قطع غيار العارف',
          storeDescription: 'متخصصون في قطع غيار السيارات الأصلية والبديلة عالية الجودة',
          logo: '',
          banner: '',
          address: 'شارع الملك فهد، حي العليا، الرياض',
          phone: '+966 11 123 4567',
          email: 'info@alaareef-parts.com',
          website: 'www.alaareef-parts.com',
          businessLicense: 'CR-123456789',
          taxNumber: '123456789012345'
        }
      : {
          storeName: 'Al Aareef Auto Parts',
          storeDescription: 'Specialists in genuine and high-quality alternative car parts',
          logo: '',
          banner: '',
          address: 'King Fahd Rd, Al Olaya, Riyadh',
          phone: '+966 11 123 4567',
          email: 'info@alaareef-parts.com',
          website: 'www.alaareef-parts.com',
          businessLicense: 'CR-123456789',
          taxNumber: '123456789012345'
        }
  );
  const [storeInfo, setStoreInfo] = useState(() => defaultStoreInfo(locale));

  const [notifications, setNotifications] = useState({
    orderNotifications: true,
    reviewNotifications: true,
    stockAlerts: true,
    emailNotifications: true,
    smsNotifications: false,
    promotionalEmails: true
  });

  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: 200,
    standardShippingCost: 25,
    expressShippingCost: 35,
    processingDays: 2,
    shippingDays: 3
  });

  const defaultPayment = (loc: string) => (
    loc === 'ar'
      ? {
          bankName: 'البنك الأهلي السعودي',
          accountNumber: '1234567890',
          iban: 'SA0312345678901234567890',
          paypalEmail: '',
          stripeConnected: false
        }
      : {
          bankName: 'Saudi National Bank',
          accountNumber: '1234567890',
          iban: 'SA0312345678901234567890',
          paypalEmail: '',
          stripeConnected: false
        }
  );
  const [paymentSettings, setPaymentSettings] = useState(() => defaultPayment(locale));
  const prevLocaleRef = useRef(locale);

  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveStoreInfo = () => {
    // Save store information logic
    console.log('Store info saved:', storeInfo);
  };

  const handleSaveNotifications = () => {
    // Save notification settings logic
    console.log('Notification settings saved:', notifications);
  };

  const handleSaveShipping = () => {
    // Save shipping settings logic
    console.log('Shipping settings saved:', shippingSettings);
  };

  const handleSavePayment = async () => {
    // If user is merchant/vendor, push IBAN to profile
    const role = (props.user?.role || '').toString().toLowerCase();
    const isVendor = role === 'vendor' || role === 'merchant';
    if (isVendor) {
      try {
        const iban = (paymentSettings.iban || '').toString().trim();
        // Basic SA IBAN format check (optional)
        if (iban && !/^SA\d{2}[A-Z0-9]{18}$/i.test(iban)) {
          await errorDialog(locale === 'ar' ? 'رقم الآيبان غير صحيح. يجب أن يبدأ بـ SA.' : 'Invalid IBAN. It must start with SA.', locale === 'ar');
          return;
        }
        const res = await updateProfile({ iban: iban } as any);
        if (res.ok) {
          await successDialog(locale === 'ar' ? 'تم حفظ بيانات الدفع' : 'Payment settings saved', locale === 'ar');
        } else {
          await errorDialog(locale === 'ar' ? 'فشل حفظ بيانات الدفع' : 'Failed to save payment settings', locale === 'ar');
        }
      } catch (e) {
        await errorDialog(locale === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'An error occurred while saving', locale === 'ar');
      }
      return;
    }
    // Non-vendor: local only
    console.log('Payment settings saved (local):', paymentSettings);
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      await errorDialog(t('vsPasswordMismatch'), locale === 'ar');
      return;
    }
    // Change password logic
    console.log('Password changed');
    setNewPassword('');
    setConfirmPassword('');
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Preload current IBAN from profile if available
  useEffect(() => {
    (async () => {
      try {
        const res = await getProfile();
        if (res.ok && res.data) {
          const anyUser: any = res.data;
          if (anyUser && anyUser.iban) {
            setPaymentSettings((curr) => ({ ...curr, iban: anyUser.iban }));
          }
        }
      } catch {}
    })();
  }, []);

  // When locale changes at runtime, update defaults ONLY if values match previous defaults (to avoid clobbering user edits)
  useEffect(() => {
    const prev = prevLocaleRef.current;
    if (prev === locale) return;
    const prevStoreDefaults = defaultStoreInfo(prev);
    const nextStoreDefaults = defaultStoreInfo(locale);
    const prevPaymentDefaults = defaultPayment(prev);
    const nextPaymentDefaults = defaultPayment(locale);

    const isEqual = (a: any, b: any) => Object.keys(b).every(k => a?.[k] === (b as any)[k]);

    setStoreInfo(curr => (isEqual(curr, prevStoreDefaults) ? nextStoreDefaults : curr));
    setPaymentSettings(curr => (isEqual(curr, prevPaymentDefaults) ? nextPaymentDefaults : curr));

    prevLocaleRef.current = locale;
  }, [locale]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <Header {...props} currentPage="vendor-settings" setCurrentPage={setCurrentPage} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t('vsTitle')}</h1>
            <p className="text-muted-foreground">{t('vsSubtitle')}</p>
          </div>
        </div>

        <Tabs defaultValue="store" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="store">{t('vsTabStore')}</TabsTrigger>
            <TabsTrigger value="shipping">{t('vsTabShipping')}</TabsTrigger>
            <TabsTrigger value="payment">{t('vsTabPayment')}</TabsTrigger>
            <TabsTrigger value="notifications">{t('vsTabNotifications')}</TabsTrigger>
            <TabsTrigger value="security">{t('vsTabSecurity')}</TabsTrigger>
          </TabsList>

          {/* Store Information */}
          <TabsContent value="store">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  {t('vsStoreInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Store Logo and Banner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>{t('vsStoreLogo')}</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={storeInfo.logo} />
                        <AvatarFallback>
                          <Store className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>
                      <Button variant="outline">
                        <Upload className="h-4 w-4 ml-2" />
                        {t('vsUploadLogo')}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label>{t('vsStoreBanner')}</Label>
                    <div className="mt-2">
                      <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <Button variant="outline">
                          <Upload className="h-4 w-4 ml-2" />
                          {t('vsUploadBanner')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Store Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="storeName">{t('vsStoreName')}</Label>
                    <Input
                      id="storeName"
                      value={storeInfo.storeName}
                      onChange={(e) => setStoreInfo({ ...storeInfo, storeName: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="businessLicense">{t('vsBusinessLicense')}</Label>
                    <Input
                      id="businessLicense"
                      value={storeInfo.businessLicense}
                      onChange={(e) => setStoreInfo({ ...storeInfo, businessLicense: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="storeDescription">{t('vsStoreDescription')}</Label>
                  <Textarea
                    id="storeDescription"
                    rows={4}
                    value={storeInfo.storeDescription}
                    onChange={(e) => setStoreInfo({ ...storeInfo, storeDescription: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">{t('vsPhone')}</Label>
                    <Input
                      id="phone"
                      value={storeInfo.phone}
                      onChange={(e) => setStoreInfo({ ...storeInfo, phone: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">{t('vsEmail')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={storeInfo.email}
                      onChange={(e) => setStoreInfo({ ...storeInfo, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website">{t('vsWebsite')}</Label>
                    <Input
                      id="website"
                      value={storeInfo.website}
                      onChange={(e) => setStoreInfo({ ...storeInfo, website: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="taxNumber">{t('vsTaxNumber')}</Label>
                    <Input
                      id="taxNumber"
                      value={storeInfo.taxNumber}
                      onChange={(e) => setStoreInfo({ ...storeInfo, taxNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">{t('vsAddress')}</Label>
                  <Textarea
                    id="address"
                    rows={3}
                    value={storeInfo.address}
                    onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })}
                  />
                </div>

                <Button onClick={handleSaveStoreInfo}>
                  <Save className="h-4 w-4 ml-2" />
                  {t('vsSaveStoreInfo')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shipping Settings */}
          <TabsContent value="shipping">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {t('vsShippingSettings')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="freeShippingThreshold">{t('vsFreeShippingThresholdSar')}</Label>
                    <Input
                      id="freeShippingThreshold"
                      type="number"
                      value={shippingSettings.freeShippingThreshold}
                      onChange={(e) => setShippingSettings({ 
                        ...shippingSettings, 
                        freeShippingThreshold: parseFloat(e.target.value) 
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="standardShippingCost">{t('vsStandardShippingCostSar')}</Label>
                    <Input
                      id="standardShippingCost"
                      type="number"
                      value={shippingSettings.standardShippingCost}
                      onChange={(e) => setShippingSettings({ 
                        ...shippingSettings, 
                        standardShippingCost: parseFloat(e.target.value) 
                      })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expressShippingCost">{t('vsExpressShippingCostSar')}</Label>
                    <Input
                      id="expressShippingCost"
                      type="number"
                      value={shippingSettings.expressShippingCost}
                      onChange={(e) => setShippingSettings({ 
                        ...shippingSettings, 
                        expressShippingCost: parseFloat(e.target.value) 
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="processingDays">{t('vsProcessingDays')}</Label>
                    <Input
                      id="processingDays"
                      type="number"
                      value={shippingSettings.processingDays}
                      onChange={(e) => setShippingSettings({ 
                        ...shippingSettings, 
                        processingDays: parseInt(e.target.value) 
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="shippingDays">{t('vsShippingDays')}</Label>
                  <Input
                    id="shippingDays"
                    type="number"
                    value={shippingSettings.shippingDays}
                    onChange={(e) => setShippingSettings({ 
                      ...shippingSettings, 
                      shippingDays: parseInt(e.target.value) 
                    })}
                  />
                </div>

                <Button onClick={handleSaveShipping}>
                  <Save className="h-4 w-4 ml-2" />
                  {t('vsSaveShipping')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {t('vsPaymentSettings')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">{t('vsBankAccount')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bankName">{t('vsBankName')}</Label>
                      <Input
                        id="bankName"
                        value={paymentSettings.bankName}
                        onChange={(e) => setPaymentSettings({ 
                          ...paymentSettings, 
                          bankName: e.target.value 
                        })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="accountNumber">{t('vsAccountNumber')}</Label>
                      <Input
                        id="accountNumber"
                        value={paymentSettings.accountNumber}
                        onChange={(e) => setPaymentSettings({ 
                          ...paymentSettings, 
                          accountNumber: e.target.value 
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label htmlFor="iban">{t('vsIban')}</Label>
                    <Input
                      id="iban"
                      value={paymentSettings.iban}
                      onChange={(e) => setPaymentSettings({ 
                        ...paymentSettings, 
                        iban: e.target.value 
                      })}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-4">{t('vsEpayMethods')}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">PayPal</h4>
                        <p className="text-sm text-muted-foreground">{locale === 'en' ? 'Connect your PayPal account for online payments' : 'ربط حساب PayPal للدفع الإلكتروني'}</p>
                      </div>
                      <Badge variant="outline">{locale === 'en' ? 'Disabled' : 'غير مفعل'}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Stripe</h4>
                        <p className="text-sm text-muted-foreground">{locale === 'en' ? 'Connect Stripe to accept cards' : 'ربط حساب Stripe لقبول البطاقات'}</p>
                      </div>
                      <Badge variant={paymentSettings.stripeConnected ? "default" : "outline"}>
                        {paymentSettings.stripeConnected ? t('vsEnabled') : t('vsDisabled')}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <Button onClick={handleSavePayment}>
                    <Save className="h-4 w-4 ml-2" />
                    {t('vsSavePayment')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  {t('vsNotificationsSettings')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('vsOrderNotifications')}</Label>
                      <p className="text-sm text-muted-foreground">{t('vsOrderNotificationsDesc')}</p>
                    </div>
                    <Switch
                      checked={notifications.orderNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, orderNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('vsReviewNotifications')}</Label>
                      <p className="text-sm text-muted-foreground">{t('vsReviewNotificationsDesc')}</p>
                    </div>
                    <Switch
                      checked={notifications.reviewNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, reviewNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('vsStockAlerts')}</Label>
                      <p className="text-sm text-muted-foreground">{t('vsStockAlertsDesc')}</p>
                    </div>
                    <Switch
                      checked={notifications.stockAlerts}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, stockAlerts: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('vsEmailNotifications')}</Label>
                      <p className="text-sm text-muted-foreground">{t('vsEmailNotificationsDesc')}</p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, emailNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('vsSmsNotifications')}</Label>
                      <p className="text-sm text-muted-foreground">{t('vsSmsNotificationsDesc')}</p>
                    </div>
                    <Switch
                      checked={notifications.smsNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, smsNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('vsPromotionalMessages')}</Label>
                      <p className="text-sm text-muted-foreground">{t('vsPromotionalMessagesDesc')}</p>
                    </div>
                    <Switch
                      checked={notifications.promotionalEmails}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, promotionalEmails: checked })
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleSaveNotifications}>
                  <Save className="h-4 w-4 ml-2" />
                  {t('vsSaveNotifications')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {t('vsSecuritySettings')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">{t('vsChangePassword')}</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="newPassword">{t('vsNewPassword')}</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <Shield className="h-4 w-4" />
                  ) : (
                    <Shield className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="confirmPassword">{t('vsConfirmPassword')}</Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    
                    <Button 
                      onClick={handlePasswordChange}
                      disabled={!newPassword || !confirmPassword}
                    >
                      <Save className="h-4 w-4 ml-2" />
                      {t('vsChangePasswordBtn')}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-4">{t('vsTwoFactorAuth')}</h3>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label>{t('vsEnableTwoFactor')}</Label>
                      <p className="text-sm text-muted-foreground">{t('vsTwoFactorDesc')}</p>
                    </div>
                    <Button variant="outline">{t('vsEnable')}</Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-4">{t('vsActivitySessions')}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{locale === 'en' ? 'Chrome on Windows' : 'Chrome على Windows'}</p>
                        <p className="text-sm text-muted-foreground">{locale === 'en' ? 'Active now • Riyadh, Saudi Arabia' : 'نشط الآن • الرياض، السعودية'}</p>
                      </div>
                      <Badge variant="default">{t('vsCurrentSession')}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{locale === 'en' ? 'Safari on iPhone' : 'Safari على iPhone'}</p>
                        <p className="text-sm text-muted-foreground">{locale === 'en' ? 'Last activity yesterday • Riyadh, Saudi Arabia' : 'آخر نشاط أمس • الرياض، السعودية'}</p>
                      </div>
                      <Button variant="outline" size="sm">{t('vsEndSession')}</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}