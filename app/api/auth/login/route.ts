import { NextRequest, NextResponse } from 'next/server';
import { comparePassword, setAuthCookie } from '@/lib/auth';
import { signToken } from '@/lib/jwt';
import { findUserByEmail } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        // Log request details
        console.log('=== Login Request Debug ===');
        console.log('Headers:', Object.fromEntries(request.headers.entries()));

        // Get raw body text first
        const bodyText = await request.text();
        console.log('Raw body text:', bodyText);
        console.log('Body length:', bodyText.length);
        console.log('First 100 chars:', bodyText.substring(0, 100));

        // Parse and validate request body
        let body;
        try {
            body = JSON.parse(bodyText);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Failed to parse body:', bodyText);
            return NextResponse.json(
                { error: 'Invalid request body - malformed JSON' },
                { status: 400 }
            );
        }

        const { email, password } = body;

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Find user
        const user = await findUserByEmail(email);
        if (!user || !user.password) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Verify password
        const isValidPassword = await comparePassword(password, user.password);
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Generate JWT
        const token = signToken({
            userId: user.id,
            email: user.email,
        });

        // Create response with user data
        const response = NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                coverImage: user.coverImage,
                username: user.username,
                bio: user.bio,
                location: user.location,
                createdAt: user.createdAt
            },
        });

        // Set cookie on the response and return
        return await setAuthCookie(token, response);
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}