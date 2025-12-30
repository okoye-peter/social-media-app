"use client"

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CirclePlus, Plus } from 'lucide-react'
import { Suspense, useState } from 'react'

const Stories = () => {

    const [count, setCount] = useState(0)

    const fetchStories = async () => {
        try {
            setTimeout(() => {
                setCount(count + 5)
            }, 2000)
            // const response = await fetch('/api/stories')
            //     const data = await response.json()
            // return data
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="flex gap-3 overflow-x-auto">
            {/* create story */}
            <Button variant='ghost' className='h-[120px] w-[120px] hover:bg-none px-0 cursor-pointer'>
                <div className="border-2 border-dashed border-[rgba(163,179,255,1)] h-[120px] w-[120px] flex items-center justify-center flex-col gap-2 rounded-2xl bg-gradient-to-b from-[#EEF2FF] to-white">
                    <span className='bg-[rgba(97,95,255,1)] rounded-full flex items-center justify-center p-2'>
                        <Plus size={20} className='text-white size-5' />
                    </span>
                    <p className=' text-[#384897]'>Create Story</p>
                </div>
            </Button>

            <Suspense fallback={<Loading />}>
                {Array.from({ length: count }, (_, index) => (
                    <Button key={index} variant='ghost' className='h-[120px] w-[120px] hover:bg-none px-0 cursor-pointer'>
                        <div className="border-2 border-dashed border-[rgba(163,179,255,1)] h-[120px] w-[120px] flex items-center justify-center flex-col gap-2 rounded-2xl bg-gradient-to-b from-[#EEF2FF] to-white">
                            <span className='bg-[rgba(97,95,255,1)] rounded-full flex items-center justify-center p-2'>
                                <Plus size={20} className='text-white size-5' />
                            </span>
                            <p className=' text-[#384897]'>Create Story</p>
                        </div>
                    </Button>
                ))}
            </Suspense>
        </div>
    )
}


const Loading = () => {
    return (
        <div className="flex gap-3 overflow-x-auto">
            {/* create story */}
            <Skeleton className='h-[120px] w-[120px]'></Skeleton>
        </div>
    )
}

export default Stories