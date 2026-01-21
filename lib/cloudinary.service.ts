/**
 * Cloudinary Upload Service
 * Provides file upload, deletion, and management functionality using Cloudinary
 */

// Environment variables
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Missing Cloudinary environment variables: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET are required');
}

/**
 * Upload result interface
 */
interface UploadResult {
    url: string;
    type: string;
    path: string; // Cloudinary public_id
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
 * Upload options interface
 */
export interface UploadOptions {
    folder?: string;
    maxRetries?: number;
    onProgress?: (progress: number) => void;
    signal?: AbortSignal;
}

/**
 * Check if running in server environment
 */
function isServer(): boolean {
    return typeof window === 'undefined';
}

/**
 * Server-side upload using fetch (for API routes)
 */
async function uploadFileServer(
    file: File,
    options: UploadOptions = {}
): Promise<UploadResult> {
    const { folder, maxRetries = 3 } = options;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

            if (folder) {
                formData.append('folder', folder);
            }

            const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
            const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

            const response = await fetch(uploadUrl, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Upload failed');
            }

            const result = await response.json();

            return {
                url: result.secure_url,
                type: getFileType(file),
                path: result.public_id,
            };
        } catch (error) {
            lastError = error as Error;
            console.error(`Upload attempt ${attempt} failed:`, error);

            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt - 1) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw new Error(
        `Failed to upload file after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`
    );
}


/**
 * Upload file to Cloudinary with retry logic, progress tracking, and cancellation support
 * Automatically detects server/client environment and uses appropriate method
 * @param file - File to upload
 * @param options - Upload options
 * @returns Upload result with URL, type, and public_id
 */
export async function uploadFile(
    file: File,
    options: UploadOptions = {}
): Promise<UploadResult> {
    // Use server-side upload if running in Node.js environment
    if (isServer()) {
        return uploadFileServer(file, options);
    }

    // Client-side upload with XMLHttpRequest for progress tracking
    const { folder, maxRetries = 3, onProgress, signal } = options;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Check if upload was cancelled
            if (signal?.aborted) {
                throw new Error('Upload cancelled');
            }

            // Create form data
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

            // Only add folder if specified
            if (folder) {
                formData.append('folder', folder);
            }

            // Determine resource type
            const resourceType = file.type.startsWith('video/') ? 'video' : 'image';

            // Upload URL
            const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

            // Use XMLHttpRequest for real progress tracking
            const result = await new Promise<UploadResult>((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                // Handle abort signal
                if (signal) {
                    signal.addEventListener('abort', () => {
                        xhr.abort();
                        reject(new Error('Upload cancelled'));
                    });
                }

                // Track upload progress
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable && onProgress) {
                        const progress = (event.loaded / event.total) * 100;
                        onProgress(progress);
                    }
                });

                // Handle completion
                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const response = JSON.parse(xhr.responseText);

                            if (onProgress) {
                                onProgress(100);
                            }

                            resolve({
                                url: response.secure_url,
                                type: getFileType(file),
                                path: response.public_id,
                            });
                        } catch {
                            reject(new Error('Failed to parse upload response'));
                        }
                    } else {
                        try {
                            const errorResponse = JSON.parse(xhr.responseText);
                            reject(new Error(errorResponse.error?.message || 'Upload failed'));
                        } catch {
                            reject(new Error(`Upload failed with status ${xhr.status}`));
                        }
                    }
                });

                // Handle errors
                xhr.addEventListener('error', () => {
                    reject(new Error('Network error during upload'));
                });

                xhr.addEventListener('abort', () => {
                    reject(new Error('Upload cancelled'));
                });

                // Send request
                xhr.open('POST', uploadUrl);
                xhr.send(formData);
            });

            return result;
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
 * Extract public_id from Cloudinary URL
 * @param url - Cloudinary URL
 * @returns public_id
 */
export function extractPublicIdFromUrl(url: string): string {
    try {
        // URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/v{version}/{public_id}.{format}
        // or: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{public_id}.{format}
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');

        // Find 'upload' in the path
        const uploadIndex = pathParts.indexOf('upload');
        if (uploadIndex === -1) {
            throw new Error('Invalid Cloudinary URL: "upload" not found in path');
        }

        // Get everything after 'upload'
        const afterUpload = pathParts.slice(uploadIndex + 1);

        // Remove version if present (starts with 'v' followed by numbers)
        const startIndex = afterUpload[0]?.match(/^v\d+$/) ? 1 : 0;

        // Join the remaining parts and remove file extension
        const publicIdWithExt = afterUpload.slice(startIndex).join('/');
        const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.')) || publicIdWithExt;

        if (!publicId) {
            throw new Error('Invalid Cloudinary URL: no public_id found');
        }

        return publicId;
    } catch (error) {
        throw new Error(`Failed to extract public_id from URL: ${(error as Error).message}`);
    }
}

/**
 * Delete file from Cloudinary
 * Note: This requires server-side API key/secret for authenticated deletion
 * For client-side, you'll need to implement a server endpoint
 * @param publicIdOrUrl - Public ID or Cloudinary URL
 * @returns True if deletion was successful
 */
export async function deleteFile(publicIdOrUrl: string): Promise<boolean> {
    try {
        // Extract public_id if URL is provided
        const publicId = publicIdOrUrl.startsWith('http')
            ? extractPublicIdFromUrl(publicIdOrUrl)
            : publicIdOrUrl;

        // Call your server endpoint to delete the file
        // This is a placeholder - you need to implement the server endpoint
        const response = await fetch('/api/cloudinary/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ publicId }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete file');
        }

        return true;
    } catch (error) {
        console.error('Failed to delete file:', error);
        throw new Error(`Failed to delete file: ${(error as Error).message}`);
    }
}

/**
 * Delete multiple files from Cloudinary
 * @param publicIdsOrUrls - Array of public IDs or Cloudinary URLs
 * @returns True if all deletions were successful
 */
export async function deleteMultipleFiles(publicIdsOrUrls: string[]): Promise<boolean> {
    try {
        // Convert all URLs to public_ids
        const publicIds = publicIdsOrUrls.map(idOrUrl =>
            idOrUrl.startsWith('http')
                ? extractPublicIdFromUrl(idOrUrl)
                : idOrUrl
        );

        // Call your server endpoint to delete multiple files
        const response = await fetch('/api/cloudinary/delete-multiple', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ publicIds }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete files');
        }

        return true;
    } catch (error) {
        console.error('Failed to delete files:', error);
        throw new Error(`Failed to delete files: ${(error as Error).message}`);
    }
}

/**
 * Get public URL for a file (if you have the public_id)
 * @param publicId - Public ID of the file
 * @param resourceType - Type of resource ('image' or 'video')
 * @returns Public URL
 */
export function getPublicUrl(publicId: string, resourceType: 'image' | 'video' = 'image'): string {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload/${publicId}`;
}
