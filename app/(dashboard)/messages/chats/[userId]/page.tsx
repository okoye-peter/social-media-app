"use client"

import { use, useEffect, useRef, useState, useLayoutEffect, useMemo, useCallback } from 'react'
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
import { MediaType, FileWithId, ChatMessage } from '@/types'
import PusherClient from 'pusher-js';
import type { Channel } from 'pusher-js';
import { getPusherChannelName } from '@/lib/utils'



const ChatPage = ({ params }: { params: Promise<{ userId: string }> }) => {
    const { userId } = use(params)
    const friendId = Number(userId)
    const authUser = useUserStore((state) => state.user)
    const queryClient = useQueryClient()

    const [text, setText] = useState('')
    const [uploadedMedia, setUploadedMedia] = useState<MediaType[]>([]);
    const [filesWithIds, setFilesWithIds] = useState<FileWithId[]>([]);
    const [uploading, setUploading] = useState(false)
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
    const prevFirstMessageIdRef = useRef<string | number | null>(null);
    const isUserScrollingRef = useRef(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout>();

    const [chatId] = useState(getPusherChannelName(authUser?.id as number, friendId));

    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const pusherRef = useRef<PusherClient | null>(null);
    const channelRef = useRef<Channel | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize Pusher and subscribe to channel
    useEffect(() => {
        if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
            console.error("Missing Pusher environment variables");
            return;
        }

        const pusher = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
            authEndpoint: '/api/pusher/auth',
        });
        pusherRef.current = pusher;

        pusher.connection.bind('connected', () => {
            console.log('✅ Pusher connected');
            setIsConnected(true);
        });

        pusher.connection.bind('disconnected', () => {
            console.log('❌ Pusher disconnected');
            setIsConnected(false);
        });

        const channel = pusher.subscribe(chatId);
        channelRef.current = channel;

        channel.bind('pusher:subscription_succeeded', () => {
            console.log('✅ Subscribed to channel:', chatId);
        });

        channel.bind('new-message', (data: ChatMessage) => {
            console.log('📨 NEW MESSAGE EVENT RECEIVED:', data);

            if (data.senderId !== authUser?.id) {
                queryClient.setQueryData<{ pages: { messages: ChatMessage[] }[], pageParams: unknown[] }>(['messages', friendId], (oldData) => {
                    if (!oldData) return oldData;

                    const newPages = oldData.pages.map((page) => ({
                        ...page,
                        messages: [...page.messages]
                    }));

                    if (newPages.length > 0) {
                        // Check if message already exists
                        const exists = newPages[0].messages.some(m =>
                            (m.id && m.id === data.id) || (m._id && m._id === data._id)
                        );
                        if (!exists) {
                            newPages[0].messages.unshift(data);
                        }
                    }

                    return {
                        ...oldData,
                        pages: newPages
                    };
                });
            }
        });

        channel.bind('user-typing', (data: { userId: number | string; userName: string; isTyping: boolean }) => {
            if (data.userId == authUser?.id) return;

            setTypingUsers(prev => {
                if (data.isTyping) {
                    if (!prev.includes(data.userName)) {
                        return [...prev, data.userName];
                    }
                    return prev;
                } else {
                    return prev.filter(name => name !== data.userName);
                }
            });
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
            pusher.disconnect();
        };
    }, [chatId, authUser?.id, friendId, queryClient]);

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

    // Memoize display messages to prevent unnecessary recalculations
    const displayMessages = useMemo(() => {
        const allMessages: ChatMessage[] = data?.pages.flatMap((page) => page.messages) || []
        return [...allMessages].reverse()
    }, [data]);

    // Smooth scroll to bottom with requestAnimationFrame
    const scrollToBottom = useCallback((smooth = true) => {
        requestAnimationFrame(() => {
            const container = scrollContainerRef.current;
            if (container) {
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: smooth ? 'smooth' : 'auto'
                });
            }
        });
    }, []);

    // Detect user scrolling
    const handleScroll = useCallback(() => {
        isUserScrollingRef.current = true;

        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
            isUserScrollingRef.current = false;
        }, 150);
    }, []);

    // Scroll Management
    useLayoutEffect(() => {
        const container = scrollContainerRef.current
        if (!container) return

        if (status === 'success' && displayMessages.length > 0) {
            if (isFirstLoadRef.current) {
                scrollToBottom(false);
                isFirstLoadRef.current = false
                prevFirstMessageIdRef.current = displayMessages[0]?.id || displayMessages[0]?._id || null
            } else {
                const currentFirstId = displayMessages[0]?.id || displayMessages[0]?._id

                if (currentFirstId !== prevFirstMessageIdRef.current && prevScrollHeightRef.current > 0) {
                    const heightDifference = container.scrollHeight - prevScrollHeightRef.current
                    container.scrollTop = heightDifference
                    prevScrollHeightRef.current = 0
                    prevFirstMessageIdRef.current = currentFirstId || null
                } else if (!isUserScrollingRef.current) {
                    // Auto-scroll to bottom if user isn't scrolling
                    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
                    if (isNearBottom) {
                        scrollToBottom();
                    }
                }
            }
        }
    }, [displayMessages, status, scrollToBottom])

    // Keep refs in sync with state
    useEffect(() => {
        messageSentRef.current = messageSent;
    }, [messageSent]);

    useEffect(() => {
        uploadedMediaRef.current = uploadedMedia;
    }, [uploadedMedia]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (!messageSentRef.current && uploadedMediaRef.current.length > 0) {
                abortControllersRef.current.forEach(controller => controller.abort());
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

    // Send Message Mutation with optimistic updates
    const sendMessageMutation = useMutation({
        mutationFn: async (payload: { receiverId: number; text?: string; media_url?: string; message_type?: string }) => {
            return axiosInstance.post('/auth/messages', payload)
        },
        onMutate: async (variables) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['messages', friendId] });

            // Snapshot previous value
            const previousMessages = queryClient.getQueryData(['messages', friendId]);

            // Optimistically update
            const optimisticMessage: ChatMessage = {
                id: Date.now(),
                senderId: authUser?.id as number,
                receiverId: friendId,
                content: variables.text || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                messageMedia: [],
                media_url: variables.media_url,
                message_type: variables.message_type,
                isOptimistic: true,
                isSending: true,
            };

            queryClient.setQueryData<{ pages: { messages: ChatMessage[] }[], pageParams: unknown[] }>(['messages', friendId], (old) => {
                if (!old) return old;

                const newPages = [...old.pages];
                if (newPages.length > 0) {
                    newPages[0] = {
                        ...newPages[0],
                        messages: [optimisticMessage, ...newPages[0].messages]
                    };
                }

                return {
                    ...old,
                    pages: newPages
                };
            });

            return { previousMessages };
        },
        onSuccess: () => {
            setText('')
            setFilesWithIds([])
            setUploadedMedia([])
            setMessageSent(false)
            queryClient.invalidateQueries({ queryKey: ['messages', friendId] })
            scrollToBottom();
        },
        onError: (error, variables, context) => {
            // Rollback on error
            if (context?.previousMessages) {
                queryClient.setQueryData(['messages', friendId], context.previousMessages);
            }
            toast.error('Failed to send message')
            console.error(error)
        }
    })

    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files as FileList)
        const validFiles: File[] = []
        const MAX_FILE_SIZE = 10 * 1024 * 1024;

        files.forEach((file) => {
            if (file.size > MAX_FILE_SIZE) {
                toast.error(`${file.name} is too large (max 10MB)`)
            } else {
                validFiles.push(file)
            }
        })

        if (validFiles.length > 0) {
            const newFilesWithIds = validFiles.map(file => ({
                file,
                id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
            }));

            setFilesWithIds(prev => [...prev, ...newFilesWithIds]);
            setIsUploading(true);

            for (const { file, id } of newFilesWithIds) {
                await uploadFileToSupabase(file, id);
            }

            setIsUploading(false);
        }
        if (e.target) e.target.value = ''
    }, []);

    const uploadFileToSupabase = async (file: File, fileId: string) => {
        try {
            const abortController = new AbortController();
            abortControllersRef.current.set(fileId, abortController);

            const uploadOptions: UploadOptions = {
                folder: `messages/${authUser?.id}/${friendId}`,
                onProgress: (progress) => {
                    setUploadProgress(prev => new Map(prev).set(fileId, progress));
                },
                signal: abortController.signal
            };

            const result = await uploadFile(file, uploadOptions);
            const { url } = result

            if (!url) {
                throw new Error("No URL returned")
            }

            setUploadedMedia(prev => [...prev, {
                url: result.url,
                type: result.type as 'image' | 'video',
                path: result.path
            }]);

            setUploadProgress(prev => {
                const newMap = new Map(prev);
                newMap.delete(fileId);
                return newMap;
            });

            abortControllersRef.current.delete(fileId);

        } catch (error) {
            console.error('Upload failed:', error);
            setFilesWithIds(prev => prev.filter(f => f.id !== fileId));
            setUploadProgress(prev => {
                const newMap = new Map(prev);
                newMap.delete(fileId);
                return newMap;
            });

            if ((error as Error).message !== 'Upload cancelled') {
                toast.error(`Failed to upload ${file.name}`);
            }
        }
    };

    const handleRemoveFile = useCallback(async (index: number) => {
        const fileToRemove = filesWithIds[index];
        const mediaToRemove = uploadedMedia[index];

        const abortController = abortControllersRef.current.get(fileToRemove.id);
        if (abortController) {
            abortController.abort();
            abortControllersRef.current.delete(fileToRemove.id);
        }

        setUploadProgress(prev => {
            const newMap = new Map(prev);
            newMap.delete(fileToRemove.id);
            return newMap;
        });

        setFilesWithIds(prev => prev.filter((_, i) => i !== index));

        if (mediaToRemove) {
            try {
                await deleteFile(mediaToRemove.path);
                setUploadedMedia(prev => prev.filter((_, i) => i !== index));
            } catch (error) {
                console.error('Failed to delete file from Supabase:', error);
            }
        }
    }, [filesWithIds, uploadedMedia]);

    const handleTyping = useCallback(() => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        } else {
            axiosInstance.post('/auth/messages/typing', {
                receiverId: friendId,
                isTyping: true
            }).catch(err => console.error("Failed to send typing status", err));
        }

        typingTimeoutRef.current = setTimeout(() => {
            axiosInstance.post('/auth/messages/typing', {
                receiverId: friendId,
                isTyping: false
            }).catch(err => console.error("Failed to send stop typing status", err));
            typingTimeoutRef.current = null;
        }, 2000);
    }, [friendId]);

    const handleSubmit = useCallback(async () => {
        if ((!text.trim() && uploadedMedia.length === 0) || isUploading) return

        setUploading(true)
        setMessageSent(true);

        try {
            const filesToUpload = [...uploadedMedia]
            const textToSend = text

            if (filesToUpload.length === 0) {
                await sendMessageMutation.mutateAsync({
                    receiverId: friendId,
                    text: textToSend
                })
            } else {
                for (let i = 0; i < filesToUpload.length; i++) {
                    const media = filesToUpload[i]
                    const currentText = i === 0 ? textToSend : ''

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
            setMessageSent(false);
        } finally {
            setUploading(false)
        }
    }, [text, uploadedMedia, isUploading, friendId, sendMessageMutation]);

    return (
        <div className='flex flex-col h-[calc(100vh-100px)]'>
            {/* Header */}
            <ChatUserCard friendId={friendId} />

            {/* Messages Area */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100 p-4 scroll-smooth"
            >
                <div className="space-y-2 max-w-4xl mx-auto pb-4 min-h-full flex flex-col justify-end">
                    {/* Top Sentinel for Infinite Scroll */}
                    <div ref={topSentinelRef} className="h-4 w-full flex justify-center p-2 shrink-0">
                        {isFetchingNextPage && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
                    </div>

                    {status === 'pending' && (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        </div>
                    )}

                    {displayMessages.map((message, index) => {
                        const isMe = message.senderId === authUser?.id
                        const hasMedia = message.messageMedia && message.messageMedia.length > 0;
                        const mediaUrl = hasMedia ? message.messageMedia[0].url : (message.media_url || null)
                        const messageType = hasMedia ? message.messageMedia[0].type : (message.message_type || 'text')
                        const showAvatar = index === 0 || displayMessages[index - 1].senderId !== message.senderId;

                        return (
                            <div
                                key={message.id || message._id}
                                className={`flex flex-col mb-1 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isMe ? 'items-end' : 'items-start'}`}
                            >
                                <div className={`max-w-sm md:max-w-md ${isMe ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : 'bg-white text-slate-700'} rounded-2xl shadow-sm hover:shadow-md transition-shadow ${isMe ? 'rounded-br-sm' : 'rounded-bl-sm'} overflow-hidden ${message.isOptimistic ? 'opacity-70' : 'opacity-100'}`}>
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
                                        <p className={`p-3 ${mediaUrl ? 'pt-2' : ''} text-sm whitespace-pre-wrap break-words`}>
                                            {message.content}
                                        </p>
                                    )}
                                    {!message.content && message.text && (
                                        <p className={`p-3 ${mediaUrl ? 'pt-2' : ''} text-sm whitespace-pre-wrap break-words`}>
                                            {message.text}
                                        </p>
                                    )}
                                    {message.isSending && (
                                        <div className="px-3 pb-2 flex items-center gap-1 text-xs opacity-70">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            <span>Sending...</span>
                                        </div>
                                    )}
                                </div>
                                {!message.isOptimistic && (
                                    <span className="text-xs text-gray-400 mt-0.5 px-2">
                                        {new Date(message.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </div>
                        )
                    })}

                    {/* Typing Indicator */}
                    {typingUsers.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 italic ml-2 mb-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
                            <span className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                            </span>
                            {typingUsers.join(', ')} is typing...
                        </div>
                    )}
                </div>
            </div>

            {/* Connection Status */}
            {!isConnected && (
                <div className="bg-yellow-50 border-t border-yellow-200 px-4 py-2 text-center">
                    <p className="text-xs text-yellow-700 flex items-center justify-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Reconnecting to chat...
                    </p>
                </div>
            )}

            {/* Input Area */}
            <div className="border-t border-gray-200 bg-white shadow-lg">
                <div className="max-w-4xl mx-auto p-4">
                    {/* Image Preview */}
                    {filesWithIds.length > 0 && (
                        <div className="mb-3 animate-in slide-in-from-bottom-2 duration-200">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-gray-600 font-medium">
                                        {filesWithIds.length} {filesWithIds.length === 1 ? 'file' : 'files'} selected
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={async () => {
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
                                        const isUploadingFile = progress !== undefined;

                                        return (
                                            <div key={id} className="relative group">
                                                <Image
                                                    src={URL.createObjectURL(file)}
                                                    alt={`Selected image ${index + 1}`}
                                                    width={80}
                                                    height={80}
                                                    className='w-20 h-20 object-cover rounded-lg border-2 border-gray-200 transition-transform group-hover:scale-105'
                                                />

                                                {isUploadingFile && (
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
                    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-all focus-within:ring-2 focus-within:ring-indigo-300 focus-within:border-indigo-400">
                        <Input
                            ref={refMessageInput}
                            type="text"
                            placeholder={isConnected ? "Type your message..." : "Connecting..."}
                            value={text}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
                            onChange={(e) => {
                                setText(e.target.value);
                                handleTyping();
                            }}
                            disabled={uploading || isUploading || !isConnected}
                            className='flex-1 border-none bg-transparent outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 text-slate-700 placeholder:text-gray-400 shadow-none'
                        />
                        <Label htmlFor='images' className={`cursor-pointer transition-opacity ${uploading || isUploading ? 'opacity-50 pointer-events-none' : 'hover:opacity-70'}`}>
                            <Input type='file' accept='image/*,video/*' id='images' className='hidden' multiple onChange={handleFileChange} disabled={uploading || isUploading} />
                            <ImageIcon className='w-5 h-5 text-gray-500 hover:text-indigo-600 transition-colors' />
                        </Label>

                        <Button
                            onClick={handleSubmit}
                            disabled={(text.trim() === '' && filesWithIds.length === 0) || uploading || isUploading || !isConnected}
                            className='bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition-all cursor-pointer text-white p-2.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg'
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