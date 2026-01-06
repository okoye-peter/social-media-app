/**
 * Example usage of Supabase Storage Service
 * This file demonstrates how to use the upload and delete functions
 */

import { uploadFile, deleteFile, deleteMultipleFiles } from './supabase-s3.service';

/**
 * Example 1: Upload a profile picture
 */
export async function uploadProfilePicture(file: File) {
    try {
        const result = await uploadFile(file, { folder: 'avatars' });

        return {
            success: true,
            data: {
                url: result.url,
                path: result.path,
                type: result.type,
            },
        };
    } catch (error) {
        console.error('Failed to upload profile picture:', error);
        return {
            success: false,
            error: (error as Error).message,
        };
    }
}

/**
 * Example 2: Upload post images (multiple files)
 */
export async function uploadPostImages(files: File[]) {
    try {
        const uploadPromises = files.map(file => uploadFile(file, { folder: 'posts' }));
        const results = await Promise.all(uploadPromises);

        return {
            success: true,
            data: results.map(r => ({
                url: r.url,
                path: r.path,
                type: r.type,
            })),
        };
    } catch (error) {
        console.error('Failed to upload post images:', error);
        return {
            success: false,
            error: (error as Error).message,
        };
    }
}

/**
 * Example 3: Upload message media
 */
export async function uploadMessageMedia(file: File) {
    try {
        const result = await uploadFile(file, { folder: 'messages' });

        return {
            success: true,
            data: {
                url: result.url,
                path: result.path,
                type: result.type,
            },
        };
    } catch (error) {
        console.error('Failed to upload message media:', error);
        return {
            success: false,
            error: (error as Error).message,
        };
    }
}

/**
 * Example 4: Delete a file using URL (from database)
 */
export async function deleteUploadedFile(fileUrl: string) {
    try {
        // Works with both URLs and paths!
        await deleteFile(fileUrl);
        return { success: true };
    } catch (error) {
        console.error('Failed to delete file:', error);
        return {
            success: false,
            error: (error as Error).message,
        };
    }
}

/**
 * Example 5: Delete old profile picture when uploading new one
 */
export async function updateProfilePicture(
    newFile: File,
    oldFileUrl?: string
) {
    try {
        // Delete old picture if exists (using URL from database)
        if (oldFileUrl) {
            await deleteFile(oldFileUrl);
        }

        // Upload new picture
        const result = await uploadFile(newFile, { folder: 'avatars' });

        return {
            success: true,
            data: {
                url: result.url,
                path: result.path,
                type: result.type,
            },
        };
    } catch (error) {
        console.error('Failed to update profile picture:', error);
        return {
            success: false,
            error: (error as Error).message,
        };
    }
}

/**
 * Example 6: Delete all media from a post (using URLs from database)
 */
export async function deletePostMedia(mediaUrls: string[]) {
    try {
        // Works with URLs too!
        await deleteMultipleFiles(mediaUrls);
        return { success: true };
    } catch (error) {
        console.error('Failed to delete post media:', error);
        return {
            success: false,
            error: (error as Error).message,
        };
    }
}
