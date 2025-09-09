"use client";

import { Search, ShoppingCart, User, Menu, Phone, MapPin, ArrowLeft, ArrowRight, Bell, MessageCircle, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../hooks/useTranslation';
import type { RouteContext } from './Router';
import { useEffect, useState } from 'react';
import { logout as apiLogout } from '@/services/auth';

interface HeaderProps extends Partial<RouteContext> {
  currentPage?: string;
}

export default function Header({ currentPage, setCurrentPage, cartItems, user, setUser, goBack }: HeaderProps) {
  const { t, locale } = useTranslation();
  const cartCount = (cartItems || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
  // Robust navigation: uses context when available, otherwise falls back to URL param
  const go = (page: string) => {
    if (setCurrentPage) return setCurrentPage(page);
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('page', page);
        window.location.href = url.toString();
      } catch {
        // no-op
      }
    }
  };
  const displayName = [user?.firstName, user?.middleName, user?.lastName].filter(Boolean).join(' ') || (user?.name || '');
  // Favorites count (guest wishlist)
  const [favCount, setFavCount] = useState(0);
  const loadFavCount = () => {
    try {
      if (typeof window !== 'undefined') {
        const raw = window.localStorage.getItem('favorites_v1');
        const list = raw ? JSON.parse(raw) : [];
        setFavCount(Array.isArray(list) ? list.length : 0);
      }
    } catch { setFavCount(0); }
  };
  useEffect(() => {
    loadFavCount();
    const onStorage = (e: StorageEvent) => { if (e.key === 'favorites_v1') loadFavCount(); };
    const onFavUpdated = () => loadFavCount();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', onStorage);
      window.addEventListener('favorites_updated', onFavUpdated as any);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', onStorage);
        window.removeEventListener('favorites_updated', onFavUpdated as any);
      }
    };
  }, []);
  const isHome = (() => {
    if (currentPage) return currentPage === 'home';
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        return (url.searchParams.get('page') || 'home') === 'home';
      } catch {}
    }
    return false;
  })();
  const current = (() => {
    if (currentPage) return currentPage;
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        return (url.searchParams.get('page') || 'home');
      } catch {}
    }
    return 'home';
  })();
  const hideBack = current === 'vendor-dashboard' || current === 'admin-dashboard';
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = user?.role === 'admin';
  const isVendor = user?.role === 'vendor';
  const isTechnician = user?.role === 'technician';
  // Restrict header content on admin pages: only greeting, logout, language, and notifications
  const isRestricted = isAdmin && current.startsWith('admin-');
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const loadNotifications = () => {
    try {
      if (typeof window !== 'undefined') {
        const raw = window.localStorage.getItem('notifications');
        const list = raw ? JSON.parse(raw) : [];
        const arr = Array.isArray(list) ? list : [];
        setNotifications(arr.slice(0, 2));
      }
    } catch { setNotifications([]); }
  };
  
  return (
    <>
    <header className="w-full">
      {/* Top promotional banner (hidden on admin pages) */}
      {!isRestricted && (
        <div className="bg-red-600 text-white py-2 px-4">
          <div className="container mx-auto text-center">
            <p className="text-sm">
              🎉 {locale === 'ar' ? 'عرض خاص: خصم 20% على جميع قطع المحرك' : 'Special Offer: 20% off all engine parts'} -
              <button onClick={() => go('offers')} className="underline hover:no-underline">{t('offers')}</button>
            </p>
          </div>
        </div>
      )}

      {/* Main header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              {/* Back button */}
              {!isHome && !hideBack && (
                <button
                  onClick={() => {
                    // Special case: from notifications page, vendors go back to vendor dashboard
                    if (current === 'notifications' && isVendor) { go('vendor-dashboard'); return; }
                    if (goBack) return goBack();
                    // Try using stored previous page from Router if available
                    if (typeof window !== 'undefined') {
                      try {
                        const prev = localStorage.getItem('mock_prev_page');
                        if (prev) { go(prev); return; }
                      } catch {}
                    }
                    // Fallback to browser history
                    if (typeof window !== 'undefined' && window.history.length > 1) {
                      try { window.history.back(); return; } catch {}
                    }
                    // Final fallback
                    go('home');
                  }}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label={locale==='ar' ? 'رجوع' : 'Back'}
                  title={locale==='ar' ? 'رجوع' : 'Back'}
                >
                  {locale === 'ar' ? (
                    <ArrowRight className="w-5 h-5" />
                  ) : (
                    <ArrowLeft className="w-5 h-5" />
                  )}
                </button>
              )}

              <button onClick={() => go('home')} className="flex items-center gap-2" aria-label={t('brandLogo')}>
                <div className="bg-primary text-white p-2 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center font-bold text-lg">
                    {t('brandName').charAt(0)}
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-primary">{t('brandName')}</h1>
                  <p className="text-xs text-muted-foreground">{t('brandSubtitle')}</p>
                </div>
              </button>
            </div>

            {/* Navigation */}
            {!isRestricted && (
              <nav className="hidden md:flex items-center gap-8">
                <button onClick={() => go('home')} className="text-foreground hover:text-primary transition-colors">{t('home')}</button>
                <button onClick={() => go('products')} className="text-foreground hover:text-primary transition-colors">{t('products')}</button>
                <button onClick={() => go('offers')} className="text-foreground hover:text-primary transition-colors">{t('offers')}</button>
                {/* Projects: hide for technicians */}
                {!isTechnician && (
                  <button onClick={() => go('projects')} className="text-foreground hover:text-primary transition-colors">{t('projects') || (locale==='ar'?'المشاريع':'Projects')}</button>
                )}
                {/* Rentals: hide for technicians; placed next to projects */}
                {!isTechnician && (
                  <button onClick={() => go('rentals')} className="text-foreground hover:text-primary transition-colors">{locale==='ar' ? 'التأجير' : 'Rentals'}</button>
                )}
                {/* Technicians quick link to their services */}
                {user && isTechnician && (
                  <button onClick={() => go('technician-services')} className="text-foreground hover:text-primary transition-colors">{locale==='ar' ? 'الخدمات' : 'Services'}</button>
                )}
                <button onClick={() => go('about')} className="text-foreground hover:text-primary transition-colors">{t('about')}</button>
              </nav>
            )}

            {/* Contact info & actions */}
            <div className="flex items-center gap-4">
              {!isRestricted && (
                <div className="hidden lg:flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{t('phone')}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{t('location')}</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                {/* Guest favorites (wishlist) button */}
                {!user && !isRestricted && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    onClick={() => go('favorites')}
                    aria-label={locale==='ar' ? 'المفضلة' : 'Favorites'}
                    title={locale==='ar' ? 'المفضلة' : 'Favorites'}
                  >
                    <Heart className="w-5 h-5" />
                    {favCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full px-1 flex items-center justify-center text-xs">
                        {favCount}
                      </Badge>
                    )}
                  </Button>
                )}
                {user && (
                  <Popover open={notifOpen} onOpenChange={(o)=>{ setNotifOpen(o); if (o) loadNotifications(); }}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative"
                        onMouseDown={(e)=>{ e.preventDefault(); if (!notifOpen) { setNotifOpen(true); loadNotifications(); } }}
                        onClick={(e)=>{ e.preventDefault(); }}
                        aria-label={locale==='ar' ? 'التنبيهات' : 'Notifications'}
                        title={locale==='ar' ? 'التنبيهات' : 'Notifications'}
                      >
                        <Bell className="w-5 h-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align={locale==='ar' ? 'start' : 'end'} side="bottom" sideOffset={10} className="w-80 p-0 bg-white">
                      <div className="p-3 border-b font-semibold text-sm">
                        {locale==='ar' ? 'التنبيهات' : 'Notifications'}
                      </div>
                      <div className="p-3 space-y-3 max-h-80 overflow-auto">
                        {notifications.length === 0 && (
                          <div className="text-sm text-muted-foreground">
                            {locale==='ar' ? 'لا توجد تنبيهات حالياً.' : 'No notifications yet.'}
                          </div>
                        )}
                        {notifications.map((n:any, idx:number) => (
                          <div key={idx} className="p-3 border rounded-md">
                            <div className="text-sm font-medium">{n.title || (locale==='ar' ? 'تنبيه' : 'Notification')}</div>
                            {n.message && (
                              <div className="text-xs text-muted-foreground mt-1">{n.message}</div>
                            )}
                            {n.createdAt && (
                              <div className="text-[11px] text-muted-foreground mt-1">
                                {new Date(n.createdAt).toLocaleString(locale==='ar' ? 'ar-EG' : 'en-US')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t">
                        <Button
                          className="w-full"
                          onClick={() => { setNotifOpen(false); if (setCurrentPage) setCurrentPage('notifications'); else { if (typeof window!=='undefined'){ try { const url=new URL(window.location.href); url.searchParams.set('page','notifications'); window.location.href=url.toString(); } catch {} } } }}
                        >
                          {locale==='ar' ? 'عرض المزيد' : 'Show more'}
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
                {/* Auth area */}
                {user ? (
                  <>
                    {/* Desktop greeting */}
                    <div className="hidden md:flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {locale === 'ar' ? 'أهلاً،' : 'Welcome,'} <span className="font-semibold text-foreground">{displayName}</span>
                      </span>
                      {isVendor && !isRestricted && (
                        <button
                          onClick={() => go('vendor-dashboard')}
                          className="text-foreground hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          {locale === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                        </button>
                      )}
                      {isAdmin && !isRestricted && (
                        <button
                          onClick={() => go('admin-dashboard')}
                          className="text-foreground hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          {locale === 'ar' ? 'لوحة المدير' : 'Admin Dashboard'}
                        </button>
                      )}
                      {!isRestricted && (
                        <Button variant="ghost" size="icon" onClick={() => go('profile')} aria-label="Profile">
                          <User className="w-5 h-5" />
                        </Button>
                      )}
                      <button
                        onClick={() => { try { apiLogout(); localStorage.removeItem('mock_current_user'); } catch {} setUser && setUser(null); go('home'); }}
                        className="text-foreground hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                      </button>
                    </div>
                    {/* Mobile minimal greeting for restricted roles */}
                    {isRestricted && (
                      <span className="md:hidden text-sm text-muted-foreground">
                        {locale==='ar' ? (isVendor ? 'أهلاً تاجر' : 'أهلاً مدير') : (isVendor ? 'Hello Vendor' : 'Hello Admin')}
                      </span>
                    )}
                  </>
                ) : (
                  <div className="hidden md:flex items-center gap-4">
                    <button
                      onClick={() => go('login')}
                      className="text-foreground hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {locale === 'ar' ? 'تسجيل الدخول' : 'Login'}
                    </button>
                    <button
                      onClick={() => go('register')}
                      className="text-foreground hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {locale === 'ar' ? 'إنشاء حساب' : 'Register'}
                    </button>
                  </div>
                )}
                {/* Show cart for guests and customers (hide only for restricted roles) */}
                {!isRestricted && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    onClick={() => go('cart')}
                    aria-label={locale==='ar' ? 'سلة التسوق' : 'Cart'}
                    title={locale==='ar' ? 'سلة التسوق' : 'Cart'}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full px-1 flex items-center justify-center text-xs">
                        {cartCount}
                      </Badge>
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open menu"
                  aria-expanded={mobileOpen}
                  onClick={() => setMobileOpen((v) => !v)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 dark:text-gray-100 border-b dark:border-gray-700 shadow-sm">
          <div className="container mx-auto px-4 py-2 flex flex-col gap-1">
            {!isRestricted && (
              <>
                <button onClick={() => { go('home'); setMobileOpen(false); }} className="py-3 text-left text-foreground hover:text-primary transition-colors">{t('home')}</button>
                <button onClick={() => { go('products'); setMobileOpen(false); }} className="py-3 text-left text-foreground hover:text-primary transition-colors">{t('products')}</button>
                <button onClick={() => { go('offers'); setMobileOpen(false); }} className="py-3 text-left text-foreground hover:text-primary transition-colors">{t('offers')}</button>
                {/* Projects: hide for technicians */}
                {!isTechnician && (
                  <button onClick={() => { go('projects'); setMobileOpen(false); }} className="py-3 text-left text-foreground hover:text-primary transition-colors">{t('projects') || (locale==='ar'?'المشاريع':'Projects')}</button>
                )}
                {/* Rentals: hide for technicians; placed next to projects */}
                {!isTechnician && (
                  <button onClick={() => { go('rentals'); setMobileOpen(false); }} className="py-3 text-left text-foreground hover:text-primary transition-colors">{locale==='ar' ? 'التأجير' : 'Rentals'}</button>
                )}
                {user && isTechnician && (
                  <button onClick={() => { go('technician-services'); setMobileOpen(false); }} className="py-3 text-left text-foreground hover:text-primary transition-colors">{locale==='ar' ? 'الخدمات' : 'Services'}</button>
                )}
                {/* Vendor dashboard quick link visible for vendors */}
                {user && isVendor && (
                  <button onClick={() => { go('vendor-dashboard'); setMobileOpen(false); }} className="py-3 text-left text-foreground hover:text-primary transition-colors">{locale==='ar' ? 'لوحة التحكم' : 'Dashboard'}</button>
                )}
                <button onClick={() => { go('about'); setMobileOpen(false); }} className="py-3 text-left text-foreground hover:text-primary transition-colors">{t('about')}</button>
                <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
              </>
            )}
            {/* Restricted (admin only): show limited options */}
            {isAdmin && (
              <>
                <button onClick={() => { try { apiLogout(); localStorage.removeItem('mock_current_user'); } catch {} setUser && setUser(null); go('home'); setMobileOpen(false); }} className="py-3 text-left text-foreground hover:text-primary transition-colors">{locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}</button>
              </>
            )}
            {user ? (
              <>
                {!isRestricted && (
                  <button onClick={() => { go('profile'); setMobileOpen(false); }} className="py-3 text-left text-foreground hover:text-primary transition-colors">{locale === 'ar' ? 'الملف الشخصي' : 'Profile'}</button>
                )}
                {!isRestricted && (
                  <button onClick={() => { try { apiLogout(); localStorage.removeItem('mock_current_user'); } catch {} setUser && setUser(null); go('home'); setMobileOpen(false); }} className="py-3 text-left text-foreground hover:text-primary transition-colors">{locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}</button>
                )}
              </>
            ) : (
              !isRestricted && (
                <>
                  <button onClick={() => { go('login'); setMobileOpen(false); }} className="py-3 text-left text-foreground hover:text-primary transition-colors">{locale === 'ar' ? 'تسجيل الدخول' : 'Login'}</button>
                  <button onClick={() => { go('register'); setMobileOpen(false); }} className="py-3 text-left text-foreground hover:text-primary transition-colors">{locale === 'ar' ? 'إنشاء حساب' : 'Register'}</button>
                </>
              )
            )}
          </div>
        </div>
      )}
    </header>

    {/* Floating Chatbot Button (bottom-right) - hidden on support page and for admins */}
    {current !== 'support' && !isAdmin && (
      <Button
        className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg h-12 w-12 p-0 bg-blue-600 hover:bg-blue-700 text-white"
        onClick={() => go('support')}
        aria-label={locale==='ar' ? 'الدعم' : 'Support'}
        title={locale==='ar' ? 'الدعم' : 'Support'}
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    )}

    {/* Notifications popover handled above */}
    </>
  );
}
