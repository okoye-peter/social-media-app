"use client"

import { dummyUserData } from '@/public/deleteLater/assets'
import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { Camera } from 'lucide-react'
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

interface EditUserProfileModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const EditUserProfileModal = ({ open, onOpenChange }: EditUserProfileModalProps) => {
    const user = dummyUserData

    const [editForm, setEditForm] = useState({
        username: user.username,
        full_name: user.full_name,
        bio: user.bio,
        profile_picture: user.profile_picture,
        location: user.location,
        cover_photo: user.cover_photo
    })

    const [profilePreview, setProfilePreview] = useState<string | null>(null)
    const [coverPreview, setCoverPreview] = useState<string | null>(null)
    const profileInputRef = useRef<HTMLInputElement>(null)
    const coverInputRef = useRef<HTMLInputElement>(null)

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
        }
    }

    const handleSave = () => {
        // TODO: Implement save logic here
        console.log('Saving profile:', editForm)
        onOpenChange(false)
    }

    const handleCancel = () => {
        // Reset form to original values
        setEditForm({
            username: user.username,
            full_name: user.full_name,
            bio: user.bio,
            profile_picture: user.profile_picture,
            location: user.location,
            cover_photo: user.cover_photo
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
                                src={profilePreview || editForm.profile_picture as string}
                                alt="Profile"
                                width={96}
                                height={96}
                                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                            />
                            <button
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
                                src={coverPreview || editForm.cover_photo as string}
                                alt="Cover"
                                width={352}
                                height={176}
                                className="w-full h-44 rounded-xl object-cover border-2 border-gray-200"
                            />
                            <button
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
                            id="full_name"
                            name="full_name"
                            type="text"
                            value={editForm.full_name}
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
                            id="username"
                            name="username"
                            type="text"
                            value={editForm.username}
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
                            id="bio"
                            name="bio"
                            value={editForm.bio}
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
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    >
                        Save Changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default EditUserProfileModal