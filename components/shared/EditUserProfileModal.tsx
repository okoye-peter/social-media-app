"use client"

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { Camera, Loader2 } from 'lucide-react'
import { AxiosError } from 'axios'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import axiosInstance from '@/lib/axios'
import { toast } from 'sonner'
import { useUserStore } from '@/stores'
import { EditUserProfileModalProps } from '@/types'
import { getAvatarUrl } from '@/lib/utils'

const EditUserProfileModal = ({ open, onOpenChange, user }: EditUserProfileModalProps) => {


    const [editForm, setEditForm] = useState({
        username: user.username || '',
        name: user.name || '',
        bio: user.bio || '',
        image: user.image || getAvatarUrl(user.name),
        location: user.location || '',
        coverImage: user.coverImage || '/cover_photo_default.jpeg'
    })

    const [profilePreview, setProfilePreview] = useState<string | null>(null)
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
    const [coverPreview, setCoverPreview] = useState<string | null>(null)
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
    const profileInputRef = useRef<HTMLInputElement>(null)
    const coverInputRef = useRef<HTMLInputElement>(null);
    const [isUpdating, setIsUpdating] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        })
    }

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setProfilePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
            setProfileImageFile(file)
        }
    }

    const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setCoverPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
            setCoverImageFile(file)
        }
    }

    const handleSave = async () => {
        // TODO: Implement save logic here
        const formData = new FormData()
        formData.append('username', editForm.username)
        formData.append('name', editForm.name)
        formData.append('bio', editForm.bio)
        formData.append('location', editForm.location)
        if (coverImageFile) formData.append('coverImage', coverImageFile as File)
        if (profileImageFile) formData.append('image', profileImageFile as File)


        setIsUpdating(true)
        try {
            const { data } = await axiosInstance.put(`/auth/users`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            useUserStore.setState({ user: data.updatedUser })
            onOpenChange(false)
        } catch (error) {
            const errorMessage = error instanceof AxiosError && error.response?.data?.error
                ? error.response.data.error
                : 'Failed to update profile. Please try again.'
            toast.error(errorMessage)
        } finally {
            setIsUpdating(false)
        }
    }

    const handleCancel = () => {
        // Reset form to original values
        setEditForm({
            username: user.username || '',
            name: user.name || '',
            bio: user.bio || '',
            image: user.image || '',
            location: user.location || '',
            coverImage: user.coverImage || ''
        })
        setProfilePreview(null)
        setCoverPreview(null)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger>
                Edit Profile
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Edit Profile</DialogTitle>
                    <DialogDescription>
                        Update your profile information including profile picture, cover photo, bio, and location.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Profile Picture */}
                    <div>
                        <Label className="text-sm font-medium text-gray-700">Profile Picture</Label>
                        <div className="mt-2 relative w-24 h-24">
                            <Image
                                src={profilePreview || editForm.image as string}
                                alt="Profile"
                                width={96}
                                height={96}
                                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                            />
                            <button
                                disabled={isUpdating}
                                type="button"
                                onClick={() => profileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 shadow-lg transition-colors"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                            <input
                                ref={profileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleProfilePictureChange}
                            />
                        </div>
                    </div>

                    {/* Cover Photo */}
                    <div>
                        <Label className="text-sm font-medium text-gray-700">Cover Photo</Label>
                        <div className="mt-2 relative w-full max-w-sm">
                            <Image
                                src={coverPreview || editForm.coverImage as string}
                                alt="Cover"
                                width={352}
                                height={176}
                                className="w-full h-44 rounded-xl object-cover border-2 border-gray-200"
                            />
                            <button
                                disabled={isUpdating}
                                type="button"
                                onClick={() => coverInputRef.current?.click()}
                                className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 shadow-lg transition-colors"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                            <input
                                ref={coverInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleCoverPhotoChange}
                            />
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
                            Name
                        </Label>
                        <Input
                            disabled={isUpdating}
                            id="full_name"
                            name="full_name"
                            type="text"
                            value={editForm.name}
                            onChange={handleInputChange}
                            className="mt-1"
                            placeholder="Enter your full name"
                        />
                    </div>

                    {/* Username */}
                    <div>
                        <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                            Username
                        </Label>
                        <Input
                            disabled={isUpdating}
                            id="username"
                            name="username"
                            type="text"
                            value={editForm.username as string || ''}
                            onChange={handleInputChange}
                            className="mt-1"
                            placeholder="Enter your username"
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                            Bio
                        </Label>
                        <Textarea
                            disabled={isUpdating}
                            id="bio"
                            name="bio"
                            value={editForm.bio as string || ''}
                            onChange={handleInputChange}
                            className="mt-1 resize-none"
                            rows={4}
                            placeholder="Tell us about yourself..."
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                            Location
                        </Label>
                        <Input
                            disabled={isUpdating}
                            id="location"
                            name="location"
                            type="text"
                            value={editForm.location || ''}
                            onChange={handleInputChange}
                            className="mt-1"
                            placeholder="Enter your location"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="px-6"
                        disabled={isUpdating}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="px-6 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white flex items-center justify-center"
                        disabled={isUpdating}
                    >
                        {
                            isUpdating
                                ?
                                <>
                                    <Loader2 className='animate-spin' /> Saving...
                                </>
                                :
                                'Save Changes'
                        }
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default EditUserProfileModal