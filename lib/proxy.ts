import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthTokenFromRequest } from '@/lib/auth';
import { verifyTokenEdge } from '@/lib/jwt-edge';

const protectedRoutes = ['/dashboard', '/profile', '/settings'];
const authRoutes = ['/login', '/register'];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = getAuthTokenFromRequest(request);
    const isAuthenticated = token ? !!(await verifyTokenEdge(token)) : false;

    // Redirect authenticated users away from auth pages
    if (isAuthenticated && authRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Redirect unauthenticated users from protected pages
    if (!isAuthenticated && protectedRoutes.some(route => pathname.startsWith(route))) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};