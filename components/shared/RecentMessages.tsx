"use client"

import { dummyRecentMessagesData } from '@/public/deleteLater/assets';
import { useEffect, useState } from 'react'
import { Message } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Image from 'next/image';
import Link from 'next/link';
import moment from 'moment';

const RecentMessages = () => {
    const [messages, setMessages] = useState<Message[]>([]);



    useEffect(() => {
        const fetchMessages = async () => {
            // const response = await fetch('/api/messages');
            // const data = await response.json();
            setMessages(dummyRecentMessagesData);
        }
        fetchMessages();
    }, []);

    return (
        <Card className='gap-3 py-4'>
            <CardHeader className='px-3'>
                <CardTitle>Recent Messages</CardTitle>
            </CardHeader>
            <CardContent className='px-3'>
                <div className='space-y-4'>
                    {messages.map((message) => (
                        <Link key={message._id} className='flex items-start justify-between  hover:bg-slate-100 p-2 cursor-pointer rounded gap-2' href={`/messages/${message.from_user_id._id}`}>
                            <div className='flex flex-1 items-center gap-2'>
                                <Image src={message.from_user_id.profile_picture || ''} alt="profile" width={30} height={30} className='w-10 h-10 rounded-full' />
                                <div className='flex-1'>
                                    <div className='flex justify-between items-center flex-1'>
                                        <p className='font-semibold flex-1 text-sm'>{message.from_user_id.full_name}</p>
                                        <p className='text-xs text-slate-500'>{moment(message.createdAt).fromNow()}</p>
                                    </div>
                                    <div className='flex justify-between items-center flex-1'>
                                        <p className='text-sm text-slate-400 flex-1'>{message.text}</p>
                                        <aside className='text-xs bg-indigo-500 text-white text-center p-1 rounded-full w-fit font-semibold'>10+</aside>
                                    </div>
                                </div>
                            </div>
                            {/* <div>
                                    <p className='text-sm text-slate-500'>{message.text}</p>
                                <p className='text-xs bg-red-500 text-white px-2 rounded-full w-fit'>1</p>
                            </div> */}
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export default RecentMessages