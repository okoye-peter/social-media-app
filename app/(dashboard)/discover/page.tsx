"use client"

import UserProfileCard from '@/components/shared/UserProfileCard'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { User } from '@/types/story'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import axiosInstance from '@/lib/axios'
import { Connection, Follow } from '@/types/connection'

export type DiscoveryUser = User & {
    sentConnections?: Connection[]
    receivedConnections?: Connection[]
    followers: Follow[]
}
interface DiscoverResponse {
    users: DiscoveryUser[]
    pagination: {
        total: number
        page: number
        totalPages: number
        hasMore: boolean
    }
}

const DiscoverPage = () => {
    const [searchInput, setSearchInput] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const observerTarget = useRef<HTMLDivElement>(null)

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput)
        }, 500)

        return () => clearTimeout(timer)
    }, [searchInput])

    // Fetch users with infinite scroll
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error
    } = useInfiniteQuery<DiscoverResponse>({
        queryKey: ['discover-users', debouncedSearch],
        queryFn: async (context) => {
            const page = (context.pageParam as number) || 1;
            const params = new URLSearchParams({
                page: page.toString(),
                ...(debouncedSearch && { search: debouncedSearch })
            })
            const response = await axiosInstance.get(`/auth/discover?${params}`)
            return response.data
        },
        getNextPageParam: (lastPage) => {
            return lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined
        },
        initialPageParam: 1,
        staleTime: 0,
        refetchOnMount: true
    })

    // Intersection observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage()
                }
            },
            { threshold: 0.1 }
        )

        const currentTarget = observerTarget.current
        if (currentTarget) {
            observer.observe(currentTarget)
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget)
            }
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value)
    }

    // Flatten all pages of users
    const allUsers = data?.pages.flatMap(page => page.users) ?? []

    return (
        <div className='min-h-screen bg-linear-to-b from-slate-50 to-white'>
            <div className='w-full mx-auto p-6'>
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-slate-900 mb-2'>Discover People</h1>
                    <p className='text-slate-500'>Connect with amazing people and grow your network</p>
                </div>

                <div className='mb-8 relative'>
                    <Input
                        type="text"
                        placeholder='Search by name...'
                        value={searchInput}
                        onChange={handleSearch}
                        className='w-full pl-10 py-2.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-200'
                    />
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500' />
                </div>

                {isError && (
                    <div className='text-center py-8 text-red-500'>
                        Error: {error instanceof Error ? error.message : 'Failed to load users'}
                    </div>
                )}

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                    {isLoading ? (
                        // Loading skeletons
                        Array.from({ length: 16 }).map((_, index) => (
                            <UserCardSkeleton key={index} />
                        ))
                    ) : allUsers.length > 0 ? (
                        allUsers.map((user) => (
                            <UserProfileCard key={user.id} user={user} />
                        ))
                    ) : (
                        <div className='col-span-full text-center py-12 text-slate-500'>
                            No users found
                        </div>
                    )}
                </div>

                {/* Loading more indicator */}
                {isFetchingNextPage && (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4'>
                        {Array.from({ length: 4 }).map((_, index) => (
                            <UserCardSkeleton key={`loading-${index}`} />
                        ))}
                    </div>
                )}

                {/* Intersection observer target */}
                <div ref={observerTarget} className='h-4' />
            </div>
        </div>
    )
}

// Skeleton component for loading state
const UserCardSkeleton = () => {
    return (
        <Card className='gap-2 py-2'>
            <CardContent className='px-2 pt-6 flex flex-col justify-between'>
                <Skeleton className='w-24 h-24 rounded-full mx-auto' />
                <Skeleton className='h-5 w-32 mx-auto mt-4' />
                <Skeleton className='h-4 w-24 mx-auto mt-2' />
                <Skeleton className='h-12 w-full mt-2 px-4' />
                <div className='justify-center gap-2 flex mt-3 flex-wrap'>
                    <Skeleton className='h-6 w-24 rounded-full' />
                    <Skeleton className='h-6 w-32 rounded-full' />
                </div>
            </CardContent>
            <CardFooter className='py-2 px-2 flex gap-2 flex-wrap'>
                <Skeleton className='flex-1 h-9 rounded-md' />
                <Skeleton className='w-16 h-9 rounded-md' />
            </CardFooter>
        </Card>
    )
}

export default DiscoverPage