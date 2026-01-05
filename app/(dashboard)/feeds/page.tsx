import RecentMessages from '@/components/shared/RecentMessages'
import PostCard from '@/components/shared/feeds/PostCard'
import Stories from '@/components/shared/feeds/Stories'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { dummyPostsData, assets } from '@/public/deleteLater/assets'
import Image from 'next/image'

const FeedsPage = () => {
    return (
        <div className='grid grid-cols-1 lg:grid-cols-3 lg:px-20 py-6 gap-6'>
            <div className="lg:col-span-2 overflow-y-auto no-scrollbar flex flex-col max-h-screen">
                {/* stories feeds */}
                <div className="shrink-0">
                    <Stories />
                </div>

                {/* feeds */}
                <div className="space-y-6">
                    {dummyPostsData.map((post) => (
                        <PostCard key={post._id} post={post} />
                    ))}
                </div>
            </div>
            <div className="lg:block hidden">
                <Card className="w-full  shadow-sm mb-6">
                    <CardHeader>
                        <CardTitle>Sponsored</CardTitle>
                    </CardHeader>
                    <CardContent className='px-3'>
                        <Image src={assets.sponsored_img} alt="sponsored" width={500} height={500} className='w-full h-full object-cover' />
                        <p className='text-slate-600 text-sm my-3'>Email marketing</p>
                        <p className='text-slate-400 text-xs'>Supercharge your marketing with a powerful, easy-
                            to-use platform built for results.</p>
                    </CardContent>
                </Card>

                <RecentMessages />
            </div>
        </div>
    )
}

export default FeedsPage