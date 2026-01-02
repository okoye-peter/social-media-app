"use client"

import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React, { useState } from 'react'
import { Story } from '@/types/story'
import moment from 'moment'
import StoryViewerModal from './StoryViewerModal'

const StoryCard = ({ story }: { story: Story }) => {
    // Handle both string URLs and imported image objects
    const profilePicSrc = typeof story.user.profile_picture === 'string'
        ? story.user.profile_picture
        : story.user.profile_picture.src;
    const [openViewStoryModal, setOpenViewStoryModal] = useState(false)


    return (
        <>
            <Button
                variant='ghost'
                className='h-[170px] w-[120px] hover:bg-none px-0 cursor-pointer rounded-2xl relative'
                style={{ backgroundColor: story.background_color }}
                onClick={() => setOpenViewStoryModal(true)}
            >
                <Image
                    className="absolute size-8 top-3 left-3 z-10 rounded-full ring ring-gray-100 shadow"
                    src={profilePicSrc}
                    alt={story.user.full_name}
                    width={32}
                    height={32}
                />
                <p className='absolute top-18 left-3 text-white/60 text-sm truncate max-w-24'>
                    {story?.content}
                </p>
                <p className='text-xs text-white absolute bottom-1 right-2 z-10'>
                    {moment(story.createdAt).fromNow()}
                </p>
                {
                    story.media_type !== 'text' && (
                        <div className='absolute inset-0 z-1 rounded-lg bg-black/50 overflow-hidden'>
                            {
                                story.media_type === 'image' ?
                                    <Image src={story.media_url} alt={story.user.full_name} width={120} height={170} className='rounded-2xl w-full h-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80' />
                                    :
                                    <video src={story.media_url} className='rounded-2xl w-full h-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80' />
                            }
                        </div>
                    )
                }

            </Button>

            {/* view story */}
            <StoryViewerModal open={openViewStoryModal} onOpenChange={setOpenViewStoryModal} story={story} />
        </>
    )
}

export default StoryCard