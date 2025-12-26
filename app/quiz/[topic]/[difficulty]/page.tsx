"use client"

import { useState, useEffect, use, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import EmailModal from "@/components/EmailModal"
import Navbar from "@/components/Navbar"
import BackButton from "@/components/BackButton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface QuizStartPageProps {
    params: Promise<{ topic: string; difficulty: string }>
}

const TOPIC_INFO: Record<string, string> = {
    react: "React",
    javascript: "JavaScript",
    typescript: "TypeScript",
    nextjs: "Next.js",
    nodejs: "Node.js",
    nestjs: "NestJS",
    mongodb: "MongoDB"
}

const DIFFICULTY_INFO: Record<string, { title: string; description: string }> = {
    basics: {
        title: "Basics",
        description: "Fundamental concepts and core principles"
    },
    intermediate: {
        title: "Intermediate",
        description: "Applied knowledge and practical scenarios"
    },
    advanced: {
        title: "Advanced",
        description: "Expert-level concepts and best practices"
    }
}

export default function QuizStartPage({ params }: QuizStartPageProps) {
    const router = useRouter()
    const [showEmailModal, setShowEmailModal] = useState(false)

    const { topic, difficulty } = use(params)
    const topicTitle = useMemo(() => TOPIC_INFO[topic], [topic])
    const difficultyInfo = useMemo(() => DIFFICULTY_INFO[difficulty], [difficulty])

    useEffect(() => {
        if (!topicTitle || !difficultyInfo) {
            router.push("/dashboard")
        }
    }, [topicTitle, difficultyInfo, router])

    if (!topicTitle || !difficultyInfo) {
        return null
    }

    const handleEmailSubmit = (email: string) => {
        sessionStorage.setItem("quiz_email", email)
        sessionStorage.setItem("quiz_topic", topic)
        sessionStorage.setItem("quiz_difficulty", difficulty)

        router.push(`/quiz/${topic}/${difficulty}/play`)
    }

    return (
        <div className="min-h-screen bg-background overflow-x-hidden">
            <Navbar />

            <main className="md:ml-64 px-4 py-6 md:py-12 pt-16 md:pt-12 w-auto">
                <div className="max-w-3xl mx-auto">
                    {/* Back Button */}
                    <BackButton href={`/quiz/${topic}`} label="Back to Difficulty Selection" />

                    <Card className="border-border bg-card shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-foreground text-xl md:text-3xl">
                                {topicTitle} - {difficultyInfo.title}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground text-sm md:text-lg">
                                {difficultyInfo.description}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Quiz Details */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Questions</p>
                                    <p className="text-2xl font-bold text-primary">20</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Estimated Time</p>
                                    <p className="text-2xl font-bold text-primary">25 min</p>
                                </div>
                            </div>

                            {/* Integrity Notice */}
                            <div className="rounded-lg border border-border bg-muted p-4 space-y-2">
                                <h3 className="font-semibold text-foreground">📋 Quiz Integrity</h3>
                                <p className="text-sm text-muted-foreground">
                                    This quiz uses integrity protections including copy prevention and tab-switching detection.
                                    Complete the quiz independently for accurate self-assessment.
                                </p>
                            </div>

                            {/* Start Button */}
                            <Button
                                onClick={() => setShowEmailModal(true)}
                                className="w-full bg-primary text-primary-foreground font-bold text-lg py-6 hover:bg-primary/90"
                            >
                                Start Quiz
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <EmailModal
                open={showEmailModal}
                onClose={() => setShowEmailModal(false)}
                onSubmit={handleEmailSubmit}
                quizTopic={`${topicTitle} - ${difficultyInfo.title}`}
            />
        </div>
    )
}
