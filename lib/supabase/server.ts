import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // If credentials are missing, we cannot authenticate.
    // However, we allow the client creation to proceed, and it will throw when used.
    // Or we could return null/dummy if we really wanted to prevent crash, but strictly typed return might be an issue.
    // For now, let's just make sure we don't pass undefined.

    // Note: The Supabase client throws if URL/Key are missing.
    // We are trusting the user to provide them eventually.

    return createServerClient(
        supabaseUrl || '',
        supabaseKey || '',
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}
