"use client"


import UserProfileCard from '@/components/shared/UserProfileCard'
import { Input } from '@/components/ui/input'
import { dummyConnectionsData } from '@/public/deleteLater/assets'
import { Search } from 'lucide-react'
import { useState } from 'react'

const DiscoverPage = () => {

    const [input, setInput] = useState('')
    const [users, setUsers] = useState(dummyConnectionsData)
    const [loading, setLoading] = useState(false)

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            setLoading(true)
            setTimeout(() => {
                setLoading(false)
            }, 1000)
        }
    }

    return (
        <div className='min-h-screen bg-linear-to-b from-slate-50 to-white'>
            <div className='w-full mx-auto p-6'>
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-slate-900 mb-2'>Discover People</h1>
                    <p className='text-slate-500'>Connect with amazing people and grow your network</p>
                </div>

                <div className='mb-8 relative'>
                    <Input type="text" placeholder='Search' value={input} onChange={handleSearch} onKeyDown={handleKeyDown} className='w-full pl-8 py-2.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-200' />
                    <Search className='absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500' />
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                    {
                        users.map((user) => (
                            <UserProfileCard key={user._id} user={user} />
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default DiscoverPage