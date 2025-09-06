import { api } from '@/lib/api';

export type SearchFilterDto = {
  page?: number;
  pageSize?: number;
  query?: string;
  categoryId?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
};

export type ProductDto = {
  id: number;
  name: string;
  slug?: string;
  brand?: string;
  categoryId?: number;
  price?: number;
  stock?: number;
  status?: string;
  imageUrl?: string;
  createdAt?: string;
};

export type PagedResultDto<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export async function getProducts(filter: SearchFilterDto = {}) {
  const params = new URLSearchParams();
  if (filter.page) params.set('page', String(filter.page));
  if (filter.pageSize) params.set('pageSize', String(filter.pageSize));
  if (filter.query) params.set('query', filter.query);
  if (filter.categoryId) params.set('categoryId', String(filter.categoryId));
  if (filter.sortBy) params.set('sortBy', filter.sortBy);
  if (filter.sortDirection) params.set('sortDirection', filter.sortDirection);
  const qs = params.toString();
  return api.get<PagedResultDto<ProductDto>>(`/api/Products${qs ? `?${qs}` : ''}`);
}

export async function getProductById(id: number) {
  return api.get<ProductDto>(`/api/Products/${id}`);
}

export async function getProductBySlug(slug: string) {
  return api.get<ProductDto>(`/api/Products/slug/${encodeURIComponent(slug)}`);
}

export type CategoryDto = { id: number; name: string; parentId?: number | null };

export async function getRootCategories() {
  return api.get<CategoryDto[]>(`/api/Categories`);
}

export async function getAllCategories() {
  return api.get<CategoryDto[]>(`/api/Categories/all`);
}

// Mutations and additional endpoints
export async function getCategoryById(id: number) {
  return api.get<CategoryDto>(`/api/Categories/${id}`);
}

export type CreateOrUpdateProductDto = {
  name: string;
  description?: string;
  price?: number;
  stock?: number;
  brand?: string;
  partNumber?: string;
  imageUrl?: string;
  categoryId?: number;
};

export async function createProduct(payload: CreateOrUpdateProductDto) {
  // Merchant only per backend; requires auth token
  return api.post(`/api/Products`, payload, { auth: true });
}

export async function updateProduct(id: number, payload: CreateOrUpdateProductDto) {
  // Merchant only per backend; requires auth token
  return api.put(`/api/Products/${id}`, payload, { auth: true });
}

export async function deleteProduct(id: number) {
  // Merchant only per backend; requires auth token
  return api.del(`/api/Products/${id}`, { auth: true });
}

export async function getMyProducts() {
  // Merchant only per backend; requires auth token
  return api.get(`/api/Products/merchant/my-products`, { auth: true });
}
