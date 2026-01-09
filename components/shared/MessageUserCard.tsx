import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MessageSquare, Eye, UserCircle2, Clock } from 'lucide-react'
import { MessageUser } from '@/types'
import { getAvatarUrl } from '@/lib/utils'

const MessageUserCard = ({ user }: { user: MessageUser }) => {

    // Handle both API format (id, name, image, username, bio) 
    // and legacy format (_id, full_name, profile_picture, username, bio)
    const userId = user.id || user._id
    const userName = user.name || user.full_name
    const userImage = user.image || user.profile_picture
    const userUsername = user.username
    const userBio = user.bio

    return (
        <div className='group relative bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-2xl transition-all duration-500 overflow-hidden h-full'>
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500" />

            {/* Floating orbs animation */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl group-hover:animate-pulse" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl group-hover:animate-pulse" />
            </div>

            <div className='relative p-6 flex flex-col h-full'>
                <div className='flex items-start gap-5'>
                    {/* Avatar section with enhanced glow */}
                    <div className="relative shrink-0">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-40 blur-xl transition-all duration-500 scale-110" />

                        {/* Avatar image */}
                        <Link href={`/profile/${userId}`} className="relative block">
                            <div className="relative">
                                <Image
                                    src={userImage || getAvatarUrl(userName)}
                                    alt={userName || 'User'}
                                    width={64}
                                    height={64}
                                    className='relative w-16 h-16 rounded-full object-cover ring-3 ring-white group-hover:ring-indigo-200 shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3'
                                />
                                {/* Online indicator */}
                                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-lg animate-pulse" />
                            </div>
                        </Link>
                    </div>

                    {/* User Info */}
                    <div className='flex-1 min-w-0'>
                        <div className="space-y-1">
                            {/* Name */}
                            <Link href={`/profile/${userId}`}>
                                <h3 className='font-bold text-lg text-gray-900 group-hover:text-indigo-700 transition-colors duration-300 truncate'>
                                    {userName}
                                </h3>
                            </Link>

                            {/* Username */}
                            {userUsername && (
                                <div className='flex items-center gap-1.5 text-gray-500 group-hover:text-indigo-600 transition-colors duration-300'>
                                    <UserCircle2 className='w-3.5 h-3.5' />
                                    <span className='text-sm font-medium truncate'>@{userUsername}</span>
                                </div>
                            )}
                        </div>

                        {/* Bio */}
                        {userBio && (
                            <p className='text-sm text-gray-600 mt-3 line-clamp-2 leading-relaxed'>
                                {userBio}
                            </p>
                        )}

                        {/* Last active (you can replace with actual data) */}
                        <div className='flex items-center gap-1.5 mt-2 text-xs text-gray-400'>
                            <Clock className='w-3.5 h-3.5' />
                            <span>Active recently</span>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className='flex gap-3 mt-auto pt-5'>
                    <Link
                        href={`/messages/chats/${userId}`}
                        className='group/btn relative flex-1 h-11 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 overflow-hidden'
                    >
                        {/* Button shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />

                        <MessageSquare className='w-4.5 h-4.5 relative z-10' />
                        <span className="relative z-10">Message</span>
                    </Link>

                    <Link
                        href={`/profile/${userId}`}
                        className='h-11 w-11 flex items-center justify-center rounded-xl bg-white hover:bg-gray-50 text-indigo-600 border-2 border-indigo-200 hover:border-indigo-300 shadow-md hover:shadow-lg active:scale-95 transition-all duration-200'
                        title="View profile"
                    >
                        <Eye className='w-5 h-5' />
                    </Link>
                </div>
            </div>

            {/* Bottom accent gradient with pulse animation */}
            <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

            {/* Corner accent */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
    )
}

export default MessageUserCard