import { SignJWT, jwtVerify } from 'jose';
import { JWTPayload } from './types';
import { AUTH_TOKEN_EXPIRES_IN_DAYS } from '@/constants';

// Edge-compatible JWT functions using jose library
// Use this in middleware and other Edge runtime code

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const JWT_EXPIRES_IN = `${AUTH_TOKEN_EXPIRES_IN_DAYS}d`;

export async function signTokenEdge(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
    return await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRES_IN)
        .sign(JWT_SECRET);
}

export async function verifyTokenEdge(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        console.log('JWT verification successful:', payload);
        // jose's JWTPayload includes standard JWT claims, we add our custom ones
        return payload as unknown as JWTPayload;
    } catch (error) {
        console.error('JWT verification error details:', {
            error,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            tokenPreview: token.substring(0, 20) + '...'
        });
        return null;
    }
}
