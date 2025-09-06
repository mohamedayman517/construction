import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useTranslation } from '../../hooks/useTranslation';
import type { RouteContext } from '../../components/Router';
import { getAdminProductOptions, saveAdminProductOptions } from '../../lib/adminOptions';

export default function AdminProductOptions(props: Partial<RouteContext>) {
  const { locale } = useTranslation();
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    const opts = getAdminProductOptions();
    setCategories(opts.categories);
    const onUpdate = () => setCategories(getAdminProductOptions().categories);
    if (typeof window !== 'undefined') window.addEventListener('admin_options_updated', onUpdate as any);
    return () => { if (typeof window !== 'undefined') window.removeEventListener('admin_options_updated', onUpdate as any); };
  }, []);

  const addCategory = () => {
    const v = newCategory.trim();
    if (!v) return;
    const next = Array.from(new Set([v, ...categories]));
    setCategories(next);
    saveAdminProductOptions({ categories: next });
    setNewCategory('');
  };

  const removeCategory = (name: string) => {
    const next = categories.filter(c => c !== name);
    setCategories(next);
    saveAdminProductOptions({ categories: next });
  };

  const editCategory = (oldName: string) => {
    const input = window.prompt(locale==='ar' ? 'تعديل اسم الفئة' : 'Edit category name', oldName);
    if (input == null) return; // cancelled
    const newName = input.trim();
    if (!newName || newName === oldName) return;
    const next = Array.from(new Set(categories.map(c => (c === oldName ? newName : c))));
    setCategories(next);
    saveAdminProductOptions({ categories: next });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header {...props} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">{locale==='ar' ? 'خيارات المنتجات (للوحة الأدمن)' : 'Product Options (Admin)'}</h1>
        <p className="text-muted-foreground mb-6">{locale==='ar' ? 'أضف/احذف الفئات التي سيختار منها البائعون في نموذج إضافة منتج' : 'Add/remove categories vendors select in add product form'}</p>

        <Card>
          <CardHeader>
            <CardTitle>{locale==='ar' ? 'فئات المنتجات' : 'Product Categories'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder={locale==='ar' ? 'أدخل اسم الفئة (عربي)' : 'Enter category (Arabic label)'}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCategory(); } }}
              />
              <Button onClick={addCategory}>{locale==='ar' ? 'إضافة' : 'Add'}</Button>
            </div>

            {categories.length === 0 ? (
              <div className="text-sm text-muted-foreground">{locale==='ar' ? 'لا توجد فئات بعد. أضف فئة جديدة أعلاه.' : 'No categories yet. Add one above.'}</div>
            ) : (
              <div className="space-y-2">
                {categories.map((c) => (
                  <div key={c} className="flex items-center justify-between p-3 border rounded-md">
                    <span>{c}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => editCategory(c)}>
                        {locale==='ar' ? 'تعديل' : 'Edit'}
                      </Button>
                      <Button variant="destructive" size="sm" className="bg-destructive text-white hover:bg-destructive/90" onClick={() => removeCategory(c)}>
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
