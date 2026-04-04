import { create } from 'zustand';
import Cookies from 'js-cookie';

interface AuthState {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!Cookies.get('access_token'),
  login: (token) => {
    Cookies.set('access_token', token, { expires: 1, secure: true }); // Expires in 1 day
    set({ isAuthenticated: true });
  },
  logout: () => {
    Cookies.remove('access_token');
    set({ isAuthenticated: false });
    window.location.href = '/login';
  },
}));