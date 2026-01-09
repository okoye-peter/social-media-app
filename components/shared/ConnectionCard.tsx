"use client"

import Image from 'next/image'
import React, { useState } from 'react'
import { User } from '@/types/story'
import Link from 'next/link'
import { Button } from '../ui/button'
import { MessageSquare, Eye, UserMinus, UserPlus, CheckCircle, Loader2, XCircle } from 'lucide-react'
import { ConnectionStatus } from '@/app/generated/prisma/enums'
import axiosInstance from '@/lib/axios'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

interface ConnectionCardProps {
    user: User & {
        following?: {
            id: number
            senderId: number
            receiverId: number
            status: ConnectionStatus
        },
        followers?: {
            id: number
            senderId: number
            receiverId: number
            status: ConnectionStatus
        }[]
        sentConnections?: {
            id: number
            senderId: number
            receiverId: number
            status: ConnectionStatus
        }[]
        receivedConnections?: {
            id: number
            senderId: number
            receiverId: number
            status: ConnectionStatus
        }[]
    }
    tag: 'followings' | 'pending' | 'connections' | 'followers'
}

const ConnectionCard = ({ user, tag }: ConnectionCardProps) => {
    const queryClient = useQueryClient()
    const defaultImageUrl = `https://ui-avatars.com/api/?color=fff&uppercase=true&name=${user.name || 'User'}&bold=true&background=9333EA`

    const [isUnfollowing, setIsUnfollowing] = useState(false)
    const [isFollowing, setIsFollowing] = useState(tag === 'followings' ? true : false)
    const [isFollowingLoading, setIsFollowingLoading] = useState(false)
    const [isAccepting, setIsAccepting] = useState(false)
    const [isRejecting, setIsRejecting] = useState(false)

    const unfollow = async () => {
        try {
            setIsUnfollowing(true)
            await axiosInstance.delete(`/auth/follows`, {
                data: {
                    receiverId: user.id
                }
            })
            setIsFollowing(false)
        } catch (error) {
            console.log(error)
            toast.error("Failed to unfollow user")
        } finally {
            setIsUnfollowing(false)
        }
    }

    const follow = async () => {
        try {
            setIsFollowingLoading(true)
            await axiosInstance.post(`/auth/follows`, {
                receiverId: user.id
            })
            setIsFollowing(true)
            toast.success("Followed successfully")
        } catch (error) {
            console.log(error)
            toast.error("Failed to follow user")
        } finally {
            setIsFollowingLoading(false)
        }
    }

    const acceptConnection = async () => {
        try {
            setIsAccepting(true)
            await axiosInstance.put(`/auth/connections`, {
                userId: user.id,
                status: ConnectionStatus.APPROVED
            })
            toast.success("Connection accepted successfully")
            // Invalidate queries to refetch connections data
            queryClient.invalidateQueries({ queryKey: ['connections'] })
            queryClient.invalidateQueries({ queryKey: ['activity'] })
        } catch (error) {
            console.log(error)
            toast.error("Failed to accept connection")
        } finally {
            setIsAccepting(false)
        }
    }

    const rejectConnection = async () => {
        try {
            setIsRejecting(true)
            await axiosInstance.put(`/auth/connections`, {
                userId: user.id,
                status: ConnectionStatus.REJECTED
            })
            toast.success("Connection rejected successfully")
            // Invalidate queries to refetch connections data
            queryClient.invalidateQueries({ queryKey: ['connections'] })
            queryClient.invalidateQueries({ queryKey: ['activity'] })
        } catch (error) {
            console.log(error)
            toast.error("Failed to reject connection")
        } finally {
            setIsRejecting(false)
        }
    }

    return (
        <div className='w-full flex flex-col gap-4 p-4 sm:p-6 bg-white shadow rounded-md'>
            <div className="flex items-center gap-3">
                <div className="shrink-0">
                    <Image src={user.image as string ?? defaultImageUrl} alt="profile" width={48} height={48} className='w-12 h-12 rounded-full shadow-md' />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-700 truncate">{user.name}</p>
                    <p className="text-slate-500 text-sm truncate">{user.username ? `@${user.username}` : 'No username'}</p>
                </div>
            </div>
            <p className="text-sm text-slate-600 line-clamp-2">{user.bio}</p>


            <div className="flex flex-row gap-2">

                <Link href={`/profile/${user.id}`} className='flex-1 p-2.5 text-sm font-medium rounded bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer flex items-center justify-center gap-2'>
                    <Eye className='w-4 h-4' />
                    {
                        tag !== 'pending' &&
                        (
                            <span className='hidden lg:inline text-sm'>Profile</span>
                        )
                    }
                </Link>

                {
                    tag === 'followings' && (
                        isFollowing ? (
                            <Button onClick={unfollow} variant={'ghost'} className='flex-1 p-2.5 text-sm font-medium rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer flex items-center justify-center gap-2'>
                                {
                                    isUnfollowing ?
                                        (
                                            <>
                                                <Loader2 className='w-4 h-4 animate-spin' />
                                                Unfollowing...
                                            </>
                                        )
                                        :
                                        (
                                            <>
                                                <UserMinus className='w-4 h-4' />
                                                <span className='hidden lg:inline'>Unfollow</span>
                                            </>
                                        )

                                }
                            </Button>
                        ) : (
                            <Button onClick={follow} variant={'ghost'} className='flex-1 p-2.5 text-sm font-medium rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer flex items-center justify-center gap-2'>
                                {
                                    isFollowingLoading ? (
                                        <>
                                            <Loader2 className='w-4 h-4 animate-spin' />
                                            Following...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className='w-4 h-4' />
                                            <span className='hidden lg:inline'>Follow</span>
                                        </>
                                    )
                                }
                            </Button>
                        )
                    )
                }

                {
                    tag === 'pending' && (
                        <>
                            <Button onClick={acceptConnection} variant={'ghost'} className='flex-1 p-2.5 text-sm font-medium rounded cursor-pointer bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition flex items-center justify-center gap-2'>
                                {
                                    isAccepting ? (
                                        <Loader2 className='w-4 h-4 animate-spin' />
                                    ) : (
                                        <CheckCircle className='w-4 h-4' />
                                    )
                                }
                            </Button>
                            <Button onClick={rejectConnection} variant={'ghost'} className='flex-1 p-2.5 text-sm font-medium rounded cursor-pointer bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition flex items-center justify-center gap-2'>
                                {
                                    isRejecting ? (
                                        <Loader2 className='w-4 h-4 animate-spin' />
                                    ) : (
                                        <XCircle className='w-4 h-4' />
                                    )
                                }
                            </Button>
                        </>
                    )
                }

                {
                    tag === 'connections' &&
                    (
                        <Link href={`/messages/chats/${user.id}`} className='flex-1 p-2.5 text-sm font-medium rounded cursor-pointer bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition flex items-center gap-2 justify-center'>
                            <MessageSquare className='w-4 h-4' />
                            <span className='hidden lg:inline'>Message</span>
                        </Link>
                    )
                }

            </div>

        </div>
    )
}

export default ConnectionCard