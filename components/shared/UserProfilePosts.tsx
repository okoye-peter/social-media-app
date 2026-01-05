import { dummyPostsData } from '@/public/deleteLater/assets'
import React from 'react'
import PostCard from './feeds/PostCard'

const UserProfilePosts = ({ userId }: { userId: string }) => {
    const userPosts = dummyPostsData.filter((post) => post.user._id === userId)

    if(userPosts.length === 0){
        return (
            <div className="text-center py-12 text-gray-500">
                <p>No posts yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:max-w-3xl mx-auto max-w-full">
            {userPosts.map((post) => (
                <PostCard key={post._id} post={post} />
            ))}
        </div>
    )
}

export default UserProfilePosts