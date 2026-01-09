import { ConnectionStatus, MessageContentType } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { uploadStories } from '@/lib/supabase-storage-examples';
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';


export async function POST(request: NextRequest) {
    try {
        // Use FormData to handle file uploads
        const formData = await request.formData()
        const content = formData.get('content') as string
        const contentBackground = formData.get('contentBackground') as string
        const media = formData.get('media') as File | null

        // Validate: Either text story OR media story, not both
        const hasTextContent = content && content.trim() !== '';
        const hasMedia = media !== null;

        if (!hasTextContent && !hasMedia) {
            return NextResponse.json(
                { error: 'Either content or media is required' },
                { status: 400 }
            )
        }

        // For text stories, contentBackground is required
        if (hasTextContent && !hasMedia && !contentBackground) {
            return NextResponse.json(
                { error: 'Content background color is required for text stories' },
                { status: 400 }
            )
        }

        let uploadData;
        let contextType: MessageContentType;

        if (hasMedia) {
            // Validate media file type (images and videos only)
            const isImage = media!.type.startsWith('image/')
            const isVideo = media!.type.startsWith('video/')

            if (!isImage && !isVideo) {
                return NextResponse.json(
                    { error: 'Invalid file type. Only images and videos are allowed.' },
                    { status: 400 }
                )
            }

            // Validate media file size (max 35MB)
            const maxSize = 35 * 1024 * 1024; // 35MB in bytes
            if (media!.size > maxSize) {
                return NextResponse.json(
                    { error: 'File size too large. Maximum size is 35MB.' },
                    { status: 400 }
                )
            }

            // Media story (image or video)
            const result = await uploadStories(media!)

            if (!result.success || result.error) {
                return NextResponse.json(
                    { error: result.error || 'Failed to upload media' },
                    { status: 500 }
                )
            }

            uploadData = result.data
            // Determine type based on uploaded file type
            contextType = uploadData!.type === 'image'
                ? MessageContentType.IMAGE
                : MessageContentType.VIDEO;
        } else {
            // Text story
            contextType = MessageContentType.TEXT;
        }

        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const story = await prisma.story.create({
            data: {
                content: hasTextContent ? content : null,
                contentBackground: hasTextContent ? contentBackground : null,
                mediaUrl: uploadData?.url || null,
                userId: user.id,
                contextType
            },
            include: {
                user: {
                    select: {
                        id: true,
                        image: true,
                        name: true,
                        username: true
                    }
                }
            }
        })

        return NextResponse.json({
            story,
            message: 'Story created successfully'
        }, { status: 201 })

    } catch (error) {
        console.error('stories creation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const followings = await prisma.follow.findMany({
            where: {
                senderId: user.id,
            },
            select: {
                receiverId: true,
            }
        });

        const connectionIds = followings.map((following) => following.receiverId);

        // Get stories from last 24 hours
        const twoDayAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

        const stories = await prisma.story.findMany({
            where: {
                userId: {
                    in: [...connectionIds, user.id]
                },
                createdAt: {
                    gte: twoDayAgo
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        image: true,
                        name: true,
                        username: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        let oldStories;
        if (stories.length < 8 || !stories) {
            // Get OLDER stories (before twoDayAgo) to fill the gap
            oldStories = await prisma.story.findMany({
                where: {
                    createdAt: {
                        lt: twoDayAgo  // Less than (older stories)
                    },
                    id: {
                        notIn: stories.map((story) => story.id)
                    }
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            image: true,
                            name: true,
                            username: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 12 - stories.length
            })
        }

        return NextResponse.json({
            stories: [...stories, ...(oldStories || [])],
            message: 'Stories fetched successfully'
        }, { status: 200 })
    } catch (error) {
        if (process.env.NODE_ENV === 'production') Sentry.captureException(error);
        console.error('stories fetching error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}