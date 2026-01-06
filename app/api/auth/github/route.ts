import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const redirectTo = '/feeds';

    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
    githubAuthUrl.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID!);
    githubAuthUrl.searchParams.set('redirect_uri', process.env.GITHUB_REDIRECT_URI!);
    githubAuthUrl.searchParams.set('scope', 'user:email');
    githubAuthUrl.searchParams.set('state', redirectTo);

    return NextResponse.redirect(githubAuthUrl.toString());
}