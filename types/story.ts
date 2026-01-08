export interface User {
    id: number;
    email: string;
    name: string;
    username: string | null;
    bio: string | null;
    image: string | null;
    coverImage: string | null;
    location: string | null;
    password?: string; // Optional as it shouldn't be exposed in frontend
    createdAt: string | Date;
    updatedAt?: string | Date | null;
}

export interface Story {
    _id: string;
    user: User;
    content: string;
    media_url: string;
    media_type: 'text' | 'image' | 'video';
    background_color: string;
    createdAt: string;
    updatedAt: string;
}
