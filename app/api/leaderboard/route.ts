import { supabase } from '@/lib/supabase'
import { createClient } from "@/lib/supabase/server"
import { LeaderboardSubmission, LeaderboardEntry } from '@/types'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body: LeaderboardSubmission = await request.json()



        const { data, error } = await supabase
            .from('leaderboard')
            .insert({
                username: body.username,
                email: body.email,
                topic: body.topic,
                difficulty: body.difficulty,
                score: body.score,
                total_questions: body.totalQuestions,
                time_taken_seconds: body.timeTakenSeconds
            })
            .select()
            .single()

        if (error) {
            console.error('Error saving leaderboard entry:', error)
            return NextResponse.json(
                { error: 'Failed to save leaderboard entry' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true, data })
    } catch (error) {
        console.error('Error in leaderboard POST:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const topic = searchParams.get('topic') || ''
        const difficulty = searchParams.get('difficulty') || ''
        const email = searchParams.get('email')
        const limit = parseInt(searchParams.get('limit') || '100')

        const supabase = await createClient()

        let query = supabase
            .from('leaderboard')
            .select('*')
            .order('score', { ascending: false })
            .order('time_taken_seconds', { ascending: true })
            .limit(limit)

        if (topic) {
            query = query.eq('topic', topic)
        }

        if (difficulty) {
            query = query.eq('difficulty', difficulty)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching leaderboard:', error)
            return NextResponse.json(
                { error: 'Failed to fetch leaderboard' },
                { status: 500 }
            )
        }

        // Add ranks
        const entries: LeaderboardEntry[] = data?.map((entry: any, index: number) => ({
            id: entry.id,
            username: entry.username,
            email: entry.email,
            topic: entry.topic,
            difficulty: entry.difficulty,
            score: entry.score,
            totalQuestions: entry.total_questions,
            timeTakenSeconds: entry.time_taken_seconds,
            createdAt: entry.created_at,
            rank: index + 1
        })) || []

        // Find user's rank if email provided
        let userRank = null
        if (email) {
            const userEntry = entries.find(e => e.email === email)
            userRank = userEntry?.rank || null
        }

        return NextResponse.json({ entries, userRank })
    } catch (error) {
        console.error('Error in leaderboard GET:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
