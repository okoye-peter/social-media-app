'use client'

import UserProfile from '@/components/shared/UserProfile';
import { useUserStore } from '@/stores';

const LoggedInUserProfile = () => {
    const user = useUserStore((state) => state.user)

    if (!user) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <UserProfile user={user} authUserId={user.id} />
        </div>
    )
}

export default LoggedInUserProfile