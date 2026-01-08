import { NextRequest, NextResponse } from "next/server"
import * as Sentry from '@sentry/nextjs';
import { prisma } from "@/lib/db";


export const GET = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = 10;
        const type = searchParams.get('type');
        // Calculate skip value for pagination
        const skip = (page - 1) * pageSize;

        // Get total count for pagination metadata (only for this user)
        const totalCount = await prisma.post.count({
            where: type === 'likes'
                ? {
                    likes: {
                        some: {
                            userId: Number(id)
                        }
                    }
                }
                : type === 'media'
                    ? {
                        userId: Number(id),
                        postMedia: {
                            some: {}
                        }
                    }
                    : {
                        userId: Number(id)
                    }
        });

        const posts = await prisma.post.findMany({
            where: type === 'likes'
                ? {
                    likes: {
                        some: {
                            userId: Number(id)
                        }
                    }
                }
                : type === 'media'
                    ? {
                        userId: Number(id),
                        postMedia: {
                            some: {}
                        }
                    }
                    : {
                        userId: Number(id)
                    },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    }
                },
                likes: true,
                postMedia: true,
                _count: {
                    select: {
                        comments: true,
                        likes: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10,
            skip
        })

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / pageSize);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return NextResponse.json({
            message: 'Posts fetched successfully',
            posts,
            pagination: {
                page,
                pageSize,
                totalCount,
                totalPages,
                hasNextPage,
                hasPrevPage,
            }
        }, { status: 200 });
    } catch (error) {
        Sentry.captureException(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}