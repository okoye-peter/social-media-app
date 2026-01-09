"use client"

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronRight, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { deleteFile, uploadFile } from '@/lib/supabase-s3.service'
import axiosInstance from '@/lib/axios'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/stores'

const RegisterComponent = ({ onChangeCard }: { onChangeCard: (card: string) => void }) => {

    const router = useRouter()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        image: ''
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [profilePicture, setProfilePicture] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [profilePictureUrl, setProfilePictureUrl] = useState<string>('')

    // Upload state management
    const [uploadProgress, setUploadProgress] = useState<number>(0)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadAbortController, setUploadAbortController] = useState<AbortController | null>(null)

    // Track registration completion to prevent cleanup on successful registration
    const registrationCompletedRef = useRef(false)

    // Cleanup effect: delete uploaded image if component unmounts without completing registration
    useEffect(() => {
        return () => {
            // Only cleanup if registration wasn't completed and there's an uploaded file
            if (!registrationCompletedRef.current && profilePictureUrl) {
                // Delete the uploaded file asynchronously
                deleteFile(profilePictureUrl).catch((error) => {
                    console.error('Failed to cleanup uploaded file:', error)
                })
            }
        }
    }, [profilePictureUrl])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]

        // Cancel any ongoing upload
        if (uploadAbortController) {
            uploadAbortController.abort()
            setUploadAbortController(null)
        }

        // Delete previous file if exists
        if (profilePictureUrl) {
            try {
                await deleteProfilePicture()
            } catch (error) {
                console.error('Error deleting previous file:', error)
            }
        }

        if (file) {
            setProfilePicture(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string)
            }
            reader.readAsDataURL(file)

            // Upload the file
            uploadProfilePicture(file)
        }
    }

    const uploadProfilePicture = async (file: File): Promise<string> => {
        // Create new abort controller
        const abortController = new AbortController()
        setUploadAbortController(abortController)
        setIsUploading(true)
        setUploadProgress(0)

        try {
            const result = await uploadFile(file, {
                folder: 'uploads',
                onProgress: (progress) => {
                    setUploadProgress(progress)
                },
                signal: abortController.signal
            })

            setProfilePictureUrl(result.url)
            setIsUploading(false)
            setUploadProgress(100)
            toast.success('Profile picture uploaded successfully!')
            return result.url
        } catch (error) {
            setIsUploading(false)
            setUploadProgress(0)
            setUploadAbortController(null)

            if ((error as Error).message === 'Upload cancelled') {
                toast.info('Upload cancelled')
            } else {
                toast.error('Failed to upload profile picture')
                console.error('Upload error:', error)
            }
            throw error
        }
    }

    const deleteProfilePicture = async (): Promise<void> => {
        if (!profilePictureUrl) {
            return
        }

        try {
            await deleteFile(profilePictureUrl)
            setProfilePictureUrl('')
            setPreviewUrl('')
            setProfilePicture(null)
            setUploadProgress(0)
        } catch (error) {
            console.error('Delete error:', error)
            throw error
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()

        // Prevent submission if upload is in progress
        if (isUploading) {
            toast.error('Please wait for the profile picture upload to complete')
            return
        }

        if (!formData.name || !formData.email || !formData.password || !formData.password_confirmation) {
            toast.error('All fields are required!')
            return
        }

        if (formData.password !== formData.password_confirmation) {
            toast.error('Passwords do not match!')
            return
        }

        setLoading(true)

        try {
            const {data} = await axiosInstance.post('/guest/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                image: profilePictureUrl
            })
            
            useUserStore.setState({user: data.user})
            
            // Mark registration as completed to prevent cleanup
            registrationCompletedRef.current = true

            router.replace('/feeds');
        } catch (error) {
            toast.error('Registration failed!')
        } finally {
            setLoading(false)
        }
        // TODO: Implement registration logic
        // console.log('Register with:', formData, profilePicture)
    }

    const handleGoogleRegister = () => {
        // Redirect to Google OAuth - this will redirect the browser to Google's auth page
        window.location.href = '/api/auth/google'
    }

    const handleGithubRegister = () => {
        // Redirect to GitHub OAuth - this will redirect the browser to GitHub's auth page
        window.location.href = '/api/auth/github'
    }

    return (
        <div className="flex items-center justify-center">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
                {/* Header */}
                <div className="text-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        Create your account
                    </h1>
                    <p className="text-sm text-gray-600">
                        Join Konnect and start connecting
                    </p>
                </div>

                {/* OAuth Buttons */}
                <div className="space-y-2 mb-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-10 text-sm font-medium hover:bg-gray-50 transition-colors"
                        onClick={handleGoogleRegister}
                    >
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 text-base font-medium hover:bg-gray-50 transition-colors"
                        onClick={handleGithubRegister}
                    >
                        <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        Continue with GitHub
                    </Button>
                </div>

                {/* Divider */}
                <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500">or</span>
                    </div>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleRegister} className="space-y-3">
                    {/* Profile Picture Upload */}
                    <div>
                        <Label className="text-xs font-semibold text-gray-700 mb-1 block">
                            Profile Picture (Optional)
                        </Label>
                        <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center overflow-hidden relative">
                                {previewUrl ? (
                                    <Image src={previewUrl} alt="Preview" width={64} height={64} className="w-full h-full object-cover" />
                                ) : (
                                    <Upload className="w-6 h-6 text-gray-400" />
                                )}
                                {isUploading && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                        <div className="text-white text-xs font-bold">{Math.round(uploadProgress)}%</div>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="picture"
                                    disabled={isUploading}
                                />
                                <Label
                                    htmlFor="picture"
                                    className={`cursor-pointer inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium bg-white transition-colors ${isUploading
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {isUploading ? 'Uploading...' : 'Choose File'}
                                </Label>
                            </div>
                        </div>
                        {/* Progress Bar */}
                        {isUploading && (
                            <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-linear-to-r from-indigo-600 to-purple-600 h-full transition-all duration-300 ease-out"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Uploading... {Math.round(uploadProgress)}%
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Name */}
                    <div>
                        <Label htmlFor="name" className="text-xs font-semibold text-gray-700 mb-1 block">
                            Full Name
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="h-10 text-sm"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <Label htmlFor="email" className="text-xs font-semibold text-gray-700 mb-1 block">
                            Email address
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email address"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="h-12 text-base"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <Label htmlFor="password" className="text-xs font-semibold text-gray-700 mb-1 block">
                            Password
                        </Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            className="h-12 text-base"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <Label htmlFor="password_confirmation" className="text-xs font-semibold text-gray-700 mb-1 block">
                            Confirm Password
                        </Label>
                        <Input
                            id="password_confirmation"
                            name="password_confirmation"
                            type="password"
                            placeholder="Confirm your password"
                            value={formData.password_confirmation}
                            onChange={handleInputChange}
                            required
                            className="h-12 text-base"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading || isUploading}
                        className="w-full h-10 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm rounded-lg shadow-lg hover:shadow-xl transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading ? 'Uploading picture...' : loading ? 'Creating account...' : 'Create Account'}
                        {!loading && !isUploading && <ChevronRight className="ml-2 w-5 h-5" />}
                    </Button>
                </form>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Button variant={'link'} onClick={() => onChangeCard('login')} className="text-indigo-600 hover:text-indigo-700 font-semibold">
                            Sign in
                        </Button>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default RegisterComponent
