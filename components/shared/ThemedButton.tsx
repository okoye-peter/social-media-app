import React from 'react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'

const ThemedButton = ({ children, asChild, disabled, onClick, className }: { children: React.ReactNode, asChild?: boolean, disabled?: boolean, onClick?: () => void, className?: string }) => {
    return (
        <Button asChild={asChild} disabled={disabled} onClick={onClick} value={'ghost'} className={cn('flex items-center justify-center gap-2 py-2.5 rounded-lg bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95-transition text-white cursor-pointer w-full', className)}>
            {children}
        </Button>
    )
}

export default ThemedButton