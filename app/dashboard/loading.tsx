import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import Navbar from '@/components/Navbar'

export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="md:ml-64 container mx-auto px-4 py-6 md:py-8 pt-16 md:pt-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header Skeleton */}
                    <div className="mb-8">
                        <Skeleton className="h-9 w-64 mb-2 bg-muted" />
                        <Skeleton className="h-5 w-96 bg-muted" />
                    </div>

                    {/* Quiz Cards Skeleton */}
                    <div className="mb-6">
                        <Skeleton className="h-8 w-48 bg-muted" />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card
                                key={i}
                                className="border-border bg-card shadow-lg"
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between mb-2">
                                        <Skeleton className="h-6 w-3/4 bg-muted" />
                                        <Skeleton className="h-5 w-16 bg-muted" />
                                    </div>
                                    <Skeleton className="h-4 w-full bg-muted" />
                                    <Skeleton className="h-4 w-5/6 bg-muted" />
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <Skeleton className="h-5 w-full bg-muted" />
                                        <Skeleton className="h-5 w-full bg-muted" />
                                    </div>
                                </CardContent>

                                <CardFooter>
                                    <Skeleton className="h-10 w-full bg-muted" />
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
