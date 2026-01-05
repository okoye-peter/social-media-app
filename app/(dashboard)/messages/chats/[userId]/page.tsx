"use client"

import { dummyMessagesData, dummyUserData } from '@/public/deleteLater/assets'
import { use, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { MessageWithUserIds } from '@/types/message'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ImageIcon, SendHorizonal, X } from 'lucide-react'

const ChatPage = ({ params }: { params: Promise<{ userId: string }> }) => {
    const { userId } = use(params)

    const messages: MessageWithUserIds[] = dummyMessagesData
    const user = dummyUserData
    const [text, setText] = useState('')
    const [loading, setLoading] = useState(false)
    const [fileError, setFileError] = useState<string>('')
    const refFileInput = useRef<HTMLInputElement>(null)
    const refMessageInput = useRef<HTMLInputElement>(null)
    const [images, setImages] = useState<File[]>([]);

    useEffect(() => {

    }, [])

    const handleSubmit = async () => {
        setLoading(true)
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

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

    return (
        <div className='flex flex-col h-[calc(100vh-100px)]'>
            {/* Header - Fixed at top */}
            <div className="flex items-center gap-2 p-4 border-b border-gray-200 bg-white shadow-sm">
                <Image src={user.profile_picture as string} alt="profile" className='size-10 rounded-full' width={40} height={40} />
                <div>
                    <h2 className='font-semibold text-gray-800'>{user.full_name}</h2>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                </div>
            </div>

            {/* Messages Area - Scrollable */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                <div className="space-y-3 max-w-4xl mx-auto pb-4">
                    {messages.toSorted((a, b) => (new Date(a.createdAt)).getTime() - (new Date(b.createdAt)).getTime()).map((message) => (
                        <div key={message._id} className={`flex flex-col mb-3 ${message.to_user_id !== user._id ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-sm md:max-w-md ${message.to_user_id !== user._id ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : 'bg-white text-slate-700'} rounded-2xl shadow-md ${message.to_user_id !== user._id ? 'rounded-br-none' : 'rounded-bl-none'} overflow-hidden`}>
                                {/* Image Message */}
                                {message.message_type === 'image' && message.media_url && (
                                    <div className="relative">
                                        <Image
                                            src={message.media_url as string}
                                            alt="message"
                                            width={500}
                                            height={500}
                                            className='w-full h-auto max-h-96 object-cover'
                                            priority
                                        />
                                    </div>
                                )}
                                {/* Text Message */}
                                {message.text && (
                                    <p className={`p-3 ${message.message_type === 'image' && message.media_url ? 'pt-2' : ''} text-sm`}>
                                        {message.text}
                                    </p>
                                )}
                            </div>
                            <span className="text-xs text-gray-400 mt-1 px-2">
                                {new Date(message.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
                </div>
            </div>


            {/* Input Area - Fixed at bottom */}
            <div className="border-t border-gray-200 bg-white shadow-lg">
                <div className="max-w-4xl mx-auto p-4">
                    {/* Image Preview Section */}
                    {images.length > 0 && (
                        <div className="mb-3">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-gray-600 font-medium">
                                        {images.length} {images.length === 1 ? 'image' : 'images'} selected
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setImages([])}
                                        className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Clear all
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {images.map((image, index) => (
                                        <div key={index} className="relative group">
                                            <Image
                                                src={URL.createObjectURL(image)}
                                                alt={`Selected image ${index + 1}`}
                                                width={80}
                                                height={80}
                                                className='w-20 h-20 object-cover rounded-lg border-2 border-gray-200'
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setImages(images.filter((_, i) => i !== index))}
                                                className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Input Bar */}
                    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow">
                        <Input
                            ref={refMessageInput}
                            type="text"
                            placeholder="Type your message..."
                            value={text}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
                            onChange={(e) => setText(e.target.value)}
                            className='flex-1 border-none bg-transparent outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 text-slate-700 placeholder:text-gray-400 shadow-none'
                        />
                        <Label htmlFor='images' className="cursor-pointer">
                            <Input type='file' accept='image/*,video/*' id='images' className='hidden' multiple onChange={handleFileChange} />
                            <ImageIcon className='w-5 h-5 text-gray-500 hover:text-indigo-600 transition-colors' />
                        </Label>

                        <Button
                            onClick={handleSubmit}
                            disabled={text.trim() === '' && images.length === 0}
                            className='bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 cursor-pointer text-white p-2.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-indigo-500 disabled:hover:to-purple-600 shadow-md'
                        >
                            <SendHorizonal size={18} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatPage