import React from 'react'
import { Button } from '../ui/button'

const ThemedButton = ({children, asChild}: {children: React.ReactNode, asChild?: boolean}) => {
  return (
    <Button asChild={asChild} value={'ghost'} className='flex items-center justify-center gap-2 py-2.5 rounded-lg bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95-transition text-white cursor-pointer w-full'>
        {children}
    </Button>
  )
}

export default ThemedButton