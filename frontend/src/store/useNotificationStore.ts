import { create } from 'zustand';
import { useAuthStore } from './userAuthStore';
import { Notification } from '../types/notification';
import toast from 'react-hot-toast';

interface NotificationState {
    isGettingNotification: boolean;
    notification: Notification | null;
    subscribeToNotification: () => void;
    unsubscribeFromNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    isGettingNotification: false,
    notification: null,
    subscribeToNotification: () => {
        set({ isGettingNotification: true });

        const authUser = useAuthStore.getState().authUser;

        const socket = useAuthStore.getState().socket;

        if (!socket) {
            console.log('No socket found');
            return;
        }
        console.log('subscribeToNotification called');

        socket.on('newNotification', (newNotification: Notification) => {
            console.log(newNotification);
            const isMessageSentFromSelectedUser = newNotification.receiverId === authUser?._id;
            if (!isMessageSentFromSelectedUser) return;
            toast(newNotification.title + '\n' + newNotification.content, {
                icon: '👏',
            });
            set({ notification: newNotification });
        });
        set({ isGettingNotification: false });
    },
    unsubscribeFromNotification: () => {
        const socket = useAuthStore.getState().socket;

        if (!socket) return;

        socket.off('newNotification');
    },
}));
