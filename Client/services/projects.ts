import { api } from '@/lib/api';

export type SearchFilterDto = {
  page?: number;
  pageSize?: number;
  query?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
};

export type ProjectDto = {
  id: number;
  title?: string;
  description?: string;
  createdAt?: string;
  views?: number;
  status?: string;
};

export type PagedResultDto<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export async function getProjects(filter: SearchFilterDto = {}) {
  const params = new URLSearchParams();
  if (filter.page) params.set('page', String(filter.page));
  if (filter.pageSize) params.set('pageSize', String(filter.pageSize));
  if (filter.query) params.set('query', filter.query);
  if (filter.sortBy) params.set('sortBy', filter.sortBy);
  if (filter.sortDirection) params.set('sortDirection', filter.sortDirection);
  const qs = params.toString();
  return api.get<PagedResultDto<ProjectDto>>(`/api/Projects${qs ? `?${qs}` : ''}`);
}

export async function getOpenProjects() {
  return api.get<ProjectDto[]>(`/api/Projects/open`);
}

export async function getProjectById(id: number) {
  return api.get<ProjectDto>(`/api/Projects/${id}`);
}
