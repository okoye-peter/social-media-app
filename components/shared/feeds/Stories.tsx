"use client"

import { Skeleton } from '@/components/ui/skeleton'
import CreateFeed from './CreateFeed'
import StoryCard from './StoryCard'
import axiosInstance from '@/lib/axios'
import { fullStory } from './StoryCard'
import { useQuery } from '@tanstack/react-query'


const Stories = () => {

    const { data: stories, isLoading, error } = useQuery<fullStory[]>({
        queryKey: ['stories'],
        queryFn: async () => {
            const { data } = await axiosInstance.get('/auth/stories')
            return data.stories
        },
        refetchOnMount: true,
        staleTime: 0,
    })


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
                stories?.map((story, index) => (
                    <StoryCard key={story.id || index} story={story} />
                ))
            )}
        </div>
    )
}


export default Stories