'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { quizSchema, type QuizFormData } from '@/lib/quiz-schema'
import { z } from 'zod'

/**
 * Server action to create a new quiz with questions
 */
export async function createQuiz(data: QuizFormData) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { error: 'You must be logged in to create a quiz' }
        }

        // Verify user is admin
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            return { error: 'Only admins can create quizzes' }
        }

        // Validate data
        const validatedData = quizSchema.parse(data)

        // Insert quiz
        const { data: quiz, error: quizError } = await supabaseAdmin
            .from('quizzes')
            .insert({
                title: validatedData.title,
                description: validatedData.description,
                created_by: user.id,
                duration_minutes: validatedData.duration_minutes,
                passing_score: validatedData.passing_score,
                total_questions: validatedData.questions.length,
                is_active: true,
            })
            .select()
            .single()

        if (quizError) {
            console.error('Quiz creation error:', quizError)
            return { error: 'Failed to create quiz: ' + quizError.message }
        }

        // Prepare questions for batch insert
        const questionsToInsert = validatedData.questions.map((q, index) => ({
            quiz_id: quiz.id,
            question_text: q.question_text,
            options: q.options,
            correct_option_index: q.correct_option_index,
            order_index: index,
        }))

        // Batch insert questions
        const { error: questionsError } = await supabaseAdmin
            .from('questions')
            .insert(questionsToInsert)

        if (questionsError) {
            console.error('Questions insertion error:', questionsError)
            // Try to delete the quiz if questions failed
            await supabaseAdmin.from('quizzes').delete().eq('id', quiz.id)
            return { error: 'Failed to create questions: ' + questionsError.message }
        }

        // Revalidate admin pages
        revalidatePath('/admin')
        revalidatePath('/admin/quizzes')

        return {
            success: true,
            quizId: quiz.id,
            message: `Quiz "${quiz.title}" created successfully with ${validatedData.questions.length} questions!`
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { error: 'Validation error: ' + error.issues[0].message }
        }
        console.error('Unexpected error:', error)
        return { error: 'An unexpected error occurred' }
    }
}

/**
 * Server action to get all quizzes
 */
export async function getQuizzes() {
    try {
        const supabase = await createClient()
        const { data: quizzes, error } = await supabase
            .from('quizzes')
            .select(`
                *,
                profiles:created_by (full_name, email)
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching quizzes:', error)
            return { error: error.message }
        }

        return { quizzes: quizzes || [] }
    } catch (error: any) {
        console.error('Unexpected error fetching quizzes:', error)
        return { error: error.message || 'Failed to fetch quizzes' }
    }
}
