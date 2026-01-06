import { PrismaClient } from '../app/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || '';

if (!process.env.DATABASE_URL) {
    console.warn('⚠️ DATABASE_URL is not set in environment variables');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
        log: ['query', 'error', 'warn'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// User operations
export async function createUser(userData: {
    name: string;
    email: string;
    image?: string;
    password: string;
}) {
    return await prisma.user.create({ data: userData });
}

export async function findUserByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email } });
}

export async function findUserById(id: number) {
    return await prisma.user.findUnique({ where: { id } });
}