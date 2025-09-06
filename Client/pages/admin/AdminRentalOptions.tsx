import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useTranslation } from '../../hooks/useTranslation';
import type { RouteContext } from '../../components/Router';
import { getAdminRentalOptions, saveAdminRentalOptions } from '../../lib/adminOptions';

export default function AdminRentalOptions(props: Partial<RouteContext>) {
  const { locale } = useTranslation();
  const [categories, setCategories] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    const opts = getAdminRentalOptions();
    setCategories(opts.categories);
    const onUpdate = () => setCategories(getAdminRentalOptions().categories);
    if (typeof window !== 'undefined') window.addEventListener('admin_options_updated', onUpdate as any);
    return () => { if (typeof window !== 'undefined') window.removeEventListener('admin_options_updated', onUpdate as any); };
  }, []);

  const addItem = () => {
    const v = newItem.trim();
    if (!v) return;
    const next = Array.from(new Set([v, ...categories]));
    setCategories(next);
    saveAdminRentalOptions({ categories: next });
    setNewItem('');
  };

  const removeItem = (name: string) => {
    const next = categories.filter(c => c !== name);
    setCategories(next);
    saveAdminRentalOptions({ categories: next });
  };

  const editItem = (oldName: string) => {
    const input = window.prompt(locale==='ar' ? 'تعديل الاسم' : 'Edit name', oldName);
    if (input == null) return;
    const newName = input.trim();
    if (!newName || newName === oldName) return;
    const next = Array.from(new Set(categories.map(c => (c === oldName ? newName : c))));
    setCategories(next);
    saveAdminRentalOptions({ categories: next });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header {...props} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">{locale==='ar' ? 'خيارات التأجير (للوحة الأدمن)' : 'Rental Options (Admin)'}</h1>
        <p className="text-muted-foreground mb-6">{locale==='ar' ? 'أضف/احذف فئات التأجير' : 'Add/remove rental categories'}</p>

        <Card>
          <CardHeader>
            <CardTitle>{locale==='ar' ? 'فئات التأجير' : 'Rental Categories'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder={locale==='ar' ? 'فئة التأجير (عربي)' : 'Rental category (Arabic label)'}
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }}
              />
              <Button onClick={addItem}>{locale==='ar' ? 'إضافة' : 'Add'}</Button>
            </div>

            {categories.length === 0 ? (
              <div className="text-sm text-muted-foreground">{locale==='ar' ? 'لا توجد عناصر بعد.' : 'No items yet.'}</div>
            ) : (
              <div className="space-y-2">
                {categories.map((c) => (
                  <div key={c} className="flex items-center justify-between p-3 border rounded-md">
                    <span>{c}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => editItem(c)}>
                        {locale==='ar' ? 'تعديل' : 'Edit'}
                      </Button>
                      <Button variant="destructive" size="sm" className="bg-destructive text-white hover:bg-destructive/90" onClick={() => removeItem(c)}>
                        {locale==='ar' ? 'حذف' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
