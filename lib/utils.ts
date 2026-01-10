import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Generates a consistent avatar URL using UI Avatars API
 * @param name - The user's name to display in the avatar
 * @returns A URL string for the avatar image
 */
export function getAvatarUrl(name?: string | null): string {
    const displayName = name || 'User';
    return `https://ui-avatars.com/api/?color=ffffff&uppercase=true&name=${encodeURIComponent(displayName)}&bold=true&background=9333EA`;
}


export function getPusherChannelName(userId: number, friendId: number): string {
    const sortedIds = [userId, friendId].sort((a, b) => a - b);
    return `private-user-${sortedIds[0]}-${sortedIds[1]}`;
}
