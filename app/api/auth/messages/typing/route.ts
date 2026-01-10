import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { triggerPusherEvent } from '@/lib/pusher';
import { getPusherChannelName } from '@/lib/utils';

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { receiverId, isTyping } = await req.json();

        if (!receiverId) {
            return NextResponse.json({ message: 'Receiver ID is required' }, { status: 400 });
        }

        const channelName = getPusherChannelName(user.id, receiverId);

        await triggerPusherEvent(channelName, 'user-typing', {
            userId: user.id,
            userName: user.name,
            isTyping: isTyping
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error triggering typing event:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
