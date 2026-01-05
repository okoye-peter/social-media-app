"use client"

import React, { useState } from 'react'
import { Post } from '@/types/post'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import Image from 'next/image'
import { BadgeCheck, Heart, MessageCircle, Share2 } from 'lucide-react'
import moment from 'moment'
import { dummyUserData } from '@/public/deleteLater/assets'
import Link from 'next/link'

const PostCard = ({ post }: { post: Post }) => {

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

    const [likes, setLikes] = useState(post.likes_count);
    const currentUser = dummyUserData;

    const handleLikes = async () => {
        
    }


    return (
        <Card className="w-full  shadow-sm">
            <CardHeader className='px-3'>
                <CardTitle className='p-0'>
                    <Link href={`/profile/${post.user._id}`} className="inline-flex items-center gap-3 cursor-pointer">
                        <Image src={post.user.profile_picture as string} width={40} height={40} alt="profile picture" className='rounded-full w-10 h-10 shadow' />
                        <div>
                            <div className="flex items-center gap-1 mb-1">
                                <span>{post.user.full_name}</span>
                                <BadgeCheck className='w-4 h-4 text-blue-500' />
                            </div>
                            <span className='text-gray-500 text-sm font-medium'>@{post.user.username} • {moment(post.createdAt).fromNow()}</span>
                        </div>
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent className='px-3'>
                {/* post content */}
                {post.content && <div className='text-gray-800 text-sm whitespace-pre-line'>{renderContentWithHashtags(post.content)}</div>}

                {/* post image */}
                {post.image_urls.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                        {post.image_urls.map((image_url, index) => (
                            <Image
                                key={index}
                                src={image_url}
                                alt="post image"
                                width={500}
                                height={500}
                                className={`w-full h-48 object-cover rounded-lg ${post.image_urls.length === 1 && 'col-span-2 h-auto'}`}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex items-center  gap-4 text-gray-600 text-xs px-3  border-t border-gray-300">
                <div className='flex items-center gap-1 cursor-pointer'>
                    <Heart className={`w-4 h-4 cursor-pointer ${likes.includes(currentUser._id) && 'text-red-500 fill-red-500'}`} onClick={handleLikes} />
                    <span className=''>{post.likes_count.length}</span>
                </div>
                <div className='flex items-center gap-1 cursor-pointer'>
                    <MessageCircle className={`w-4 h-4 cursor-pointer ${likes.includes(currentUser._id) && 'text-red-500 fill-red-500'}`} onClick={handleLikes} />
                    <span className=''>12</span>
                </div>
                <div className='flex items-center gap-1 cursor-pointer'>
                    <Share2 className={`w-4 h-4 cursor-pointer ${likes.includes(currentUser._id) && 'text-red-500 fill-red-500'}`} onClick={handleLikes} />
                    <span className=''>7</span>
                </div>
            </CardFooter>
        </Card>
    )
}

export default PostCard