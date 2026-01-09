"use client"

import ThemedButton from '@/components/shared/ThemedButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { dummyUserData } from '@/public/deleteLater/assets';
import { uploadFile, deleteFile, UploadOptions } from '@/lib/supabase-s3.service';

import { ImageIcon, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import React, { useRef, useState, useEffect } from 'react'
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { MediaType, FileWithId } from '@/types/pages'


const CreatePost = () => {
    const router = useRouter()

    const user = dummyUserData
    const [content, setContent] = useState('');
    const [uploadedMedia, setUploadedMedia] = useState<MediaType[]>([]);
    const [filesWithIds, setFilesWithIds] = useState<FileWithId[]>([]);
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [fileError, setFileError] = useState<string>('');
    const [uploadProgress, setUploadProgress] = useState<Map<string, number>>(new Map());
    const [postSubmitted, setPostSubmitted] = useState(false);
    const postSubmittedRef = useRef(false);
    const uploadedMediaRef = useRef<MediaType[]>([]);
    const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
    const refFileInput = useRef<HTMLInputElement>(null)

    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes

    // Keep refs in sync with state
    useEffect(() => {
        postSubmittedRef.current = postSubmitted;
    }, [postSubmitted]);

    useEffect(() => {
        uploadedMediaRef.current = uploadedMedia;
    }, [uploadedMedia]);

    // Cleanup on unmount - delete files from Supabase if post not submitted
    useEffect(() => {
        return () => {
            // Only cleanup if post was not successfully submitted
            if (!postSubmittedRef.current && uploadedMediaRef.current.length > 0) {
                // Cancel any ongoing uploads
                // eslint-disable-next-line react-hooks/exhaustive-deps
                abortControllersRef.current.forEach(controller => controller.abort());

                // Delete all uploaded files from Supabase
                uploadedMediaRef.current.forEach(async (media) => {
                    try {
                        await deleteFile(media.path);
                        console.log(`Cleaned up orphaned file: ${media.path}`);
                    } catch (error) {
                        console.error(`Failed to cleanup file: ${media.path}`, error);
                    }
                });
            }
        };
    }, []); // Only run cleanup on unmount

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files as FileList);
        const validFiles: File[] = [];
        const rejectedFiles: string[] = [];

        files.forEach((file) => {
            // Validate file type - only images and videos
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');

            if (!isImage && !isVideo) {
                rejectedFiles.push(`${file.name} (invalid type - only images and videos allowed)`);
                return;
            }

            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                rejectedFiles.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB - exceeds 20MB limit)`);
                return;
            }

            validFiles.push(file);
        });

        if (rejectedFiles.length > 0) {
            setFileError(`Rejected files: ${rejectedFiles.join(', ')}`);
            setTimeout(() => setFileError(''), 5000); // Clear error after 5 seconds
        }

        if (validFiles.length > 0) {
            // Create files with unique IDs
            const newFilesWithIds = validFiles.map(file => ({
                file,
                id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
            }));

            // Add to preview state
            setFilesWithIds(prev => [...prev, ...newFilesWithIds]);

            // Upload files to Supabase
            setIsUploading(true);

            for (const { file, id } of newFilesWithIds) {
                await uploadFileToSupabase(file, id);
            }

            setIsUploading(false);
        }

        // Reset the input value to allow selecting the same file again
        if (e.target) {
            e.target.value = '';
        }
    };

    const uploadFileToSupabase = async (file: File, fileId: string) => {
        try {
            // Create abort controller for this upload
            const abortController = new AbortController();
            abortControllersRef.current.set(fileId, abortController);

            // Upload options with progress tracking
            const uploadOptions: UploadOptions = {
                folder: 'posts',
                onProgress: (progress) => {
                    setUploadProgress(prev => new Map(prev).set(fileId, progress));
                },
                signal: abortController.signal
            };

            // Upload to Supabase
            const result = await uploadFile(file, uploadOptions);

            // Add to uploaded media state
            setUploadedMedia(prev => [...prev, {
                url: result.url,
                type: result.type as 'image' | 'video',
                path: result.path
            }]);

            // Remove from progress tracking
            setUploadProgress(prev => {
                const newMap = new Map(prev);
                newMap.delete(fileId);
                return newMap;
            });

            // Remove abort controller
            abortControllersRef.current.delete(fileId);

        } catch (error) {
            console.error('Upload failed:', error);

            // Remove file from preview on error
            setFilesWithIds(prev => prev.filter(f => f.id !== fileId));

            // Remove from progress tracking
            setUploadProgress(prev => {
                const newMap = new Map(prev);
                newMap.delete(fileId);
                return newMap;
            });

            // Show error message
            if ((error as Error).message !== 'Upload cancelled') {
                setFileError(`Failed to upload ${file.name}: ${(error as Error).message}`);
                setTimeout(() => setFileError(''), 5000);
            }
        }
    };

    const handleRemoveFile = async (index: number) => {
        const fileToRemove = filesWithIds[index];
        const mediaToRemove = uploadedMedia[index];

        // Cancel upload if still in progress
        const abortController = abortControllersRef.current.get(fileToRemove.id);
        if (abortController) {
            abortController.abort();
            abortControllersRef.current.delete(fileToRemove.id);
        }

        // Remove from progress tracking
        setUploadProgress(prev => {
            const newMap = new Map(prev);
            newMap.delete(fileToRemove.id);
            return newMap;
        });

        // Remove from preview
        setFilesWithIds(prev => prev.filter((_, i) => i !== index));

        // Delete from Supabase if already uploaded
        if (mediaToRemove) {
            try {
                await deleteFile(mediaToRemove.path);
                setUploadedMedia(prev => prev.filter((_, i) => i !== index));
            } catch (error) {
                console.error('Failed to delete file from Supabase:', error);
            }
        }
    };

    const handleSubmit = async () => {
        if (!content && uploadedMedia.length === 0) {
            toast.error('Please add some content or media to your post');
            return;
        }

        setLoading(true);

        try {
            setPostSubmitted(true);

            await axiosInstance.post('/auth/posts', {
                content,
                media: uploadedMedia
            })

            toast.success('Post created successfully!');
            router.push('/feeds');
        } catch (error) {
            setPostSubmitted(false);
            console.error('Failed to create post:', error);
            toast.error('Failed to create post. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='min-h-screen bg-linear-to-b from-slate-50 to-white'>
            <div className="md:max-w-6xl max-w-full mx-auto p-6">
                <div>
                    <h1 className='text-3xl font-bold text-slate-900 mb-2'>Create Post</h1>
                    <p className='text-slate-600'>Share your thoughts with the world</p>
                </div>

                <Card className="max-w-xl mt-6">
                    <CardHeader className="space-y-0 pb-3">
                        <div className='flex items-center gap-3'>
                            <Image src={user.profile_picture as string} alt="profile" className='w-12 h-12 rounded-full shadow' />
                            <div>
                                <h2 className='font-semibold'>{user.full_name}</h2>
                                <p className="text-sm text-gray-500">@{user.username}</p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Textarea */}
                        <Textarea
                            placeholder="What's on your mind?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className='resize-none shadow-none max-h-20 text-sm border-0 placeholder-gray-400 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0'
                        />

                        {/* Files preview with progress */}
                        {
                            filesWithIds.length > 0 && (
                                <div className='flex flex-wrap gap-2'>
                                    {
                                        filesWithIds.map(({ file, id }, index) => {
                                            const progress = uploadProgress.get(id);
                                            const isUploading = progress !== undefined;

                                            return (
                                                <div className='relative group' key={id}>
                                                    {/* File preview */}
                                                    {file.type.startsWith('image/') ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt="post"
                                                            className='w-25 h-25 object-cover rounded-md'
                                                        />
                                                    ) : (
                                                        // Video preview
                                                        <video
                                                            src={URL.createObjectURL(file)}
                                                            className='w-25 h-25 object-cover rounded-md'
                                                        />
                                                    )}

                                                    {/* Upload progress overlay */}
                                                    {isUploading && (
                                                        <div className='absolute inset-0 bg-black/60 rounded-md flex flex-col items-center justify-center'>
                                                            <Loader2 className="w-6 h-6 text-white animate-spin mb-2" />
                                                            <span className='text-white text-xs font-medium'>
                                                                {Math.round(progress)}%
                                                            </span>
                                                            <Progress
                                                                value={progress}
                                                                className='w-20 h-1 mt-2'
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Remove button */}
                                                    <Button
                                                        variant={'ghost'}
                                                        className='absolute hidden group-hover:flex justify-center items-center top-0 right-0 left-0 bg-black/40 hover:bg-black/60 rounded-md cursor-pointer h-25 w-25'
                                                        onClick={() => handleRemoveFile(index)}
                                                    >
                                                        <X className="w-6 h-6 text-white" />
                                                    </Button>
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            )
                        }

                        <Separator className="mt-3" />

                        <div className="flex justify-between items-center">
                            <div className='flex flex-col gap-1'>
                                <Button
                                    onClick={() => refFileInput.current?.click()}
                                    variant={'outline'}
                                    className='flex items-center gap-2 w-fit'
                                    disabled={isUploading}
                                >
                                    <ImageIcon />
                                </Button>
                                <p className='text-xs text-gray-500'>Images & videos only, max 20MB</p>
                            </div>
                            <Input
                                ref={refFileInput}
                                type="file"
                                accept='image/*,video/*'
                                className='hidden'
                                multiple
                                onChange={handleFileChange}
                            />

                            <ThemedButton
                                disabled={loading || isUploading}
                                onClick={handleSubmit}
                                className='w-1/4'
                            >
                                {loading ? 'Publishing...' : isUploading ? 'Uploading...' : 'Publish Post'}
                            </ThemedButton>
                        </div>

                        {/* File error message */}
                        {fileError && (
                            <p className="text-sm text-red-500">{fileError}</p>
                        )}
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}

export default CreatePost