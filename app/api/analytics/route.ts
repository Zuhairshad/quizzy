import { supabase } from '@/lib/supabase'
import { createClient } from "@/lib/supabase/server"
import { QuizAnalytics, QuestionAnalytics, AnalyticsStats } from '@/types'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { quizAnalytics, questionAnalytics }: {
            quizAnalytics: QuizAnalytics
            questionAnalytics: QuestionAnalytics[]
        } = body



        // Save quiz analytics
        const { error: quizError } = await supabase
            .from('quiz_analytics')
            .insert({
                topic: quizAnalytics.topic,
                difficulty: quizAnalytics.difficulty,
                questions_total: quizAnalytics.questionsTotal,
                questions_answered: quizAnalytics.questionsAnswered,
                correct_answers: quizAnalytics.correctAnswers,
                time_taken_seconds: quizAnalytics.timeTakenSeconds
            })

        if (quizError) {
            console.error('Error saving quiz analytics:', quizError)
            return NextResponse.json(
                { error: 'Failed to save quiz analytics' },
                { status: 500 }
            )
        }

        // Save question analytics
        if (questionAnalytics && questionAnalytics.length > 0) {
            const { error: questionsError } = await supabase
                .from('question_analytics')
                .insert(
                    questionAnalytics.map(q => ({
                        topic: q.topic,
                        difficulty: q.difficulty,
                        question_id: q.questionId,
                        was_correct: q.wasCorrect,
                        time_taken_seconds: q.timeTakenSeconds
                    }))
                )

            if (questionsError) {
                console.error('Error saving question analytics:', questionsError)
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error in analytics POST:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') || 'stats'

        const supabase = await createClient()

        if (type === 'stats') {
            // Get aggregated statistics
            const { data: quizzes, error } = await supabase
                .from('quiz_analytics')
                .select('*')
                .order('completed_at', { ascending: false })

            if (error) throw error

            // Calculate topic stats
            const topicStats: Record<string, {
                completions: number
                averageScore: number
                averageTime: number
            }> = {}

            quizzes?.forEach((quiz: any) => {
                const key = `${quiz.topic}-${quiz.difficulty}`
                if (!topicStats[key]) {
                    topicStats[key] = {
                        completions: 0,
                        averageScore: 0,
                        averageTime: 0
                    }
                }
                topicStats[key].completions++
                const percentage = (quiz.correct_answers / quiz.questions_total) * 100
                topicStats[key].averageScore += percentage
                topicStats[key].averageTime += quiz.time_taken_seconds || 0
            })

            // Calculate averages
            Object.keys(topicStats).forEach(key => {
                const count = topicStats[key].completions
                topicStats[key].averageScore /= count
                topicStats[key].averageTime /= count
            })

            const stats: AnalyticsStats = {
                totalQuizzes: quizzes?.length || 0,
                topicStats,
                recentCompletions: quizzes?.slice(0, 10).map((q: any) => ({
                    topic: q.topic,
                    difficulty: q.difficulty,
                    questionsTotal: q.questions_total,
                    questionsAnswered: q.questions_answered,
                    correctAnswers: q.correct_answers,
                    timeTakenSeconds: q.time_taken_seconds
                })) || []
            }

            return NextResponse.json(stats)
        }

        if (type === 'popular') {
            // Get most popular topics
            const { data, error } = await supabase
                .from('quiz_analytics')
                .select('topic, difficulty')

            if (error) throw error

            const topicCounts: Record<string, number> = {}
            data?.forEach((item: any) => {
                const key = `${item.topic} (${item.difficulty})`
                topicCounts[key] = (topicCounts[key] || 0) + 1
            })

            const popular = Object.entries(topicCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([topic, count]) => ({ topic, count }))

            return NextResponse.json({ popular })
        }

        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    } catch (error) {
        console.error('Error in analytics GET:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
