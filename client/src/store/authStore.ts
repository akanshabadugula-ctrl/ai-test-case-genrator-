import { create } from 'zustand';
import { authApi, type AuthUser } from '../api/auth';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';
interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
  restoreSession: () => Promise<void>;
  signup: (input: { name: string; email: string; password: string }) => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

function errorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { error?: { message?: string } } } }).response;
    if (response?.data?.error?.message) return response.data.error.message;
  }
  return 'Unable to reach TestPilot. Check your connection and try again.';
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'loading',
  error: null,
  restoreSession: async () => {
    try { set({ user: await authApi.me(), status: 'authenticated', error: null }); }
    catch { set({ user: null, status: 'anonymous', error: null }); }
  },
  signup: async (input) => {
    try { set({ user: await authApi.signup(input), status: 'authenticated', error: null }); }
    catch (error) { const message = errorMessage(error); set({ error: message }); throw new Error(message); }
  },
  login: async (input) => {
    try { set({ user: await authApi.login(input), status: 'authenticated', error: null }); }
    catch (error) { const message = errorMessage(error); set({ error: message }); throw new Error(message); }
  },
  logout: async () => {
    try { await authApi.logout(); } finally { set({ user: null, status: 'anonymous', error: null }); }
  },
}));
