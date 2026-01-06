import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, setAuthCookie } from '@/lib/auth';
import { signToken } from '@/lib/jwt';
import { createUser, findUserByEmail, prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        const state = searchParams.get('state') || '/feeds';

        if (!code) {
            return NextResponse.redirect(new URL('/login?error=no_code', request.url));
        }

        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
                grant_type: 'authorization_code',
            }),
        });

        const tokens = await tokenResponse.json();

        // Get user info
        const userInfoResponse = await fetch(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            {
                headers: { Authorization: `Bearer ${tokens.access_token}` },
            }
        );

        const googleUser = await userInfoResponse.json();


        // Check if user exists with same email
        let user = await prisma.user.findUnique({ where: { email: googleUser.email } });

        if (!user) {
            const hashedPassword = await hashPassword('password')
            // Create new user
            user = await createUser({
                email: googleUser.email,
                name: googleUser.name,
                image: googleUser.picture,
                password: hashedPassword
            });
        }

        // Generate JWT
        const token = signToken({
            userId: user.id,
            email: user.email,
        });

        // Create redirect response
        const response = NextResponse.redirect(new URL(state, request.url));

        // Set cookie on the response and return
        return await setAuthCookie(token, response);
    } catch (error) {
        console.error('Google OAuth error:', error);
        return NextResponse.redirect(
            new URL('/login?error=oauth_failed', request.url)
        );
    }
}