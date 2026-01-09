import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/db";



export const GET = async (request: NextRequest, { params }: { params: Promise<{ userId: string }> }) => {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const friendId = (await params).userId;

        // Verify there's an approved connection between users
        const connection = await prisma.connection.findFirst({
            where: {
                OR: [
                    {
                        senderId: user.id,
                        receiverId: Number(friendId),
                        status: 'APPROVED'
                    },
                    {
                        senderId: Number(friendId),
                        receiverId: user.id,
                        status: 'APPROVED'
                    }
                ]
            }
        });

        if (!connection) {
            return NextResponse.json({ error: 'No connection found with this user' }, { status: 403 });
        }

        // Check if friend exists
        const friend = await prisma.user.findUnique({
            where: {
                id: Number(friendId)
            },
        });
        if (!friend) return NextResponse.json({ error: 'Friend not found' }, { status: 404 });

        // Get pagination parameters
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = 20;
        const skip = (page - 1) * limit;

        // Fetch messages between users
        const [messages, totalMessages] = await Promise.all([
            prisma.message.findMany({
                where: {
                    OR: [
                        {
                            senderId: user.id,
                            receiverId: Number(friendId)
                        },
                        {
                            senderId: Number(friendId),
                            receiverId: user.id
                        }
                    ]
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit,
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
            }),
            prisma.message.count({
                where: {
                    OR: [
                        {
                            senderId: user.id,
                            receiverId: Number(friendId)
                        },
                        {
                            senderId: Number(friendId),
                            receiverId: user.id
                        }
                    ]
                }
            })
        ]);



        return NextResponse.json({
            friend,
            connection,
            messages,
            pagination: {
                page,
                limit,
                total: totalMessages,
                totalPages: Math.ceil(totalMessages / limit),
                hasMore: skip + messages.length < totalMessages
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