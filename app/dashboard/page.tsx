import { createClient } from "@/lib/supabase/server"
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ActiveQuizCard from '@/components/active-quiz-card'
import { QUIZ_DATA } from "@/lib/quiz-data"

const QUIZ_TOPICS = [
    {
        id: 'react',
        title: 'React',
        description: '3 difficulty levels: Basics, Intermediate, Advanced',
        questionCount: 60,
        estimatedTime: '75 min total'
    },
    {
        id: 'javascript',
        title: 'JavaScript',
        description: '3 difficulty levels: Basics, Intermediate, Advanced',
        questionCount: 60,
        estimatedTime: '75 min total'
    },
    {
        id: 'typescript',
        title: 'TypeScript',
        description: '3 difficulty levels: Basics, Intermediate, Advanced',
        questionCount: 60,
        estimatedTime: '75 min total'
    },
    {
        id: 'nextjs',
        title: 'Next.js',
        description: '3 difficulty levels: Basics, Intermediate, Advanced',
        questionCount: 60,
        estimatedTime: '75 min total'
    },
    {
        id: 'nodejs',
        title: 'Node.js',
        description: '3 difficulty levels: Basics, Intermediate, Advanced',
        questionCount: 60,
        estimatedTime: '75 min total'
    },
    {
        id: 'nestjs',
        title: 'NestJS',
        description: '3 difficulty levels: Basics, Intermediate, Advanced',
        questionCount: 60,
        estimatedTime: '75 min total'
    },
    {
        id: 'mongodb',
        title: 'MongoDB',
        description: '3 difficulty levels: Basics, Intermediate, Advanced',
        questionCount: 60,
        estimatedTime: '75 min total'
    }
]

export default async function DashboardPage() {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch active progress
    let activeQuizzes: any[] = []
    if (user) {
        const { data } = await supabase
            .from('quiz_progress')
            .select('*')
            .eq('user_id', user.id)
            .order('last_updated', { ascending: false })

        activeQuizzes = data || []
    }

    return (
        <div className="min-h-screen bg-background overflow-x-hidden">
            <Navbar />
            <main className="md:ml-64 px-4 py-8 md:py-12 pt-20 w-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 md:mb-12 text-center">
                        <h1 className="text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 mb-2 md:mb-4 drop-shadow-sm">
                            Choose Your Quiz Topic
                        </h1>
                        <p className="text-sm md:text-lg text-muted-foreground">
                            Select a topic to test your knowledge and improve your skills
                        </p>
                    </div>

                    {/* Active Quizzes Section */}
                    {activeQuizzes.length > 0 && (
                        <div className="mb-12">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="h-8 w-1 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                                    In Progress
                                </h2>
                            </div>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {activeQuizzes.map((quiz) => {
                                    // Parse quiz_id (format: "topic_difficulty")
                                    const [topic, difficulty] = quiz.quiz_id.split('_')

                                    // Calculate progress percentage
                                    const answeredCount = quiz.answers ? Object.keys(quiz.answers).length : 0

                                    // Get accurate total questions from QUIZ_DATA
                                    // Use 'as any' to avoid potentially strict typing issues with dynamic keys for this quick fix, 
                                    // though using the proper type would be better if we imported it.
                                    // Importing QUIZ_DATA at the file level is cleaner.
                                    const totalQuestions = (QUIZ_DATA as any)[topic]?.[difficulty]?.length || 20

                                    return (
                                        <ActiveQuizCard
                                            key={quiz.id}
                                            quizId={quiz.quiz_id}
                                            topic={topic}
                                            difficulty={difficulty}
                                            progress={(answeredCount / totalQuestions) * 100}
                                            totalQuestions={totalQuestions}
                                            answeredCount={answeredCount}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Quiz Topics Grid */}
                    <div className="flex items-center gap-2 mb-6">
                        <span className="h-8 w-1 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                        <h2 className="text-2xl font-bold text-foreground tracking-tight">
                            Start New Quiz
                        </h2>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-8">
                        {QUIZ_TOPICS.map((topic) => (
                            <Link key={topic.id} href={`/quiz/${topic.id}`}>
                                <Card className="glass-card hover:scale-105 cursor-pointer h-full group relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <CardHeader className="relative z-10">
                                        <CardTitle className="text-primary text-2xl group-hover:text-primary transition-colors">
                                            {topic.title}
                                        </CardTitle>
                                        <CardDescription className="text-muted-foreground group-hover:text-foreground/80 transition-colors">
                                            {topic.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="relative z-10">
                                        <div className="flex justify-between text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
                                            <span>{topic.questionCount} questions</span>
                                            <span>{topic.estimatedTime}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
