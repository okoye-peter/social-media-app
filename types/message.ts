import { User } from './story';

export interface Message {
    _id: string;
    from_user_id: User;
    to_user_id: User;
    text: string;
    message_type: 'text' | 'image' | 'video';
    media_url: string;
    seen: boolean;
    createdAt: string;
    updatedAt: string;
}

// Type for messages where user IDs are strings (e.g., in dummyMessagesData)
export interface MessageWithUserIds {
    _id: string;
    from_user_id: string;
    to_user_id: string;
    text: string;
    message_type: 'text' | 'image' | 'video';
    media_url: string;
    seen: boolean;
    createdAt: string;
    updatedAt: string;
}
