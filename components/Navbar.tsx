'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-[#ffff00]/20 bg-black/80 backdrop-blur-xl shadow-lg shadow-[#ffff00]/5">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo / Brand */}
                <Link href="/" className="flex items-center">
                    <span className="text-xl font-bold text-gradient">
                        Quizzy Quizzy
                    </span>
                </Link>

                {/* Navigation Links */}
                <div className="flex items-center space-x-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" className="text-base">
                            Dashboard
                        </Button>
                    </Link>
                    <Link href="/analytics">
                        <Button variant="ghost" className="text-base">
                            📊 Analytics
                        </Button>
                    </Link>
                    <Link href="/leaderboard">
                        <Button variant="ghost" className="text-base">
                            🏆 Leaderboard
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    )
}
