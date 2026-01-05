import Image from 'next/image'
import React from 'react'
import { User } from '@/types/story'
import Link from 'next/link'
import { Button } from '../ui/button'
import { MessageSquare, Eye, UserMinus, UserPlus, CheckCircle } from 'lucide-react'

const ConnectionCard = ({ user, tag }: { user: User, tag: string }) => {
    return (
        <div className='w-full flex flex-col gap-4 p-4 sm:p-6 bg-white shadow rounded-md'>
            <div className="flex items-center gap-3">
                <div className="shrink-0">
                    <Image src={user.profile_picture as string} alt="profile" width={48} height={48} className='w-12 h-12 rounded-full shadow-md' />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-700 truncate">{user.full_name}</p>
                    <p className="text-slate-500 text-sm truncate">@{user.username}</p>
                </div>
            </div>

            <p className="text-sm text-slate-600 line-clamp-2">{user.bio}</p>

            <div className="flex flex-row gap-2">

                <Link href={`/profile/${user._id}`} className='flex-1 p-2.5 text-sm font-medium rounded bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer flex items-center justify-center gap-2'>
                    <Eye className='w-4 h-4' />
                    <span className='hidden lg:inline text-sm'>Profile</span>
                </Link>

                {
                    tag === 'followings' && (
                        user.following ? (
                            <Button variant={'ghost'} className='flex-1 p-2.5 text-sm font-medium rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer flex items-center justify-center gap-2'>
                                <UserMinus className='w-4 h-4' />
                                <span className='hidden lg:inline'>Unfollow</span>
                            </Button>
                        ) : (
                            <Button variant={'ghost'} className='flex-1 p-2.5 text-sm font-medium rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer flex items-center justify-center gap-2'>
                                <UserPlus className='w-4 h-4' />
                                <span className='hidden lg:inline'>Follow</span>
                            </Button>
                        )
                    )
                }

                {
                    tag === 'pending' && (
                        <Button variant={'ghost'} className='flex-1 p-2.5 text-sm font-medium rounded cursor-pointer bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition flex items-center justify-center gap-2'>
                            <CheckCircle className='w-4 h-4' />
                            <span className='hidden lg:inline'>Accept</span>
                        </Button>
                    )
                }

                {
                    tag === 'connections' &&
                    (
                        <Link href={`/messages/chats/${user._id}`} className='flex-1 p-2.5 text-sm font-medium rounded cursor-pointer bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition flex items-center gap-2 justify-center'>
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