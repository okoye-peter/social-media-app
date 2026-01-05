"use client"

import React from 'react'
import { User } from '@/types/story'
import { Calendar, MapPin, PenBox, Verified } from 'lucide-react'
import Image from 'next/image'
import { Button } from '../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import moment from 'moment'
import UserProfilePosts from './UserProfilePosts'
import EditUserProfileModal from './EditUserProfileModal'

const UserProfile = ({ user, authUserId }: { user: User, authUserId?: string }) => {
    const [open, setOpen] = React.useState(false)
    const onOpenChange = (open: boolean) => setOpen(open)

    return (
        <>
            <div className='relative h-full overflow-y-scroll md:p-6'>
                <div className="mx-auto">
                    <div className="bg-white rounded-2xl shadow-md overflow-hidden md:max-w-3xl max-w-full mx-auto">
                        <div className="h-40 md:h-56 bg-linear-to-r from-indigo-200 via-purple-200 to-pink-200">
                            {
                                user.cover_photo &&
                                <Image src={user.cover_photo as string} alt="cover" className='w-full h-full object-cover' />
                            }
                        </div>

                        {/* user info */}
                        <div className="relative py-4 px-6 md:px-8 bg-white">
                            <div className="flex flex-col md:flex-row items-start gap-6">
                                <div className="w-32 h-32 border-4 border-white shadow-lg absolute -top-16 rounded-full">
                                    <Image src={user.profile_picture as string} alt="profile" className='absolute rounded-full z-2' />
                                </div>

                                <div className="w-full pt-16 md:pt-0 md:pl-36">
                                    <div className="flex flex-col md:flex-row items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h1 className="text-2xl font-bold text-gray-900">{user.full_name}</h1>
                                                <Verified className="w-6 h-6 text-blue-500" />
                                            </div>
                                            <p className="text-sm text-gray-500">{user.username ? `@${user.username}` : 'Add a username'}</p>
                                        </div>
                                        {/* {
                                            authUserId && authUserId !== user._id && ( */}
                                                <Button variant={'ghost'} className='flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors mt-4 md:mt-0 cursor-pointer' onClick={() => setOpen(true)}>
                                                    <PenBox className="w-4 h-4" />
                                                    Edit
                                                </Button>
                                            {/* )
                                        } */}
                                    </div>
                                    <p className="text-gray-700 text-sm max-w-md mt-4">
                                        {user.bio}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mt-4">
                                        <span className='flex items-center gap-1.5'>
                                            <MapPin className="w-4 h-4" />
                                            {user.location ?? 'Add location'}
                                        </span>

                                        <span className='flex items-center gap-1.5'>
                                            <Calendar className="w-4 h-4" />
                                            Joined <span className="font-medium">{moment(user.createdAt).fromNow()}</span>
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mt-6">
                                        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-linear-to-br from-white to-gray-50 p-3 sm:p-4 transition-all duration-300 hover:border-indigo-300 hover:shadow-lg hover:scale-105 cursor-pointer">
                                            <div className="absolute inset-0 bg-linear-to-br from-indigo-500/0 to-purple-500/0 transition-all duration-300 group-hover:from-indigo-500/5 group-hover:to-purple-500/5" />
                                            <div className="relative text-center xs:text-left">
                                                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">
                                                    10
                                                </p>
                                                <p className="text-xs sm:text-sm font-medium text-gray-600">
                                                    Posts
                                                </p>
                                            </div>
                                        </div>

                                        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-linear-to-br from-white to-gray-50 p-3 sm:p-4 transition-all duration-300 hover:border-purple-300 hover:shadow-lg hover:scale-105 cursor-pointer">
                                            <div className="absolute inset-0 bg-linear-to-br from-purple-500/0 to-pink-500/0 transition-all duration-300 group-hover:from-purple-500/5 group-hover:to-pink-500/5" />
                                            <div className="relative text-center xs:text-left">
                                                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">
                                                    10.4k
                                                </p>
                                                <p className="text-xs sm:text-sm font-medium text-gray-600">
                                                    Followers
                                                </p>
                                            </div>
                                        </div>

                                        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-linear-to-br from-white to-gray-50 p-3 sm:p-4 transition-all duration-300 hover:border-pink-300 hover:shadow-lg hover:scale-105 cursor-pointer">
                                            <div className="absolute inset-0 bg-linear-to-br from-pink-500/0 to-rose-500/0 transition-all duration-300 group-hover:from-pink-500/5 group-hover:to-rose-500/5" />
                                            <div className="relative text-center xs:text-left">
                                                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">
                                                    100.4k
                                                </p>
                                                <p className="text-xs sm:text-sm font-medium text-gray-600">
                                                    Following
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Tabs defaultValue="posts" className="w-full mt-6">
                        <TabsList className="grid lg:w-1/3 md:w-2/3 w-full  grid-cols-3 bg-gray-100 p-1 rounded-lg mx-auto my-6">
                            <TabsTrigger
                                value="posts"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                            >
                                Posts
                            </TabsTrigger>
                            <TabsTrigger
                                value="media"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                            >
                                Media
                            </TabsTrigger>
                            <TabsTrigger
                                value="likes"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                            >
                                Likes
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="posts" className="mt-6">
                            <UserProfilePosts userId={user._id} />
                        </TabsContent>

                        <TabsContent value="media" className="mt-6">
                            <div className="text-center py-12 text-gray-500">
                                <p>No media yet</p>
                            </div>
                        </TabsContent>

                        <TabsContent value="likes" className="mt-6">
                            <div className="text-center py-12 text-gray-500">
                                <p>No liked posts yet</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <EditUserProfileModal open={open} onOpenChange={onOpenChange} />
        </>
    )
}

export default UserProfile