import { Metadata } from 'next'
import { prisma } from '@/lib/db'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    try {
        const { id } = await params

        const post = await prisma.post.findUnique({
            where: { id: Number(id) },
            include: {
                user: {
                    select: {
                        name: true,
                        username: true,
                        image: true,
                    }
                },
                postMedia: true,
            }
        })

        if (!post) {
            return {
                title: 'Post Not Found',
            }
        }

        const title = post.content
            ? `${post.content.substring(0, 60)}${post.content.length > 60 ? '...' : ''}`
            : `Post by ${post.user.name}`

        const description = post.content || `Check out this post by ${post.user.name} (@${post.user.username})`
        const image = post.postMedia[0]?.url || post.user.image || '/default-og-image.jpg'

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images: [
                    {
                        url: image,
                        width: 1200,
                        height: 630,
                        alt: title,
                    }
                ],
                type: 'article',
                siteName: 'Your Social App',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [image],
            },
        }
    } catch (error) {
        console.error('Error generating metadata:', error)
        return {
            title: 'Post',
        }
    }
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children
}
