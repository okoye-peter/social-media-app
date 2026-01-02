import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Sparkle, TextIcon, UploadIcon } from 'lucide-react';
import Image from 'next/image';
import React, { useRef, useState } from 'react'
import { toast } from 'sonner';

interface CreateStoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const CreateStoryModal = ({ open, onOpenChange }: CreateStoryModalProps) => {
    const bgColors = ['#4f46e5', '#7c3aed', '#db2777', '#e11d48', '#ca8a04', '#0d9488'];
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [mode, setMode] = useState<'media' | 'text'>('text')
    const [backgroundColor, setBackgroundColor] = useState(bgColors[0]);
    const [text, setText] = useState('')
    const [media, setMedia] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setMedia(file)
            setPreviewUrl(URL.createObjectURL(file) as string)
        }
    }

    const handleCreateStory = async () => {
        
          toast.promise<{ name: string }>(
            () =>
              new Promise((resolve) =>
                setTimeout(() => resolve({ name: "Event" }), 2000)
              ),
            {
              loading: "Loading...",
              success: (data) => `${data.name} has been created`,
              error: "Error",
            }
          )
    
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className=" bg-transparent border-0 text-white shadow-none">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        {/* <Button
                            variant='ghost'
                            size="icon"
                            className='text-white hover:bg-white/10'
                            onClick={() => onOpenChange(false)}
                        >
                            <ArrowLeft />
                        </Button> */}
                        <DialogTitle className='text-2xl font-bold text-center flex-1'>Create Story</DialogTitle>

                    </div>
                </DialogHeader>

                {/* Add your modal content here */}
                <div className="rounded-lg h-96 flex items-center justify-center relative" style={{ backgroundColor }}>
                    {
                        mode === 'text' && (
                            <Textarea
                                className='bg-transparent text-white w-full h-full p-6 resize-none placeholder:text-white/60 !focus:outline-none border-0'
                                placeholder='What is on your mind?'
                                value={text} onChange={(e) => setText(e.target.value)}
                            />
                        )
                    }

                    {
                        mode === 'media' && previewUrl && (
                            media?.type.startsWith('image') ? (
                                <Image src={previewUrl} alt="Preview" fill className="rounded-lg object-contain" />
                            ) : (
                                <video src={previewUrl} className="w-full h-full rounded-lg object-contain" controls />
                            )
                        )
                    }

                </div>
                <div className="flex mt-4 gap-2">
                    {bgColors.map((color, index) => (
                        <Button
                            variant={'ghost'}
                            key={index}
                            className={`w-8 h-8 rounded-full cursor-pointer ${backgroundColor === color ? 'ring-1 ring-white' : ''}`}
                            style={{ backgroundColor: color }}
                            onClick={() => setBackgroundColor(color)}
                        />
                    ))}
                </div>
                <div className="flex gap-2 mt-4">
                    <Button className={`flex flex-1 items-center justify-center gap-2 cursor-pointer ${mode === 'text' ? 'bg-white text-black' : ' bg-zinc-800 text-white'}`} onClick={() => { setMode('text'); setMedia(null); setPreviewUrl(null); setText('') }}>
                        <TextIcon size={16} /> Text
                    </Button>
                    <Button className={`flex flex-1 items-center justify-center gap-2 cursor-pointer ${mode === 'media' ? 'bg-white text-black' : ' bg-zinc-800 text-white'}`} onClick={() => { setMode('media');; setMedia(null); setPreviewUrl(null); setText(''); fileInputRef.current?.click(); }}>
                        <UploadIcon size={16} /> Photo/Video
                    </Button>
                    <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={(e) => { handleMediaUpload(e); setMode('media'); }} className='hidden' />
                </div>

                <Button onClick={handleCreateStory} className='flex items-center justify-center gap-2 text-white py-3 mt-4 rounded bg-gradient-to-r from-indigo-500 to-purple-600 hove:from-indigo-600 hover:to-purple-700 active:scale-95 transition duration-200 cursor-pointer'>
                    <Sparkle size={18} />
                    Create Story
                </Button>
            </DialogContent>
        </Dialog>
    )
}

export default CreateStoryModal