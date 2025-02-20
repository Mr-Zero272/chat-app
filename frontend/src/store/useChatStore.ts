import { create } from 'zustand';
import { User } from '../types/user';
import { Message } from '../types/message';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from './userAuthStore';

interface ChatState {
    messages: Message[];
    users: User[];
    selectedUser: null | User;
    isUserLoading: boolean;
    isMessagesLoading: boolean;
    getUsers: () => Promise<void>;
    getMessages: (userId: string) => Promise<void>;
    sendMessage: (messageData: { text: string; image: string | ArrayBuffer | null }) => Promise<void>;
    setSelectedUser: (selectedUser: User | null) => void;
    subscribeToMessages: () => void;
    unsubscribeFromMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUserLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUserLoading: true });
        try {
            const res = await axiosInstance.get('/messages/users');
            set({ users: res.data });
        } catch (error) {
            console.log('Error in get message users', error);
            if (isAxiosError(error)) {
                toast.error((error.response?.data as { message: string }).message);
            } else {
                toast.error('Something went wrong');
            }
        } finally {
            set({ isUserLoading: false });
        }
    },
    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            console.log('Error in getMessages ', error);
            if (isAxiosError(error)) {
                toast.error((error.response?.data as { message: string }).message);
            } else {
                toast.error('Something went wrong');
            }
        } finally {
            set({ isMessagesLoading: false });
        }
    },
    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            if (selectedUser) {
                const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
                set({ messages: [...messages, res.data] });
            }
        } catch (error) {
            console.log('Error sending message', error);
            if (isAxiosError(error)) {
                toast.error((error.response?.data as { message: string }).message);
            } else {
                toast.error('Something went wrong');
            }
        }
    },
    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        if (!socket) return;

        // todo: optimize this one later
        socket.on('newMessage', (newMessage: Message) => {
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
            if (!isMessageSentFromSelectedUser) return;
            set({ messages: [...get().messages, newMessage] });
        });
    },
    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;

        if (!socket) return;

        socket.off('newMessage');
    },
    setSelectedUser: async (selectedUser) => {
        const { selectedUser: previousSelectedUser } = get();
        if (selectedUser === null || previousSelectedUser === null) {
            //TODO: send exit chat request.
            await axiosInstance.post('/api/messages/exit-chat').catch((error) => {
                console.log('Error in setSelectedUser exit chat', error);
                if (isAxiosError(error)) {
                    toast.error((error.response?.data as { message: string }).message);
                } else {
                    toast.error('Something went wrong');
                }
            });
        }
        set({ selectedUser });
    },
}));
