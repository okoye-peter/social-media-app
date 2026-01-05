import MessageUserCard from '@/components/shared/MessageUserCard'
import { Input } from '@/components/ui/input'
import React from 'react'
import { dummyConnectionsData } from '@/public/deleteLater/assets'

const Messages = () => {
  return (
    <div className='min-h-screen relative'>
        <div className=" mx-auto p-6">
            {/* Title */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Messages</h1>
                <p className="text-slate-500 text-sm">You have 10 unread messages</p>
            </div>

            {/* Search */}
            <div className="mb-8">
                <Input type="text" placeholder="Search" className="w-full focus:outline-none " />
            </div>

            {/* Messages */}
            <div className="mb-8">
                {dummyConnectionsData.map((user) => (
                    <MessageUserCard key={user._id} user={user} />
                ))}
            </div>
        </div>
    </div>
  )
}

export default Messages