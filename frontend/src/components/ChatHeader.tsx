import { X } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/userAuthStore';

const ChatHeader = () => {
    const { selectedUser, setSelectedUser } = useChatStore();
    const { onlineUsers } = useAuthStore();
    return (
        <div className="border-b border-base-300 p-2.5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="avatar">
                        <div className="relative size-10 rounded-full">
                            <img src={selectedUser?.profilePic || '/avatar.jpg'} alt={selectedUser?.fullName} />
                        </div>
                    </div>

                    {/* User info */}
                    <div>
                        <h3 className="font-medium">{selectedUser?.fullName}</h3>
                        <p className="text-sm text-base-content/70">
                            {onlineUsers.includes(selectedUser ? selectedUser._id : '') ? 'Online' : 'Offline'}
                        </p>
                    </div>
                </div>

                {/* Close button */}
                <button onClick={() => setSelectedUser(null)}>
                    <X />
                </button>
            </div>
        </div>
    );
};

export default ChatHeader;
