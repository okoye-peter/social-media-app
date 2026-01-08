import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, setAuthCookie } from '@/lib/auth';
import { signTokenEdge } from '@/lib/jwt-edge';
import { createUser, findUserByEmail } from '@/lib/db';
import * as Sentry from '@sentry/nextjs';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        const state = searchParams.get('state') || '/dashboard';

        if (!code) {
            return NextResponse.redirect(new URL('/login?error=no_code', request.url));
        }

        // Exchange code for access token
        const tokenResponse = await fetch(
            'https://github.com/login/oauth/access_token',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    client_id: process.env.GITHUB_CLIENT_ID!,
                    client_secret: process.env.GITHUB_CLIENT_SECRET!,
                    code,
                }),
            }
        );

        const tokens = await tokenResponse.json();

        // Get user info
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
            },
        });

        const githubUser = await userResponse.json();

        // Get user email if not public
        let email = githubUser.email;
        if (!email) {
            const emailResponse = await fetch('https://api.github.com/user/emails', {
                headers: {
                    Authorization: `Bearer ${tokens.access_token}`,
                },
            });
            const emails = await emailResponse.json();
            email = emails.find((e: unknown) => (e as { primary: boolean }).primary)?.email || emails[0]?.email;
        }

        // Find or create user
        let user = await findUserByEmail(email);

        if (!user) {
            const hashedPassword = await hashPassword('password')
            user = await createUser({
                email,
                name: githubUser.name || githubUser.login,
                image: githubUser.avatar_url,
                password: hashedPassword
            });
        }

        // Generate JWT using jose (Edge-compatible)
        const token = await signTokenEdge({
            userId: user.id,
            email: user.email,
        });

        // Create redirect response
        const response = NextResponse.redirect(new URL(state, request.url));

        // Set cookie on the response and return
        return await setAuthCookie(token, response);
    } catch (error) {
        Sentry.captureException(error);
        return NextResponse.redirect(
            new URL('/login?error=oauth_failed', request.url)
        );
    }
}