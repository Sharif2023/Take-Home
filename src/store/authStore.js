import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as loginApi, getMe } from '../lib/api';
import useCartStore from './cartStore';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { data } = await loginApi(email, password);
          localStorage.setItem('token', data.token);
          localStorage.setItem('refreshToken', data.refreshToken);
          useCartStore.getState().clearCart();
          set({
            user: { _id: data._id, name: data.name, email: data.email, role: data.role },
            token: data.token,
            refreshToken: data.refreshToken,
            loading: false,
          });
          return data;
        } catch (err) {
          const msg = err.response?.data?.message || 'Login failed';
          set({ error: msg, loading: false });
          throw new Error(msg);
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        useCartStore.getState().clearCart();
        set({ user: null, token: null, refreshToken: null });
      },

      fetchMe: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
          const { data } = await getMe();
          set({ user: data });
        } catch {
          get().logout();
        }
      },

      isAdmin: () => get().user?.role === 'admin',
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, refreshToken: state.refreshToken }),
    }
  )
);

export default useAuthStore;
