import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, UserPlus, UserCheck, UserPen } from 'lucide-react'
import {
    dummyConnectionsData as connections,
    dummyFollowersData as followers,
    dummyFollowingData as followings,
    dummyPendingConnectionsData as pending
} from '@/public/deleteLater/assets'
import ConnectionCard from '@/components/shared/ConnectionCard'

const ConnectionsPage = () => {
    const dataArray = [
        {
            value: "followers",
            data: followers,
            icons: Users,
            count: followers.length
        },
        {
            value: "followings",
            data: followings,
            icons: UserCheck,
            count: followings.length
        },
        {
            value: "pending",
            data: pending,
            icons: UserPen,
            count: pending.length
        },
        {
            value: "connections",
            data: connections,
            icons: UserPlus,
            count: connections.length
        }
    ]


    return (
        <div className='min-h-screen relative'>
            <div className="mx-auto md:p-6 md:px-6 px-3">
                {/* Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Connections</h1>
                    <p className="text-slate-500 text-sm">Manage your network and discover new connections</p>
                </div>

                <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
                    {
                        dataArray.map((item) => (
                            <div key={item.value} className="flex flex-col items-center justify-center gap-1 border h-20 border-gray-200 bg-white shadow rounded-md p-2">
                                <b className="text-lg sm:text-xl">{item.count}</b>
                                <p className='text-slate-600 text-xs sm:text-sm capitalize'>{item.value}</p>
                            </div>
                        ))
                    }
                </div>

                <Tabs defaultValue="connections" className="w-full mt-4">
                    <TabsList className="w-full grid grid-cols-4 gap-1">
                        <TabsTrigger value="followers" className="text-xs sm:text-sm">
                            <Users className="w-4 h-4 mr-0 sm:mr-2" />
                            <span className="hidden sm:inline">Followers</span>
                        </TabsTrigger>
                        <TabsTrigger value="followings" className="text-xs sm:text-sm">
                            <UserCheck className="w-4 h-4 mr-0 sm:mr-2" />
                            <span className="hidden sm:inline">Following</span>
                        </TabsTrigger>
                        <TabsTrigger value="pending" className="text-xs sm:text-sm">
                            <UserPen className="w-4 h-4 mr-0 sm:mr-2" />
                            <span className="hidden sm:inline">Pending</span>
                        </TabsTrigger>
                        <TabsTrigger value="connections" className="text-xs sm:text-sm">
                            <UserPlus className="w-4 h-4 mr-0 sm:mr-2" />
                            <span className="hidden sm:inline">Connections</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="followers">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {followers.map((user) => (
                                <ConnectionCard key={user._id} user={user} tag='followers' />
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="followings">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {followings.map((user) => (
                                <ConnectionCard key={user._id} user={user} tag='followings' />
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="pending">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pending.map((user) => (
                                <ConnectionCard key={user._id} user={user} tag='pending' />
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="connections">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {connections.map((user) => (
                                <ConnectionCard key={user._id} user={user} tag='connections' />
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default ConnectionsPage