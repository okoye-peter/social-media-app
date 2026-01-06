import { User } from '@/app/generated/prisma/client'
import { create } from 'zustand'

interface UserStore {
    user: User | null
    setUser: (user: User | null) => void
    logOut: () => void
}

export const useUserStore = create<UserStore>((set) => ({
    user: null,
    setUser: (user: User | null) => set((state) => ({ user })),
    logOut: () => set((state) => ({ user: null })),
}))