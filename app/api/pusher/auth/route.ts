import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getPusherInstance } from '@/lib/pusher';

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.text();
        const params = new URLSearchParams(body);
        const socketId = params.get('socket_id');
        const channelName = params.get('channel_name');

        if (!socketId || !channelName) {
            return NextResponse.json({ message: 'Missing socket_id or channel_name' }, { status: 400 });
        }

        // Verify user has access to this channel
        // Channel format: "private-user-{userId1}-{userId2}"
        const channelParts = channelName.split('-');
        if (channelParts.length !== 4 || channelParts[0] !== 'private' || channelParts[1] !== 'user') {
            return NextResponse.json({ message: 'Invalid channel name' }, { status: 403 });
        }

        const userId1 = parseInt(channelParts[2]);
        const userId2 = parseInt(channelParts[3]);

        // User must be one of the participants
        if (user.id !== userId1 && user.id !== userId2) {
            return NextResponse.json({ message: 'Unauthorized access to channel' }, { status: 403 });
        }

        // Authenticate the channel
        const pusher = getPusherInstance();
        const authResponse = pusher.authorizeChannel(socketId, channelName);

        return NextResponse.json(authResponse);

    } catch (error) {
        console.error('Pusher auth error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
