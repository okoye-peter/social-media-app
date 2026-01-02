export interface User {
    _id: string;
    email: string;
    full_name: string;
    username: string;
    bio: string;
    profile_picture: string | { src: string };
    cover_photo: string | { src: string };
    location: string;
    followers: string[];
    following: string[];
    connections: string[];
    posts: string[];
    is_verified: boolean;
    createdAt: string;
    updatedAt: string;
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
