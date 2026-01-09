import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ConnectionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

export const GET = async (request: NextRequest) => {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const totalFollowers = await prisma.follow.count({
            where: {
                receiverId: user.id
            }
        });

        const totalFollowings = await prisma.follow.count({
            where: {
                senderId: user.id
            }
        });

        const totalConnections = await prisma.connection.count({
            where: {
                OR: [
                    { senderId: user.id },
                    { receiverId: user.id }
                ],
                status: ConnectionStatus.APPROVED
            }
        });

        const totalPending = await prisma.connection.count({
            where: {
                receiverId: user.id,
                status: ConnectionStatus.PENDING
            }
        });

        return NextResponse.json({
            followers: totalFollowers,
            followings: totalFollowings,
            connections: totalConnections,
            pending: totalPending
        });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}