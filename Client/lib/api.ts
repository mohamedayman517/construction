export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';

function getAuthToken(): string | null {
  try {
    if (typeof window === 'undefined') return null;
    const ls = localStorage.getItem('auth_token');
    if (ls) return ls;
    // Fallback: read token from cookies if backend stores it there
    const cookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('auth_token='));
    if (cookie) return decodeURIComponent(cookie.split('=')[1] || '');
    return null;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(path: string, options?: {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
  auth?: boolean; // include bearer token from localStorage
  signal?: AbortSignal;
}): Promise<{ data: T | null; ok: boolean; status: number; error?: any }> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const isForm = typeof FormData !== 'undefined' && options?.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isForm ? {} : { 'Content-Type': 'application/json' }),
    ...(options?.headers || {}),
  };

  if (options?.auth) {
    const token = getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      method: options?.method || 'GET',
      headers,
      body: options?.body ? (isForm ? options.body : JSON.stringify(options.body)) : undefined,
      signal: options?.signal,
    });

    const status = res.status;
    const ok = res.ok;
    let data: any = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!ok) {
      return { data: null, ok: false, status, error: data };
    }

    return { data: data as T, ok: true, status };
  } catch (error) {
    return { data: null, ok: false, status: 0, error };
  }
}

export const api = {
  get: <T>(path: string, opts?: Omit<Parameters<typeof apiFetch<T>>[1], 'method'>) => apiFetch<T>(path, { ...(opts || {}), method: 'GET' }),
  post: <T>(path: string, body?: any, opts?: Omit<Parameters<typeof apiFetch<T>>[1], 'method' | 'body'>) => apiFetch<T>(path, { ...(opts || {}), method: 'POST', body }),
  put: <T>(path: string, body?: any, opts?: Omit<Parameters<typeof apiFetch<T>>[1], 'method' | 'body'>) => apiFetch<T>(path, { ...(opts || {}), method: 'PUT', body }),
  patch: <T>(path: string, body?: any, opts?: Omit<Parameters<typeof apiFetch<T>>[1], 'method' | 'body'>) => apiFetch<T>(path, { ...(opts || {}), method: 'PATCH', body }),
  del: <T>(path: string, opts?: Omit<Parameters<typeof apiFetch<T>>[1], 'method'>) => apiFetch<T>(path, { ...(opts || {}), method: 'DELETE' }),
  uploadFile: async (file: File, folder?: string) => {
    const form = new FormData();
    form.append('file', file);
    const query = folder ? `?folder=${encodeURIComponent(folder)}` : '';
    return apiFetch<{ success: boolean; url: string; publicId: string }>(`/api/uploads${query}`, {
      method: 'POST',
      body: form,
      auth: true,
    });
  },
  uploadFiles: async (files: File[], folder?: string) => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    const query = folder ? `?folder=${encodeURIComponent(folder)}` : '';
    return apiFetch<{ success: boolean; items: Array<{ url: string; publicId: string; fileName: string }> }>(`/api/uploads/batch${query}`, {
      method: 'POST',
      body: form,
      auth: true,
    });
  },
};
