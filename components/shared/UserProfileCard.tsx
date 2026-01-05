import React from 'react'
import { Card, CardContent, CardFooter } from '../ui/card'
import Image from 'next/image'
import { User } from '@/types/story'
import { Button } from '../ui/button'
import { MapPin, MessageSquare, Plus, UserPlus } from 'lucide-react'

const UserProfileCard = ({ user, currentUser }: { user: User, currentUser?: User}) => {


    return (

        <Card className='gap-2 py-2'>
            <CardContent className='px-2 pt-6 flex flex-col justify-between'>
                <Image src={user.profile_picture as string} alt='profile' width={100} height={100} className='w-24 h-24 rounded-full mx-auto' />
                <p className='font-semibold mt-4 text-center'>{user.full_name}</p>
                {user.username && <p className='text-gray-500 font-light text-center mt-2'>@{user.username}</p>}
                {user.bio && <p className='text-slate-600 mt-2 text-center text-sm px-4'>{user.bio}</p>}
                <div className='justify-center gap-2 flex mt-3 flex-wrap'>
                    <div className='flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1 text-xs'>
                        <MapPin className='w-4 h-4' /> {user.location}
                    </div>
                    <div className='flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1 text-xs'>
                        <b>{user.followers.length}</b> Followers
                    </div>
                </div>
            </CardContent>
            <CardFooter className='py-2 px-2 flex gap-2 flex-wrap'>
                {/* follow/unfollow button */}
                <Button disabled={currentUser?.following.includes(user._id)} variant={'ghost'} className='flex-1 py-2 rounded-md flex items-center justify-center gap-2 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer'>
                    <UserPlus className='w-4 h-4' />
                    { currentUser?.following.includes(user._id) ? 'Following' : 'Follow' }
                </Button>

                {/* send message button */}
                {
                    currentUser?.connections.includes(user._id) ? (
                        <Button variant={'ghost'} className='flex items-center justify-center w-16 border text-slate-500 group rounded-md cursor-pointer active:scale-95 transition'>
                            <MessageSquare className='w-4 h-4' />
                        </Button>
                    ) : (
                        <Button variant={'ghost'} className='flex items-center justify-center w-16 border text-slate-500 group rounded-md cursor-pointer active:scale-95 transition'>
                            <Plus className='w-4 h-4' />
                        </Button>
                    )
                }
            </CardFooter>
        </Card>    
        
    )
}

export default UserProfileCard