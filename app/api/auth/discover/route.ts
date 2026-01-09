import { NextRequest, NextResponse } from "next/server";
import * as Sentry from '@sentry/nextjs';
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ConnectionStatus } from "@prisma/client";


export const GET = async (request: NextRequest) => {
    try {
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 16;
        const skip = (page - 1) * limit;

        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userConnections = await prisma.connection.findMany({
            where: {
                OR: [
                    { senderId: user.id as number },
                    { receiverId: user.id as number }
                ],
                status: {
                    in: [ConnectionStatus.APPROVED]
                }
            }
        })

        // Get IDs of users that are already connected (either as sender or receiver)
        const userConnectionsIds = userConnections.map((connection) => {
            // If current user is the sender, get receiver's ID, otherwise get sender's ID
            return connection.senderId === user.id ? connection.receiverId : connection.senderId;
        });

        const whereClause = {
            id: {
                notIn: [...userConnectionsIds, user.id as number]
            },
            ...(search?.trim() && {
                name: {
                    contains: search,
                    mode: 'insensitive' as const
                }
            })
        };

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    sentConnections: {
                        where: {
                            receiverId: user.id as number,
                            status: {
                                in: [ConnectionStatus.PENDING]
                            }
                        }
                    },
                    receivedConnections: {
                        where: {
                            senderId: user.id as number,
                            status: {
                                in: [ConnectionStatus.PENDING]
                            }
                        }
                    },
                    followers: {
                        where: {
                            senderId: user.id as number
                        }
                    }
                }
            }),
            prisma.user.count({ where: whereClause })
        ]);

        return NextResponse.json({
            users,
            pagination: {
                total,
                page,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total
            }
        })
    } catch (error) {
        if (process.env.NODE_ENV === 'production') Sentry.captureException(error);
        console.error(error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}