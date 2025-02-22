import { useEffect } from 'react';
import ChatContainer from '../components/ChatContainer';
import NoChatSelected from '../components/NoChatSelected';
import Sidebar from '../components/Sidebar';
import { useChatStore } from '../store/useChatStore';
import { useNotificationStore } from '../store/useNotificationStore';

const HomePage = () => {
    const { selectedUser } = useChatStore();
    const { subscribeToNotification, unsubscribeFromNotification } = useNotificationStore();

    useEffect(() => {
        subscribeToNotification();
    }, [subscribeToNotification]);

    useEffect(() => {
        const pageHideHandler = () => {
            unsubscribeFromNotification();
        };

        window.addEventListener('pagehide', pageHideHandler);

        return () => {
            window.removeEventListener('pagehide', pageHideHandler);
        };
    }, [unsubscribeFromNotification]);

    return (
        <div className="h-screen bg-base-200">
            <div className="flex items-center justify-center px-4 pt-20">
                <div className="shadow-cl h-[calc(100vh-8rem)] w-full max-w-6xl rounded-lg bg-base-100">
                    <div className="flex h-full overflow-hidden rounded-lg">
                        <Sidebar />
                        {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
