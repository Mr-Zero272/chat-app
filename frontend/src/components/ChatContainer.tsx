import { useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/userAuthStore';
import ChatHeader from './ChatHeader';
import MessageSkeleton from './skeleton/MessageSkeleton';
import MessageInput from './MessageInput';
import { formatMessageTime } from '../lib/utils';
import { Message } from '../types/message';

const ChatContainer = () => {
    const { messages, getMessages, isMessagesLoading, selectedUser, subscribeToMessages, unsubscribeFromMessages } =
        useChatStore();
    const { authUser } = useAuthStore();
    const messageEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedUser) {
            getMessages(selectedUser._id);
        }

        subscribeToMessages();

        return () => unsubscribeFromMessages();
    }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages]);

    useEffect(() => {
        if (messageEndRef.current && messages) {
            messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    if (isMessagesLoading) {
        return (
            <div className="flex flex-1 flex-col overflow-auto">
                <ChatHeader />
                <MessageSkeleton />
                <MessageInput />
            </div>
        );
    }
    return (
        <div className="flex flex-1 flex-col overflow-auto">
            <ChatHeader />

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {messages.length !== 0 &&
                    messages.map((message: Message) => (
                        <div
                            key={message._id}
                            className={`chat ${message.senderId === authUser?._id ? 'chat-end' : 'chat-start'}`}
                            ref={messageEndRef}
                        >
                            <div className="avatar chat-image">
                                <div className="size-10 rounded-full border">
                                    <img
                                        src={
                                            message.senderId === authUser?._id
                                                ? authUser?.profilePic || '/avatar.jpg'
                                                : selectedUser?.profilePic || '/avatar.jpg'
                                        }
                                        alt="profile pic"
                                    />
                                </div>
                            </div>
                            <div className="chat-header mb-1">
                                <time className="ml-1 text-xs opacity-50">{formatMessageTime(message.createdAt)}</time>
                            </div>
                            <div className="chat-bubble flex flex-col">
                                {message.image && (
                                    <img
                                        src={message.image}
                                        alt="Attachment"
                                        className="mb-2 rounded-md sm:max-w-[200px]"
                                    />
                                )}
                                {message.text && <p>{message.text}</p>}
                            </div>
                        </div>
                    ))}
            </div>

            <MessageInput />
        </div>
    );
};

export default ChatContainer;
