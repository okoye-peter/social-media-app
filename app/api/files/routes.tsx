import { deleteFile, uploadFile } from '@/lib/supabase-s3.service';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Upload the file directly (it's already a File object from formData)
        const result = await uploadFile(file, { folder: 'uploads' });

        return NextResponse.json({
            success: true,
            url: result.url,
            type: result.type,
            path: result.path
        }, { status: 200 });

    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const formData = await request.formData();
        const link = formData.get('link');

        if (!link || typeof link !== 'string') {
            return NextResponse.json({ error: 'No file link provided' }, { status: 400 });
        }

        // Delete the file using the provided link
        const result = await deleteFile(link);

        return NextResponse.json({
            success: true,
            result
        }, { status: 200 });

    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}
