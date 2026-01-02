"use client"

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import CreateStoryModal from './CreateStoryModal'
import { useState } from 'react'

const CreateFeed = () => {
    const [open, setOpen] = useState(false)
    const onOpenChange = () => {
        setOpen(!open)
    }

    return (
        <>
            <Button variant='ghost' className='h-[170px] w-[120px] hover:bg-none px-0 cursor-pointer' onClick={() => setOpen(true)}>
                <div className="border-2 border-dashed border-[rgba(163,179,255,1)] h-[170px] w-[120px] flex items-center justify-center flex-col gap-2 rounded-2xl bg-gradient-to-b from-[#EEF2FF] to-white">
                    <span className='bg-[rgba(97,95,255,1)] rounded-full flex items-center justify-center p-2'>
                        <Plus size={20} className='text-white size-5' />
                    </span>
                    <p className=' text-[#384897]'>Create Story</p>
                </div>
            </Button>

            <CreateStoryModal open={open} onOpenChange={onOpenChange} /> 
        </>
    )
}   

export default CreateFeed