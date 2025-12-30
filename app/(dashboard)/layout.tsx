"use client"

import React from 'react';
import { Home, Search, Settings, LogOut, Users, MessageCircle, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SignedIn, useUser, useClerk, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

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

    const { user } = useUser()
    const { signOut } = useClerk();
    console.log('DashboardLayout', user)

    const isActive = (url: string) => pathname === url;


    return (
        <SignedIn>
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
                                                            ? "bg-[linear-gradient(90deg,#615FFF_0%,#9810FA_100%)] text-white font-medium shadow-md hover:bg-[linear-gradient(90deg,#3A38A3_0%,#4D0889_100%)] hover:text-white"
                                                            : "text-gray-700 hover:bg-gray-200"
                                                    )}
                                                >
                                                    <item.icon className="w-5 h-5 flex-shrink-0" />
                                                    <span>{item.label}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    {/* Footer */}
                    <SidebarFooter className='border-t border-gray-300'>
                        <SidebarMenu>
                            <SidebarMenuItem className='flex items-center justify-center gap-3'>
                                <UserButton />
                                <div className="flex flex-col items-start flex-1">
                                    <span className="text-sm font-medium text-gray-700">{user?.fullName}</span>
                                    <span className="text-xs text-muted-foreground">{user?.emailAddresses[0].emailAddress}</span>
                                </div>
                                <Button onClick={() => signOut({ redirectUrl: '/login' })} variant="ghost" type='button'>
                                    <LogOut className="ml-auto" size={20} />
                                </Button>
                                {/* <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={SignedOut}>
                                    <SidebarMenuButton>
                                        
                                        <div className="flex flex-row flex-wrap items-center gap-12">
                                            <Avatar className="">
                                                <AvatarImage
                                                    src={user?.imageUrl ?? "https://github.com/evilrabbit.png"}
                                                    alt={user?.fullName ?? "evil rabbit"}
                                                    className='rounded-full w-8 h-8'
                                                />
                                                <AvatarFallback>{user?.fullName?.slice(0, 2)}</AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div className="flex flex-col items-start flex-1">
                                            <span className="text-sm font-medium">{ user?.fullName }</span>
                                            <span className="text-xs text-muted-foreground">{ user?.emailAddresses[0].emailAddress }</span>
                                        </div>
                                        
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                                    <DropdownMenuItem>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Logout</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu> */}
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
        </SignedIn>
    );
};

export default DashboardLayout;
