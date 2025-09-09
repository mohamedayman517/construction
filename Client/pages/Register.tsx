import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '../components/ui/utils';
import { RouteContext } from '../components/Router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { useTranslation } from '../hooks/useTranslation';
import { validateEmail, validatePasswordMin, Role } from '../lib/authMock';
import { register as apiRegister } from '@/services/auth';
import { info as infoAlert } from '../utils/alerts';

interface RegisterProps extends RouteContext {}

export default function Register({ setCurrentPage, setUser, returnTo, setReturnTo, user, cartItems }: RegisterProps) {
  const { t, locale } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const isAr = locale === 'ar';
  const [role, setRole] = useState<Role>('customer');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [profession, setProfession] = useState<'plumber' | 'electrician' | 'carpenter' | 'painter' | 'gypsum' | 'marble' | ''>('');
  const [error, setError] = useState<string | null>(null);
  // Vendor specific state
  const [vFirstName, setVFirstName] = useState('');
  const [vMiddleName, setVMiddleName] = useState('');
  const [vLastName, setVLastName] = useState('');
  const [vPhone2, setVPhone2] = useState('');
  const [vBuilding, setVBuilding] = useState('');
  const [vStreet, setVStreet] = useState('');
  const [vCity, setVCity] = useState('');
  const [vPostal, setVPostal] = useState('');
  const [vTax, setVTax] = useState('');
  const [vRegStart, setVRegStart] = useState('');
  const [vRegEnd, setVRegEnd] = useState('');
  const [vDocFile, setVDocFile] = useState<File | null>(null);
  const [vImageFile, setVImageFile] = useState<File | null>(null);
  const [vLicenseImage, setVLicenseImage] = useState<File | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation
    // Require first/last name for all roles
    if (role !== 'vendor') {
      if (!firstName.trim() || !lastName.trim()) {
        setError(isAr ? 'الاسم الأول واسم العائلة مطلوبان' : 'First and last name are required');
        return;
      }
    }
    if (!validateEmail(email)) {
      setError(isAr ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Invalid email format');
      return;
    }
    if (!validatePasswordMin(password, 6)) {
      setError(isAr ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError(isAr ? 'تأكيد كلمة المرور غير متطابق' : 'Password confirmation does not match');
      return;
    }
    if (role === 'technician') {
      if (!phone.trim()) { setError(isAr ? 'رقم الهاتف مطلوب' : 'Phone number is required'); return; }
      if (!dob.trim()) { setError(isAr ? 'تاريخ الميلاد مطلوب' : 'Date of birth is required'); return; }
      if (!profession) { setError(isAr ? 'اختر المهنة' : 'Please select a profession'); return; }
    }
    if (role === 'customer') {
      if (!phone.trim()) { setError(isAr ? 'رقم الهاتف مطلوب' : 'Phone number is required'); return; }
      if (!dob.trim()) { setError(isAr ? 'تاريخ الميلاد مطلوب' : 'Date of birth is required'); return; }
    }
    if (role === 'vendor') {
      // Basic vendor validations
      if (!phone.trim()) { setError(isAr ? 'رقم الهاتف الأساسي مطلوب' : 'Primary phone is required'); return; }
      if (!vFirstName.trim() || !vLastName.trim()) { setError(isAr ? 'الاسم الأول واسم العائلة مطلوبان' : 'First and last name are required'); return; }
      if (!vBuilding.trim() || !vStreet.trim() || !vCity.trim() || !vPostal.trim()) { setError(isAr ? 'العنوان الكامل مطلوب (رقم المبنى، الشارع، المدينة، الرمز البريدي)' : 'Full address is required (building, street, city, postal code)'); return; }
    }

    const effectiveName = role === 'vendor' ? ((firstName + ' ' + lastName).trim() || (email.includes('@') ? email.split('@')[0] : 'Merchant')) : (firstName + ' ' + lastName).trim();
    const base = { name: effectiveName, email: email.trim(), password, role } as any;
    // Backend requires ConfirmPassword and separate FirstName/LastName
    base.confirmPassword = confirmPassword;
    if (role === 'technician') {
      base.phoneNumber = phone.trim();
      base.dob = dob.trim();
      base.profession = profession;
      base.firstName = firstName.trim();
      base.middleName = middleName.trim() || undefined;
      base.lastName = lastName.trim();
    }
    if (role === 'vendor') {
      base.phoneNumber = phone.trim();
      base.phoneSecondary = vPhone2.trim() || undefined;
      base.firstName = vFirstName.trim();
      base.middleName = vMiddleName.trim() || undefined;
      base.lastName = vLastName.trim();
      base.buildingNumber = vBuilding.trim();
      base.streetName = vStreet.trim();
      base.cityName = vCity.trim();
      base.postalCode = vPostal.trim();
      base.taxNumber = vTax.trim() || undefined;
      base.registryStart = vRegStart.trim() || undefined;
      base.registryEnd = vRegEnd.trim() || undefined;
      if (vDocFile) base.documentFile = vDocFile;
      if (vImageFile) base.imageFile = vImageFile;
      if (vLicenseImage) base.licenseImage = vLicenseImage;
    }
    if (role !== 'vendor' && role !== 'technician') {
      // Customer or others: use separate fields
      base.firstName = firstName.trim() || 'User';
      base.middleName = middleName.trim() || undefined;
      base.lastName = lastName.trim() || 'User';
      if (role === 'customer') {
        base.phoneNumber = phone.trim();
        base.dateOfBirth = dob.trim();
      }
    }
    setError(null);

    const { ok, data, error } = await apiRegister(base);
    if (!ok || !data) {
      let msg = (data as any)?.message || '';
      if (!msg && error) {
        if (typeof (error as any)?.message === 'string') msg = (error as any).message;
        else if (typeof (error as any)?.title === 'string') msg = (error as any).title;
        else if ((error as any)?.errors && typeof (error as any).errors === 'object') {
          const all = Object.values((error as any).errors as any).flat().join(' | ');
          msg = all;
        } else {
          try { msg = JSON.stringify(error); } catch { msg = String(error); }
        }
      }
      if (!msg) msg = isAr ? 'فشل إنشاء الحساب' : 'Registration failed';
      setError(msg);
      return;
    }

    const apiUser = (data as any)?.user || {} as any;
    const roleStr = (apiUser.role || role || 'customer').toString();
    // Normalize to router roles
    const roleMap: Record<string, 'customer'|'vendor'|'technician'|'admin'> = {
      'Customer':'customer','Merchant':'vendor','Technician':'technician','Admin':'admin',
      'customer':'customer','vendor':'vendor','technician':'technician','admin':'admin'
    };
    const uiRole = roleMap[roleStr] || 'customer';

    if (uiRole === 'vendor') {
      infoAlert(
        isAr ? 'تم استلام طلب تسجيلك كتاجر وهو قيد المراجعة من الإدارة. سيتم إشعارك عند الموافقة.' : 'Your merchant registration is pending admin approval. You will be notified when approved.',
        isAr
      );
      setReturnTo(null);
      setCurrentPage('login');
      return;
    }

    // Auto-login non-vendor if backend returned user info
    if (apiUser) {
      const payload: any = { id: apiUser.id, name: apiUser.name, email: apiUser.email, role: uiRole };
      if (uiRole === 'technician') {
        payload.phone = (apiUser as any).phone || phone;
        payload.dob = (apiUser as any).dob || dob;
        payload.birthdate = (apiUser as any).dob || dob;
        payload.profession = (apiUser as any).profession || profession;
        payload.technicianType = (apiUser as any).profession || profession;
      }
      setUser(payload);
      try { localStorage.setItem('mock_current_user', JSON.stringify(payload)); } catch {}
    }
    const dest = returnTo || 'home';
    setReturnTo(null);
    setCurrentPage(dest);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <Header currentPage="register" setCurrentPage={setCurrentPage} user={user} setUser={setUser} cartItems={cartItems} />
      <div className="w-full px-4 md:px-6 py-10 md:py-12">
        <div className="max-w-2xl mx-auto min-h-[70vh] flex items-center justify-center">
          <div className="w-full">
            <Card className="w-full max-w-xl mx-auto shadow-2xl border border-gray-200/70 dark:border-gray-800/70 rounded-2xl backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-extrabold">{locale === 'en' ? 'Create your account' : 'إنشاء حساب جديد'}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {locale === 'en' ? 'Fill in your details to get started.' : 'أدخل بياناتك للبدء.'}
                </p>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleRegister} dir={isAr ? 'rtl' : 'ltr'}>
                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded p-2">
                      {error}
                    </div>
                  )}
                  {/* Email and passwords at the bottom for non-vendor only */}
                  {role !== 'vendor' && (
                  <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                    <Label className="font-medium" htmlFor="email">{locale === 'en' ? 'Email' : 'البريد الإلكتروني'}</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={cn('h-12 rounded-xl text-base', isAr ? 'pr-11 text-right' : 'pl-11')}
                      />
                      <Mail className={cn('absolute top-1/2 -translate-y-1/2 size-4 text-muted-foreground', isAr ? 'right-3' : 'left-3')} />
                    </div>
                  </div>
                  )}
                  {role !== 'vendor' && (
                  <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                    <Label className="font-medium" htmlFor="password">{locale === 'en' ? 'Password' : 'كلمة المرور'}</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={cn('h-12 rounded-xl text-base pl-11 pr-11', isAr && 'text-right')}
                      />
                      <Lock className={cn('absolute top-1/2 -translate-y-1/2 size-4 text-muted-foreground', isAr ? 'right-3' : 'left-3')} />
                      <button
                        type="button"
                        aria-label={locale === 'en' ? (showPassword ? 'Hide password' : 'Show password') : (showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور')}
                        onClick={() => setShowPassword((v: boolean) => !v)}
                        className={cn('absolute top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted/50 transition', isAr ? 'left-2' : 'right-2')}
                      >
                        {showPassword ? (
                          <EyeOff className="size-4 text-muted-foreground" />
                        ) : (
                          <Eye className="size-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                  )}
                  {role !== 'vendor' && (
                  <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                    <Label className="font-medium" htmlFor="confirmPassword">{isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-12 rounded-xl text-base"
                    />
                  </div>
                  )}
                  {role !== 'vendor' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                        <Label className="font-medium" htmlFor="firstName">{isAr ? 'الاسم الأول' : 'First Name'}</Label>
                        <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="h-12 rounded-xl text-base" />
                      </div>
                      <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                        <Label className="font-medium" htmlFor="middleName">{isAr ? 'الاسم الأوسط (اختياري)' : 'Middle Name (optional)'}</Label>
                        <Input id="middleName" value={middleName} onChange={(e) => setMiddleName(e.target.value)} className="h-12 rounded-xl text-base" />
                      </div>
                      <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                        <Label className="font-medium" htmlFor="lastName">{isAr ? 'اسم العائلة' : 'Last Name'}</Label>
                        <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="h-12 rounded-xl text-base" />
                      </div>
                    </div>
                  )}
                  {/* Customer phone & DOB */}
                  {role === 'customer' && (
                    <>
                      <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                        <Label className="font-medium" htmlFor="custPhone">{isAr ? 'رقم الهاتف' : 'Phone Number'}</Label>
                        <Input id="custPhone" value={phone} onChange={(e) => setPhone(e.target.value)} required className="h-12 rounded-xl text-base" />
                      </div>
                      <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                        <Label className="font-medium" htmlFor="custDob">{isAr ? 'تاريخ الميلاد' : 'Date of Birth'}</Label>
                        <Input id="custDob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} required className="h-12 rounded-xl text-base" />
                      </div>
                    </>
                  )}
                  <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                    <Label className="font-medium" htmlFor="role">{isAr ? 'الدور' : 'Role'}</Label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as Role)}
                      className="h-11 w-full rounded-lg border border-input bg-background px-3 text-base"
                    >
                      <option value="customer">{isAr ? 'مستخدم' : 'Customer'}</option>
                      <option value="vendor">{isAr ? 'تاجر' : 'Vendor'}</option>
                      <option value="technician">{isAr ? 'فني' : 'Technician'}</option>
                    </select>
                  </div>
                  {role === 'vendor' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                          <Label className="font-medium" htmlFor="firstName">{isAr ? 'الاسم الأول' : 'First Name'}</Label>
                          <Input id="firstName" value={vFirstName} onChange={(e)=> setVFirstName(e.target.value)} required className="h-12 rounded-xl text-base" />
                        </div>
                        <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                          <Label className="font-medium" htmlFor="middleName">{isAr ? 'الاسم الأوسط' : 'Middle Name'}</Label>
                          <Input id="middleName" value={vMiddleName} onChange={(e)=> setVMiddleName(e.target.value)} className="h-12 rounded-xl text-base" />
                        </div>
                        <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                          <Label className="font-medium" htmlFor="lastName">{isAr ? 'اسم العائلة' : 'Last Name'}</Label>
                          <Input id="lastName" value={vLastName} onChange={(e)=> setVLastName(e.target.value)} required className="h-12 rounded-xl text-base" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                          <Label className="font-medium" htmlFor="emailTop">{locale === 'en' ? 'Email' : 'البريد الإلكتروني'}</Label>
                          <Input id="emailTop" type="email" value={email} onChange={(e)=> setEmail(e.target.value)} required className="h-12 rounded-xl text-base" />
                        </div>
                        <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                          <Label className="font-medium" htmlFor="passwordTop">{locale === 'en' ? 'Password' : 'كلمة المرور'}</Label>
                          <Input id="passwordTop" type="password" value={password} onChange={(e)=> setPassword(e.target.value)} required className="h-12 rounded-xl text-base" />
                        </div>
                        <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                          <Label className="font-medium" htmlFor="confirmTop">{isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}</Label>
                          <Input id="confirmTop" type="password" value={confirmPassword} onChange={(e)=> setConfirmPassword(e.target.value)} required className="h-12 rounded-xl text-base" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                          <Label className="font-medium" htmlFor="phone1">{isAr ? 'رقم الهاتف الأساسي' : 'Primary Phone'}</Label>
                          <Input id="phone1" value={phone} onChange={(e)=> setPhone(e.target.value)} required className="h-12 rounded-xl text-base" />
                        </div>
                        <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                          <Label className="font-medium" htmlFor="phone2">{isAr ? 'رقم هاتف إضافي (اختياري)' : 'Secondary Phone (optional)'}</Label>
                          <Input id="phone2" value={vPhone2} onChange={(e)=> setVPhone2(e.target.value)} className="h-12 rounded-xl text-base" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                          <Label className="font-medium" htmlFor="building">{isAr ? 'رقم المبنى' : 'Building Number'}</Label>
                          <Input id="building" value={vBuilding} onChange={(e)=> setVBuilding(e.target.value)} className="h-12 rounded-xl text-base" />
                        </div>
                        <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                          <Label className="font-medium" htmlFor="street">{isAr ? 'اسم الشارع' : 'Street Name'}</Label>
                          <Input id="street" value={vStreet} onChange={(e)=> setVStreet(e.target.value)} className="h-12 rounded-xl text-base" />
                        </div>
                        <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                          <Label className="font-medium" htmlFor="city">{isAr ? 'اسم المدينة' : 'City'}</Label>
                          <Input id="city" value={vCity} onChange={(e)=> setVCity(e.target.value)} className="h-12 rounded-xl text-base" />
                        </div>
                        <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                          <Label className="font-medium" htmlFor="postal">{isAr ? 'الرمز البريدي' : 'Postal Code'}</Label>
                          <Input id="postal" value={vPostal} onChange={(e)=> setVPostal(e.target.value)} className="h-12 rounded-xl text-base" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                          <Label className="font-medium" htmlFor="tax">{isAr ? 'الرقم الضريبي (اختياري)' : 'Tax Number (optional)'}</Label>
                          <Input id="tax" value={vTax} onChange={(e)=> setVTax(e.target.value)} className="h-12 rounded-xl text-base" />
                        </div>
                        <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                          <Label className="font-medium" htmlFor="regStart">{isAr ? 'السجل الموحد - البداية' : 'Unified Registry - Start'}</Label>
                          <Input id="regStart" value={vRegStart} onChange={(e)=> setVRegStart(e.target.value)} className="h-12 rounded-xl text-base" />
                        </div>
                        <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                          <Label className="font-medium" htmlFor="regEnd">{isAr ? 'السجل الموحد - النهاية' : 'Unified Registry - End'}</Label>
                          <Input id="regEnd" value={vRegEnd} onChange={(e)=> setVRegEnd(e.target.value)} className="h-12 rounded-xl text-base" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                          <Label className="font-medium" htmlFor="docFile">{isAr ? 'مستند (PDF/Doc)' : 'Document (PDF/Doc)'}</Label>
                          <Input id="docFile" type="file" accept=".pdf,.doc,.docx,image/*" onChange={(e)=> setVDocFile(e.target.files?.[0] || null)} className="h-12 rounded-xl text-base" />
                        </div>
                        <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                          <Label className="font-medium" htmlFor="imageFile">{isAr ? 'صورة' : 'Image'}</Label>
                          <Input id="imageFile" type="file" accept="image/*" onChange={(e)=> setVImageFile(e.target.files?.[0] || null)} className="h-12 rounded-xl text-base" />
                        </div>
                        <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                          <Label className="font-medium" htmlFor="licenseImage">{isAr ? 'رخصة (اختياري)' : 'License (optional)'}</Label>
                          <Input id="licenseImage" type="file" accept="image/*" onChange={(e)=> setVLicenseImage(e.target.files?.[0] || null)} className="h-12 rounded-xl text-base" />
                        </div>
                      </div>
                    </>
                  )}
                  {role === 'technician' && (
                    <>
                      <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                        <Label className="font-medium" htmlFor="phone">{isAr ? 'رقم الهاتف' : 'Phone Number'}</Label>
                        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required className="h-12 rounded-xl text-base" />
                      </div>
                      <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                        <Label className="font-medium" htmlFor="dob">{isAr ? 'تاريخ الميلاد' : 'Date of Birth'}</Label>
                        <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} required className="h-12 rounded-xl text-base" />
                      </div>
                      <div className={cn('space-y-1', isAr ? 'text-right' : 'text-left')}>
                        <Label className="font-medium" htmlFor="profession">{isAr ? 'المهنة' : 'Profession'}</Label>
                        <select
                          id="profession"
                          value={profession}
                          onChange={(e) => setProfession(e.target.value as any)}
                          className="h-11 w-full rounded-lg border border-input bg-background px-3 text-base"
                        >
                          <option value="">{isAr ? 'اختر المهنة' : 'Select profession'}</option>
                          <option value="plumber">{isAr ? 'سباك' : 'Plumber'}</option>
                          <option value="electrician">{isAr ? 'كهربائي' : 'Electrician'}</option>
                          <option value="carpenter">{isAr ? 'نجار' : 'Carpenter'}</option>
                          <option value="painter">{isAr ? 'دهان' : 'Painter'}</option>
                          <option value="gypsum">{isAr ? 'فني جبس' : 'Gypsum Installer'}</option>
                          <option value="marble">{isAr ? 'فني رخام' : 'Marble Installer'}</option>
                        </select>
                      </div>
                    </>
                  )}
                  <Button className="w-full rounded-xl h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-md hover:shadow-lg hover:brightness-110 hover:-translate-y-[1px] ring-1 ring-indigo-500/30 transition" size="lg" type="submit">{locale === 'en' ? 'Register' : 'تسجيل'}</Button>
                </form>
                <div className="my-4 border-t border-gray-200 dark:border-gray-800" />
                <div className="text-sm text-muted-foreground">
                  {locale === 'en' ? 'Already have an account?' : 'لديك حساب بالفعل؟'}{' '}
                  <button className="text-primary underline" onClick={() => setCurrentPage('login')}>
                    {locale === 'en' ? 'Login' : 'تسجيل الدخول'}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}
