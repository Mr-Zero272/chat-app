import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import { User } from '../types/user.js';
import { io, Socket } from 'socket.io-client';

const BASE_URL = import.meta.env.MODE === 'development' ? 'http://localhost:5001' : '/';

interface AuthState {
    authUser: User | null;
    isSigningUp: boolean;
    isLoggingIn: boolean;
    isUpdatingProfile: boolean;
    isCheckingAuth: boolean;
    onlineUsers: string[];
    socket: Socket | null;
    checkAuth: () => Promise<void>;
    signup: ({ fullName, email, password }: { fullName: string; email: string; password: string }) => Promise<void>;
    logout: () => Promise<void>;
    login: ({ email, password }: { email: string; password: string }) => Promise<void>;
    updateProfile: ({ profilePic }: { profilePic: string | ArrayBuffer | null }) => Promise<void>;
    connectSocket: () => void;
    disconnectSocket: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,
    checkAuth: async () => {
        try {
            const res = await axiosInstance.get('/auth/check');
            set({ authUser: res.data });
            get().connectSocket();
        } catch (error) {
            console.log('Error in checkAuth', error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },
    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post('/auth/signup', data);
            set({ authUser: res.data });
            toast.success('Account created successfully');

            get().connectSocket();
        } catch (error) {
            console.log('Error in signup', error);
            if (isAxiosError(error)) {
                toast.error((error.response?.data as { message: string }).message);
            } else {
                toast.error('Something went wrong');
            }
        } finally {
            set({ isSigningUp: false });
        }
    },
    login: async (data) => {
        set({ isLoggingIn: true });

        try {
            const res = await axiosInstance.post('/auth/login', data);
            set({ authUser: res.data });
            toast.success('Logged in successfully');

            get().connectSocket();
        } catch (error) {
            console.log('Error in login', error);
            if (isAxiosError(error)) {
                toast.error((error.response?.data as { message: string }).message);
            } else {
                toast.error('Something went wrong');
            }
        } finally {
            set({ isLoggingIn: false });
        }
    },
    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout');
            set({ authUser: null });
            toast.success('Logged out successfully');

            get().disconnectSocket();
        } catch (error) {
            console.log('Error in signup', error);
            if (isAxiosError(error)) {
                toast.error((error.response?.data as { message: string }).message);
            } else {
                toast.error('Something went wrong');
            }
        }
    },
    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put('/auth/update-profile', data);
            set({ authUser: res.data });
            toast.success('Profile updated successfully');
        } catch (error) {
            console.log('Error in updateProfile', error);
            if (isAxiosError(error)) {
                toast.error((error.response?.data as { message: string }).message);
            } else {
                toast.error('Something went wrong');
            }
        } finally {
            set({ isUpdatingProfile: false });
        }
    },
    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || (get().socket && get().socket?.connected)) return;
        console.log(authUser._id);
        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            },
        });
        socket.connect();
        set({ socket: socket });

        socket.on('getOnlineUsers', (userIds) => {
            set({ onlineUsers: userIds });
        });
    },
    disconnectSocket: () => {
        if (get().socket && get().socket?.connected) {
            get().socket?.disconnect();
        }
    },
}));
