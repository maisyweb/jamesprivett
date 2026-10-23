import { supabase } from './supabase'

export async function isCurrentUserAdmin(session) {
    if (!session ? .user ? .id) {
        return false
    }

    const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', session.user.id)
        .maybeSingle()

    if (error && error.code !== 'PGRST116') {
        console.error('Failed to check admin access:', error)
        return false
    }

    return Boolean(data)
}

export function formatEntityDate(value) {
    if (!value) {
        return 'Not set'
    }

    try {
        return new Date(value).toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    } catch (error) {
        return 'Unknown'
    }
}