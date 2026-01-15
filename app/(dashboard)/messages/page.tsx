"use client"

import MessageUserCard from '@/components/shared/MessageUserCard'
import { Input } from '@/components/ui/input'
import { useState, useRef, useEffect, useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2 } from 'lucide-react'
import { MessagesAPIResponse } from '@/types'

const Messages = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const loadMoreRef = useRef<HTMLDivElement>(null)

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery)
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery])

    // Fetch messages data with infinite query
    const {
        data,
        isLoading,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ['messages', debouncedSearch],
        queryFn: async ({ pageParam = 1, signal }) => {
            const searchParam = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ''
            const response = await axiosInstance.get<MessagesAPIResponse>(
                `/auth/messages?page=${pageParam}&limit=10${searchParam}`,
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

    // Process data from all pages
    const allFriends = useMemo(() => {
        if (!data?.pages) return []
        return data.pages.flatMap(page => page.friends)
    }, [data])

    // Get total count from first page
    const totalCount = data?.pages?.[0]?.pagination?.total || 0

    return (
        <div className='min-h-screen relative'>
            <div className="mx-auto p-6">
                {/* Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Messages</h1>
                    <p className="text-slate-500 text-sm">
                        {totalCount > 0 ? `${totalCount} conversation${totalCount !== 1 ? 's' : ''}` : 'No conversations'}
                    </p>
                </div>

                {/* Search */}
                <div className="mb-8">
                    <Input
                        type="text"
                        placeholder="Search conversations..."
                        className="w-full focus:outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Messages */}
                <div className="mb-8">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <MessageCardSkeleton key={index} />
                            ))}
                        </div>
                    ) : isError ? (
                        <div className="text-center py-12">
                            <p className="text-red-500">
                                Error: {error instanceof Error ? error.message : 'Failed to load messages'}
                            </p>
                        </div>
                    ) : allFriends.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {allFriends.map((friend) => (
                                    <MessageUserCard
                                        key={friend.id}
                                        user={{
                                            id: friend.id,
                                            name: friend.name,
                                            username: friend.username,
                                            bio: friend.bio,
                                            image: friend.image
                                        }}
                                    />
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
                                ) : allFriends.length > 0 ? (
                                    <div className="text-slate-400 text-sm">No more conversations to load</div>
                                ) : null}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-slate-500">
                                {searchQuery ? 'No conversations found matching your search' : 'No conversations yet'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Skeleton component for loading state
const MessageCardSkeleton = () => {
    return (
        <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
            <div className='p-5'>
                <div className='flex items-start gap-4 mb-4'>
                    <Skeleton className="w-14 h-14 rounded-full shrink-0" />
                    <div className='flex-1 min-w-0 space-y-2'>
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
                <div className="space-y-2 mb-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                <div className='flex gap-2'>
                    <Skeleton className="h-10 flex-1 rounded-lg" />
                    <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                </div>
            </div>
        </div>
    )
}

export default Messages