import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { verifyTokenEdge } from './jwt-edge';

import { prisma } from './db';
import { AUTH_TOKEN_COOKIE_NAME, AUTH_TOKEN_EXPIRES_IN_DAYS } from '@/constants';
import { User } from '@prisma/client';



const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * AUTH_TOKEN_EXPIRES_IN_DAYS, // 7 days
    path: '/',
};

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function comparePassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

export async function setAuthCookie(token: string, response: NextResponse): Promise<NextResponse> {
    response.cookies.set(AUTH_TOKEN_COOKIE_NAME, token, COOKIE_OPTIONS);
    return response;
}

export async function removeAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_TOKEN_COOKIE_NAME);
}

export async function getAuthToken(): Promise<string | null> {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(AUTH_TOKEN_COOKIE_NAME);
    return cookie?.value || null;
}

export async function getCurrentUser(): Promise<Omit<User, 'password' | 'updatedAt'> | null> {
    const token = await getAuthToken();
    if (!token) return null;

    const payload = await verifyTokenEdge(token);
    if (!payload) return null;

    // Fetch user from database
    // This is a placeholder - replace with your actual database call
    const user = await getUserFromDatabase(payload.userId);
    return user;
}

export function getAuthTokenFromRequest(request: NextRequest): string | null {
    return request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value || null;
}

// Placeholder function - implement with your database
async function getUserFromDatabase(userId: number): Promise<Omit<User, 'password' | 'updatedAt'> | null> {
    return await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            id: true,
            email: true,
            name: true,
            image: true,
            coverImage: true,
            username: true,
            bio: true,
            location: true,
            createdAt: true
        }
    });
}

/**
 * Get authenticated user ID from request headers (set by middleware)
 * Middleware passes userId via header to avoid Edge runtime limitations
 * Note: This header is only in the request, NOT sent to the client
 */
export function getUserIdFromHeaders(request: NextRequest): number | null {
    const userIdHeader = request.headers.get('x-user-id');
    if (!userIdHeader) return null;

    const userId = parseInt(userIdHeader, 10);
    return isNaN(userId) ? null : userId;
}

/**
 * Get authenticated user from request (via middleware-provided userId)
 * This fetches user data from database using the userId from middleware
 */
export async function getUserFromRequest(request: NextRequest): Promise<Omit<User, 'password' | 'updatedAt'> | null> {
    const userId = getUserIdFromHeaders(request);
    if (!userId) return null;

    return getUserFromDatabase(userId);
}