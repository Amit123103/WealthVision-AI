import { create } from 'zustand';

interface LocaleState {
  locale: string;
  setLocale: (l: string) => void;
}

interface SidebarState {
  isOpen: boolean;
  toggle: () => void;
}

export type UserRole = 'ADMIN' | 'POLICY_MAKER' | 'VIEWER';

interface AuthState {
  role: UserRole;
  setRole: (r: UserRole) => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: 'en',
  setLocale: (l) => set({ locale: l }),
}));

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));

export const useAuthStore = create<AuthState>((set) => ({
  role: 'ADMIN',
  setRole: (r) => set({ role: r }),
}));
