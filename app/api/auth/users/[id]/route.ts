import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import * as Sentry from '@sentry/nextjs';


export const GET = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const { id } = await params
        const user = await prisma.user.findUnique({
            where: {
                id: Number(id)
            }
        })
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
        return NextResponse.json(user)
    } catch (error) {
        if (process.env.NODE_ENV === 'production') Sentry.captureException(error);
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}