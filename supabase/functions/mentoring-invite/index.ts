import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const jsonHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/json',
}

function respond(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return respond(405, { error: 'Method not allowed' })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Supabase service configuration is missing')
      return respond(500, { error: 'Invitation service is not configured' })
    }

    const authorization = req.headers.get('Authorization')
    if (!authorization?.startsWith('Bearer ')) {
      return respond(401, { error: 'Authentication required' })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const accessToken = authorization.slice('Bearer '.length)
    const { data: authData, error: authError } =
      await supabase.auth.getUser(accessToken)
    if (authError || !authData.user) {
      return respond(401, { error: 'Your session is invalid or expired' })
    }

    const { data: adminRecord, error: adminError } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', authData.user.id)
      .maybeSingle()

    if (adminError) {
      console.error('Admin authorization lookup failed:', adminError.message)
      return respond(500, { error: 'Unable to verify admin access' })
    }
    if (!adminRecord) {
      return respond(403, { error: 'Admin access required' })
    }

    const payload = await req.json().catch(() => null)
    const clientId = payload?.client_id
    if (typeof clientId !== 'string' || !/^[0-9a-f-]{36}$/i.test(clientId)) {
      return respond(400, { error: 'A valid client_id is required' })
    }

    const { data: client, error: clientError } = await supabase
      .from('mentoring_clients')
      .select('id, first_name, last_name, email, status, user_id')
      .eq('id', clientId)
      .maybeSingle()

    if (clientError) {
      console.error('Client lookup failed:', clientError.message)
      return respond(500, { error: 'Unable to load the client record' })
    }
    if (!client) {
      return respond(404, { error: 'Client record not found' })
    }
    if (client.user_id) {
      return respond(409, { error: 'This client already has a linked account' })
    }

    const allowedRedirectOrigins = new Set([
      'http://localhost:5173',
      'https://jamesprivett.co.uk',
      'https://www.jamesprivett.co.uk',
    ])
    const requestOrigin = req.headers.get('origin')
    const redirectOrigin =
      requestOrigin && allowedRedirectOrigins.has(requestOrigin)
        ? requestOrigin
        : 'https://jamesprivett.co.uk'

    const { data: inviteData, error: inviteError } =
      await supabase.auth.admin.inviteUserByEmail(client.email, {
        redirectTo: `${redirectOrigin}/mentoring/setup`,
        data: {
          first_name: client.first_name,
          last_name: client.last_name,
        },
      })

    if (inviteError || !inviteData.user) {
      console.error('Supabase invitation failed:', inviteError?.message)
      return respond(502, {
        error: inviteError?.message || 'Unable to send invitation email',
      })
    }

    const { error: updateError } = await supabase
      .from('mentoring_clients')
      .update({
        user_id: inviteData.user.id,
        invitation_status: 'invited',
        invited_at: new Date().toISOString(),
        status: client.status === 'draft' ? 'invited' : client.status,
      })
      .eq('id', client.id)

    if (updateError) {
      console.error('Failed to link invited account:', updateError.message)
      return respond(500, {
        error:
          'Invitation was sent, but the client account could not be linked. Contact an administrator before retrying.',
      })
    }

    return respond(200, {
      success: true,
      message: 'Invitation sent successfully.',
    })
  } catch (error) {
    console.error('Mentoring invitation function failed:', error)
    return respond(500, { error: 'Unable to send the invitation' })
  }
})
