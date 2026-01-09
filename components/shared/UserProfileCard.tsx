'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter } from '../ui/card'
import Image from 'next/image'
import { Button } from '../ui/button'
import { Check, Loader2, MapPin, UserMinus2, UserPlus, X } from 'lucide-react'
import axiosInstance from '@/lib/axios'
import { ConnectionStatus } from '@/types/connection'
import { useUserStore } from '@/stores'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { DiscoveryUser } from '@/types/pages'

interface DiscoverUserProp {
    user: DiscoveryUser
    onConnectionAccepted?: (userId: number) => void
}

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

    const defaultImageUrl = `https://ui-avatars.com/api/?color=fff&uppercase=true&name=${user.name || 'User'}&bold=true&background=9333EA`

    return (

        <Card className='gap-2 py-2'>
            <CardContent className='px-2 pt-6 flex flex-col justify-between cursor-pointer' onClick={viewProfile}>
                <Image
                    src={user.image || defaultImageUrl}
                    alt={user.name}
                    width={100}
                    height={100}
                    className='w-24 h-24 rounded-full mx-auto object-cover'
                />
                <p className='font-semibold mt-4 text-center'>{user.name}</p>
                {user.username && <p className='text-gray-500 font-light text-center mt-2'>@{user.username}</p>}
                {user.bio && <p className='text-slate-600 mt-2 text-center text-sm px-4 line-clamp-2'>{user.bio}</p>}
                <div className='justify-center gap-2 flex mt-3 flex-wrap'>
                    {user.location && (
                        <div className='flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1 text-xs'>
                            <MapPin className='w-4 h-4' /> {user.location}
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className='py-2 px-2 flex gap-2 flex-wrap mt-auto'>
                {/* Accept or Reject connection sent to you */}
                {hasPendingConnectionReceived ? (
                    <>
                        <Button onClick={acceptConnection} disabled={acceptConnectionLoading} variant={'ghost'} className='flex-1 py-2 rounded-md flex items-center justify-center gap-2 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer text-sm'>
                            {acceptConnectionLoading ? (
                                <>
                                    <Loader2 className='w-4 h-4 animate-spin' /> Accepting...
                                </>
                            ) : (
                                <>
                                    <Check className='w-4 h-4' />
                                    Accept
                                </>
                            )}
                        </Button>

                        <Button onClick={rejectConnection} disabled={rejectConnectionLoading} variant={'ghost'} className='flex-1 py-2 rounded-md flex items-center justify-center gap-2 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer text-sm'>
                            {rejectConnectionLoading ? (
                                <>
                                    <Loader2 className='w-4 h-4 animate-spin' /> Rejecting...
                                </>
                            ) : (
                                <>
                                    <X className='w-4 h-4' />
                                    Reject
                                </>
                            )}
                        </Button>
                    </>
                ) : hasPendingConnectionSent ? (
                    <Button onClick={cancelConnection} disabled={connectionLoading} variant={'ghost'} className='flex-1 py-2 rounded-md flex items-center justify-center gap-2 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer text-sm'>
                        {connectionLoading ? (
                            <>
                                <Loader2 className='w-4 h-4 animate-spin' /> Cancelling...
                            </>
                        ) : (
                            <>
                                <UserMinus2 className='w-4 h-4' />
                                Cancel
                            </>
                        )}
                    </Button>
                ) : (
                    <Button onClick={sendConnection} disabled={connectionLoading} variant={'ghost'} className='flex-1 py-2 rounded-md flex items-center justify-center gap-2 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer text-sm'>
                        {connectionLoading ? (
                            <>
                                <Loader2 className='w-4 h-4 animate-spin' /> Connecting...
                            </>
                        ) : (
                            <>
                                <UserPlus className='w-4 h-4' />
                                Connect
                            </>
                        )}
                    </Button>
                )}


                {
                    isFollowing ? (
                        <Button onClick={unfollow} variant={'ghost'} className='flex-1 py-2 rounded-md flex items-center justify-center gap-2 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer text-sm'>
                            {
                                unfollowLoading ? (
                                    <>
                                        <Loader2 className='w-4 h-4 animate-spin' /> Unfollowing...
                                    </>
                                ) : (
                                    <>
                                        <UserMinus2 className='w-4 h-4' />
                                        Unfollow
                                    </>
                                )
                            }
                        </Button>
                    ) : (
                        <Button onClick={follow} variant={'ghost'} className='flex-1 py-2 rounded-md flex items-center justify-center gap-2 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer text-sm'>
                            {
                                followLoading ? (
                                    <>
                                        <Loader2 className='w-4 h-4 animate-spin' /> Following...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className='w-4 h-4' />
                                        Follow
                                    </>
                                )
                            }
                        </Button>
                    )
                }
            </CardFooter>
        </Card>

    )
}

export default UserProfileCard