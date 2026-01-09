"use client"

import { use, useEffect, useRef, useState, useLayoutEffect } from 'react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ImageIcon, SendHorizonal, X, Loader2 } from 'lucide-react'
import axiosInstance from '@/lib/axios'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUserStore } from '@/stores'
import ChatUserCard from '@/components/shared/ChatUserCard'
import { uploadFile, deleteFile, UploadOptions } from '@/lib/supabase-s3.service'
import { toast } from 'sonner'
import { MessageWithUserIds, MediaType, FileWithId } from '@/types'

// Type definition for Message from API
interface Message {
    id?: number;
    _id?: string;
    senderId: number;
    receiverId: number;
    content: string | null;
    text?: string; // fallback
    createdAt: string;
    updatedAt: string;
    messageMedia: {
        id: number;
        url: string;
        type: string;
    }[];
    media_url?: string;
    message_type?: string;
}

const ChatPage = ({ params }: { params: Promise<{ userId: string }> }) => {
    const { userId } = use(params)
    const friendId = Number(userId)
    const authUser = useUserStore((state) => state.user)
    const queryClient = useQueryClient()

    const [text, setText] = useState('')
    const [uploadedMedia, setUploadedMedia] = useState<MediaType[]>([]);
    const [filesWithIds, setFilesWithIds] = useState<FileWithId[]>([]);
    const [uploading, setUploading] = useState(false) // Keep for backward compatibility/loading state
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState<Map<string, number>>(new Map());
    const [messageSent, setMessageSent] = useState(false);
    const messageSentRef = useRef(false);
    const uploadedMediaRef = useRef<MediaType[]>([]);
    const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
    const refMessageInput = useRef<HTMLInputElement>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const topSentinelRef = useRef<HTMLDivElement>(null)
    const isFirstLoadRef = useRef(true)
    const prevScrollHeightRef = useRef<number>(0)
    const prevFirstMessageIdRef = useRef<string | number | null>(null)

    // Fetch Messages
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['messages', friendId],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await axiosInstance.get(`/auth/messages/${friendId}/chats?page=${pageParam}&limit=20`)
            return res.data
        },
        getNextPageParam: (lastPage) => lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
        initialPageParam: 1,
    })

    // Combine messages from all pages and reverse them for display (Oldest -> Newest)
    const allMessages: Message[] = data?.pages.flatMap((page) => page.messages) || []
    const displayMessages = [...allMessages].reverse()

    // Scroll Management
    useLayoutEffect(() => {
        const container = scrollContainerRef.current
        if (!container) return

        if (status === 'success' && displayMessages.length > 0) {
            if (isFirstLoadRef.current) {
                // First load: Scroll to bottom
                container.scrollTop = container.scrollHeight
                isFirstLoadRef.current = false
                // Track oldest message
                prevFirstMessageIdRef.current = displayMessages[0]?.id || displayMessages[0]?._id || null
            } else {
                // Subsequent load (loading more history)
                // If we added messages at the TOP, restore scroll position
                const currentFirstId = displayMessages[0]?.id || displayMessages[0]?._id

                // If the first message changed, it means we loaded older messages
                if (currentFirstId !== prevFirstMessageIdRef.current && prevScrollHeightRef.current > 0) {
                    const heightDifference = container.scrollHeight - prevScrollHeightRef.current
                    container.scrollTop = heightDifference
                    prevScrollHeightRef.current = 0
                    prevFirstMessageIdRef.current = currentFirstId || null
                } else if (prevScrollHeightRef.current === 0) {
                    // New message sent (optimistic or refetch) -> Scroll to bottom if we were at bottom?
                    // Or just auto-scroll to bottom if user is close to bottom?
                    // For now, simple behavior: if user sent message (mutation), we handle it in onSuccess
                }
            }
        }
    }, [data, status, displayMessages])

    // Keep refs in sync with state
    useEffect(() => {
        messageSentRef.current = messageSent;
    }, [messageSent]);

    useEffect(() => {
        uploadedMediaRef.current = uploadedMedia;
    }, [uploadedMedia]);

    // Cleanup on unmount - delete files from Supabase if message not sent
    useEffect(() => {
        return () => {
            // Only cleanup if message was not successfully sent
            if (!messageSentRef.current && uploadedMediaRef.current.length > 0) {
                // Cancel any ongoing uploads
                abortControllersRef.current.forEach(controller => controller.abort());

                // Delete all uploaded files from Supabase
                uploadedMediaRef.current.forEach(async (media) => {
                    try {
                        await deleteFile(media.path);
                    } catch (error) {
                        console.error(`Failed to cleanup file: ${media.path}`, error);
                    }
                });
            }
        };
    }, []);

    // Infinite Scroll Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    if (scrollContainerRef.current) {
                        // Capture scroll height BEFORE fetch
                        prevScrollHeightRef.current = scrollContainerRef.current.scrollHeight
                    }
                    fetchNextPage()
                }
            },
            { threshold: 0.5 }
        )

        if (topSentinelRef.current) {
            observer.observe(topSentinelRef.current)
        }

        return () => observer.disconnect()
    }, [fetchNextPage, hasNextPage, isFetchingNextPage])

    // Send Message Mutation
    const sendMessageMutation = useMutation({
        mutationFn: async (payload: { receiverId: number; text?: string; media_url?: string; message_type?: string }) => {
            return axiosInstance.post('/auth/messages', payload)
        },
        onSuccess: () => {
            setText('')
            setFilesWithIds([])
            setUploadedMedia([])
            setMessageSent(false) // Reset for next message
            // Refetch messages
            queryClient.invalidateQueries({ queryKey: ['messages', friendId] })
            // Scroll to bottom
            setTimeout(() => {
                const container = scrollContainerRef.current
                if (container) {
                    container.scrollTop = container.scrollHeight
                    // Reset scroll tracking
                    isFirstLoadRef.current = false // ensure we don't jump
                    prevScrollHeightRef.current = 0
                }
            }, 100)
        },
        onError: (error) => {
            toast.error('Failed to send message')
            console.error(error)
        }
    })

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files as FileList)
        const validFiles: File[] = []
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

        files.forEach((file) => {
            if (file.size > MAX_FILE_SIZE) {
                toast.error(`${file.name} is too large (max 10MB)`)
            } else {
                validFiles.push(file)
            }
        })

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
        if (e.target) e.target.value = ''
    }

    const uploadFileToSupabase = async (file: File, fileId: string) => {
        try {
            // Create abort controller for this upload
            const abortController = new AbortController();
            abortControllersRef.current.set(fileId, abortController);

            // Upload options with progress tracking
            const uploadOptions: UploadOptions = {
                folder: `messages/${authUser?.id}/${friendId}`,
                onProgress: (progress) => {
                    setUploadProgress(prev => new Map(prev).set(fileId, progress));
                },
                signal: abortController.signal
            };

            // Upload to Supabase
            const result = await uploadFile(file, uploadOptions);
            const { url } = result

            if (!url) {
                throw new Error("No URL returned")
            }

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
                toast.error(`Failed to upload ${file.name}`);
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
        if ((!text.trim() && uploadedMedia.length === 0) || isUploading) return

        setUploading(true)
        setMessageSent(true);

        try {
            const filesToUpload = [...uploadedMedia] // These are already uploaded now
            const textToSend = text

            if (filesToUpload.length === 0) {
                await sendMessageMutation.mutateAsync({
                    receiverId: friendId,
                    text: textToSend
                })
            } else {
                for (let i = 0; i < filesToUpload.length; i++) {
                    const media = filesToUpload[i]


                    const currentText = i === 0 ? textToSend : '' // Attach text to first image only

                    await sendMessageMutation.mutateAsync({
                        receiverId: friendId,
                        text: currentText,
                        media_url: media.url,
                        message_type: typeof media.type === 'string' && media.type.startsWith('image') ? 'image' : 'video'
                    })
                }
            }

        } catch (error) {
            console.error('Send error:', error)
            setMessageSent(false); // Reset if failed so cleanup can happen if user leaves
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className='flex flex-col h-[calc(100vh-100px)]'>
            {/* Header */}
            <ChatUserCard friendId={friendId} />

            {/* Messages Area */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto bg-gray-50 p-4 scroll-smooth"
            >
                <div className="space-y-3 max-w-4xl mx-auto pb-4 min-h-full flex flex-col justify-end">
                    {/* Top Sentinel for Infinite Scroll */}
                    <div ref={topSentinelRef} className="h-4 w-full flex justify-center p-2 shrink-0">
                        {isFetchingNextPage && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                    </div>

                    {status === 'pending' && (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                    )}

                    {displayMessages.map((message) => {
                        const isMe = message.senderId === authUser?.id
                        const hasMedia = message.messageMedia && message.messageMedia.length > 0;
                        const mediaUrl = hasMedia ? message.messageMedia[0].url : (message.media_url || null)
                        const messageType = hasMedia ? message.messageMedia[0].type : (message.message_type || 'text')

                        return (
                            <div key={message.id || message._id} className={`flex flex-col mb-3 ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-sm md:max-w-md ${isMe ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : 'bg-white text-slate-700'} rounded-2xl shadow-md ${isMe ? 'rounded-br-none' : 'rounded-bl-none'} overflow-hidden`}>
                                    {/* Media */}
                                    {mediaUrl && (
                                        <div className="relative">
                                            {(messageType === 'image' || messageType.startsWith('image')) ? (
                                                <Image
                                                    src={mediaUrl}
                                                    alt="message"
                                                    width={500}
                                                    height={500}
                                                    className='w-full h-auto max-h-96 object-cover'
                                                />
                                            ) : (
                                                <video src={mediaUrl} controls className='w-full h-auto max-h-96' />
                                            )}
                                        </div>
                                    )}
                                    {/* Text */}
                                    {message.content && (
                                        <p className={`p-3 ${mediaUrl ? 'pt-2' : ''} text-sm whitespace-pre-wrap`}>
                                            {message.content}
                                        </p>
                                    )}
                                    {/* Fallback */}
                                    {!message.content && message.text && (
                                        <p className={`p-3 ${mediaUrl ? 'pt-2' : ''} text-sm whitespace-pre-wrap`}>
                                            {message.text}
                                        </p>
                                    )}
                                </div>
                                <span className="text-xs text-gray-400 mt-1 px-2">
                                    {new Date(message.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 bg-white shadow-lg">
                <div className="max-w-4xl mx-auto p-4">
                    {/* Image Preview */}
                    {filesWithIds.length > 0 && (
                        <div className="mb-3">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-gray-600 font-medium">
                                        {filesWithIds.length} {filesWithIds.length === 1 ? 'image' : 'images'} selected
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={async () => {
                                            // Clear all
                                            const count = filesWithIds.length;
                                            for (let i = count - 1; i >= 0; i--) {
                                                await handleRemoveFile(i);
                                            }
                                        }}
                                        className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Clear all
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {filesWithIds.map(({ file, id }, index) => {
                                        const progress = uploadProgress.get(id);
                                        const isUploading = progress !== undefined;

                                        return (
                                            <div key={id} className="relative group">
                                                <Image
                                                    src={URL.createObjectURL(file)}
                                                    alt={`Selected image ${index + 1}`}
                                                    width={80}
                                                    height={80}
                                                    className='w-20 h-20 object-cover rounded-lg border-2 border-gray-200'
                                                />

                                                {/* Upload progress overlay */}
                                                {isUploading && (
                                                    <div className='absolute inset-0 bg-black/60 rounded-lg flex flex-col items-center justify-center z-10'>
                                                        <Loader2 className="w-4 h-4 text-white animate-spin mb-1" />
                                                    </div>
                                                )}

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveFile(index)}
                                                    className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full 
                                                opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Input Bar */}
                    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-indigo-200">
                        <Input
                            ref={refMessageInput}
                            type="text"
                            placeholder="Type your message..."
                            value={text}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
                            onChange={(e) => setText(e.target.value)}
                            disabled={uploading || isUploading}
                            className='flex-1 border-none bg-transparent outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 text-slate-700 placeholder:text-gray-400 shadow-none'
                        />
                        <Label htmlFor='images' className={`cursor-pointer ${uploading || isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            <Input type='file' accept='image/*,video/*' id='images' className='hidden' multiple onChange={handleFileChange} disabled={uploading || isUploading} />
                            <ImageIcon className='w-5 h-5 text-gray-500 hover:text-indigo-600 transition-colors' />
                        </Label>

                        <Button
                            onClick={handleSubmit}
                            disabled={(text.trim() === '' && filesWithIds.length === 0) || uploading || isUploading}
                            className='bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 cursor-pointer text-white p-2.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-md'
                        >
                            {uploading || isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizonal size={18} />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatPage