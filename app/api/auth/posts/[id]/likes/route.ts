import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import * as Sentry from '@sentry/nextjs';


export const POST = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {

        const { id } = await params
        const postId = Number(id)

        if (isNaN(postId)) {
            return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
        }

        const user = await getCurrentUser()

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const post = await prisma.post.findUnique({
            where: {
                id: postId
            }
        })

        if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

        let like = await prisma.like.findFirst({
            where: {
                userId: user.id,
                postId: postId
            }
        })


        let action: string;

        if (like) {
            await prisma.like.deleteMany({
                where: {
                    userId: user.id,
                    postId: postId
                }
            })
            action = 'unlike'
        } else {
            like = await prisma.like.create({
                data: {
                    userId: user.id,
                    postId: postId
                }
            })
            action = 'like'
        }


        return NextResponse.json({
            message: 'Like toggled successfully',
            action,
            like
        })

    } catch (error) {
        Sentry.captureException(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}