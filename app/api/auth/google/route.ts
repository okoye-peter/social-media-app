import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const redirectTo = process.env.GOOGLE_REDIRECT_URI as string;

  // Store redirect in a secure way (e.g., session, encrypted cookie)
  // For simplicity, we'll use query params here
  console.log('GOOGLE_CLIENT_ID', process.env.GOOGLE_CLIENT_ID)
  console.log('GOOGLE_REDIRECT_URI', process.env.GOOGLE_REDIRECT_URI)
  
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!);
  googleAuthUrl.searchParams.set('redirect_uri', process.env.GOOGLE_REDIRECT_URI!);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('state', redirectTo);

  return NextResponse.redirect(googleAuthUrl.toString());
}