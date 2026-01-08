"use client"

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Home, Search, Settings, LogOut, Users, MessageCircle, CirclePlus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger
} from '@/components/ui/sidebar';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import ThemedButton from '@/components/shared/ThemedButton';
import { useUserStore } from '@/stores';
import axiosInstance from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const menuItems = [
    { icon: Home, label: 'Feed', url: '/feeds' },
    { icon: MessageCircle, label: 'Messages', url: '/messages' },
    { icon: Users, label: 'Connections', url: '/connections' },
    { icon: Search, label: 'Discover', url: '/discover' },
    { icon: Settings, label: 'Profile', url: '/profile' },
];

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const pathname = usePathname();
    const router = useRouter();

    const user = useUserStore((state) => state.user)

    const logOut = useUserStore((state) => state.logOut)

    const handleLogOut = async () => {
        toast.promise<{ name: string }>(
            () => axiosInstance.post('/auth/logout'),
            {
                loading: "Signing out...",
                success: (data) => {
                    router.replace('/login')
                    logOut()
                    return "Signed out successfully"
                },
                error: "Error signing out",
            }
        )
    }

    const isActive = (url: string) => pathname === url;

    const { isLoading } = useQuery({
        queryKey: ['authUser'],
        queryFn: async () => {
            try {
                const res = await axiosInstance.get('/auth/me')
                useUserStore.setState({ user: res.data.user })
                return res.data.user
            } catch (err: unknown) {
                if (err && typeof err === 'object' && 'response' in err) {
                    const error = err as { response?: { status?: number } }
                    if (error?.response?.status === 401) {
                        logOut()
                        router.replace('/login')
                    }
                }
                throw err
            }
        },
        enabled: !user, // Only fetch if user is not already in store
        retry: false, // Don't retry on 401 errors
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    });

    if (!user || isLoading) {
        return (
            <SidebarProvider>
                <Sidebar>
                    <SidebarHeader className='border-b border-gray-300 h-16'>
                        <div className="flex items-center gap-2 px-2">
                            <Skeleton className="w-10 h-10 rounded" />
                            <Skeleton className="w-24 h-6" />
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarMenu className='py-6 px-4 space-y-2'>
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Skeleton key={i} className="w-full h-10 rounded-lg" />
                                    ))}
                                    <Skeleton className="w-full h-12 rounded-lg mt-6" />
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                    <SidebarFooter className='border-t border-gray-300 px-4'>
                        <div className='flex items-center gap-3 py-2'>
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className='flex-1 space-y-2'>
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                            <Skeleton className="h-8 w-8 rounded" />
                        </div>
                    </SidebarFooter>
                </Sidebar>
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <Skeleton className="w-8 h-8" />
                        <Skeleton className="w-32 h-6" />
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-4">
                        <Skeleton className="w-full h-64 rounded-lg" />
                        <Skeleton className="w-full h-48 rounded-lg" />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        )
    }


    return (
        <SidebarProvider>
            <Sidebar>
                {/* Header */}
                <SidebarHeader className='border-b border-gray-300 h-16'>
                    <div className="flex items-center gap-2 px-2">
                        <Image
                            src="/icon.png"
                            alt="logo"
                            width={40}
                            height={40}
                            className="rounded"
                            style={{ width: 'auto', height: 'auto' }}
                        />
                        <h1 className="text-lg font-semibold">Konnect</h1>
                    </div>
                </SidebarHeader>

                {/* Content */}
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu className='py-6 px-4'>
                                {menuItems.map((item) => (
                                    <SidebarMenuItem key={item.label}>
                                        <SidebarMenuButton asChild>
                                            <Link
                                                href={item.url}
                                                className={cn(
                                                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                                                    isActive(item.url)
                                                        ? "bg-indigo-50 text-indigo-700 font-medium  shadow-sm hover:bg-indigo-100"
                                                        : "text-gray-700 hover:bg-gray-200"
                                                )}
                                            >
                                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                                <SidebarMenuItem>
                                    <ThemedButton asChild>
                                        <Link href={'/posts/create'} className='mt-6'>
                                            <CirclePlus className='w-5 h-5' />
                                            Create Post
                                        </Link>
                                    </ThemedButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                {/* Footer */}
                <SidebarFooter className='border-t border-gray-300 px-4'>
                    <SidebarMenu>
                        <SidebarMenuItem className='flex items-center justify-center gap-3'>
                            <Avatar className="h-8 w-8">
                                <AvatarImage
                                    src={user?.image ?? "https://github.com/shadcn.png"}
                                    alt={user?.name ?? "User"}
                                />
                                <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start flex-1">
                                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                                <span className="text-xs text-muted-foreground">{user?.email}</span>
                            </div>
                            <Button onClick={handleLogOut} variant="ghost" type='button'>
                                <LogOut className="ml-auto" size={20} />
                            </Button>

                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>

            {/* Main Content Area */}
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <div className="text-lg font-semibold">Dashboard</div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default DashboardLayout;
