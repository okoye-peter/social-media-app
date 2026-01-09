import { NextRequest, NextResponse } from "next/server"
import Sentry from "@sentry/nextjs"
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";


export const GET = async (request: NextRequest) => {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';

        // Calculate skip for pagination
        const skip = (page - 1) * limit;

        // Use raw SQL for efficient database-level pagination
        // This query finds all friends (approved connections) and their most recent message
        const friends = search
            ? await prisma.$queryRaw<Array<{
                id: number;
                name: string;
                image: string | null;
                bio: string | null;
                username: string | null;
                lastMessageDate: Date | null;
            }>>`
                SELECT 
                    u.id,
                    u.name,
                    u.image,
                    u.bio,
                    u.username,
                    last_msg."createdAt" as "lastMessageDate"
                FROM users u
                LEFT JOIN LATERAL (
                    SELECT "createdAt"
                    FROM messages m
                    WHERE (m."senderId" = u.id AND m."receiverId" = ${user.id})
                       OR (m."senderId" = ${user.id} AND m."receiverId" = u.id)
                    ORDER BY m."createdAt" DESC
                    LIMIT 1
                ) last_msg ON true
                WHERE EXISTS (
                    SELECT 1 FROM connections c
                    WHERE c.status = 'APPROVED'
                    AND (
                        (c."senderId" = u.id AND c."receiverId" = ${user.id})
                        OR (c."receiverId" = u.id AND c."senderId" = ${user.id})
                    )
                )
                AND u.name ILIKE ${'%' + search + '%'}
                ORDER BY 
                    CASE WHEN last_msg."createdAt" IS NULL THEN 1 ELSE 0 END,
                    last_msg."createdAt" DESC NULLS LAST
                LIMIT ${limit}
                OFFSET ${skip}
            `
            : await prisma.$queryRaw<Array<{
                id: number;
                name: string;
                image: string | null;
                bio: string | null;
                username: string | null;
                lastMessageDate: Date | null;
            }>>`
                SELECT 
                    u.id,
                    u.name,
                    u.image,
                    u.bio,
                    u.username,
                    last_msg."createdAt" as "lastMessageDate"
                FROM users u
                LEFT JOIN LATERAL (
                    SELECT "createdAt"
                    FROM messages m
                    WHERE (m."senderId" = u.id AND m."receiverId" = ${user.id})
                       OR (m."senderId" = ${user.id} AND m."receiverId" = u.id)
                    ORDER BY m."createdAt" DESC
                    LIMIT 1
                ) last_msg ON true
                WHERE EXISTS (
                    SELECT 1 FROM connections c
                    WHERE c.status = 'APPROVED'
                    AND (
                        (c."senderId" = u.id AND c."receiverId" = ${user.id})
                        OR (c."receiverId" = u.id AND c."senderId" = ${user.id})
                    )
                )
                ORDER BY 
                    CASE WHEN last_msg."createdAt" IS NULL THEN 1 ELSE 0 END,
                    last_msg."createdAt" DESC NULLS LAST
                LIMIT ${limit}
                OFFSET ${skip}
            `;

        // Get total count for pagination metadata
        const totalCountResult = search
            ? await prisma.$queryRaw<Array<{ count: bigint }>>`
                SELECT COUNT(DISTINCT u.id)::bigint as count
                FROM users u
                WHERE EXISTS (
                    SELECT 1 FROM connections c
                    WHERE c.status = 'APPROVED'
                    AND (
                        (c."senderId" = u.id AND c."receiverId" = ${user.id})
                        OR (c."receiverId" = u.id AND c."senderId" = ${user.id})
                    )
                )
                AND u.name ILIKE ${'%' + search + '%'}
            `
            : await prisma.$queryRaw<Array<{ count: bigint }>>`
                SELECT COUNT(DISTINCT u.id)::bigint as count
                FROM users u
                WHERE EXISTS (
                    SELECT 1 FROM connections c
                    WHERE c.status = 'APPROVED'
                    AND (
                        (c."senderId" = u.id AND c."receiverId" = ${user.id})
                        OR (c."receiverId" = u.id AND c."senderId" = ${user.id})
                    )
                )
            `;

        const totalCount = Number(totalCountResult[0]?.count || 0);

        return NextResponse.json({
            friends: friends,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasMore: skip + friends.length < totalCount
            }
        }, { status: 200 });
    } catch (error) {
        if (process.env.NODE_ENV === 'production') Sentry.captureException(error);
        console.error(error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export const POST = async (request: NextRequest) => {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { receiverId, text, media_url, message_type } = body;

        // Validation: Must have receiverId, and either text or media
        if (!receiverId || (!text && !media_url)) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify connection exists
        const connection = await prisma.connection.findFirst({
            where: {
                status: 'APPROVED',
                OR: [
                    { senderId: user.id, receiverId: Number(receiverId) },
                    { senderId: Number(receiverId), receiverId: user.id }
                ]
            }
        });

        if (!connection) {
            return NextResponse.json({ error: 'You can only message friends' }, { status: 403 });
        }

        // Prepare data for creation
        const messageData: Prisma.MessageUncheckedCreateInput = {
            senderId: user.id,
            receiverId: Number(receiverId),
            content: text || '',
        };

        // Add media if present
        if (media_url && message_type !== 'text') {
            messageData.messageMedia = {
                create: {
                    url: media_url,
                    type: message_type || 'image',
                }
            };
        }

        const message = await prisma.message.create({
            data: messageData,
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                messageMedia: true
            }
        });

        return NextResponse.json(message, { status: 201 });

    } catch (error) {
        if (process.env.NODE_ENV === 'production') Sentry.captureException(error);
        console.error(error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}