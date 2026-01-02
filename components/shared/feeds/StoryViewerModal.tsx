import { Button } from '@/components/ui/button';
import { Story } from '@/types/story';
import { BadgeCheck, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const StoryViewerModal = ({ open, onOpenChange, story }: { open: boolean; onOpenChange: (open: boolean) => void; story: Story }) => {

    const [progress, setProgress] = useState(0)

    // Reset progress when modal opens or closes
    useEffect(() => {
        // eslint-disable-next-line
        setProgress(0);
    }, [open]);

    // Handle auto-progress for non-video stories
    useEffect(() => {
        if (!open || story.media_type === 'video') {
            return;
        }

        const duration = 10000; // 10 seconds
        const stepTime = 100; // Update every 100ms
        let elapsed = 0;

        const progressInterval = setInterval(() => {
            elapsed += stepTime;
            const newProgress = (elapsed / duration) * 100;

            if (newProgress >= 100) {
                clearInterval(progressInterval);
                onOpenChange(false);
            } else {
                setProgress(newProgress);
            }
        }, stepTime);

        return () => {
            clearInterval(progressInterval);
        };
    }, [open, story.media_type, onOpenChange]);

    if (!open || !story || !onOpenChange) return null

    const renderContent = () => {
        if (story.media_type === 'text') {
            return <p className="text-white text-center text-2xl w-full h-full p-8">{story.content}</p>;
        } else if (story.media_type === 'image') {
            return <Image src={story.media_url} alt="Story" fill className="max-w-full max-h-screen object-contain" />;
        } else if (story.media_type === 'video') {
            return <video onEnded={() => onOpenChange(false)} src={story.media_url} className="max-w-full max-h-screen object-contain" autoPlay controls />;
        }
    };

    return (
        <div className="fixed inset-0 h-screen bg-black bg-opacity-90 z-110 flex items-center justify-center" style={{ backgroundColor: story.media_type == 'text' ? story.background_color : '#000000', display: open ? 'flex' : 'none' }}>
            {/* progress bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-700 z-10" >
                <div className="h-full bg-white transition-all duration-100 linear" style={{ width: `${progress}%` }}></div>
                {/* user info */}
                <div className='absolute top-4 left-4 flex items-center space-x-3 p-2 px-4 sm:p-4 sm:px-8 backdrop-blur-2xl rounded  flex-col gap-2 '>
                    <Image src={story.user.profile_picture as string} alt={story.user.full_name} width={40} height={40} className='rounded-full ring ring-white' />
                    <div className="text-white font-medium flex items-center gap-1.5 text-sm">
                        <span>{story.user.full_name}</span>
                        <BadgeCheck size={18} />
                    </div>
                </div>

                {/* close button */}
                <Button onClick={() => onOpenChange(false)} variant='ghost' className='absolute top-4 right-4 text-white text-3xl font-bold focus:outline-none'>
                    <X className='h-8 w-8 hover:scale-110 transition cursor-pointer' />
                </Button>


            </div>
            <div className="max-w[90vw] max-h-[90vh] flex items-center justify-center">
                {renderContent()}
            </div>

        </div>
        // <Dialog open={open} onOpenChange={onOpenChange}>
        //     <DialogContent>
        //         <DialogHeader>
        //             <DialogTitle>Story Viewer</DialogTitle>
        //         </DialogHeader>
        //     </DialogContent>
        // </Dialog>
    )
}

export default StoryViewerModal