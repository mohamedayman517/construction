export type Role = 'admin' | 'customer' | 'vendor' | 'technician';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  status?: 'active' | 'pending' | 'suspended';
  // Optional fields for technicians
  phone?: string;
  dob?: string; // ISO date string (YYYY-MM-DD)
  profession?: 'plumber' | 'electrician' | 'carpenter' | 'painter' | 'gypsum' | 'marble';
}

const SEED_USERS: MockUser[] = [
  { id: '1', name: 'Admin', email: 'admin@demo.com', password: 'admin123', role: 'admin', status: 'active' },
  { id: '2', name: 'Vendor', email: 'vendor@demo.com', password: 'vendor123', role: 'vendor', status: 'active' },
  { id: '4', name: 'Customer', email: 'user@demo.com', password: 'user12345', role: 'customer', status: 'active' },
  { id: '5', name: 'Technician Sample', email: 'tech@demo.com', password: 'tech12345', role: 'technician', phone: '+966500000000', dob: '1990-01-01', profession: 'plumber', status: 'active' },
  // Guaranteed demo technician for QA
  { id: '6', name: 'Technician', email: 'Technician@demo.com', password: 'Technician123', role: 'technician', phone: '+966512345678', dob: '1992-05-10', profession: 'electrician', status: 'active' },
];

const STORAGE_KEY = 'mock_users';

function readStore(): MockUser[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as MockUser[];
    return null;
  } catch {
    return null;
  }
}

function writeStore(users: MockUser[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
}

export function getUsers(): MockUser[] {
  const existing = readStore();
  // If store exists, ensure demo technician is present
  if (existing && existing.length) {
    const hasDemo = existing.some(u => u.email.toLowerCase() === 'technician@demo.com'.toLowerCase());
    if (!hasDemo) {
      const demo: MockUser = { id: '6', name: 'Technician', email: 'Technician@demo.com', password: 'Technician123', role: 'technician', phone: '+966512345678', dob: '1992-05-10', profession: 'electrician', status: 'active' };
      const withDemo: MockUser[] = [...existing, demo];
      writeStore(withDemo);
      return withDemo;
    }
    return existing;
  }
  writeStore(SEED_USERS);
  return [...SEED_USERS];
}

export function saveUsers(users: MockUser[]) {
  writeStore(users);
}

export function findUserByEmail(email: string): MockUser | undefined {
  const normalized = email.trim().toLowerCase();
  return getUsers().find(u => u.email.toLowerCase() === normalized);
}

export function authenticate(email: string, password: string): MockUser | null {
  const normalized = email.trim().toLowerCase();
  const users = getUsers();
  const match = users.find(u => u.email.toLowerCase() === normalized && u.password === password);
  return match || null;
}

export function addUser(newUser: Omit<MockUser, 'id'>): { ok: true; user: MockUser } | { ok: false; error: string } {
  const users = getUsers();
  const exists = users.some(u => u.email.toLowerCase() === newUser.email.trim().toLowerCase());
  if (exists) return { ok: false, error: 'EMAIL_TAKEN' };
  const user: MockUser = { ...newUser, id: String(Date.now()) } as MockUser;
  // Default status: vendors -> pending, others -> active
  if (!user.status) {
    user.status = user.role === 'vendor' ? 'pending' : 'active';
  }
  users.push(user);
  saveUsers(users);
  return { ok: true, user };
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePasswordMin(password: string, min = 6): boolean {
  return typeof password === 'string' && password.length >= min;
}

// Helpers for admin approval
export function setUserStatus(userId: string, status: 'active' | 'pending' | 'suspended'): void {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx !== -1) {
    users[idx].status = status;
    saveUsers(users);
  }
}
