import { Message } from '@/types/message'
import React from 'react'
import { Card, CardContent } from '../ui/card'
import Image from 'next/image'
import { User } from '@/types/story'
import { Button } from '../ui/button'
import Link from 'next/link'
import { Eye, MessageSquare } from 'lucide-react'

const MessageUserCard = ({ user }: { user: User }) => {
    console.log(user)
    return (
        <Card className='mb-6'>
            <CardContent>
                <div className='flex items-center gap-4'>
                    <Image src={user.profile_picture as string} alt="profile" width={30} height={30} className='w-10 h-10 rounded-full' />
                    <div className='flex-1'>
                        <p className='font-medium text-slate-700'>{user.full_name}</p>
                        <p className='text-slate-500 text-sm'>@{user.username}</p>
                        <p className='text-xs text-gray-600'>{user.bio}</p>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <Link href={`/messages/chats/${user._id}`} className='size-10 flex items-center justify-center text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer gap-1'>
                           <MessageSquare className='w-4 h-4' />
                        </Link>

                        <Link href={`/profile/${user._id}`} className='size-10 flex items-center justify-center text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer gap-1'>
                           <Eye className='w-4 h-4' />
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
        // <div className='flex items-center gap-2'>
        //     <Image src={message.from_user_id.profile_picture as string} alt="profile" width={30} height={30} className='w-10 h-10 rounded-full' />
        //     <div>
        //         <p className='font-semibold'>{message.from_user_id.full_name}</p>
        //         <p className='text-xs text-slate-500'>{message.text}</p>
        //     </div>
        // </div>
    )
}

export default MessageUserCard