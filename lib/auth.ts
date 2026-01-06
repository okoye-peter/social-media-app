import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';
import { User } from './types';
import { prisma } from './db';

const COOKIE_NAME = 'auth-token';
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
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
    response.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
    return response;
}

export async function removeAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

export async function getAuthToken(): Promise<string | null> {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    return cookie?.value || null;
}

export async function getCurrentUser(): Promise<Omit<User, 'password' | 'updatedAt'> | null> {
    const token = await getAuthToken();
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    // Fetch user from database
    // This is a placeholder - replace with your actual database call
    const user = await getUserFromDatabase(payload.userId);
    return user;
}

export function getAuthTokenFromRequest(request: NextRequest): string | null {
    return request.cookies.get(COOKIE_NAME)?.value || null;
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