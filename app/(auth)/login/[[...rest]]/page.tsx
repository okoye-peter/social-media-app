"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Star } from 'lucide-react'
// import { SignIn, useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import LoginComponent from '@/components/auth/LoginComponent'
import RegisterComponent from '@/components/auth/RegisterComponent'
import { useUserStore } from '@/stores'
import axiosInstance from '@/lib/axios'
import { toast } from "sonner"

const Login = () => {
    const searchParams = useSearchParams();

    const user = useUserStore((state) => state.user)
    const [loading, setLoading] = useState(false)
    const setUser = useUserStore((state) => state.setUser)

    const router = useRouter()

    const [card, setCard] = useState('login')

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                setLoading(true)
                const res = await axiosInstance.get('/auth/me')
                setUser(res.data.user) // Extract user from response
                router.replace('/feeds')
            } catch (err: unknown) {
                if (err && typeof err === 'object' && 'response' in err) {
                    const axiosError = err as { response?: { status: number } }
                    if (axiosError.response?.status === 401) {
                        setUser(null)
                    }
                }
            } finally {
                setLoading(false)
            }
        }

        // Only check if we don't already have a user
        if (!user) {
            checkSession()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Run only once on mount

    // Handle authentication errors from OAuth redirects
    useEffect(() => {
        const error = searchParams.get('error')
        
        if (error == 'no_code' || error == 'oauth_failed') {
            toast.error('Authentication failed!')
        }
    }, [searchParams])


    // Show loading skeleton while checking authentication status
    if (loading) {
        return (
            <div className='h-screen lg:px-20 md:px-16 px-4 py-8 bg-[url("/bgImage.png")] bg-cover bg-center bg-no-repeat'>
                <header className='flex items-center justify-center gap-4 flex-col h-1/4'>
                    <Skeleton className='w-[100px] h-[100px] rounded-lg' />
                    <Skeleton className='w-[300px] h-[36px] rounded-md' />
                </header>
                <div className='grid md:grid-cols-2 grid-cols-1 items-center justify-center gap-4 h-3/4'>
                    <div className="md:block hidden space-y-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className='w-[100px] h-[100px] rounded-lg' />
                            <div className='space-y-2'>
                                <Skeleton className='w-[120px] h-[16px]' />
                                <Skeleton className='w-[180px] h-[20px]' />
                            </div>
                        </div>
                        <Skeleton className='w-full h-[200px] rounded-md' />
                        <Skeleton className='w-3/4 h-[36px] rounded-md' />
                    </div>
                    <div className='justify-items-center'>
                        <Skeleton className='w-[400px] h-[500px] rounded-lg' />
                    </div>
                </div>
            </div>
        )
    }

    // If user is authenticated, don't render the login page
    if (user) {
        return null
    }

    return (
        <div className='h-screen lg:px-20 md:px-16 px-4 py-8 bg-[url("/bgImage.png")] bg-cover bg-center bg-no-repeat'>
            <header className='flex items-center justify-center gap-4 flex-col h-1/4'>
                <Image src="/icon.png" alt="Logo" width={100} height={100} className='rounded-lg' />
                <p className='font-semibold text-3xl font-gothic text-[rgba(28,57,142,1)]'>Live * Love * Laugh</p>
            </header>
            <div className='grid md:grid-cols-2 grid-cols-1 items-center justify-center gap-4 h-3/4'>
                <div className="md:block hidden">
                    <div className="flex items-center gap-4">
                        <Image src="/group_users.png" alt="Logo" width={100} height={100} className='rounded-lg' />
                        <div>
                            <div className="starts-container flex">
                                <Star className='text-[rgba(253,154,0,1)]' size={16} fill='rgba(253, 154, 0, 1)' />
                                <Star className='text-[rgba(253,154,0,1)]' size={16} fill='rgba(253, 154, 0, 1)' />
                                <Star className='text-[rgba(253,154,0,1)]' size={16} fill='rgba(253, 154, 0, 1)' />
                                <Star className='text-[rgba(253,154,0,1)]' size={16} fill='rgba(253, 154, 0, 1)' />
                                <Star className='text-[rgba(253,154,0,1)]' size={16} fill='rgba(253, 154, 0, 1)' />
                            </div>
                            <p className='text-[rgba(28,57,142,1)] font-medium'>Used by 12k+ developers</p>
                        </div>
                    </div>
                    <h1 className='font-bold text-6xl bg-[linear-gradient(90deg,#1E1A4D_0%,#372AAC_100%)] bg-clip-text text-transparent my-4'>More than just friends
                        truly connect</h1>
                    <p className='text-[rgba(28,57,142,1)] font-normal text-3xl'>connect with global community on pingup.</p>
                </div>
                <div className='justify-items-center'>
                    {card === 'login' ? <LoginComponent onChangeCard={setCard} /> : <RegisterComponent onChangeCard={setCard} />}
                    {/* <SignIn forceRedirectUrl="/feeds" /> */}
                </div>
            </div>
        </div>
    )
}

export default Login