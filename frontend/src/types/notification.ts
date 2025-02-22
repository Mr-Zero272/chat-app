export interface Notification {
    _id: string;
    senderId: string;
    receiverId: string;
    type: string;
    title: string;
    content: string;
    relatedEntityType: string;
    status: string;
    createAt: string;
    updatedAt: string;
}
