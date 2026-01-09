import { prisma } from "@/lib/db"
import { ConnectionStatus } from "@prisma/client"
import { NextResponse } from "next/server"
import * as Sentry from '@sentry/nextjs';


export const GET = async (
    request: Request,
    { params }: { params: Promise<{ userId: string }> }
) => {
    try {
        const { userId } = await params

        const totalPosts = await prisma.post.count({
            where: {
                userId: Number(userId)
            }
        })

        const totalFollowers = await prisma.connection.count({
            where: {
                receiverId: Number(userId),
                status: ConnectionStatus.APPROVED
            }
        })

        const totalFollowing = await prisma.connection.count({
            where: {
                senderId: Number(userId),
                status: ConnectionStatus.APPROVED
            }
        })

        return NextResponse.json({
            totalPosts,
            totalFollowers,
            totalFollowing
        }, { status: 200 })

    } catch (error) {
        if (process.env.NODE_ENV === 'production') Sentry.captureException(error);
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}