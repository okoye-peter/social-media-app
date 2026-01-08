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
import { ArrowLeft, BadgeCheck, Heart, MessageCircle, Share2, Loader2, Copy, Check } from 'lucide-react'
import moment from 'moment'
import { useState, useEffect } from 'react'
import { displayNumber } from '@/lib/numberDisplay'
import { useUserStore } from '@/stores'
import { toast } from 'sonner'
import {
    FacebookShareButton,
    TwitterShareButton,
    WhatsappShareButton,
    LinkedinShareButton,
    FacebookIcon,
    TwitterIcon,
    WhatsappIcon,
    LinkedinIcon,
} from 'react-share'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const PostDetailsPage = () => {
    const params = useParams()
    const router = useRouter()
    const queryClient = useQueryClient()
    const postId = params.id as string
    const user = useUserStore((state) => state.user)

    const [commentContent, setCommentContent] = useState('')
    const [isLiking, setIsLiking] = useState(false)
    const [copied, setCopied] = useState(false)
    const [shareMenuOpen, setShareMenuOpen] = useState(false)

    // Fetch post details
    const { data: post, isLoading: postLoading } = useQuery<Post>({
        queryKey: ['post', postId],
        queryFn: async () => {
            const res = await axiosInstance.get(`/auth/posts/${postId}`)
            return res.data.post
        }
    })

    // Reactive state for likes and comments
    const [likes, setLikes] = useState(post?.likes || [])
    const [likesCount, setLikesCount] = useState(post?._count.likes || 0)
    const [commentsCount, setCommentsCount] = useState(post?._count.comments || 0)

    // Update state when post data changes
    useEffect(() => {
        if (post) {
            setLikes(post.likes || [])
            setLikesCount(post._count.likes || 0)
            setCommentsCount(post._count.comments || 0)
        }
    }, [post])

    const postUrl = typeof window !== 'undefined' ? `${window.location.origin}/posts/${postId}` : ''
    const shareTitle = post ? `Check out this post by ${post.user.name}` : 'Check out this post'
    const shareDescription = post?.content || 'Interesting post!'

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
            queryClient.invalidateQueries({
                queryKey: ['comments', postId],
                refetchType: 'active'
            })
            setCommentsCount(prev => prev + 1)
            setCommentContent('')
        }
    })

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault()
        if (commentContent.trim()) {
            createCommentMutation.mutate(commentContent)
        }
    }

    const handleLikes = async () => {
        setIsLiking(true)
        try {
            const { data } = await axiosInstance.post(`/auth/posts/${postId}/likes`)
            if (data.action === 'like') {
                setLikes([...likes, data.like])
                setLikesCount(prev => prev + 1)
            } else {
                setLikes(likes.filter((like) => like.userId !== user?.id))
                setLikesCount(prev => prev - 1)
            }
        } catch (error) {
            console.log(error)
            toast.error(`Error ${likes.some((like) => like.userId === user?.id) ? 'unliking' : 'liking'} post`)
        } finally {
            setIsLiking(false)
        }
    }

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(postUrl)
            setCopied(true)
            toast.success('Link copied to clipboard!')
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            toast.error('Failed to copy link')
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
                    <div className='flex items-center gap-1 cursor-pointer' onClick={handleLikes}>
                        {isLiking ? <Loader2 className='w-4 h-4 animate-spin' /> : <Heart className={`w-4 h-4 ${likes.some(like => like.userId === user?.id) ? 'text-red-500 fill-red-500' : ''}`} />}
                        <span>{displayNumber(likesCount)}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                        <MessageCircle className='w-4 h-4' />
                        <span>{displayNumber(commentsCount)}</span>
                    </div>
                    <DropdownMenu open={shareMenuOpen} onOpenChange={setShareMenuOpen}>
                        <DropdownMenuTrigger asChild>
                            <div className='flex items-center gap-1 cursor-pointer'>
                                <Share2 className='w-4 h-4 cursor-pointer' />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <div className="p-2">
                                <p className="text-xs font-medium text-gray-500 mb-2">Share this post</p>
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    <FacebookShareButton url={postUrl} onClick={() => setShareMenuOpen(false)}>
                                        <div className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity">
                                            <FacebookIcon size={32} round />
                                            <span className="text-[10px] text-gray-600">Facebook</span>
                                        </div>
                                    </FacebookShareButton>
                                    <TwitterShareButton url={postUrl} title={shareTitle} onClick={() => setShareMenuOpen(false)}>
                                        <div className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity">
                                            <TwitterIcon size={32} round />
                                            <span className="text-[10px] text-gray-600">Twitter</span>
                                        </div>
                                    </TwitterShareButton>
                                    <WhatsappShareButton url={postUrl} title={shareTitle} onClick={() => setShareMenuOpen(false)}>
                                        <div className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity">
                                            <WhatsappIcon size={32} round />
                                            <span className="text-[10px] text-gray-600">WhatsApp</span>
                                        </div>
                                    </WhatsappShareButton>
                                    <LinkedinShareButton url={postUrl} title={shareTitle} summary={shareDescription} onClick={() => setShareMenuOpen(false)}>
                                        <div className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity">
                                            <LinkedinIcon size={32} round />
                                            <span className="text-[10px] text-gray-600">LinkedIn</span>
                                        </div>
                                    </LinkedinShareButton>
                                </div>
                            </div>
                            <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
                                {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                                {copied ? 'Copied!' : 'Copy link'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
