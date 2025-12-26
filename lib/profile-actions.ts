'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Update user profile role (admin only or self)
 */
export async function updateProfileRole(userId: string, role: 'admin' | 'intern') {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { error: 'You must be logged in' }
        }

        // Check if current user is admin or updating their own profile
        const { data: currentProfile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (currentProfile?.role !== 'admin' && user.id !== userId) {
            return { error: 'Only admins can update other users' }
        }

        // Update profile role
        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ role })
            .eq('id', userId)

        if (error) {
            return { error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error('Error updating profile role:', error)
        return { error: 'An unexpected error occurred' }
    }
}

