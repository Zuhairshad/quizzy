'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import { ModeToggle } from '@/components/ui/mode-toggle'

export default function Navbar() {
    const router = useRouter()
    const pathname = usePathname()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        const supabase = createClient()

        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            setLoading(false)
        }

        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    useEffect(() => {
        // Close mobile menu when route changes
        setMobileMenuOpen(false)
    }, [pathname])

    const handleLogout = async () => {
        const supabase = createClient()
        const { error } = await supabase.auth.signOut()

        if (error) {
            toast.error('Failed to logout')
            return
        }

        toast.success('Logged out successfully')
        router.push('/login')
        router.refresh()
    }

    const navLinkClass = (href: string) => cn(
        "w-full flex items-center justify-start px-4 py-3 text-sm font-medium rounded-md text-left",
        pathname === href
            ? "bg-primary/30 text-primary font-semibold border-l-4 border-primary shadow-sm cursor-default"
            : "text-muted-foreground hover:bg-primary/20 hover:text-primary hover:border-l-4 hover:border-primary/50 transition-all duration-200"
    )

    const sidebarContent = (
        <>
            {/* Logo / Brand */}
            <div className="px-6 py-6 border-b border-border flex items-center justify-between">
                <Link href="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                    <span className="text-xl font-bold text-gradient">
                        Quizzy Quizzy
                    </span>
                </Link>
                <ModeToggle />
            </div>

            {/* Navigation Links */}
            <div className="flex-1 px-4 py-6 space-y-2">
                {user ? (
                    <>
                        <Link href="/dashboard" prefetch={true} onClick={() => setMobileMenuOpen(false)} className={pathname === '/dashboard' ? 'pointer-events-none' : ''}>
                            <Button variant="ghost" className={navLinkClass('/dashboard')}>
                                Dashboard
                            </Button>
                        </Link>
                        <Link href="/analytics" prefetch={true} onClick={() => setMobileMenuOpen(false)} className={pathname === '/analytics' ? 'pointer-events-none' : ''}>
                            <Button variant="ghost" className={navLinkClass('/analytics')}>
                                Analytics
                            </Button>
                        </Link>
                        <Link href="/leaderboard" prefetch={true} onClick={() => setMobileMenuOpen(false)} className={pathname === '/leaderboard' ? 'pointer-events-none' : ''}>
                            <Button variant="ghost" className={navLinkClass('/leaderboard')}>
                                Leaderboard
                            </Button>
                        </Link>
                    </>
                ) : (
                    <>
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant="ghost" className={navLinkClass('/login')}>
                                Login
                            </Button>
                        </Link>
                        <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant="ghost" className={navLinkClass('/signup')}>
                                Sign Up
                            </Button>
                        </Link>
                    </>
                )}
            </div>

            {/* Logout at the bottom */}
            {user && (
                <div className="px-4 py-4 border-t border-border">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            handleLogout()
                            setMobileMenuOpen(false)
                        }}
                        className="w-full flex items-center justify-start px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-md"
                    >
                        Logout
                    </Button>
                </div>
            )}
        </>
    )

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="fixed top-4 left-4 z-[60] md:hidden p-2 rounded-md bg-card border border-border text-foreground hover:bg-muted transition-colors shadow-md"
                aria-label="Toggle menu"
            >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 dark:bg-black/40 z-[55] md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Desktop */}
            <nav className="hidden md:flex fixed left-0 top-0 h-screen w-64 border-r border-border bg-card/95 backdrop-blur-xl shadow-lg z-50 flex-col">
                {sidebarContent}
            </nav>

            {/* Sidebar - Mobile (Slide Out) */}
            <nav
                className={cn(
                    "fixed left-0 top-0 h-screen w-64 border-r border-border bg-card backdrop-blur-xl shadow-lg z-[55] flex flex-col transition-transform duration-300 ease-in-out md:hidden",
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {sidebarContent}
            </nav>
        </>
    )
}
