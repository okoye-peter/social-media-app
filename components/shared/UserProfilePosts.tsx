'use client'

import React, { useEffect, useRef } from 'react'
import PostCard from './feeds/PostCard'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Skeleton } from '../ui/skeleton'
import axiosInstance from '@/lib/axios'
import { PostsResponse } from '@/types'

const UserProfilePosts = ({ userId, type }: { userId: number, type?: 'likes' | 'media' }) => {

    const observerTarget = useRef<HTMLDivElement>(null)
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery<PostsResponse>({
        queryKey: ['user-posts', userId, type],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await axiosInstance.get(`/auth/users/${userId}/posts?page=${pageParam}${type ? `&type=${type}` : ''}`)
            return res.data
        },
        getNextPageParam: (lastPage) => {
            return lastPage.pagination.hasNextPage
                ? lastPage.pagination.page + 1
                : undefined
        },
        initialPageParam: 1,
    })

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

    // Loading skeleton - only show on initial load
    if (isLoading && !data) {
        return (
            <div className="space-y-6 md:max-w-3xl mx-auto max-w-full">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-md p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-12 h-12 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-64 w-full rounded-xl" />
                        <div className="flex gap-4">
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-8 w-20" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    // Flatten all posts from pages
    const posts = data?.pages.flatMap(page => page.posts) ?? []

    // Empty state
    if (posts.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>No posts yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:max-w-3xl mx-auto max-w-full">
            {posts.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}

            {/* Infinite scroll observer target */}
            <div ref={observerTarget} className="h-10 flex items-center justify-center">
                {isFetchingNextPage && (
                    <div className="flex items-center gap-2 text-purple-600">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                        <span className="text-sm">Loading more posts...</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default UserProfilePosts