import UserProfile from '@/components/shared/UserProfile';
import { dummyUserData } from '@/public/deleteLater/assets';

import React from 'react'

const ProfilePage = () => {
    const user = dummyUserData;
    return (
        <div>
            <UserProfile user={user} />
        </div>
    )
}

export default ProfilePage