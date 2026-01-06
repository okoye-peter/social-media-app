export interface User {
    id: number;
    email: string;
    name: string;
    username?: string | null;
    bio?: string | null;
    location?: string | null;
    coverImage?: string | null;
    image?: string | null;
    password: string;
    createdAt: Date;
    updatedAt?: Date | null;
}

export interface JWTPayload {
    userId: number;
    email: string;
    iat?: number;
    exp?: number;
}