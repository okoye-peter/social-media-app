import { Button } from '@/components/ui/button';
import { BadgeCheck, Loader, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { fullStory } from './StoryCard';

const StoryViewerModal = ({ open, onOpenChange, story }: { open: boolean; onOpenChange: (open: boolean) => void; story: fullStory }) => {

    const [progress, setProgress] = useState(0)
    const [isVideoLoading, setIsVideoLoading] = useState(true)
    const videoRef = useRef<HTMLVideoElement>(null)

    // Reset progress when modal opens or closes
    useEffect(() => {
        // eslint-disable-next-line
        setProgress(0);
        setIsVideoLoading(true);
    }, [open]);

    // Handle auto-progress for non-video stories
    useEffect(() => {
        if (!open || story.contextType === 'VIDEO') {
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
    }, [open, story, onOpenChange]);

    // Handle video progress tracking
    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement || story.contextType !== 'VIDEO') return;

        const updateProgress = () => {
            if (videoElement.duration) {
                const newProgress = (videoElement.currentTime / videoElement.duration) * 100;
                setProgress(newProgress);
            }
        };

        videoElement.addEventListener('timeupdate', updateProgress);
        return () => videoElement.removeEventListener('timeupdate', updateProgress);
    }, [story.contextType, open]);

    if (!open || !story || !onOpenChange) return null

    const handleVideoCanPlay = () => {
        setIsVideoLoading(false);
    };

    const handleVideoWaiting = () => {
        setIsVideoLoading(true);
    };

    const renderContent = () => {
        if (story.contextType === 'TEXT') {
            return <p className="text-white text-center text-2xl w-full h-full p-8">{story.content}</p>;
        } else if (story.contextType === 'IMAGE') {
            return <Image src={story.mediaUrl as string} alt="Story" fill className="max-w-full max-h-screen object-contain" />;
        } else if (story.contextType === 'VIDEO') {
            return (
                <>
                    <video
                        ref={videoRef}
                        onEnded={() => onOpenChange(false)}
                        onCanPlay={handleVideoCanPlay}
                        onWaiting={handleVideoWaiting}
                        onLoadedData={() => setIsVideoLoading(false)}
                        src={story.mediaUrl as string}
                        className="max-w-full max-h-screen object-contain"
                        autoPlay
                        playsInline
                        preload="auto"
                    />
                    {isVideoLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <Loader className="animate-spin text-white" size={48} />
                        </div>
                    )}
                </>
            );
        }
    };

    return (
        <div className="fixed inset-0 h-screen bg-black bg-opacity-90 z-110 flex items-center justify-center" style={{ backgroundColor: story.contextType == 'TEXT' ? story.contentBackground as string : '#000000', display: open ? 'flex' : 'none' }}>
            {/* progress bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-700 z-10" >
                <div className="h-full bg-white transition-all duration-100 linear" style={{ width: `${progress}%` }}></div>
                {/* user info */}
                <div className='absolute top-4 left-4 flex items-center space-x-3 p-2 px-4 sm:p-4 sm:px-8 backdrop-blur-2xl rounded  flex-col gap-2 '>
                    <Image src={story.user.image as string} alt={story.user.name} width={40} height={40} className='rounded-full ring ring-white' />
                    <div className="text-white font-medium flex items-center gap-1.5 text-sm">
                        <span>{story.user.name}</span>
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