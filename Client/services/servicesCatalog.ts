import { api } from '@/lib/api';

export type ServiceDto = {
  id: string | number;
  type: string;
  dailyWage: number;
  days: number;
  total: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  vendorId?: string | number;
};

export async function listVendorServices(params?: { vendorId?: 'me' | string | number }) {
  const qs = new URLSearchParams();
  if (params?.vendorId) qs.set('vendorId', String(params.vendorId));
  const query = qs.toString();
  return api.get<ServiceDto[]>(`/api/Services${query?`?${query}`:''}`, { auth: true });
}

export async function getServiceById(id: string | number) {
  return api.get<ServiceDto>(`/api/Services/${id}`, { auth: true });
}

export async function createService(payload: Partial<ServiceDto>) {
  return api.post<ServiceDto>('/api/Services', payload, { auth: true });
}

export async function updateService(id: string | number, payload: Partial<ServiceDto>) {
  return api.put<ServiceDto>(`/api/Services/${id}`, payload, { auth: true });
}

export async function deleteService(id: string | number) {
  return api.del<unknown>(`/api/Services/${id}`, { auth: true });
}
