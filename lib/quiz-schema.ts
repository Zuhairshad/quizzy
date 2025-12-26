import { z } from 'zod'

// Zod schema for question validation
export const questionSchema = z.object({
    question_text: z.string().min(5, 'Question must be at least 5 characters'),
    options: z.array(z.string().min(1, 'Option cannot be empty')).length(4, 'Must have exactly 4 options'),
    correct_option_index: z.number().min(0).max(3, 'Correct answer must be between 0 and 3'),
})

// Zod schema for quiz validation
export const quizSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    duration_minutes: z.number().min(1).optional(),
    passing_score: z.number().min(1).optional(),
    questions: z.array(questionSchema).min(1, 'Quiz must have at least 1 question'),
})

export type QuizFormData = z.infer<typeof quizSchema>


