import Stories from '@/components/shared/feeds/stories'
import React from 'react'

const FeedsPage = () => {
  return (
    <div className='grid: md:grid-cols-3 grid-cols-1 md:px-20 py-6'>
        <div className="md:col-span-2">
            {/* stories feeds */}
            <Stories />
        </div>
        <div className="md:block hidden">
            
        </div>
    </div>
  )
}

export default FeedsPage