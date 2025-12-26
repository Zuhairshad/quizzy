import { AdminSidebar } from "@/components/admin-sidebar"
import { ModeToggle } from "@/components/ui/mode-toggle"

export const dynamic = 'force-dynamic'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <AdminSidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="flex h-14 items-center gap-4 border-b border-border/40 glass-nav px-6 lg:h-[60px] sticky top-0 z-40 shrink-0">
                    <div className="flex-1">
                        <h1 className="text-lg font-semibold text-white drop-shadow-md">Command Center</h1>
                    </div>
                    <ModeToggle />
                </header>
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
