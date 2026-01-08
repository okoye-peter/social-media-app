'use client';

import UserProfile from '@/components/shared/UserProfile';
import UserProfileSkeleton from '@/components/shared/UserProfileSkeleton';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useUserStore } from '@/stores';
import axiosInstance from '@/lib/axios';

const ProfilePage = () => {
    const params = useParams();
    const userId = params.userId as string;
    const authUser = useUserStore((state) => state.user);

    const { data: user, isLoading, error } = useQuery({
        queryKey: ['user', userId],
        queryFn: async () => {
            const response = await axiosInstance.get(`/auth/users/${userId}`);
            return response.data;
        },
        enabled: !!userId
    });

    if (isLoading) {
        return <UserProfileSkeleton />;
    }

    if (error || !user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] p-4">
                <div className="text-center space-y-4">
                    <div className="relative inline-block">
                        <div className="w-24 h-24 mx-auto bg-linear-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-12 w-12 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-800">User Not Found</h2>
                        <p className="text-gray-500 max-w-md">
                            We couldn&apos;t find the user you&apos;re looking for. They may have been removed or the link might be incorrect.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <UserProfile user={user} authUserId={authUser?.id} />
        </div>
    );
};

export default ProfilePage;