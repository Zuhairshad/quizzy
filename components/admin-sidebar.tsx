"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, FileText, BarChart3, Settings } from "lucide-react"

import { cn } from "@/lib/utils"

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Users, label: "Candidates", href: "/admin/candidates" },
    { icon: FileText, label: "Assessments", href: "/admin/assessments" },
    { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
]

export function AdminSidebar() {
    const pathname = usePathname()

    return (
        <aside className="hidden h-screen w-64 flex-col glass-nav text-card-foreground md:flex sticky top-0">
            <div className="flex h-14 items-center border-b border-border/40 px-6">
                <div className="flex items-center gap-2 font-semibold">
                    <div className="h-6 w-6 rounded-md bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
                    <span className="text-lg font-bold text-gradient-cyan tracking-wide">Quizzy</span>
                </div>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid gap-1 px-2">
                    {sidebarItems.map((item, index) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-primary/10 text-primary border-l-2 border-primary shadow-[inset_10px_0_20px_-10px_rgba(6,182,212,0.2)]"
                                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:translate-x-1"
                                )}
                            >
                                <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-primary drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" : "group-hover:text-primary")} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </aside>
    )
}
