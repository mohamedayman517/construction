import React from 'react';
import { RouteContext } from '../../components/Router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { 
  Users, 
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ArrowRight,
  User
} from 'lucide-react';
import Header from '../../components/Header';
import { useTranslation } from '../../hooks/useTranslation';
import { useEffect, useState } from 'react';
import {
  getAdminUsers,
  addAdminUser,
  updateAdminUser,
  deleteAdminUser,
  setAdminUserStatus,
} from '../../lib/adminStore';
import type { AdminUser, AdminRole, AdminUserStatus } from '../../lib/adminStore';

// Local state backed by adminStore (localStorage)
export type UserRow = AdminUser;

export default function AdminUsers({ setCurrentPage, ...context }: Partial<RouteContext>) {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState<null | number>(null); // id when editing
  const [form, setForm] = useState<Partial<UserRow>>({
    name: '', email: '', phone: '', role: 'customer', status: 'active', location: '', orders: 0, totalSpent: '0 ر.س',
  });

  const reload = () => setUsers(getAdminUsers());
  useEffect(() => { reload(); }, []);

  // Show only end customers by default (roles: 'customer' or legacy 'user')
  const filteredUsers = users
    .filter(u => u.role === 'customer' || (u as any).role === 'user')
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });

  const openCreate = () => {
    setEditMode(null);
    setForm({ name: '', email: '', phone: '', role: 'customer', status: 'active', location: '', orders: 0, totalSpent: '0 ر.س' });
    setFormOpen(true);
  };
  const openEdit = (u: UserRow) => {
    setEditMode(u.id);
    setForm({ ...u });
    setFormOpen(true);
  };
  const submitForm = () => {
    if (!form.name || !form.email || !form.phone) return;
    if (editMode) {
      updateAdminUser(editMode, {
        name: String(form.name),
        email: String(form.email),
        phone: String(form.phone),
        role: form.role as AdminRole,
        status: form.status as AdminUserStatus,
        location: String(form.location || ''),
        orders: Number(form.orders || 0),
        totalSpent: String(form.totalSpent || '0 ر.س'),
      });
    } else {
      addAdminUser({
        name: String(form.name),
        email: String(form.email),
        phone: String(form.phone),
        role: form.role as AdminRole,
        status: form.status as AdminUserStatus,
        location: String(form.location || ''),
        orders: Number(form.orders || 0),
        totalSpent: String(form.totalSpent || '0 ر.س'),
      });
    }
    setFormOpen(false);
    setEditMode(null);
    reload();
  };
  const setStatus = (u: UserRow, status: AdminUserStatus) => { setAdminUserStatus(u.id, status); reload(); };
  const removeUser = (u: UserRow) => { deleteAdminUser(u.id); reload(); };

  const getRoleText = (role: string) => {
    switch(role) {
      case 'customer': return t('customerRole');
      case 'vendor': return t('vendorRole');
      case 'technician': return t('technicianRole');
      case 'admin': return t('adminRole');
      default: return role;
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'active': return t('activeStatus');
      case 'pending': return t('pendingStatus');
      case 'suspended': return t('suspendedStatus');
      case 'banned': return t('bannedStatus');
      default: return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'suspended': return 'destructive';
      case 'banned': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header {...context} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button 
              variant="outline" 
              onClick={() => setCurrentPage && setCurrentPage('admin-dashboard')}
              className="mr-4"
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              {t('backToDashboard')}
            </Button>
          </div>
          <h1 className="mb-2">{t('manageUsersTitle')}</h1>
          <p className="text-muted-foreground">{t('manageUsersSubtitle')}</p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              {t('searchAndFilter')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('searchByNameOrEmail')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder={t('userType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allTypes')}</SelectItem>
                  <SelectItem value="customer">{t('customerRole')}</SelectItem>
                  <SelectItem value="vendor">{t('vendorRole')}</SelectItem>
                  <SelectItem value="technician">{t('technicianRole')}</SelectItem>
                  <SelectItem value="admin">{t('adminRole')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder={t('statusLabel')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allStatuses')}</SelectItem>
                  <SelectItem value="active">{t('activeStatus')}</SelectItem>
                  <SelectItem value="pending">{t('pendingStatus')}</SelectItem>
                  <SelectItem value="suspended">{t('suspendedStatus')}</SelectItem>
                  <SelectItem value="banned">{t('bannedStatus')}</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                {t('addUser')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                {t('usersList')} ({filteredUsers.length})
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4 space-x-reverse w-full min-w-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1 w-full min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium break-words max-w-full leading-snug">{user.name}</h3>
                        <Badge variant={getStatusVariant(user.status)}>
                          {getStatusText(user.status)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center break-words min-w-0">
                          <Mail className="mr-1 h-3 w-3" />
                          <span className="break-words">{user.email}</span>
                        </div>
                        <div className="flex items-center break-words min-w-0">
                          <Phone className="mr-1 h-3 w-3" />
                          <span className="break-words">{user.phone}</span>
                        </div>
                        <div className="flex items-center break-words min-w-0">
                          <MapPin className="mr-1 h-3 w-3" />
                          <span className="break-words">{user.location}</span>
                        </div>
                        <span className="break-words">{t('ordersCountLabel')}: {user.orders}</span>
                        <span className="break-words">{t('totalSpentLabel')}: {user.totalSpent}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedUser(user)}
                        >
                          <User className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border border-white/20">
                        <DialogHeader>
                          <DialogTitle>{t('userDetails')}</DialogTitle>
                        </DialogHeader>
                        {selectedUser && (
                          <div className="space-y-4">
                            <div className="flex items-center space-x-4 space-x-reverse">
                              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                <Users className="h-8 w-8 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-medium">{selectedUser.name}</h3>
                                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                                <Badge variant={getStatusVariant(selectedUser.status)}>
                                  {getStatusText(selectedUser.status)}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <Label className="text-muted-foreground">{t('userType')}</Label>
                                <p>{getRoleText(selectedUser.role)}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">{t('phoneNumber')}</Label>
                                <p>{selectedUser.phone}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">{t('locationLabel')}</Label>
                                <p>{selectedUser.location}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">{t('joinDate')}</Label>
                                <p>{selectedUser.joinDate}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">{t('numberOfOrders')}</Label>
                                <p>{selectedUser.orders}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">{t('totalSpentLabel')}</Label>
                                <p>{selectedUser.totalSpent}</p>
                              </div>
                            </div>

                            <div className="flex space-x-2 space-x-reverse pt-4">
                              <Button size="sm" className="flex-1">
                                <Edit className="mr-2 h-4 w-4" />
                                {t('editAction')}
                              </Button>
                              {selectedUser.status === 'active' ? (
                                <Button size="sm" variant="outline" className="flex-1">
                                  <Ban className="mr-2 h-4 w-4" />
                                  {t('suspendAction')}
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" className="flex-1">
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  {t('activateAction')}
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" variant="outline" onClick={() => openEdit(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    {user.status === 'active' ? (
                      <Button size="sm" variant="outline" onClick={() => setStatus(user, 'suspended')}>
                        <Ban className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setStatus(user, 'active')}>
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => removeUser(user)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">{t('noResults')}</h3>
                <p className="text-muted-foreground">{t('noUsersFoundWithCriteria')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create / Edit User Dialog */}
        <Dialog open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) setEditMode(null); }}>
          <DialogContent className="max-w-lg bg-white/95 backdrop-blur-sm border border-white/20">
            <DialogHeader>
              <DialogTitle>{editMode ? t('editUser') : t('addUser')}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{t('fullName')}</Label>
                <Input value={form.name || ''} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <Label>{t('email')}</Label>
                <Input type="email" value={form.email || ''} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <Label>{t('phoneNumber')}</Label>
                <Input value={form.phone || ''} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <Label>{t('locationLabel')}</Label>
                <Input value={form.location || ''} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div>
                <Label>{t('userType')}</Label>
                <Select value={(form.role as string) || 'customer'} onValueChange={(v) => setForm(f => ({ ...f, role: v as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">{t('customerRole')}</SelectItem>
                    <SelectItem value="vendor">{t('vendorRole')}</SelectItem>
                    <SelectItem value="technician">{t('technicianRole')}</SelectItem>
                    <SelectItem value="admin">{t('adminRole')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('statusLabel')}</Label>
                <Select value={(form.status as string) || 'active'} onValueChange={(v) => setForm(f => ({ ...f, status: v as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t('activeStatus')}</SelectItem>
                    <SelectItem value="pending">{t('pendingStatus')}</SelectItem>
                    <SelectItem value="suspended">{t('suspendedStatus')}</SelectItem>
                    <SelectItem value="banned">{t('bannedStatus')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('ordersCountLabel')}</Label>
                <Input type="number" value={Number(form.orders || 0)} onChange={(e) => setForm(f => ({ ...f, orders: Number(e.target.value) }))} />
              </div>
              <div>
                <Label>{t('totalSpentLabel')}</Label>
                <Input value={form.totalSpent || '0 ر.س'} onChange={(e) => setForm(f => ({ ...f, totalSpent: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => { setFormOpen(false); setEditMode(null); }}>
                {t('cancel')}
              </Button>
              <Button onClick={submitForm}>
                {t('save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}