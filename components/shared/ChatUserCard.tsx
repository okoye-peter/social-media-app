import React from 'react'
import Image from 'next/image'
import axiosInstance from '@/lib/axios'
import { useQuery } from '@tanstack/react-query'
import { getAvatarUrl } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

const ChatUserCard = ({ friendId }: { friendId: number }) => {

    const { data: friend, isLoading } = useQuery({
        queryKey: ['friend', friendId],
        queryFn: async () => {
            const res = await axiosInstance.get(`/auth/users/${friendId}`)
            return res.data
        }
    })


    if (isLoading) {
        return (
            <div className="flex items-center gap-2 p-4 border-b border-gray-200 bg-white shadow-sm">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 p-4 border-b border-gray-200 bg-white shadow-sm">
            <Image src={friend.image as string ?? getAvatarUrl(friend.name)} alt="profile" className='size-10 rounded-full' width={40} height={40} />
            <div>
                <h2 className='font-semibold text-gray-800'>{friend.name}</h2>
                {friend.username && <p className="text-xs text-gray-500">@{friend.username}</p>}
            </div>
        </div>
    )
}

export default ChatUserCard