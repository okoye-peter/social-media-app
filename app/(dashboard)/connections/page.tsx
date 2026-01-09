"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, UserPlus, UserCheck, UserPen, Loader2 } from 'lucide-react'
import ConnectionCard from '@/components/shared/ConnectionCard'
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { useUserStore } from '@/stores'

import { ConnectionType, FollowerData, FollowingData, PendingData, ConnectionData, ConnectionAPIResponse } from '@/types'



const ConnectionsPage = () => {
    const authUser = useUserStore((state) => state.user)
    const [activeTab, setActiveTab] = useState<ConnectionType>('followers')
    const loadMoreRef = useRef<HTMLDivElement>(null)
    const queryClient = useQueryClient()

    const tabUrls = {
        followers: '/auth/connections?type=followers',
        followings: '/auth/connections?type=followings',
        pending: '/auth/connections?type=pending',
        connections: '/auth/connections?type=connections'
    }

    // Fetch connections data with infinite query
    const {
        data,
        isLoading,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ['connections', activeTab],
        queryFn: async ({ pageParam = 1, signal }) => {
            const response = await axiosInstance.get<ConnectionAPIResponse>(
                `${tabUrls[activeTab]}&page=${pageParam}&limit=12`,
                { signal }
            )
            return response.data
        },
        getNextPageParam: (lastPage) => {
            return lastPage.pagination.hasMore
                ? lastPage.pagination.page + 1
                : undefined
        },
        initialPageParam: 1,
        staleTime: 0,
        refetchOnMount: true
    })

    const { data: activityData } = useQuery({
        queryKey: ['activity'],
        queryFn: async ({ signal }) => {
            const response = await axiosInstance.get(`/auth/users/activity`, {
                signal
            })
            return response.data
        },
        staleTime: 0,
        refetchOnMount: true
    })

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0]
                if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage()
                }
            },
            { threshold: 0.1 }
        )

        const currentRef = loadMoreRef.current
        if (currentRef) {
            observer.observe(currentRef)
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef)
            }
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    const handleTabChange = (value: string) => {
        const newTab = value as ConnectionType

        // Reset the query cache for the new tab to force a fresh fetch
        queryClient.resetQueries({
            queryKey: ['connections', newTab],
            exact: true
        })

        setActiveTab(newTab)
    }

    // Process data from all pages
    const processedData = React.useMemo(() => {
        if (!data?.pages) return []

        switch (activeTab) {
            case 'followers': {
                const allData = data.pages.flatMap(page => page.data as FollowerData[])
                return allData.map(item => item.sender)
            }
            case 'followings': {
                const allData = data.pages.flatMap(page => page.data as FollowingData[])
                return allData.map(item => item.receiver)
            }
            case 'pending': {
                const allData = data.pages.flatMap(page => page.data as PendingData[])
                return allData.map(item => item.sender)
            }
            case 'connections': {
                const allData = data.pages.flatMap(page => page.data as ConnectionData[])
                return allData.flatMap(item => {
                    // For connections, return the other user (not the current user)
                    return [item.sender, item.receiver].filter((connection) => connection.id !== authUser?.id).filter(Boolean)
                })
            }
            default:
                return []
        }
    }, [data, activeTab, authUser])

    // Get total count from first page
    const totalCount = data?.pages?.[0]?.pagination?.total || 0

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
                        activityData && Object.entries(activityData).map(([key, count]) => (
                            <div key={key} className="flex flex-col items-center justify-center gap-1 border h-20 border-gray-200 bg-white shadow rounded-md p-2">
                                <b className="text-lg sm:text-xl">{count as number}</b>
                                <p className='text-slate-600 text-xs sm:text-sm capitalize'>{key}</p>
                            </div>
                        ))
                    }
                </div>

                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full mt-4">
                    <TabsList className="w-full grid grid-cols-4 gap-1">
                        <TabsTrigger value="followers" className="text-xs sm:text-sm">
                            <Users className="w-4 h-4 mr-0 sm:mr-2" />
                            <span className="hidden sm:inline">Followers</span>
                        </TabsTrigger>
                        <TabsTrigger value="followings" className="text-xs sm:text-sm">
                            <UserCheck className="w-4 h-4 mr-0 sm:mr-2" />
                            <span className="hidden sm:inline">Following</span>
                        </TabsTrigger>
                        <TabsTrigger value="connections" className="text-xs sm:text-sm">
                            <UserPlus className="w-4 h-4 mr-0 sm:mr-2" />
                            <span className="hidden sm:inline">Connections</span>
                        </TabsTrigger>
                        <TabsTrigger value="pending" className="text-xs sm:text-sm">
                            <UserPen className="w-4 h-4 mr-0 sm:mr-2" />
                            <span className="hidden sm:inline">Pending</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Content for all tabs */}
                    <TabsContent value={activeTab}>
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <ConnectionCardSkeleton key={index} />
                                ))}
                            </div>
                        ) : isError ? (
                            <div className="text-center py-12">
                                <p className="text-red-500">
                                    Error: {error instanceof Error ? error.message : 'Failed to load data'}
                                </p>
                            </div>
                        ) : processedData.length > 0 ? (
                            <>
                                <div className="mb-4 text-sm text-slate-600">
                                    Showing {processedData.length} of {totalCount} {activeTab}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {processedData.map((user) => (
                                        <ConnectionCard key={user.id} user={user} tag={activeTab} />
                                    ))}
                                </div>

                                {/* Loading indicator and intersection observer trigger */}
                                <div ref={loadMoreRef} className="flex justify-center py-8">
                                    {isFetchingNextPage ? (
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Loading more...</span>
                                        </div>
                                    ) : hasNextPage ? (
                                        <div className="text-slate-400 text-sm">Scroll for more</div>
                                    ) : processedData.length > 0 ? (
                                        <div className="text-slate-400 text-sm">No more {activeTab} to load</div>
                                    ) : null}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-slate-500">No {activeTab} found</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

// Skeleton component for loading state
const ConnectionCardSkeleton = () => {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                </div>
                <div className="mt-4 flex gap-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 w-20" />
                </div>
            </CardContent>
        </Card>
    )
}

export default ConnectionsPage