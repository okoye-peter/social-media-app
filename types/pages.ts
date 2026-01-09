import { User } from './story'
import { Connection, Follow } from './connection'

// ============================================================================
// Connection Page Types
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

// ============================================================================
// Discover Page Types
// ============================================================================

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

// ============================================================================
// Post Creation Types
// ============================================================================

export type MediaType = {
    url: string
    type: 'image' | 'video'
    path: string
}

export type FileWithId = {
    file: File
    id: string
}
