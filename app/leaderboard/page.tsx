"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { LeaderboardEntry } from "@/types"
import { Trophy, Medal, Award, Clock } from "lucide-react"

const TOPICS = ["react", "typescript", "nodejs", "javascript", "nextjs", "nestjs", "mongodb"]
const DIFFICULTIES = ["basics", "intermediate", "advanced"]

export default function LeaderboardPage() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [topic, setTopic] = useState("")
    const [difficulty, setDifficulty] = useState("")

    useEffect(() => {
        fetchLeaderboard()
    }, [topic, difficulty])

    const fetchLeaderboard = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (topic) params.append('topic', topic)
            if (difficulty) params.append('difficulty', difficulty)

            const response = await fetch(`/api/leaderboard?${params}`)
            const data = await response.json()
            setEntries(data.entries || [])
        } catch (error) {
            console.error('Error fetching leaderboard:', error)
        } finally {
            setLoading(false)
        }
    }

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
        if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
        if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
        return <Award className="h-5 w-5 text-muted-foreground" />
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Global Leaderboard 🏆</h1>
                <p className="text-muted-foreground">
                    Top scores from quiz takers around the world
                </p>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>Filter leaderboard by topic and difficulty</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Topic</label>
                            <Select value={topic} onValueChange={setTopic}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Topics" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Topics</SelectItem>
                                    {TOPICS.map(t => (
                                        <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Difficulty</label>
                            <Select value={difficulty} onValueChange={setDifficulty}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Difficulties" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Difficulties</SelectItem>
                                    {DIFFICULTIES.map(d => (
                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Leaderboard Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Scores</CardTitle>
                    <CardDescription>
                        {topic && difficulty ? `${topic.toUpperCase()} - ${difficulty}` : 'All quizzes'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(10)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No entries yet. Be the first to complete a quiz!
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-20">Rank</TableHead>
                                        <TableHead>Username</TableHead>
                                        <TableHead>Topic</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead className="text-right">Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {entries.map((entry) => {
                                        const percentage = (entry.score / entry.totalQuestions) * 100
                                        return (
                                            <TableRow key={entry.id} className={entry.rank && entry.rank <= 3 ? "bg-primary/5" : ""}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getRankIcon(entry.rank || 0)}
                                                        <span className="font-bold">#{entry.rank}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{entry.username}</div>
                                                    {entry.rank && entry.rank <= 10 && (
                                                        <Badge variant="secondary" className="text-xs mt-1">
                                                            Top 10
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{entry.topic}</span>
                                                        <span className="text-xs text-muted-foreground">{entry.difficulty}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-lg">{percentage.toFixed(1)}%</span>
                                                        <span className="text-sm text-muted-foreground">
                                                            ({entry.score}/{entry.totalQuestions})
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                        <span>{formatTime(entry.timeTakenSeconds)}</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
