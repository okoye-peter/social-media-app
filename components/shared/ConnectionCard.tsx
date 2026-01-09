"use client"

import Image from 'next/image'
import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '../ui/button'
import { MessageSquare, Eye, UserMinus, UserPlus, CheckCircle, Loader2, XCircle, UserCircle } from 'lucide-react'
import { ConnectionStatus } from '@/types'
import axiosInstance from '@/lib/axios'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { ConnectionCardProps } from '@/types'
import { getAvatarUrl } from '@/lib/utils'

const ConnectionCard = ({ user, tag }: ConnectionCardProps) => {
    const queryClient = useQueryClient()

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
            toast.success("Unfollowed successfully")
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
        <div className='group relative bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 overflow-hidden'>
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className='relative p-5'>
                <div className="flex items-start gap-4">
                    {/* Avatar with glow effect */}
                    <div className="relative shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-300" />
                        <Link href={`/profile/${user.id}`} className="relative block">
                            <Image
                                src={user.image as string ?? getAvatarUrl(user.name)}
                                alt="profile"
                                width={56}
                                height={56}
                                className='w-14 h-14 rounded-full object-cover ring-2 ring-white group-hover:ring-indigo-100 shadow-lg transition-all duration-300'
                            />
                        </Link>
                    </div>

                    {/* User info */}
                    <div className="flex-1 min-w-0">
                        <Link href={`/profile/${user.id}`} className="block group/name">
                            <p className="font-semibold text-base text-gray-900 truncate group-hover/name:text-indigo-700 transition-colors duration-200">
                                {user.name}
                            </p>
                        </Link>
                        {user.username && (
                            <div className="flex items-center gap-1 mt-0.5">
                                <UserCircle className='w-3.5 h-3.5 text-gray-400' />
                                <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                            </div>
                        )}
                        {user.bio && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                                {user.bio}
                            </p>
                        )}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 mt-4">
                    {/* View Profile button */}
                    <Link
                        href={`/profile/${user.id}`}
                        className='inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg active:scale-95 transition-all duration-200'
                    >
                        <Eye className='w-4 h-4' />
                        {tag !== 'pending' && <span className='hidden sm:inline'>Profile</span>}
                    </Link>

                    {/* Pending connection Accept/Reject buttons */}
                    {tag === 'pending' && (
                        <>
                            <Button
                                onClick={acceptConnection}
                                disabled={isAccepting}
                                className='inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg active:scale-95 transition-all duration-200'
                            >
                                {isAccepting ? (
                                    <Loader2 className='w-4 h-4 animate-spin' />
                                ) : (
                                    <CheckCircle className='w-4 h-4' />
                                )}
                                <span className='hidden sm:inline'>Accept</span>
                            </Button>
                            <Button
                                onClick={rejectConnection}
                                disabled={isRejecting}
                                className='inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-md hover:shadow-lg active:scale-95 transition-all duration-200'
                            >
                                {isRejecting ? (
                                    <Loader2 className='w-4 h-4 animate-spin' />
                                ) : (
                                    <XCircle className='w-4 h-4' />
                                )}
                                <span className='hidden sm:inline'>Reject</span>
                            </Button>
                        </>
                    )}

                    {/* Following/Unfollow button */}
                    {tag === 'followings' && (
                        isFollowing ? (
                            <Button
                                onClick={unfollow}
                                disabled={isUnfollowing}
                                className='inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md active:scale-95 transition-all duration-200'
                            >
                                {isUnfollowing ? (
                                    <>
                                        <Loader2 className='w-4 h-4 animate-spin' />
                                        <span className='hidden sm:inline'>Unfollowing...</span>
                                    </>
                                ) : (
                                    <>
                                        <UserMinus className='w-4 h-4' />
                                        <span className='hidden sm:inline'>Unfollow</span>
                                    </>
                                )}
                            </Button>
                        ) : (
                            <Button
                                onClick={follow}
                                disabled={isFollowingLoading}
                                className='inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-white hover:bg-gray-50 text-indigo-600 border-2 border-indigo-300 hover:border-indigo-400 shadow-sm hover:shadow-md active:scale-95 transition-all duration-200'
                            >
                                {isFollowingLoading ? (
                                    <>
                                        <Loader2 className='w-4 h-4 animate-spin' />
                                        <span className='hidden sm:inline'>Following...</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className='w-4 h-4' />
                                        <span className='hidden sm:inline'>Follow</span>
                                    </>
                                )}
                            </Button>
                        )
                    )}

                    {/* Message button for connections */}
                    {tag === 'connections' && (
                        <Link
                            href={`/messages/chats/${user.id}`}
                            className='inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-white hover:bg-gray-50 text-indigo-600 border-2 border-indigo-300 hover:border-indigo-400 shadow-sm hover:shadow-md active:scale-95 transition-all duration-200'
                        >
                            <MessageSquare className='w-4 h-4' />
                            <span className='hidden sm:inline'>Message</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Bottom accent gradient */}
            <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </div>
    )
}

export default ConnectionCard