import { inngest } from "./client";
import { triggerPusherEvent } from "@/lib/pusher";
import { prisma } from "@/lib/db";

export const helloWorld = inngest.createFunction(
    { id: "hello-world" },
    { event: "test/hello.world" },
    async ({ event, step }) => {
        await step.sleep("wait-a-moment", "1s");
        return { message: `Hello ${event.data.email}!` };
    },
);

// Message broadcasting function with Pusher
export const broadcastMessage = inngest.createFunction(
    {
        id: "broadcast-message",
        retries: 3,
    },
    { event: "message/sent" },
    async ({ event, step }) => {
        const { messageId, channelName } = event.data;

        // Step 1: Fetch the complete message with relations
        const message = await step.run("fetch-message", async () => {
            return await prisma.message.findUnique({
                where: { id: messageId },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true
                        }
                    },
                    receiver: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true
                        }
                    },
                    messageMedia: true
                }
            });
        });

        if (!message) {
            throw new Error(`Message ${messageId} not found`);
        }

        // Step 2: Broadcast via Pusher
        await step.run("broadcast-pusher", async () => {
            await triggerPusherEvent(channelName, "new-message", message);
        });

        // Step 3: Optional - Send push notification (placeholder for future)
        // await step.run("send-push-notification", async () => {
        //     // Implement push notification logic here
        // });

        return { success: true, messageId };
    }
);