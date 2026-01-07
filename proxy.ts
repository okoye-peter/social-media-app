import { NextRequest, NextResponse } from "next/server"
import { AUTH_TOKEN_COOKIE_NAME } from "./constants"
import { verifyTokenEdge } from "./lib/jwt-edge"

// Note: Middleware runs on Edge runtime by default and cannot use:
// - Node.js crypto module (needed by bcrypt, jsonwebtoken verification works via jose alternative)
// - Prisma database queries
// Solution: Verify token here, pass userId to route handlers via header


async function authMiddleware(request: NextRequest) {

    try {
        const token = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value

        if (!token) {
            return NextResponse.json(
                { error: 'No token provided!' },
                { status: 401 }
            )
        }

        console.log('Token:', token)

        // Verify token (this works in Edge runtime using jose)
        const payload = await verifyTokenEdge(token)

        if (!payload) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            )
        }

        console.log('JWT verification successful! User ID:', payload.userId)

        // Pass userId to route handlers via REQUEST headers (server-side only)
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('x-user-id', String(payload.userId))

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })
    } catch (error) {
        console.error('Token verification error:', error)
        return NextResponse.json(
            { error: 'Invalid token' },
            { status: 401 }
        )
    }
}

async function guestMiddleware(request: NextRequest) {
    const token = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value

    if (token) {
        const payload = await verifyTokenEdge(token)

        if (payload) {
            return NextResponse.redirect(new URL('/feeds', request.url))
        }
    }

    return NextResponse.next()
}


export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Guest routes - public auth endpoints (login, register, OAuth)
    if (pathname.startsWith('/api/guest')) {
        return guestMiddleware(request)
    }

    // Protected routes - require authentication (me, logout, etc.)
    if (pathname.startsWith('/api/auth')) {
        return authMiddleware(request)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/api/:path*']
}