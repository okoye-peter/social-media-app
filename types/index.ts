import { Story as PrismaStory, User as PrismaUser } from '@prisma/client';

// ============================================================================
// CORE USER & AUTH TYPES
// ============================================================================

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

// ============================================================================
// STORY TYPES
// ============================================================================

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

export type FullStory = PrismaStory & {
    user: Omit<PrismaUser, 'password'>
}

// ============================================================================
// POST TYPES
// ============================================================================

export interface PostUser {
    id: number;
    name: string;
    username: string | null;
    image: string | null;
}

export interface PostMedia {
    id: number;
    url: string;
    type: string;
    createdAt: string;
    updatedAt: string;
}

export interface Like {
    id: number;
    userId: number;
    postId: number;
    createdAt: string;
    updatedAt: string;
}

export interface Post {
    id: number;
    userId: number;
    content: string | null;
    createdAt: string;
    updatedAt: string;
    user: PostUser;
    postMedia: PostMedia[];
    _count: {
        comments: number;
        likes: number;
    };
    likes: Like[];
}

export interface PostsResponse {
    message: string;
    posts: Post[];
    pagination: {
        page: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

// ============================================================================
// COMMENT TYPES
// ============================================================================

export interface Comment {
    id: number;
    userId: number;
    postId: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    user: {
        id: number;
        name: string;
        username: string | null;
        image: string | null;
    };
}

export interface CommentsResponse {
    message: string;
    comments: Comment[];
}

// ============================================================================
// MESSAGE TYPES
// ============================================================================

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

// Type that supports both API format and legacy dummy data format for message user cards
export interface MessageUser {
    id?: number;
    _id?: string;
    name?: string;
    full_name?: string;
    username?: string | null;
    bio?: string | null;
    image?: string | null;
    profile_picture?: string;
}

export interface Friend {
    id: number;
    name: string;
    image: string | null;
    bio: string | null;
    username: string | null;
    lastMessageDate: Date | null;
}

export interface MessagesAPIResponse {
    friends: Friend[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
    };
}

// ============================================================================
// CONNECTION & FOLLOW TYPES
// ============================================================================

export enum ConnectionStatus {
    PENDING = 'PENDING',
    REJECTED = 'REJECTED',
    APPROVED = 'APPROVED'
}

export interface Connection {
    id: number;
    senderId: number;
    receiverId: number;
    status: ConnectionStatus;
    createdAt: Date;
}

export interface Follow {
    id: number;
    senderId: number;
    receiverId: number;
    createdAt: Date;
}

// ============================================================================
// PAGE TYPES
// ============================================================================

export type ConnectionType = 'followers' | 'followings' | 'pending' | 'connections'

export interface UserData {
    id: number
    name: string
    email: string
    username: string | null
    image: string | null
    coverImage: string | null
    location: string | null
    bio: string | null
    createdAt: string
}

export interface FollowerData {
    id: number
    senderId: number
    receiverId: number
    sender: UserData
    createdAt: string
}

export interface FollowingData {
    id: number
    senderId: number
    receiverId: number
    receiver: UserData
    createdAt: string
}

export interface PendingData {
    id: number
    senderId: number
    receiverId: number
    sender: UserData
    status: string
    createdAt: string
}

export interface ConnectionData {
    id: number
    senderId: number
    receiverId: number
    sender: UserData
    receiver: UserData
    status: string
    createdAt: string
}

export interface PaginationData {
    total: number
    page: number
    limit: number
    totalPages: number
    hasMore: boolean
}

export interface ConnectionAPIResponse {
    data: FollowerData[] | FollowingData[] | PendingData[] | ConnectionData[]
    type: string
    pagination: PaginationData
}

export type DiscoveryUser = User & {
    sentConnections?: Connection[]
    receivedConnections?: Connection[]
    followers: Follow[]
}

export interface DiscoverResponse {
    users: DiscoveryUser[]
    pagination: {
        total: number
        page: number
        totalPages: number
        hasMore: boolean
    }
}

export type MediaType = {
    url: string
    type: 'image' | 'video'
    path: string
}

export type FileWithId = {
    file: File
    id: string
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

// Props for ConnectionCard component
export interface ConnectionCardProps {
    user: User & {
        following?: {
            id: number
            senderId: number
            receiverId: number
            status: ConnectionStatus
        },
        followers?: {
            id: number
            senderId: number
            receiverId: number
            status: ConnectionStatus
        }[]
        sentConnections?: {
            id: number
            senderId: number
            receiverId: number
            status: ConnectionStatus
        }[]
        receivedConnections?: {
            id: number
            senderId: number
            receiverId: number
            status: ConnectionStatus
        }[]
    }
    tag: 'followings' | 'pending' | 'connections' | 'followers'
}

// Props for UserProfileCard component (used in discover page)
export interface DiscoverUserProp {
    user: {
        id: number;
        name: string;
        email: string;
        username: string | null;
        bio: string | null;
        location: string | null;
        coverImage: string | null;
        image: string | null;
        createdAt: string | Date;
        updatedAt?: string | Date | null;
        followers: {
            id: number;
            senderId: number;
            receiverId: number;
        }[];
        sentConnections?: {
            id: number;
            senderId: number;
            receiverId: number;
            status: ConnectionStatus;
        }[];
        receivedConnections?: {
            id: number;
            senderId: number;
            receiverId: number;
            status: ConnectionStatus;
        }[];
    };
    onConnectionAccepted?: (userId: number) => void;
}

// Props for CreateStoryModal component
export interface CreateStoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onStoryCreated?: (story: FullStory) => void;
}

// Props for EditUserProfileModal component
export interface EditUserProfileModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User;
}

// Props for DashboardLayout component
export interface DashboardLayoutProps {
    children: React.ReactNode;
}
