import { MediaType } from "@/types";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import * as Sentry from '@sentry/nextjs';


export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json()
        const content = body.content as string | null
        const media = body.media as MediaType[] | null

        if ((!content || content.trim() === '') && (!media || media.length === 0)) {
            return NextResponse.json(
                { error: 'Post must have content or media' },
                { status: 400 }
            );
        }

        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const post = await prisma.post.create({
            data: {
                content: content || null,
                user: {
                    connect: {
                        id: user.id as number
                    }
                },
                postMedia: media && media.length > 0 ? {
                    create: media.map((m) => ({
                        url: m.url,
                        type: m.type.toUpperCase(), // Convert to uppercase to match enum
                    }))
                } : undefined
            }
        })

        return NextResponse.json({
            message: 'Post created successfully',
            post
        }, { status: 201 });
    } catch (error) {
        if (process.env.NODE_ENV === 'production') Sentry.captureException(error);
        console.error(error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export const GET = async (request: NextRequest) => {
    try {
        // Get page from query params, default to 1
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = 10;

        // Calculate skip value for pagination
        const skip = (page - 1) * pageSize;

        // Get total count for pagination metadata
        const totalCount = await prisma.post.count();

        // Fetch paginated posts
        const posts = await prisma.post.findMany({
            skip,
            take: pageSize,
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
                createdAt: 'desc',
            },
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
        console.error('posts fetching error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
