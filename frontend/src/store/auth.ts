import { create } from 'zustand';
import api from '@/lib/api';

interface User {
    id: number;
    email: string;
    name?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    login: (token, user) => {
        localStorage.setItem('token', token);
        set({ token, user });
    },
    logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null });
    },
    checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await api.get('/auth/profile');
                set({ user: response.data, token });
            } catch (error) {
                localStorage.removeItem('token');
                set({ token: null, user: null });
            }
        }
    },
}));
