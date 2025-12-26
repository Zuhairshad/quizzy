'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

/**
 * Server action to submit quiz and grade it using RPC
 */
export async function submitQuiz(quizId: string, answers: Record<string, number>) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { error: 'You must be logged in to submit a quiz' }
        }

        // Call the secure grade_quiz RPC function
        // This performs ALL grading on the server - client never sees correct answers
        const { data, error } = await supabaseAdmin.rpc('grade_quiz', {
            p_quiz_id: quizId,
            p_user_id: user.id,
            p_answers: answers,
        })

        if (error) {
            console.error('Quiz grading error:', error)
            return { error: 'Failed to submit quiz: ' + error.message }
        }

        if (!data || data.length === 0) {
            return { error: 'Failed to get quiz results' }
        }

        const result = data[0]

        // Revalidate dashboard to show updated completion status
        revalidatePath('/dashboard')

        return {
            success: true,
            submissionId: result.submission_id,
            score: result.score,
            totalQuestions: result.total_questions,
            passed: result.passed,
        }
    } catch (error) {
        console.error('Unexpected error:', error)
        return { error: 'An unexpected error occurred' }
    }
}

/**
 * Get quiz results for a submission
 */
export async function getQuizResults(quizId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'You must be logged in' }
    }

    // Fetch quiz details
    const { data: quiz } = await supabaseAdmin
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single()

    // Fetch user's submission for this quiz
    const { data: submission } = await supabaseAdmin
        .from('submissions')
        .select('*')
        .eq('quiz_id', quizId)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single()

    if (!quiz || !submission) {
        return { error: 'Quiz or submission not found' }
    }

    return {
        quiz,
        submission,
    }
}
