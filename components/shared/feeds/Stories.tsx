"use client"

import { Skeleton } from '@/components/ui/skeleton'
import { dummyStoriesData } from '@/public/deleteLater/assets'
import { useEffect, useState } from 'react'
import CreateFeed from './CreateFeed'
import StoryCard from './StoryCard'
import { Story } from '@/types/story'


const Stories = () => {
    const [stories, setStories] = useState<Story[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStories = async () => {
            setIsLoading(true);
            await new Promise((resolve) => {
                setTimeout(() => {
                    setStories(dummyStoriesData as Story[])
                    resolve(true)
                }, 2000)
            })
            setIsLoading(false);
        }
        fetchStories()
    }, [])

    return (
        <div className="w-full no-scrollbar overflow-x-auto flex gap-3 mb-6 pb-6">
            {/* create story */}
            <CreateFeed />

            {isLoading ? (
                <>
                    <Skeleton className='h-[170px] w-[120px]'></Skeleton>
                    <Skeleton className='h-[170px] w-[120px]'></Skeleton>
                    <Skeleton className='h-[170px] w-[120px]'></Skeleton>
                    <Skeleton className='h-[170px] w-[120px]'></Skeleton>
                    <Skeleton className='h-[170px] w-[120px]'></Skeleton>
                </>
            ) : (
                stories.map((story, index) => (
                    <StoryCard key={story._id || index} story={story} />
                ))
            )}
        </div>
    )
}


export default Stories