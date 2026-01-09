import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import axiosInstance from '@/lib/axios';
import { Loader, Sparkle, TextIcon, UploadIcon, X } from 'lucide-react';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner';
import { fullStory } from './StoryCard';
import { CreateStoryModalProps } from '@/types';

const BG_COLORS = ['#4f46e5', '#7c3aed', '#db2777', '#e11d48', '#ca8a04', '#0d9488'];
const MAX_FILE_SIZE = 35 * 1024 * 1024; // 35MB


const CreateStoryModal = ({ open, onOpenChange, onStoryCreated }: CreateStoryModalProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [mode, setMode] = useState<'media' | 'text'>('text')
    const [backgroundColor, setBackgroundColor] = useState(BG_COLORS[0]);
    const [text, setText] = useState('')
    const [media, setMedia] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false)

    // Cleanup preview URL on unmount or when media changes
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    // Reset form when modal closes
    useEffect(() => {
        if (!open) {
            resetForm();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const resetForm = useCallback(() => {
        setText('');
        setMedia(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setMode('text');
        setBackgroundColor(BG_COLORS[0]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [previewUrl]);

    const handleMediaUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return;

        // Validate file type (only images and videos)
        const isImage = file.type.startsWith('image/')
        const isVideo = file.type.startsWith('video/')

        if (!isImage && !isVideo) {
            toast.error('Invalid file type. Please upload an image or video file.')
            e.target.value = '' // Reset input
            return;
        }

        // Validate file size (max 35MB)
        if (file.size > MAX_FILE_SIZE) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            toast.error(`File size (${sizeMB}MB) exceeds maximum of 35MB.`)
            e.target.value = '' // Reset input
            return;
        }

        // Revoke old preview URL before creating new one
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setMedia(file)
        setPreviewUrl(URL.createObjectURL(file))
    }, [previewUrl])

    const handleRemoveMedia = useCallback(() => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setMedia(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [previewUrl]);

    const switchToTextMode = useCallback(() => {
        setMode('text');
        handleRemoveMedia();
        setText('');
    }, [handleRemoveMedia]);

    const switchToMediaMode = useCallback(() => {
        setMode('media');
        setText('');
        fileInputRef.current?.click();
    }, []);

    const handleCreateStory = async () => {
        // Validation
        if (!text.trim() && !media) {
            toast.error('Please add content or media to your story')
            return
        }

        const formData = new FormData();

        if (text.trim()) {
            formData.append('content', text)
            formData.append('contentBackground', backgroundColor)
        }

        if (media) {
            formData.append('media', media)
        }

        setLoading(true)

        try {
            // Create the story
            const response = await axiosInstance.post('/auth/stories', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            // Show success toast
            toast.success("Story created successfully!")

            // Call the callback with the new story
            const newStory = response.data.story
            onStoryCreated?.(newStory)

            // Close modal and reset form
            onOpenChange(false)
            resetForm()
        } catch (error) {
            console.error('Failed to create story:', error)
            toast.error('Failed to create story')
        } finally {
            setLoading(false)
        }
    }

    const isMediaMode = mode === 'media';
    const hasContent = text.trim() || media;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-transparent border-0 text-white shadow-none max-w-md">
                <DialogHeader>
                    <DialogTitle className='text-2xl font-bold text-center'>
                        Create Story
                    </DialogTitle>
                </DialogHeader>

                {/* Story Preview */}
                <div
                    className="rounded-lg h-96 flex items-center justify-center relative overflow-hidden"
                    style={{ backgroundColor }}
                >
                    {mode === 'text' && (
                        <Textarea
                            className='bg-transparent text-white text-center w-full h-full p-6 resize-none placeholder:text-white/60 focus-visible:outline-none focus-visible:ring-0 border-0'
                            placeholder='What&apos;s on your mind?'
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            maxLength={300}
                            disabled={loading}
                        />
                    )}

                    {isMediaMode && previewUrl && (
                        <>
                            {media?.type.startsWith('image') ? (
                                <Image
                                    src={previewUrl}
                                    alt="Story preview"
                                    fill
                                    className="rounded-lg object-contain"
                                />
                            ) : (
                                <video
                                    src={previewUrl}
                                    className="w-full h-full rounded-lg object-contain"
                                    controls
                                />
                            )}

                            {/* Remove media button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 rounded-full"
                                onClick={handleRemoveMedia}
                                disabled={loading}
                            >
                                <X size={20} className="text-white" />
                            </Button>
                        </>
                    )}

                    {isMediaMode && !previewUrl && (
                        <div className="flex flex-col items-center gap-3 text-white/60">
                            <UploadIcon size={48} />
                            <p className="text-sm">Click below to upload photo or video</p>
                        </div>
                    )}
                </div>

                {/* Background Color Selector (only for text mode) */}
                {mode === 'text' && (
                    <div className="flex mt-4 gap-2 items-center">
                        <span className="text-sm text-white/70 mr-2">Background:</span>
                        {BG_COLORS.map((color) => (
                            <Button
                                variant="ghost"
                                key={color}
                                className={`w-8 h-8 p-0 rounded-full transition-all ${backgroundColor === color ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                                    }`}
                                style={{ backgroundColor: color }}
                                onClick={() => setBackgroundColor(color)}
                                disabled={loading}
                            />
                        ))}
                    </div>
                )}

                {/* Mode Selector */}
                <div className="flex gap-2 mt-4">
                    <Button
                        className={`flex flex-1 items-center justify-center gap-2 transition-all ${mode === 'text'
                            ? 'bg-white text-black hover:bg-white/90'
                            : 'bg-zinc-800 text-white hover:bg-zinc-700'
                            }`}
                        onClick={switchToTextMode}
                        disabled={loading}
                    >
                        <TextIcon size={16} /> Text
                    </Button>
                    <Button
                        className={`flex flex-1 items-center justify-center gap-2 transition-all ${mode === 'media'
                            ? 'bg-white text-black hover:bg-white/90'
                            : 'bg-zinc-800 text-white hover:bg-zinc-700'
                            }`}
                        onClick={switchToMediaMode}
                        disabled={loading}
                    >
                        <UploadIcon size={16} /> Photo/Video
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => {
                            handleMediaUpload(e);
                            setMode('media');
                        }}
                        className='hidden'
                        disabled={loading}
                    />
                </div>

                {/* Create Story Button */}
                <Button
                    onClick={handleCreateStory}
                    className='flex items-center justify-center gap-2 text-white py-3 mt-4 rounded bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                    disabled={loading || !hasContent}
                >
                    {loading ? (
                        <>
                            <Loader className='animate-spin' size={18} />
                            Creating Story...
                        </>
                    ) : (
                        <>
                            <Sparkle size={18} />
                            Create Story
                        </>
                    )}
                </Button>
            </DialogContent>
        </Dialog>
    )
}

export default CreateStoryModal