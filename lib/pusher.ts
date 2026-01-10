// lib/pusher.ts - Server-side Pusher instance
import Pusher from 'pusher';

// Singleton pattern to prevent multiple instances
let pusherInstance: Pusher | null = null;

export const getPusherInstance = () => {
    if (!pusherInstance) {
        pusherInstance = new Pusher({
            appId: process.env.PUSHER_APP_ID!,
            key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
            secret: process.env.PUSHER_SECRET!,
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
            useTLS: true,
        });
    }
    return pusherInstance;
};

// Helper function to trigger events
export const triggerPusherEvent = async (
    channel: string,
    event: string,
    data: unknown
) => {
    const pusher = getPusherInstance();
    try {
        await pusher.trigger(channel, event, data);
        return { success: true };
    } catch (error) {
        console.error('Pusher trigger error:', error);
        throw error;
    }
};

// Helper for batch triggers
export const triggerMultipleEvents = async (
    events: Array<{ channel: string; event: string; data: unknown }>
) => {
    const pusher = getPusherInstance();
    try {
        await pusher.triggerBatch(
            events.map(e => ({
                channel: e.channel,
                name: e.event,
                data: e.data,
            }))
        );
        return { success: true };
    } catch (error) {
        console.error('Pusher batch trigger error:', error);
        throw error;
    }
};