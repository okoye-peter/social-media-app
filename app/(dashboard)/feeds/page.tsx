'use client'

import RecentMessages from '@/components/shared/RecentMessages'
import PostCard from '@/components/shared/feeds/PostCard'
import Stories from '@/components/shared/feeds/Stories'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { assets } from '@/public/deleteLater/assets'
import Image from 'next/image'
import { useInfiniteQuery } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'
import { PostsResponse } from '@/types/post'
import { useEffect, useRef } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2 } from 'lucide-react'

const FeedsPage = () => {
    const observerTarget = useRef<HTMLDivElement>(null)

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery<PostsResponse>({
        queryKey: ['posts'],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await axiosInstance.get(`/auth/posts?page=${pageParam}`)
            return res.data
        },
        getNextPageParam: (lastPage) => {
            return lastPage.pagination.hasNextPage
                ? lastPage.pagination.page + 1
                : undefined
        },
        initialPageParam: 1,
    })

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
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

    // Flatten all posts from all pages
    const allPosts = data?.pages.flatMap((page) => page.posts) ?? []

    return (
        <div className='grid grid-cols-1 lg:grid-cols-3 lg:px-20 py-6 gap-6'>
            <div className="lg:col-span-2 overflow-y-auto no-scrollbar flex flex-col max-h-screen">
                {/* stories feeds */}
                <div className="shrink-0">
                    <Stories />
                </div>

                {/* feeds */}
                <div className="space-y-6">
                    {isLoading ? (
                        // Loading skeletons for initial load
                        Array.from({ length: 3 }).map((_, index) => (
                            <Card key={index} className="w-full shadow-sm">
                                <CardHeader className='px-3'>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-10 h-10 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-48" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className='px-3 space-y-3'>
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-48 w-full rounded-lg mt-3" />
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <>
                            {allPosts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}

                            {/* Loading indicator for next page */}
                            {isFetchingNextPage && (
                                <div className="flex justify-center py-6">
                                    <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                                </div>
                            )}

                            {/* Observer target */}
                            <div ref={observerTarget} className="h-4" />

                            {/* End of posts message */}
                            {!hasNextPage && allPosts.length > 0 && (
                                <div className="text-center py-6 text-gray-500 text-sm">
                                    You&apos;ve reached the end! 🎉
                                </div>
                            )}

                            {/* No posts message */}
                            {!isLoading && allPosts.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    No posts yet. Be the first to create one!
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            <div className="lg:block hidden">
                <Card className="w-full  shadow-sm mb-6">
                    <CardHeader>
                        <CardTitle>Sponsored</CardTitle>
                    </CardHeader>
                    <CardContent className='px-3'>
                        <Image src={assets.sponsored_img} alt="sponsored" width={500} height={500} className='w-full h-full object-cover' />
                        <p className='text-slate-600 text-sm my-3'>Email marketing</p>
                        <p className='text-slate-400 text-xs'>Supercharge your marketing with a powerful, easy-
                            to-use platform built for results.</p>
                    </CardContent>
                </Card>

                <RecentMessages />
            </div>
        </div>
    )
}

export default FeedsPage