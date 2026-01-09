"use client"

import { Post } from '@/types'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import Image from 'next/image'
import { BadgeCheck, Heart, Loader2, MessageCircle, Share2, Copy, Check } from 'lucide-react'
import moment from 'moment'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { displayNumber } from '@/lib/numberDisplay'
import axiosInstance from '@/lib/axios'
import { useState } from 'react'
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

const PostCard = ({ post }: { post: Post }) => {
    const router = useRouter()
    const [likes, setLikes] = useState(post.likes || [])
    const [likesCount, setLikesCount] = useState(post._count.likes)
    const user = useUserStore((state) => state.user)

    const [isLiking, setIsLiking] = useState(false)
    const [copied, setCopied] = useState(false)
    const [shareMenuOpen, setShareMenuOpen] = useState(false)

    const postUrl = typeof window !== 'undefined' ? `${window.location.origin}/posts/${post.id}` : ''
    const shareTitle = `Check out this post by ${post.user.name}`
    const shareDescription = post.content || 'Interesting post!'

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

    const handleLikes = async () => {
        setIsLiking(true);
        try {
            const { data } = await axiosInstance.post(`/auth/posts/${post.id}/likes`)
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


    return (
        <Card className="w-full  shadow-sm">
            <CardHeader className='px-3'>
                <CardTitle className='p-0'>
                    <Link href={`/profile/${post.user.id}`} className="inline-flex items-center gap-3 cursor-pointer">
                        <Image src={post.user.image as string} width={40} height={40} alt="profile picture" className='rounded-full w-10 h-10 shadow' />
                        <div>
                            <div className="flex items-center gap-1 mb-1">
                                <span>{post.user.name}</span>
                                <BadgeCheck className='w-4 h-4 text-blue-500' />
                            </div>
                            <span className='text-gray-500 text-sm font-medium'>@{post.user.username} • {moment(post.createdAt).fromNow()}</span>
                        </div>
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent className='px-3 cursor-pointer' onClick={() => router.push(`/posts/${post.id}`)}>
                {/* post content */}
                {post.content && <div className='text-gray-800 text-sm whitespace-pre-line'>{renderContentWithHashtags(post.content)}</div>}

                {/* post media (images and videos) */}
                {post.postMedia.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                        {post.postMedia.map((media, index) => (
                            <div key={index} className={`${post.postMedia.length === 1 && 'col-span-2'}`}>
                                {media.type === 'IMAGE' ? (
                                    <Image
                                        src={media.url}
                                        alt="post image"
                                        width={500}
                                        height={500}
                                        className={`w-full ${post.postMedia.length === 1 ? 'h-auto max-h-[600px]' : 'h-48'} object-cover rounded-lg`}
                                    />
                                ) : media.type === 'VIDEO' ? (
                                    <video
                                        src={media.url}
                                        controls
                                        muted
                                        className={`w-full ${post.postMedia.length === 1 ? 'h-auto max-h-[600px]' : 'h-48'} object-cover rounded-lg`}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                ) : null}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex items-center  gap-4 text-gray-600 text-xs px-3  border-t border-gray-300">
                <div className='flex items-center gap-1 cursor-pointer' onClick={handleLikes}>
                    {isLiking ? <Loader2 className={`w-4 h-4 animate-spin`} /> : <Heart className={`w-4 h-4 cursor-pointer ${likes.some(like => like.userId === user?.id) ? 'text-red-500 fill-red-500' : ''}`} />}
                    <span className=''>{displayNumber(likesCount)}</span>
                </div>
                <div className='flex items-center gap-1 cursor-pointer' onClick={() => router.push(`/posts/${post.id}`)}>
                    <MessageCircle className={`w-4 h-4 cursor-pointer`} />
                    <span className=''>{displayNumber(post._count.comments)}</span>
                </div>
                <DropdownMenu open={shareMenuOpen} onOpenChange={setShareMenuOpen}>
                    <DropdownMenuTrigger asChild>
                        <div className='flex items-center gap-1 cursor-pointer'>
                            <Share2 className={`w-4 h-4 cursor-pointer`} />
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
    )
}

export default PostCard