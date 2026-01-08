import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteFile, uploadFile } from "@/lib/supabase-s3.service";
import { NextRequest, NextResponse } from "next/server";
import * as Sentry from '@sentry/nextjs';


export const PUT = async (req: NextRequest) => {
    try {
        const user = await getCurrentUser()

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        const formData = await req.formData()
        const username = formData.get('username') as string
        const name = formData.get('name') as string
        const bio = formData.get('bio') as string
        const location = formData.get('location') as string
        const coverImageFile = formData.get('coverImage') as File | null
        const imageFile = formData.get('image') as File | null

        let imageUrl = user.image;
        let coverImageUrl = user.coverImage;

        if (imageFile && imageFile.size > 0) {
            const { url } = await uploadFile(imageFile, {
                folder: 'profile_picture'
            })
            if (!url) return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
            if (imageUrl) deleteFile(imageUrl)
            imageUrl = url
        }

        if (coverImageFile && coverImageFile.size > 0) {
            const { url } = await uploadFile(coverImageFile, {
                folder: 'user_cover_photo'
            })
            if (!url) return NextResponse.json({ error: 'Failed to upload cover image' }, { status: 500 })
            if (coverImageUrl) deleteFile(coverImageUrl)
            coverImageUrl = url
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                username,
                name,
                bio,
                location,
                image: imageUrl,
                coverImage: coverImageUrl
            }
        })

        return NextResponse.json({
            message: 'user profile updated successfully',
            updatedUser
        }, {
            status: 200
        })
    } catch (error) {
        console.log(error)
        Sentry.captureException(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}