'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '../ui/button'
import { Check, Loader2, MapPin, UserMinus2, UserPlus, X, UserCircle, Calendar } from 'lucide-react'
import axiosInstance from '@/lib/axios'
import { ConnectionStatus } from '@/types'
import { useUserStore } from '@/stores'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { DiscoverUserProp } from '@/types'
import { getAvatarUrl } from '@/lib/utils'


const UserProfileCard = ({ user, onConnectionAccepted }: DiscoverUserProp) => {
    const router = useRouter()
    const queryClient = useQueryClient()

    const authUser = useUserStore((state) => state.user);

    const [isFollowing, setIsFollowing] = useState(user.followers.some(follower => follower.senderId === authUser?.id))
    // Track if I sent a pending connection to this user
    // API already filters receivedConnections to only show connections where I (authUser) am the sender
    const [hasPendingConnectionSent, setHasPendingConnectionSent] = useState(
        (user.receivedConnections?.length ?? 0) > 0
    )
    // Track if this user sent me a pending connection  
    // API already filters sentConnections to only show connections where I (authUser) am the receiver
    const [hasPendingConnectionReceived, setHasPendingConnectionReceived] = useState(
        (user.sentConnections?.length ?? 0) > 0
    )
    const [followLoading, setFollowLoading] = useState(false)
    const [unfollowLoading, setUnfollowLoading] = useState(false)
    const [connectionLoading, setConnectionLoading] = useState(false)
    const [acceptConnectionLoading, setAcceptConnectionLoading] = useState(false)
    const [rejectConnectionLoading, setRejectConnectionLoading] = useState(false)

    const viewProfile = () => {
        router.push(`/profile/${user.id}`)
    }

    const sendConnection = async () => {
        setConnectionLoading(true)
        try {
            await axiosInstance.post(`/auth/connections`, {
                receiverId: user.id
            })
            setHasPendingConnectionSent(true)
            toast.success('Connection request sent')
        } catch (error) {
            toast.error('Failed to send connection request')
        } finally {
            setConnectionLoading(false)
        }
    }

    const cancelConnection = async () => {
        setConnectionLoading(true)
        try {
            await axiosInstance.put(`/auth/connections`, {
                userId: user.id,
                status: ConnectionStatus.REJECTED
            })
            setHasPendingConnectionSent(false)
            toast.success('Connection request cancelled')
        } catch (error) {
            toast.error('Failed to cancel connection')
        } finally {
            setConnectionLoading(false)
        }
    }

    const acceptConnection = async () => {
        setAcceptConnectionLoading(true)
        try {
            await axiosInstance.put(`/auth/connections`, {
                userId: user.id,
                status: ConnectionStatus.APPROVED
            })
            setHasPendingConnectionReceived(false)
            toast.success('Connection accepted')

            // Remove user from discover list
            onConnectionAccepted?.(user.id)

            // Invalidate discover query to refetch data
            queryClient.invalidateQueries({ queryKey: ['discover-users'] })
        } catch (error) {
            toast.error('Failed to accept connection')
        } finally {
            setAcceptConnectionLoading(false)
        }
    }

    const rejectConnection = async () => {
        setRejectConnectionLoading(true)
        try {
            await axiosInstance.put(`/auth/connections`, {
                userId: user.id,
                status: ConnectionStatus.REJECTED
            })
            setHasPendingConnectionReceived(false)
            toast.success('Connection rejected')
        } catch (error) {
            toast.error('Failed to reject connection')
        } finally {
            setRejectConnectionLoading(false)
        }
    }



    const follow = async () => {
        setFollowLoading(true)
        try {
            await axiosInstance.post(`/auth/follows`, {
                receiverId: user.id
            })
            setIsFollowing(true)
            toast.success('Followed successfully')
        } catch (error) {
            toast.error('Failed to follow')
        } finally {
            setFollowLoading(false)
        }
    }

    const unfollow = async () => {
        setUnfollowLoading(true)
        try {
            await axiosInstance.delete(`/auth/follows`, {
                data: {
                    receiverId: user.id
                }
            })
            setIsFollowing(false)
            toast.success('Unfollowed successfully')
        } catch (error) {
            toast.error('Failed to unfollow')
        } finally {
            setUnfollowLoading(false)
        }
    }


    return (
        <div className='group relative bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col h-full'>
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-3xl" />
            </div>

            <div className='relative p-6 cursor-pointer flex-1' onClick={viewProfile}>
                {/* Avatar section with enhanced effects */}
                <div className="relative mb-5">
                    {/* Glow effect */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-28 h-28 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500" />
                    </div>

                    {/* Avatar image */}
                    <div className="relative flex justify-center">
                        <div className="relative">
                            <Image
                                src={user.image || getAvatarUrl(user.name)}
                                alt={user.name}
                                width={120}
                                height={120}
                                className='w-28 h-28 rounded-full object-cover ring-4 ring-white group-hover:ring-indigo-100 shadow-xl transition-all duration-300 group-hover:scale-105'
                            />
                            {/* Online status indicator */}
                            <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-lg" />
                        </div>
                    </div>
                </div>

                {/* User info section */}
                <div className="text-center space-y-3">
                    {/* Name */}
                    <h3 className='font-bold text-xl text-gray-900 group-hover:text-indigo-700 transition-colors duration-200'>
                        {user.name}
                    </h3>

                    {/* Username */}
                    {user.username && (
                        <div className="flex items-center justify-center gap-1.5 text-gray-600 group-hover:text-indigo-600 transition-colors">
                            <UserCircle className='w-4 h-4' />
                            <span className='text-sm font-medium'>@{user.username}</span>
                        </div>
                    )}

                    {/* Bio */}
                    {user.bio && (
                        <p className='text-sm text-gray-600 leading-relaxed line-clamp-2 px-2'>
                            {user.bio}
                        </p>
                    )}

                    {/* Location and Member since */}
                    <div className='flex flex-wrap items-center justify-center gap-3 pt-2'>
                        {user.location && (
                            <div className='inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-full text-xs font-medium text-indigo-700 transition-all duration-200 hover:scale-105'>
                                <MapPin className='w-3.5 h-3.5' />
                                <span>{user.location}</span>
                            </div>
                        )}
                        <div className='inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600'>
                            <Calendar className='w-3.5 h-3.5' />
                            <span>Joined {new Date(user.createdAt).getFullYear()}</span>
                        </div>
                    </div>

                    {/* Follower count */}
                    <div className="flex items-center justify-center gap-4 pt-2 text-sm">
                        <div className="text-center">
                            <p className="font-bold text-gray-900">{user.followers.length}</p>
                            <p className="text-xs text-gray-500">Followers</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className='relative px-4 pb-4 flex gap-2 flex-wrap items-center'>
                {/* Accept or Reject connection sent to you */}
                {hasPendingConnectionReceived ? (
                    <>
                        <Button
                            onClick={acceptConnection}
                            disabled={acceptConnectionLoading}
                            className='flex-1 h-11 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200'
                        >
                            {acceptConnectionLoading ? (
                                <>
                                    <Loader2 className='w-4 h-4 animate-spin mr-2' /> Accepting...
                                </>
                            ) : (
                                <>
                                    <Check className='w-4 h-4 mr-2' />
                                    Accept
                                </>
                            )}
                        </Button>

                        <Button
                            onClick={rejectConnection}
                            disabled={rejectConnectionLoading}
                            className='flex-1 h-11 rounded-xl font-semibold bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200'
                        >
                            {rejectConnectionLoading ? (
                                <>
                                    <Loader2 className='w-4 h-4 animate-spin mr-2' /> Rejecting...
                                </>
                            ) : (
                                <>
                                    <X className='w-4 h-4 mr-2' />
                                    Reject
                                </>
                            )}
                        </Button>
                    </>
                ) : hasPendingConnectionSent ? (
                    <Button
                        onClick={cancelConnection}
                        disabled={connectionLoading}
                        className='flex-1 h-11 rounded-xl font-semibold bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200'
                    >
                        {connectionLoading ? (
                            <>
                                <Loader2 className='w-4 h-4 animate-spin mr-2' /> Cancelling...
                            </>
                        ) : (
                            <>
                                <UserMinus2 className='w-4 h-4 mr-2' />
                                Cancel
                            </>
                        )}
                    </Button>
                ) : (
                    <Button
                        onClick={sendConnection}
                        disabled={connectionLoading}
                        className='flex-1 h-11 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200'
                    >
                        {connectionLoading ? (
                            <>
                                <Loader2 className='w-4 h-4 animate-spin mr-2' /> Connecting...
                            </>
                        ) : (
                            <>
                                <UserPlus className='w-4 h-4 mr-2' />
                                Connect
                            </>
                        )}
                    </Button>
                )}

                {/* Follow/Unfollow button */}
                {isFollowing ? (
                    <Button
                        onClick={unfollow}
                        disabled={unfollowLoading}
                        className='flex-1 h-11 rounded-xl font-semibold bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400 shadow-md hover:shadow-lg active:scale-95 transition-all duration-200'
                    >
                        {unfollowLoading ? (
                            <>
                                <Loader2 className='w-4 h-4 animate-spin mr-2' /> Unfollowing...
                            </>
                        ) : (
                            <>
                                <UserMinus2 className='w-4 h-4 mr-2' />
                                Unfollow
                            </>
                        )}
                    </Button>
                ) : (
                    <Button
                        onClick={follow}
                        disabled={followLoading}
                        className='flex-1 h-11 rounded-xl font-semibold bg-white hover:bg-gray-50 text-indigo-600 border-2 border-indigo-300 hover:border-indigo-400 shadow-md hover:shadow-lg active:scale-95 transition-all duration-200'
                    >
                        {followLoading ? (
                            <>
                                <Loader2 className='w-4 h-4 animate-spin mr-2' /> Following...
                            </>
                        ) : (
                            <>
                                <UserPlus className='w-4 h-4 mr-2' />
                                Follow
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Bottom accent gradient */}
            <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </div>
    )
}

export default UserProfileCard