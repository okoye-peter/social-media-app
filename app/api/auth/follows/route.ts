import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import * as Sentry from '@sentry/nextjs';


export const GET = async (request: NextRequest) => {
    try {
        const user = await getCurrentUser();
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Validate type parameter
        if (!type) {
            return NextResponse.json(
                { error: 'Type parameter is required' },
                { status: 400 }
            )
        }

        // Validate pagination parameters
        if (page < 1 || limit < 1 || limit > 100) {
            return NextResponse.json(
                { error: 'Invalid pagination parameters. Page must be >= 1 and limit must be between 1 and 100' },
                { status: 400 }
            )
        }

        const skip = (page - 1) * limit;

        if (type === 'followings') {
            // Get total count
            const totalCount = await prisma.follow.count({
                where: {
                    senderId: user.id,
                }
            });

            const followings = await prisma.follow.findMany({
                where: {
                    senderId: user.id,
                },
                select: {
                    receiverId: true,
                },
                skip,
                take: limit
            });

            const users = await prisma.user.findMany({
                where: {
                    id: {
                        in: followings.map((following: { receiverId: number }) => following.receiverId)
                    }
                }
            })

            const totalPages = Math.ceil(totalCount / limit);

            return NextResponse.json({
                followings: users,
                pagination: {
                    total: totalCount,
                    page,
                    limit,
                    totalPages,
                    hasMore: page < totalPages
                }
            })
        }

        if (type === 'followers') {
            // Get total count
            const totalCount = await prisma.follow.count({
                where: {
                    receiverId: user.id,
                }
            });

            const followers = await prisma.follow.findMany({
                where: {
                    receiverId: user.id,
                },
                select: {
                    senderId: true,
                },
                skip,
                take: limit
            });

            const users = await prisma.user.findMany({
                where: {
                    id: {
                        in: followers.map((follower: { senderId: number }) => follower.senderId)
                    }
                }
            })

            const totalPages = Math.ceil(totalCount / limit);

            return NextResponse.json({
                followers: users,
                pagination: {
                    total: totalCount,
                    page,
                    limit,
                    totalPages,
                    hasMore: page < totalPages
                }
            })
        }

        // Default case - invalid type
        return NextResponse.json(
            { error: 'Invalid type parameter. Use "followers" or "followings"' },
            { status: 400 }
        )
    } catch (error) {
        if (process.env.NODE_ENV === 'production') Sentry.captureException(error);
        console.error(error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}


export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { receiverId } = await request.json();

        if (!receiverId) {
            return NextResponse.json(
                { error: 'Receiver ID is required' },
                { status: 400 }
            )
        }

        // Check if already following
        const existingFollow = await prisma.follow.findFirst({
            where: {
                senderId: user.id,
                receiverId
            }
        });

        if (existingFollow) {
            return NextResponse.json(
                { error: 'You are already following this user' },
                { status: 400 }
            )
        }

        const follow = await prisma.follow.create({
            data: {
                senderId: user.id,
                receiverId
            }
        })

        return NextResponse.json({
            follow,
            message: 'Follow created successfully'
        }, { status: 201 })
    } catch (error) {
        if (process.env.NODE_ENV === 'production') Sentry.captureException(error);
        console.error(error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export const DELETE = async (request: NextRequest) => {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { receiverId } = await request.json();

        if (!receiverId) {
            return NextResponse.json(
                { error: 'Receiver ID is required' },
                { status: 400 }
            )
        }

        const follow = await prisma.follow.deleteMany({
            where: {
                senderId: user.id,
                receiverId
            }
        })

        return NextResponse.json({
            follow,
            message: 'Follow deleted successfully'
        }, { status: 200 })
    } catch (error) {
        if (process.env.NODE_ENV === 'production') Sentry.captureException(error);
        console.error(error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}