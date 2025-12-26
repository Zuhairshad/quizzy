"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { RotateCcw, Play } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface ActiveQuizProps {
    quizId: string // e.g., "react_basics"
    topic: string
    difficulty: string
    progress: number
    totalQuestions: number
    answeredCount: number
}

export default function ActiveQuizCard({ quizId, topic, difficulty, progress, totalQuestions, answeredCount }: ActiveQuizProps) {
    const router = useRouter()

    // Parse topic/diff cleanly for display
    const displayTopic = topic.charAt(0).toUpperCase() + topic.slice(1)
    const displayDiff = difficulty.charAt(0).toUpperCase() + difficulty.slice(1)

    const handleStartOver = async () => {
        try {
            await fetch(`/api/progress?quizId=${quizId}`, { method: 'DELETE' })
            toast.success("Progress reset", { description: "You can now start fresh." })
            router.refresh()
        } catch (error) {
            toast.error("Failed to reset")
        }
    }

    return (
        <Card className="glass-card border-l-4 border-l-primary relative overflow-hidden group">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl text-foreground mb-1">{displayTopic}</CardTitle>
                        <CardDescription>{displayDiff} Level</CardDescription>
                    </div>
                    {/* Pie Chart / Ring */}
                    <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            {/* Background Circle */}
                            <circle cx="24" cy="24" r="20" className="text-muted/20 stroke-current" strokeWidth="4" fill="transparent" />
                            {/* Progress Circle */}
                            <circle
                                cx="24" cy="24" r="20"
                                className="text-primary stroke-current transition-all duration-1000 ease-out"
                                strokeWidth="4"
                                fill="transparent"
                                strokeDasharray="125.6" // 2 * pi * 20
                                strokeDashoffset={125.6 - (125.6 * progress) / 100}
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className="absolute text-[10px] font-bold text-foreground">{Math.round(progress)}%</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4 text-sm text-muted-foreground">
                    Answered {answeredCount} of {totalQuestions} questions
                </div>
                <div className="flex gap-2">
                    <Link href={`/quiz/${topic}/${difficulty}/play`} className="flex-1">
                        <Button className="w-full bg-primary/10 text-primary hover:bg-primary/20 border-primary/50 hover:border-primary border">
                            <Play className="w-4 h-4 mr-2" />
                            Resume
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleStartOver}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Start Over"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
