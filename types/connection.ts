// Shared types for connections and follows
// These mirror Prisma types but can be safely used in client components

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
