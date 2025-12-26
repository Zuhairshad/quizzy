"use client"

import { useState, useEffect, useMemo } from "react"
import Navbar from "@/components/Navbar"
import BackButton from "@/components/BackButton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AnalyticsStats } from "@/types"
import { BarChart3, TrendingUp, Clock, Award } from "lucide-react"

export default function AnalyticsPage() {
    const [stats, setStats] = useState<AnalyticsStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAnalytics()
    }, [])

    const fetchAnalytics = async () => {
        try {
            const response = await fetch('/api/analytics?type=stats', {
                next: { revalidate: 60 }, // Cache for 60 seconds
            })
            const data = await response.json()
            setStats(data)
        } catch (error) {
            console.error('Error fetching analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    // Must call hooks before any conditional returns
    const topicEntries = useMemo(() => Object.entries(stats?.topicStats || {}), [stats?.topicStats])

    if (loading) {
        return (
            <div className="min-h-screen bg-background overflow-x-hidden">
                <Navbar />
                <div className="md:ml-64 p-6 pt-20 w-auto">
                    <div className="max-w-6xl mx-auto">
                        <BackButton />
                        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-foreground">Analytics Dashboard</h1>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {[...Array(4)].map((_, i) => (
                                <Card key={i}>
                                    <CardHeader>
                                        <Skeleton className="h-4 w-20" />
                                    </CardHeader>
                                    <CardContent>
                                        <Skeleton className="h-10 w-full" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background overflow-x-hidden">
            <Navbar />
            <div className="md:ml-64 p-6 pt-20 w-auto">
                <div className="max-w-6xl mx-auto">
                    <BackButton />
                    <div className="mb-6 md:mb-8 text-center">
                        <h1 className="text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 mb-2 md:mb-4 drop-shadow-sm">Analytics Dashboard</h1>
                        <p className="text-sm md:text-base text-muted-foreground">
                            Track quiz performance and popular topics
                        </p>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.totalQuizzes || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    Completed quizzes
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Topics Tracked</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{topicEntries.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    Different topic/difficulty combinations
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
                                <Award className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {topicEntries.length > 0
                                        ? (topicEntries.reduce((acc, [, stats]) => acc + stats.averageScore, 0) / topicEntries.length).toFixed(1)
                                        : 0}%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Across all topics
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Avg Time</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {topicEntries.length > 0
                                        ? Math.round(topicEntries.reduce((acc, [, stats]) => acc + stats.averageTime, 0) / topicEntries.length / 60)
                                        : 0}m
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Per quiz
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Topic Performance */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Topic Performance</CardTitle>
                            <CardDescription>Average scores and completion times by topic</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {topicEntries.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    No quiz data yet. Complete some quizzes to see analytics!
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {topicEntries
                                        .sort(([, a], [, b]) => b.completions - a.completions)
                                        .map(([key, topicStats]) => {
                                            const [topic, difficulty] = key.split('-')
                                            return (
                                                <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-semibold">{topic}</h3>
                                                            <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                                                                {difficulty}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {topicStats.completions} completion{topicStats.completions !== 1 ? 's' : ''}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-8 items-center">
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold">{topicStats.averageScore.toFixed(1)}%</div>
                                                            <div className="text-xs text-muted-foreground">Avg Score</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold">{Math.round(topicStats.averageTime / 60)}m</div>
                                                            <div className="text-xs text-muted-foreground">Avg Time</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Completions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Completions</CardTitle>
                            <CardDescription>Latest quiz submissions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {stats?.recentCompletions && stats.recentCompletions.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.recentCompletions.map((completion, index) => {
                                        const percentage = (completion.correctAnswers / completion.questionsTotal) * 100
                                        return (
                                            <div key={index} className="flex items-center justify-between p-3 border rounded">
                                                <div>
                                                    <div className="font-medium">{completion.topic} - {completion.difficulty}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {completion.correctAnswers}/{completion.questionsTotal} correct
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold">{percentage.toFixed(1)}%</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {Math.round(completion.timeTakenSeconds / 60)}m
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">
                                    No recent completions
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
