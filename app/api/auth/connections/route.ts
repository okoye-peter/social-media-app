import { NextResponse } from "next/server";
import Sentry from "@sentry/nextjs";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ConnectionStatus } from "@prisma/client";

export const GET = async (req: Request) => {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'connections';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        // Validate pagination parameters
        if (page < 1 || limit < 1 || limit > 100) {
            return NextResponse.json(
                { error: 'Invalid pagination parameters. Page must be >= 1 and limit must be between 1 and 100' },
                { status: 400 }
            );
        }

        const skip = (page - 1) * limit;

        let data;
        let totalCount;

        switch (type) {
            case 'followers':
                // Get total count
                totalCount = await prisma.follow.count({
                    where: {
                        receiverId: user.id // Users following me
                    }
                });

                // Get users who are following the current user
                data = await prisma.follow.findMany({
                    where: {
                        receiverId: user.id // Users following me
                    },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                username: true,
                                image: true,
                                location: true,
                                bio: true,
                                createdAt: true,
                                _count: true
                            }
                        }
                    },
                    skip,
                    take: limit
                });
                break;

            case 'followings':
                // Get total count
                totalCount = await prisma.follow.count({
                    where: {
                        senderId: user.id // Users I'm following
                    }
                });

                // Get users that the current user is following
                data = await prisma.follow.findMany({
                    where: {
                        senderId: user.id // Users I'm following
                    },
                    include: {
                        receiver: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                username: true,
                                image: true,
                                location: true,
                                bio: true,
                                createdAt: true,
                                _count: true
                            }
                        }
                    },
                    skip,
                    take: limit
                });
                break;

            case 'pending':
                // Get total count
                totalCount = await prisma.connection.count({
                    where: {
                        receiverId: user.id,
                        status: ConnectionStatus.PENDING
                    }
                });

                // Get pending connection requests (received)
                data = await prisma.connection.findMany({
                    where: {
                        receiverId: user.id,
                        status: ConnectionStatus.PENDING
                    },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                username: true,
                                image: true,
                                location: true,
                                bio: true,
                                createdAt: true,
                                _count: true
                            }
                        }
                    },
                    skip,
                    take: limit
                });
                break;

            case 'connections':
                // Get total count
                totalCount = await prisma.connection.count({
                    where: {
                        OR: [
                            { senderId: user.id },
                            { receiverId: user.id }
                        ],
                        status: ConnectionStatus.APPROVED
                    }
                });

                // Get approved connections (both sent and received)
                data = await prisma.connection.findMany({
                    where: {
                        OR: [
                            { senderId: user.id },
                            { receiverId: user.id }
                        ],
                        status: ConnectionStatus.APPROVED
                    },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                username: true,
                                image: true,
                                location: true,
                                bio: true,
                                createdAt: true,
                                _count: true
                            }
                        },
                        receiver: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                username: true,
                                image: true,
                                location: true,
                                bio: true,
                                createdAt: true,
                                _count: true
                            }
                        }
                    },
                    skip,
                    take: limit
                });
                break;

            default:
                return NextResponse.json(
                    { error: 'Invalid type parameter' },
                    { status: 400 }
                );
        }

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json(
            {
                data,
                type,
                pagination: {
                    total: totalCount,
                    page,
                    limit,
                    totalPages,
                    hasMore: page < totalPages
                }
            },
            { status: 200 }
        );

    } catch (error) {
        Sentry.captureException(error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export const POST = async (req: Request) => {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { receiverId } = await req.json();

        if (!receiverId) {
            return NextResponse.json(
                { error: 'Missing receiverId' },
                { status: 400 }
            );
        }

        // Validate receiverId is a number
        if (typeof receiverId !== 'number' || isNaN(receiverId)) {
            return NextResponse.json(
                { error: 'Invalid receiverId format' },
                { status: 400 }
            );
        }

        // Check if receiver user exists
        const receiverUser = await prisma.user.findUnique({
            where: { id: receiverId }
        });

        if (!receiverUser) {
            return NextResponse.json(
                { error: 'Receiver user not found' },
                { status: 404 }
            );
        }

        const connection = await prisma.connection.findFirst({
            where: {
                OR: [
                    {
                        senderId: user.id,
                        receiverId: receiverId
                    },
                    {
                        senderId: receiverId,
                        receiverId: user.id
                    }
                ]
            }
        })

        if (connection) {
            return NextResponse.json(
                { error: 'You are already connected' },
                { status: 400 }
            );
        }

        const newConnection = await prisma.connection.create({
            data: {
                senderId: user.id,
                receiverId: receiverId
            }
        })

        return NextResponse.json(
            { connection: newConnection, message: 'connection sent successfully' },
            { status: 200 }
        );

    } catch (error) {
        Sentry.captureException(error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export const PUT = async (req: Request) => {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { userId, status } = await req.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing userId' },
                { status: 400 }
            );
        }

        const connection = await prisma.connection.findFirst({
            where: {
                OR: [
                    { senderId: user.id, receiverId: userId },
                    { receiverId: user.id, senderId: userId }
                ]
            }
        })

        if (!connection) {
            return NextResponse.json(
                { error: 'Connection not found' },
                { status: 404 }
            );
        }

        // Verify user is either sender or receiver
        if (connection.senderId !== user.id && connection.receiverId !== user.id) {
            return NextResponse.json(
                { error: 'Unauthorized to modify this connection' },
                { status: 403 }
            );
        }

        // // Verify connection status
        // if (connection.status !== ConnectionStatus.PENDING && connection.status !== ConnectionStatus.APPROVED) {
        //     return NextResponse.json(
        //         { error: 'Invalid connection status' },
        //         { status: 400 }
        //     );
        // }

        if (!status) {
            return NextResponse.json(
                { error: 'Missing status' },
                { status: 400 }
            );
        }

        if (!Object.values(ConnectionStatus).includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            );
        }

        if (status === ConnectionStatus.APPROVED && connection.status === ConnectionStatus.APPROVED && user?.id === connection.receiverId) {
            return NextResponse.json(
                { error: 'Connection already approved' },
                { status: 400 }
            );
        } else if (status === ConnectionStatus.APPROVED && connection.status === ConnectionStatus.PENDING && user?.id === connection.receiverId) {
            const newUpdateConnection = await prisma.connection.update({
                where: {
                    id: Number(connection.id)
                },
                data: {
                    status: ConnectionStatus.APPROVED
                }
            })

            return NextResponse.json(
                {
                    connection: newUpdateConnection,
                    message: 'Connection approved'
                },
                { status: 200 }
            );
        }

        if (status === ConnectionStatus.REJECTED && connection.status === ConnectionStatus.PENDING) {
            await prisma.connection.delete({
                where: {
                    id: Number(connection.id)
                }
            })

            return NextResponse.json(
                { message: user.id === connection.receiverId ? 'Connection request rejected' : 'Connection request cancelled' },
                { status: 200 }
            );
        }

        // No valid action matched
        return NextResponse.json(
            { error: 'Invalid operation' },
            { status: 400 }
        );
    } catch (error) {
        Sentry.captureException(error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
