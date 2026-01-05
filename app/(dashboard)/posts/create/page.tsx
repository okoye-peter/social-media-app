"use client"

import ThemedButton from '@/components/shared/ThemedButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { dummyUserData } from '@/public/deleteLater/assets';

import { ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
import React, { useRef, useState } from 'react'

const CreatePost = () => {
    const user = dummyUserData
    const [content, setContent] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [fileError, setFileError] = useState<string>('');
    const refFileInput = useRef<HTMLInputElement>(null)

    const MAX_FILE_SIZE = 35 * 1024 * 1024; // 35MB in bytes

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files as FileList);
        const validFiles: File[] = [];
        const rejectedFiles: string[] = [];

        files.forEach((file) => {
            if (file.size > MAX_FILE_SIZE) {
                rejectedFiles.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
            } else {
                validFiles.push(file);
            }
        });

        if (rejectedFiles.length > 0) {
            setFileError(`Files exceeding 35MB limit: ${rejectedFiles.join(', ')}`);
            setTimeout(() => setFileError(''), 5000); // Clear error after 5 seconds
        }

        if (validFiles.length > 0) {
            setImages([...images, ...validFiles]);
        }

        // Reset the input value to allow selecting the same file again
        if (e.target) {
            e.target.value = '';
        }
    };

    const handleSubmit = async () => {

        setLoading(true);
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
                        <Textarea placeholder="What's on your mind?" value={content} onChange={(e) => setContent(e.target.value)} className='resize-none shadow-none max-h-20 text-sm border-0 placeholder-gray-400 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0' />

                        {/* images */}
                        {
                            images.length > 0 && (
                                <div className='flex flex-wrap gap-2'>
                                    {
                                        images.map((image, index: number) => (
                                            <div className='relative group' key={index}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={URL.createObjectURL(image)} alt="post" className='w-25 h-25 object-cover rounded-md' />

                                                <Button variant={'ghost'} className='absolute hidden group-hover:flex justify-center items-center top-0 right-0 left-0 bg-black/40 hover:bg-black/60 rounded-md cursor-pointer h-25 w-25' onClick={() => setImages(images.filter((_, i) => i !== index))}>
                                                    <X className="w-6 h-6 text-white" />
                                                </Button>
                                            </div>
                                        ))
                                    }
                                </div>
                            )
                        }

                        <Separator className="mt-3" />

                        <div className="flex justify-between items-center">
                            <Button onClick={() => refFileInput.current?.click()} variant={'outline'} className='flex items-center gap-2'>
                                <ImageIcon />
                            </Button>
                            <Input ref={refFileInput} type="file" accept='image/*,video/*' className='hidden' multiple onChange={handleFileChange} />

                            {/* File size error message */}
                            {fileError && (
                                <p className="text-sm text-red-500 mt-2">{fileError}</p>
                            )}

                            <ThemedButton disabled={loading} onClick={handleSubmit} className='w-1/4'>
                                {loading ? 'Publishing...' : 'Publish Post'}
                            </ThemedButton>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}

export default CreatePost