import { User } from './story';

export interface Post {
    _id: string;
    user: User;
    content: string;
    image_urls: string[];
    post_type: 'text' | 'image' | 'text_with_image';
    likes_count: string[];
    createdAt: string;
    updatedAt: string;
}
