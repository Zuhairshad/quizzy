'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
    href?: string
    label?: string
}

export default function BackButton({ href, label = 'Back' }: BackButtonProps) {
    const router = useRouter()
    const pathname = usePathname()

    // Don't show back button on dashboard or home
    if (pathname === '/dashboard' || pathname === '/') {
        return null
    }

    const handleClick = () => {
        if (href) {
            router.push(href)
        } else {
            router.back()
        }
    }

    return (
        <Button
            variant="ghost"
            onClick={handleClick}
            className="mb-4 md:mb-6 border border-border text-primary hover:bg-muted hover:text-foreground"
        >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {label}
        </Button>
    )
}

