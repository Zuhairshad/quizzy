import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const quizId = searchParams.get('quizId')

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        let query = supabase
            .from('quiz_progress')
            .select('*')
            .eq('user_id', user.id)

        if (quizId) {
            query = query.eq('quiz_id', quizId).single()
        }

        const { data, error } = await query

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found" for single()
            console.error('Error fetching progress:', error)
            return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Error in progress GET:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { quizId, currentQuestionIndex, answers, score } = body

        if (!quizId) {
            return NextResponse.json({ error: 'Missing quizId' }, { status: 400 })
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Upsert progress
        const { data, error } = await supabase
            .from('quiz_progress')
            .upsert({
                user_id: user.id,
                quiz_id: quizId,
                current_question_index: currentQuestionIndex,
                answers,
                score,
                last_updated: new Date().toISOString()
            }, {
                onConflict: 'user_id, quiz_id'
            })
            .select()
            .single()

        if (error) {
            console.error('Error saving progress:', error)
            return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 })
        }

        return NextResponse.json({ success: true, data })
    } catch (error) {
        console.error('Error in progress POST:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const quizId = searchParams.get('quizId')

        if (!quizId) {
            return NextResponse.json({ error: 'Missing quizId' }, { status: 400 })
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { error } = await supabase
            .from('quiz_progress')
            .delete()
            .eq('user_id', user.id)
            .eq('quiz_id', quizId)

        if (error) {
            console.error('Error deleting progress:', error)
            return NextResponse.json({ error: 'Failed to delete progress' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error in progress DELETE:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
