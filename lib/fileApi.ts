/**
 * File Management API Client
 * Helper functions for uploading and deleting files
 */

export interface UploadResult {
    success: boolean;
    url: string;
    type: string;
    path: string;
}

export interface DeleteResult {
    success: boolean;
    result: boolean;
}

export interface BatchDeleteResult {
    success: boolean;
    deletedCount: number;
    result: boolean;
}

/**
 * Upload a single file to the server
 * @param file - File object to upload
 * @param folder - Optional folder name (defaults to 'uploads' on server)
 * @returns Upload result with URL, type, and path
 */
export async function uploadFile(file: File, folder?: string): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload file');
    }

    return await response.json();
}

/**
 * Delete a single file from the server
 * @param link - File URL or path to delete
 * @returns Delete result
 */
export async function deleteFile(link: string): Promise<DeleteResult> {
    const formData = new FormData();
    formData.append('link', link);

    const response = await fetch('/api/files', {
        method: 'DELETE',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete file');
    }

    return await response.json();
}

/**
 * Delete multiple files from the server
 * @param links - Array of file URLs or paths to delete
 * @returns Batch delete result
 */
export async function deleteMultipleFiles(links: string[]): Promise<BatchDeleteResult> {
    const response = await fetch('/api/files/batch', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ links }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete files');
    }

    return await response.json();
}

/**
 * Upload multiple files sequentially
 * @param files - Array of File objects to upload
 * @param folder - Optional folder name
 * @returns Array of upload results
 */
export async function uploadMultipleFiles(
    files: File[],
    folder?: string
): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (const file of files) {
        const result = await uploadFile(file, folder);
        results.push(result);
    }

    return results;
}

/**
 * Upload multiple files in parallel
 * @param files - Array of File objects to upload
 * @param folder - Optional folder name
 * @returns Array of upload results
 */
export async function uploadMultipleFilesParallel(
    files: File[],
    folder?: string
): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => uploadFile(file, folder));
    return await Promise.all(uploadPromises);
}
