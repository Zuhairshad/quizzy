"use client"

import { use, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import BackButton from "@/components/BackButton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface DifficultySelectionProps {
    params: Promise<{ topic: string }>
}

const TOPIC_INFO: Record<string, { title: string; description: string }> = {
    react: {
        title: "React",
        description: "Component-based UI library for building interactive interfaces"
    },
    javascript: {
        title: "JavaScript",
        description: "The programming language of the web"
    },
    typescript: {
        title: "TypeScript",
        description: "Typed superset of JavaScript for scalable applications"
    },
    nextjs: {
        title: "Next.js",
        description: "React framework for production-ready applications"
    },
    nodejs: {
        title: "Node.js",
        description: "JavaScript runtime for server-side development"
    },
    nestjs: {
        title: "NestJS",
        description: "Progressive Node.js framework for building efficient applications"
    },
    mongodb: {
        title: "Backend Development",
        description: "Server-side programming and API design"
    }
}

const DIFFICULTY_LEVELS = [
    {
        id: "basics",
        title: "Basics",
        description: "Fundamental concepts and core principles",
        icon: "📚",
        color: "from-foreground to-muted-foreground"
    },
    {
        id: "intermediate",
        title: "Intermediate",
        description: "Applied knowledge and practical scenarios",
        icon: "⚡",
        color: "from-foreground to-muted-foreground"
    },
    {
        id: "advanced",
        title: "Advanced",
        description: "Expert-level concepts and best practices",
        icon: "🚀",
        color: "from-foreground to-muted-foreground"
    }
]

export default function DifficultySelection({ params }: DifficultySelectionProps) {
    const router = useRouter()
    const { topic } = use(params)
    const topicInfo = useMemo(() => TOPIC_INFO[topic], [topic])

    if (!topicInfo) {
        return null
    }

    return (
        <div className="min-h-screen bg-background overflow-x-hidden">
            <Navbar />

            <main className="md:ml-64 px-4 py-6 md:py-12 pt-16 md:pt-12 w-auto">
                <div className="max-w-5xl mx-auto">
                    {/* Back Button */}
                    <BackButton href="/dashboard" label="Back to Dashboard" />

                    {/* Header */}
                    <div className="mb-8 md:mb-12 text-center">
                        <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2 md:mb-4">
                            {topicInfo.title} Quiz
                        </h1>
                        <p className="text-sm md:text-lg text-muted-foreground">
                            {topicInfo.description}
                        </p>
                        <p className="text-xs md:text-sm text-muted-foreground mt-2">
                            Choose your difficulty level
                        </p>
                    </div>

                    {/* Difficulty Cards */}
                    <div className="grid gap-4 md:gap-6 md:grid-cols-3">
                        {DIFFICULTY_LEVELS.map((level) => (
                            <Card
                                key={level.id}
                                className="border-border bg-card hover:shadow-xl hover:shadow-primary/20 transition-all hover:scale-105 cursor-pointer group"
                                onClick={() => router.push(`/quiz/${topic}/${level.id}`)}
                            >
                                <CardHeader className="text-center">
                                    <div className="text-6xl mb-4">{level.icon}</div>
                                    <CardTitle className="text-primary text-2xl">
                                        {level.title}
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground">
                                        {level.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <div className="space-y-2 mb-4">
                                        <p className="text-sm text-muted-foreground">20 Questions</p>
                                        <p className="text-sm text-muted-foreground">≈ 25 minutes</p>
                                    </div>
                                    <Button
                                        className="w-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 hover:scale-105 transition-all"
                                    >
                                        Start {level.title} Quiz
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
