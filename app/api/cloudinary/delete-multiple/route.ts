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
        const { publicIds } = await request.json();

        if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
            return NextResponse.json(
                { error: 'Missing or invalid publicIds parameter' },
                { status: 400 }
            );
        }

        // Delete multiple files from Cloudinary using individual API calls
        const results = await Promise.allSettled(
            publicIds.map(async (publicId) => {
                const timestamp = Math.floor(Date.now() / 1000);

                const params = {
                    public_id: publicId,
                    timestamp: timestamp,
                };

                const signature = generateSignature(params);

                const formData = new URLSearchParams();
                formData.append('public_id', publicId);
                formData.append('timestamp', timestamp.toString());
                formData.append('api_key', API_KEY);
                formData.append('signature', signature);

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
                    throw new Error(`Failed to delete ${publicId}: ${result.result || result.error?.message}`);
                }

                return result;
            })
        );

        // Check if any deletions failed
        const failures = results.filter((result) => result.status === 'rejected');

        if (failures.length > 0) {
            console.warn(`${failures.length} out of ${publicIds.length} deletions failed`);
        }

        return NextResponse.json({
            success: true,
            total: publicIds.length,
            succeeded: results.length - failures.length,
            failed: failures.length
        });
    } catch (error) {
        console.error('Error deleting files from Cloudinary:', error);
        return NextResponse.json(
            { error: 'Failed to delete files', message: (error as Error).message },
            { status: 500 }
        );
    }
}
