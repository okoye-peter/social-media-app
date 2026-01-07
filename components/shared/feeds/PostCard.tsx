"use client"

import { Post } from '@/types/post'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import Image from 'next/image'
import { BadgeCheck, Heart, Loader2, MessageCircle, Share2 } from 'lucide-react'
import moment from 'moment'
import Link from 'next/link'
import { displayNumber } from '@/lib/numberDisplay'
import axiosInstance from '@/lib/axios'
import { useState } from 'react'

const PostCard = ({ post }: { post: Post }) => {
    const likesCount = post._count.likes;

    const [isLiking, setIsLiking] = useState(false)

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
            const response = await axiosInstance.post(`/auth/posts/${post.id}/likes`)
            console.log(response.data)
            // likesCount += response.data.action ==
        } catch (error) {
            console.log(error)

        } finally{
            setIsLiking(false)
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
            <CardContent className='px-3 cursor-pointer' onClick={() => window.location.href = `/posts/${post.id}`}>
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
                    {isLiking ? <Loader2 className={`w-4 h-4 animate-spin`} /> : <Heart className={`w-4 h-4 cursor-pointer`} />}
                    <span className=''>{displayNumber(likesCount)}</span>
                </div>
                <div className='flex items-center gap-1 cursor-pointer' onClick={() => window.location.href = `/posts/${post.id}`}>
                    <MessageCircle className={`w-4 h-4 cursor-pointer`} />
                    <span className=''>{displayNumber(post._count.comments)}</span>
                </div>
                <div className='flex items-center gap-1 cursor-pointer'>
                    <Share2 className={`w-4 h-4 cursor-pointer`} />
                </div>
            </CardFooter>
        </Card>
    )
}

export default PostCard