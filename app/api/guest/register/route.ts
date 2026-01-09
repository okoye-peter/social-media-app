import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, setAuthCookie } from '@/lib/auth';
import { signTokenEdge } from '@/lib/jwt-edge';
import { createUser, findUserByEmail } from '@/lib/db';
import * as Sentry from '@sentry/nextjs';

export async function POST(request: NextRequest) {
    try {
        const { email, password, name, image } = await request.json();

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await createUser({
            email,
            password: hashedPassword,
            name,
            ...(image && { image }), // Only include image if provided
        });

        // Generate JWT using jose (Edge-compatible)
        const token = await signTokenEdge({
            userId: user.id,
            email: user.email,
        });

        // Create response with user data
        const response = NextResponse.json(
            {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    createdAt: user.createdAt,
                    image: user.image,
                    updatedAt: user.updatedAt,
                    username: user.username,
                    bio: user.bio,
                    location: user.location,
                    coverImage: user.coverImage,
                },
            },
            { status: 201 }
        );

        // Set cookie on the response and return
        return await setAuthCookie(token, response);
    } catch (error) {
        if (process.env.NODE_ENV === 'production') Sentry.captureException(error);
        console.error(error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}