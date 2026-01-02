import Stories from '@/components/shared/feeds/Stories'
import React from 'react'

const FeedsPage = () => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 md:px-20 py-6'>
        <div className="md:col-span-2 h-full overflow-y-scroll no-scrollbar flex flex-col justify-center">
            {/* stories feeds */}
            <Stories  />

            <div className="space-y-6"></div>
        </div>
        <div className="md:block hidden">
            
        </div>
    </div>
  )
}

export default FeedsPage