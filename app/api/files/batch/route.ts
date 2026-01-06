import { deleteMultipleFiles } from '@/lib/supabase-s3.service';
import { NextRequest, NextResponse } from 'next/server';

/**
 * DELETE /api/files/batch
 * Delete multiple files at once
 * 
 * Request body (JSON):
 * {
 *   "links": ["url1", "url2", "url3", ...]
 * }
 */
export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { links } = body;

        // Validate that links is an array of strings
        if (!links || !Array.isArray(links)) {
            return NextResponse.json(
                { error: 'Invalid request: "links" must be an array of urls' },
                { status: 400 }
            );
        }

        if (links.length === 0) {
            return NextResponse.json(
                { error: 'No file links provided' },
                { status: 400 }
            );
        }

        // Validate that all items in the array are strings
        const invalidLinks = links.filter(link => typeof link !== 'string');
        if (invalidLinks.length > 0) {
            return NextResponse.json(
                { error: 'All links must be strings' },
                { status: 400 }
            );
        }

        // Delete multiple files
        const result = await deleteMultipleFiles(links);

        return NextResponse.json({
            success: true,
            deletedCount: links.length,
            result
        }, { status: 200 });

    } catch (error) {
        console.error('Error deleting multiple files:', error);
        return NextResponse.json(
            {
                error: 'Failed to delete files',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
