"use client"

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'
import { Post } from '@/types/post'
import { CommentsResponse } from '@/types/comment'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import { ArrowLeft, BadgeCheck, Heart, MessageCircle, Share2 } from 'lucide-react'
import moment from 'moment'
import { useState } from 'react'
import { displayNumber } from '@/lib/numberDisplay'

const PostDetailsPage = () => {
    const params = useParams()
    const router = useRouter()
    const queryClient = useQueryClient()
    const postId = params.id as string
    const [commentContent, setCommentContent] = useState('')

    // Fetch post details
    const { data: post, isLoading: postLoading } = useQuery<Post>({
        queryKey: ['post', postId],
        queryFn: async () => {
            const res = await axiosInstance.get(`/auth/posts/${postId}`)
            return res.data.post
        }
    })

    // Fetch comments
    const { data: commentsData, isLoading: commentsLoading } = useQuery<CommentsResponse>({
        queryKey: ['comments', postId],
        queryFn: async () => {
            const res = await axiosInstance.get(`/auth/posts/${postId}/comments`)
            return res.data
        }
    })

    // Create comment mutation
    const createCommentMutation = useMutation({
        mutationFn: async (content: string) => {
            const res = await axiosInstance.post(`/auth/posts/${postId}/comments`, { content })
            return res.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', postId] })
            setCommentContent('')
        }
    })

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault()
        if (commentContent.trim()) {
            createCommentMutation.mutate(commentContent)
        }
    }

    const renderContentWithHashtags = (content: string) => {
        const parts = content.split(/(#\w+)/g);
        return parts.map((part, index) =>
            part.startsWith('#') ? (
                <span key={index} className="text-indigo-600">{part}</span>
            ) : (
                part
            )
        );
    };

    if (postLoading) {
        return (
            <div className="max-w-4xl mx-auto py-6 px-4">
                <Button variant="ghost" className="mb-4" disabled>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                {/* Post Skeleton */}
                <Card className="w-full shadow-sm mb-6">
                    <CardHeader className='px-3'>
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-48" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className='px-3 space-y-3'>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-64 w-full rounded-lg mt-3" />
                    </CardContent>
                    <CardFooter className="flex items-center gap-4 px-3 border-t border-gray-300 py-3">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-12" />
                    </CardFooter>
                </Card>

                {/* Comments Skeleton */}
                <Card className="w-full shadow-sm">
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className='px-3 space-y-4'>
                        <div className="space-y-2">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                        <div className="space-y-4 mt-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-3">
                                    <Skeleton className="w-8 h-8 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-3 w-40" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!post) {
        return <div className="flex items-center justify-center min-h-screen">Post not found</div>
    }

    return (
        <div className="max-w-4xl mx-auto py-6 px-4">
            {/* Back button */}
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mb-4"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
            </Button>

            {/* Post Card */}
            <Card className="w-full shadow-sm mb-6">
                <CardHeader className='px-3'>
                    <CardTitle className='p-0'>
                        <div className="inline-flex items-center gap-3">
                            <Image
                                src={post.user.image as string}
                                width={40}
                                height={40}
                                alt="profile picture"
                                className='rounded-full w-10 h-10 shadow'
                            />
                            <div>
                                <div className="flex items-center gap-1 mb-1">
                                    <span>{post.user.name}</span>
                                    <BadgeCheck className='w-4 h-4 text-blue-500' />
                                </div>
                                <span className='text-gray-500 text-sm font-medium'>
                                    @{post.user.username} • {moment(post.createdAt).fromNow()}
                                </span>
                            </div>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className='px-3'>
                    {/* Post content */}
                    {post.content && (
                        <div className='text-gray-800 text-sm whitespace-pre-line mb-4'>
                            {renderContentWithHashtags(post.content)}
                        </div>
                    )}

                    {/* Post media */}
                    {post.postMedia.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {post.postMedia.map((media, index) => (
                                <div key={index} className={`${post.postMedia.length === 1 && 'col-span-2'}`}>
                                    {media.type === 'IMAGE' ? (
                                        <Image
                                            src={media.url}
                                            alt="post image"
                                            width={800}
                                            height={600}
                                            className={`w-full ${post.postMedia.length === 1 ? 'h-auto max-h-[600px]' : 'h-64'} object-cover rounded-lg`}
                                        />
                                    ) : media.type === 'VIDEO' ? (
                                        <video
                                            src={media.url}
                                            controls
                                            className={`w-full ${post.postMedia.length === 1 ? 'h-auto max-h-[600px]' : 'h-64'} object-cover rounded-lg`}
                                        >
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex items-center gap-4 text-gray-600 text-xs px-3 border-t border-gray-300">
                    <div className='flex items-center gap-1'>
                        <Heart className='w-4 h-4' />
                        <span>{displayNumber(post._count.likes)}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                        <MessageCircle className='w-4 h-4' />
                        <span>{displayNumber(post._count.comments)}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                        <Share2 className='w-4 h-4' />
                    </div>
                </CardFooter>
            </Card>

            {/* Comments Section */}
            <Card className="w-full shadow-sm">
                <CardHeader>
                    <CardTitle>Comments ({displayNumber(commentsData?.comments.length || 0)})</CardTitle>
                </CardHeader>
                <CardContent className='px-3 space-y-4'>
                    {/* Add comment form */}
                    <form onSubmit={handleSubmitComment} className="space-y-2">
                        <Textarea
                            placeholder="Write a comment..."
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            className="min-h-[80px]"
                        />
                        <Button
                            type="submit"
                            disabled={!commentContent.trim() || createCommentMutation.isPending}
                        >
                            {createCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
                        </Button>
                    </form>

                    {/* Comments list */}
                    <div className="space-y-4 mt-6">
                        {commentsLoading ? (
                            <>
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-3 pb-4 border-b">
                                        <Skeleton className="w-8 h-8 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-3 w-40" />
                                            <Skeleton className="h-4 w-full" />
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : commentsData?.comments.length === 0 ? (
                            <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
                        ) : (
                            commentsData?.comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3 pb-4 border-b last:border-0">
                                    <Image
                                        src={comment.user.image as string}
                                        width={32}
                                        height={32}
                                        alt={comment.user.name}
                                        className="rounded-full w-8 h-8"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-sm">{comment.user.name}</span>
                                            <span className="text-gray-500 text-xs">
                                                @{comment.user.username}
                                            </span>
                                            <span className="text-gray-400 text-xs">
                                                • {moment(comment.createdAt).fromNow()}
                                            </span>
                                        </div>
                                        <p className="text-gray-800 text-sm">{comment.content}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default PostDetailsPage
