import React from 'react'
import { Skeleton } from '../ui/skeleton'

const UserProfileSkeleton = () => {
    return (
        <div className='relative h-full overflow-y-scroll md:p-6'>
            <div className="mx-auto">
                <div className="bg-white rounded-2xl shadow-md overflow-hidden md:max-w-3xl max-w-full mx-auto">
                    {/* Cover photo skeleton */}
                    <Skeleton className="h-40 md:h-56 w-full" />

                    {/* User info */}
                    <div className="relative py-4 px-6 md:px-8 bg-white">
                        <div className="flex flex-col md:flex-row items-start gap-6">
                            {/* Profile picture skeleton */}
                            <Skeleton className="w-32 h-32 border-4 border-white shadow-lg absolute -top-16 rounded-full" />

                            <div className="w-full pt-16 md:pt-0 md:pl-36">
                                <div className="flex flex-col md:flex-row items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-8 w-48" />
                                            <Skeleton className="w-6 h-6 rounded-full" />
                                        </div>
                                        <Skeleton className="h-4 w-32 mt-2" />
                                    </div>
                                    <Skeleton className="h-10 w-24 rounded-lg mt-4 md:mt-0" />
                                </div>

                                {/* Bio skeleton */}
                                <div className="mt-4 space-y-2">
                                    <Skeleton className="h-4 w-full max-w-md" />
                                    <Skeleton className="h-4 w-3/4 max-w-md" />
                                </div>

                                {/* Location and join date skeleton */}
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-40" />
                                </div>

                                {/* Stats skeleton */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mt-6">
                                    <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
                                        <Skeleton className="h-8 w-16 mb-2" />
                                        <Skeleton className="h-4 w-12" />
                                    </div>
                                    <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
                                        <Skeleton className="h-8 w-16 mb-2" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                    <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
                                        <Skeleton className="h-8 w-16 mb-2" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs skeleton */}
                <div className="w-full mt-6">
                    <Skeleton className="h-12 lg:w-1/3 md:w-2/3 w-full rounded-lg mx-auto my-6" />

                    {/* Posts skeleton */}
                    <div className="space-y-4 mt-6">
                        <Skeleton className="h-48 w-full rounded-xl" />
                        <Skeleton className="h-48 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserProfileSkeleton
