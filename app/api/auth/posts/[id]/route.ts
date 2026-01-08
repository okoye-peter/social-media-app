import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import * as Sentry from '@sentry/nextjs';

// GET /api/auth/posts/[id] - Get a single post by ID
export const GET = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    try {
        const postId = parseInt((await params).id);

        if (isNaN(postId)) {
            return NextResponse.json(
                { error: 'Invalid post ID' },
                { status: 400 }
            );
        }

        const post = await prisma.post.findUnique({
            where: { id: postId },
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
            }
        });

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Post fetched successfully',
            post
        }, { status: 200 });
    } catch (error) {
        Sentry.captureException(error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
};
