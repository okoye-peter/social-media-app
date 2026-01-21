import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const API_KEY = process.env.CLOUDINARY_API_KEY!;
const API_SECRET = process.env.CLOUDINARY_API_SECRET!;

/**
 * Generate SHA-1 signature for Cloudinary API authentication
 */
function generateSignature(params: Record<string, string | number>): string {
    // Sort parameters alphabetically
    const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&');

    // Create signature: SHA1(sorted_params + api_secret)
    return crypto
        .createHash('sha1')
        .update(sortedParams + API_SECRET)
        .digest('hex');
}

export async function POST(request: NextRequest) {
    try {
        const { publicId } = await request.json();

        if (!publicId) {
            return NextResponse.json(
                { error: 'Missing publicId parameter' },
                { status: 400 }
            );
        }

        // Generate timestamp
        const timestamp = Math.floor(Date.now() / 1000);

        // Parameters for deletion
        const params = {
            public_id: publicId,
            timestamp: timestamp,
        };

        // Generate signature
        const signature = generateSignature(params);

        // Create form data for the API request
        const formData = new URLSearchParams();
        formData.append('public_id', publicId);
        formData.append('timestamp', timestamp.toString());
        formData.append('api_key', API_KEY);
        formData.append('signature', signature);

        // Call Cloudinary destroy API
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
            }
        );

        const result = await response.json();

        if (!response.ok || (result.result !== 'ok' && result.result !== 'not found')) {
            throw new Error(`Cloudinary deletion failed: ${result.result || result.error?.message}`);
        }

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
        return NextResponse.json(
            { error: 'Failed to delete file', message: (error as Error).message },
            { status: 500 }
        );
    }
}
