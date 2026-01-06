import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

// Default storage bucket name
const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'uploads';

/**
 * Upload result interface
 */
interface UploadResult {
    url: string;
    type: string;
    path: string;
}

/**
 * Get file type from File object or mime type
 */
function getFileType(file: File): string {
    const mimeType = file.type.toLowerCase();

    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf')) return 'pdf';

    return 'file';
}

/**
 * Generate a unique file path
 */
function generateFilePath(file: File, folder?: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

    const fileName = `${timestamp}-${randomString}-${sanitizedName}`;

    return folder ? `${folder}/${fileName}` : fileName;
}

/**
 * Upload options interface
 */
export interface UploadOptions {
    folder?: string;
    maxRetries?: number;
    onProgress?: (progress: number) => void;
    signal?: AbortSignal;
}

/**
 * Upload file to Supabase Storage with retry logic, progress tracking, and cancellation support
 * @param file - File to upload
 * @param options - Upload options
 * @returns Upload result with URL, type, and path
 */
export async function uploadFile(
    file: File,
    options: UploadOptions = {}
): Promise<UploadResult> {
    const { folder, maxRetries = 3, onProgress, signal } = options;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Check if upload was cancelled
            if (signal?.aborted) {
                throw new Error('Upload cancelled');
            }

            // Generate unique file path
            const filePath = generateFilePath(file, folder);

            // Simulate progress tracking (Supabase doesn't provide native progress yet)
            // We'll use a workaround with XMLHttpRequest or just simulate it
            if (onProgress) {
                onProgress(0);
            }

            // Upload file to Supabase Storage
            const uploadPromise = supabase.storage
                .from(STORAGE_BUCKET)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            // Simulate progress for better UX (since Supabase doesn't expose real progress)
            const progressInterval = setInterval(() => {
                if (onProgress) {
                    // Simulate progress from 10% to 90%
                    const randomProgress = Math.min(90, 10 + Math.random() * 80);
                    onProgress(randomProgress);
                }
            }, 200);

            const { data, error } = await uploadPromise;
            clearInterval(progressInterval);

            if (signal?.aborted) {
                throw new Error('Upload cancelled');
            }

            if (error) {
                throw error;
            }

            if (!data) {
                throw new Error('Upload failed: No data returned');
            }

            // Get public URL
            const { data: publicUrlData } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(data.path);

            if (!publicUrlData?.publicUrl) {
                throw new Error('Failed to get public URL');
            }

            // Get file type
            const fileType = getFileType(file);

            if (onProgress) {
                onProgress(100);
            }

            return {
                url: publicUrlData.publicUrl,
                type: fileType,
                path: data.path,
            };
        } catch (error) {
            lastError = error as Error;

            // If cancelled, don't retry
            if (signal?.aborted || (error as Error).message === 'Upload cancelled') {
                throw new Error('Upload cancelled');
            }

            console.error(`Upload attempt ${attempt} failed:`, error);

            // If this is not the last attempt, wait before retrying
            if (attempt < maxRetries) {
                // Exponential backoff: 1s, 2s, 4s
                const delay = Math.pow(2, attempt - 1) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    // All retries failed
    throw new Error(
        `Failed to upload file after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`
    );
}

/**
 * Extract file path from public URL
 * @param url - Public URL from Supabase Storage
 * @returns File path in storage
 */
export function extractPathFromUrl(url: string): string {
    try {
        // URL format: https://project.supabase.co/storage/v1/object/public/bucket-name/path/to/file.jpg
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');

        // Find the bucket name index and extract everything after it
        const bucketIndex = pathParts.indexOf(STORAGE_BUCKET);
        if (bucketIndex === -1) {
            throw new Error('Invalid Supabase storage URL: bucket not found');
        }

        // Get the path after the bucket name
        const filePath = pathParts.slice(bucketIndex + 1).join('/');

        if (!filePath) {
            throw new Error('Invalid Supabase storage URL: no file path found');
        }

        return filePath;
    } catch (error) {
        throw new Error(`Failed to extract path from URL: ${(error as Error).message}`);
    }
}

/**
 * Delete file from Supabase Storage
 * @param filePathOrUrl - File path or public URL (if URL, path will be extracted automatically)
 * @returns True if deletion was successful
 */
export async function deleteFile(filePathOrUrl: string): Promise<boolean> {
    try {
        // Check if input is a URL or a path
        const filePath = filePathOrUrl.startsWith('http')
            ? extractPathFromUrl(filePathOrUrl)
            : filePathOrUrl;

        const { error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([filePath]);

        if (error) {
            throw error;
        }

        return true;
    } catch (error) {
        console.error('Failed to delete file:', error);
        throw new Error(`Failed to delete file: ${(error as Error).message}`);
    }
}

/**
 * Delete multiple files from Supabase Storage
 * @param filePathsOrUrls - Array of file paths or public URLs (URLs will be converted automatically)
 * @returns True if all deletions were successful
 */
export async function deleteMultipleFiles(filePathsOrUrls: string[]): Promise<boolean> {
    try {
        // Convert all URLs to paths
        const filePaths = filePathsOrUrls.map(pathOrUrl =>
            pathOrUrl.startsWith('http')
                ? extractPathFromUrl(pathOrUrl)
                : pathOrUrl
        );

        const { error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove(filePaths);

        if (error) {
            throw error;
        }

        return true;
    } catch (error) {
        console.error('Failed to delete files:', error);
        throw new Error(`Failed to delete files: ${(error as Error).message}`);
    }
}

/**
 * Get public URL for an existing file
 * @param filePath - Path to the file in storage
 * @returns Public URL
 */
export function getPublicUrl(filePath: string): string {
    const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

    return data.publicUrl;
}
