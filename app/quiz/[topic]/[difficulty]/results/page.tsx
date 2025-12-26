"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import BackButton from "@/components/BackButton"
import { AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface QuizResultsPageProps {
    params: Promise<{ topic: string; difficulty: string }>
}

const TOPIC_TITLES: Record<string, string> = {
    react: "React",
    javascript: "JavaScript",
    typescript: "TypeScript",
    nextjs: "Next.js",
    nodejs: "Node.js",
    nestjs: "NestJS",
    mongodb: "MongoDB"
}

const DIFFICULTY_TITLES: Record<string, string> = {
    basics: "Basics",
    intermediate: "Intermediate",
    advanced: "Advanced"
}

export default function QuizResultsPage({ params }: QuizResultsPageProps) {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [score, setScore] = useState(0)
    const [total, setTotal] = useState(0)
    const [percentage, setPercentage] = useState(0)

    const { topic, difficulty } = use(params)

    useEffect(() => {
        const storedEmail = sessionStorage.getItem("quiz_email")
        const storedScore = sessionStorage.getItem("quiz_score")
        const storedTotal = sessionStorage.getItem("quiz_total")
        const storedTopic = sessionStorage.getItem("quiz_topic")
        const storedDifficulty = sessionStorage.getItem("quiz_difficulty")

        if (!storedEmail || !storedScore || !storedTotal || !storedTopic || !storedDifficulty) {
            router.push(`/quiz/${topic}/${difficulty}`)
            return
        }

        const scoreNum = parseInt(storedScore)
        const totalNum = parseInt(storedTotal)

        setEmail(storedEmail)
        setScore(scoreNum)
        setTotal(totalNum)
        setPercentage(Math.round((scoreNum / totalNum) * 100))

        const sendEmails = async () => {
            try {
                const response = await fetch('/api/send-results', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        topic: `${TOPIC_TITLES[storedTopic]} - ${DIFFICULTY_TITLES[storedDifficulty]}`,
                        score: scoreNum,
                        totalQuestions: totalNum,
                        userEmail: storedEmail,
                    }),
                })

                if (!response.ok) {
                    console.error('Failed to send emails')
                }
            } catch (error) {
                console.error('Error sending emails:', error)
            }
        }

        sendEmails()
    }, [topic, difficulty, router])

    const getScoreColor = (percentage: number) => {
        if (percentage >= 80) return "text-green-800 dark:text-green-600"
        if (percentage >= 60) return "text-primary"
        return "text-red-800 dark:text-red-600"
    }

    const getScoreMessage = (percentage: number) => {
        if (percentage >= 80) return "Excellent work! 🎉"
        if (percentage >= 60) return "Good job! 👍"
        return "Keep practicing! 💪"
    }

    return (
        <div className="min-h-screen bg-background overflow-x-hidden">
            <Navbar />

            <main className="md:ml-64 px-4 py-6 md:py-12 pt-16 md:pt-12 w-auto">
                <div className="max-w-3xl mx-auto">
                    <BackButton href={`/quiz/${topic}`} label="Back to Quiz" />

                    <Card className="border-border bg-card shadow-lg">
                        <CardHeader className="text-center">
                            <div className="mb-4 text-4xl md:text-6xl">{percentage >= 80 ? "🎉" : percentage >= 60 ? "👍" : "💪"}</div>
                            <CardTitle className="text-foreground text-2xl md:text-3xl mb-2">
                                Quiz Complete!
                            </CardTitle>
                            <CardDescription className="text-muted-foreground text-sm md:text-lg">
                                {getScoreMessage(percentage)}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Score Display */}
                            <div className="text-center space-y-4">
                                <div>
                                    <p className="text-xs md:text-sm text-muted-foreground mb-2">Your Score</p>
                                    <p className={`text-4xl md:text-6xl font-bold ${getScoreColor(percentage)}`}>
                                        {score}/{total}
                                    </p>
                                    <p className="text-xl md:text-2xl text-primary mt-2">{percentage}%</p>
                                </div>
                            </div>

                            {/* Breakdown */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-lg border border-green-800 dark:border-green-600 bg-green-50 dark:bg-green-950/30 p-4 text-center">
                                    <p className="text-sm text-muted-foreground mb-1">Correct</p>
                                    <p className="text-3xl font-bold text-green-800 dark:text-green-600">✓ {score}</p>
                                </div>
                                <div className="rounded-lg border border-red-800 dark:border-red-600 bg-red-50 dark:bg-red-950/30 p-4 text-center">
                                    <p className="text-sm text-muted-foreground mb-1">Incorrect</p>
                                    <p className="text-3xl font-bold text-red-800 dark:text-red-600">✗ {total - score}</p>
                                </div>
                            </div>

                            {/* Email Confirmation */}
                            <div className="rounded-lg border border-border bg-muted p-4">
                                <p className="text-sm text-foreground text-center">
                                    📧 Results sent to: <span className="font-semibold text-primary">{email}</span>
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            {/* Actions */}
                            <div className="flex gap-4 w-full">
                                <Link href={`/quiz/${topic}/${difficulty}/play`} className="flex-1">
                                    <Button
                                        onClick={async () => {
                                            // Reset progress if retaking
                                            try {
                                                await fetch(`/api/progress?quizId=${topic}_${difficulty}`, { method: 'DELETE' })
                                            } catch (e) {
                                                console.error("Failed to reset progress", e)
                                            }
                                        }}
                                        className="w-full bg-gradient-to-r from-blue-600 to-primary hover:from-blue-700 hover:to-blue-600 text-white font-bold py-6 text-lg"
                                    >
                                        {percentage < 80 ? "Reset & Try Again" : "Play Again"}
                                    </Button>
                                </Link>
                                <Link href="/dashboard" className="flex-1">
                                    <Button
                                        variant="outline"
                                        className="w-full border-primary/30 hover:bg-primary/10 text-primary hover:text-foreground font-bold py-6 text-lg dark:bg-black/40"
                                    >
                                        Back to Dashboard
                                    </Button>
                                </Link>
                            </div>
                        </CardFooter>
                    </Card>

                    {/* Low Score Warning */}
                    {percentage < 80 && (
                        <div className="mt-6 p-4 rounded-xl glass-card border-l-4 border-l-amber-500 bg-amber-500/10">
                            <div className="flex gap-3">
                                <AlertTriangle className="text-amber-500 w-6 h-6 shrink-0" />
                                <div>
                                    <h3 className="font-bold text-amber-500 mb-1">Score under 80%</h3>
                                    <p className="text-muted-foreground text-sm">
                                        We recommend reviewing the material and trying again to master this topic.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

