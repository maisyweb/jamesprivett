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
    return new Response('ok', {
      headers: corsHeaders,
    })
  }

  if (req.method !== 'POST') {
    return respond(405, { error: 'Method not allowed' })
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!resendApiKey) {
      return respond(500, { error: 'RESEND_API_KEY is not configured' })
    }

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Supabase URL or service role key is not configured')
      return respond(500, { error: 'Message storage is not configured' })
    }

    const payload = await req.json()
    const { name, email, subject, message } = payload ?? {}

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof subject !== 'string' ||
      typeof message !== 'string'
    ) {
      return respond(400, {
        error: 'Name, email, subject and message are required',
      })
    }

    const cleanName = name.trim()
    const cleanEmail = email.trim()
    const cleanSubject = subject.trim()
    const cleanMessage = message.trim()
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (
      !cleanName ||
      cleanName.length > 120 ||
      !emailPattern.test(cleanEmail) ||
      cleanEmail.length > 254 ||
      !cleanSubject ||
      cleanSubject.length > 200 ||
      !cleanMessage ||
      cleanMessage.length > 10000
    ) {
      return respond(400, {
        error: 'Please check the form fields and try again',
      })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: record, error: insertError } = await supabase
      .from('contact_emails')
      .insert({
        name: cleanName,
        sender_email: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
        delivery_status: 'pending',
      })
      .select('id')
      .single()

    if (insertError || !record) {
      console.error('Failed to save contact email:', insertError?.message)
      return respond(500, { error: 'Could not save your message' })
    }

    let resendData: { id?: string } | null = null
    try {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'James Privett <hello@jamesprivett.co.uk>',
          to: ['hello@jamesprivett.co.uk'],
          reply_to: cleanEmail,
          subject: `Website contact: ${cleanSubject}`,
          text: `Name: ${cleanName}

Email: ${cleanEmail}

Subject: ${cleanSubject}

Message:

${cleanMessage}`,
        }),
      })

      resendData = await resendResponse.json().catch(() => null)

      if (!resendResponse.ok) {
        console.error('Resend rejected contact email:', resendData)
        await supabase
          .from('contact_emails')
          .update({ delivery_status: 'failed' })
          .eq('id', record.id)
        return respond(502, { error: 'Unable to send email' })
      }
    } catch (error) {
      console.error('Failed to send contact email:', error)
      await supabase
        .from('contact_emails')
        .update({ delivery_status: 'failed' })
        .eq('id', record.id)
      return respond(502, { error: 'Unable to send email' })
    }

    const { error: updateError } = await supabase
      .from('contact_emails')
      .update({
        delivery_status: 'sent',
        resend_id: resendData?.id ?? null,
      })
      .eq('id', record.id)

    if (updateError) {
      console.error(
        'Failed to update contact email status:',
        updateError.message
      )
    }

    return respond(200, {
      success: true,
      id: resendData?.id,
      recordId: record.id,
    })
  } catch (error) {
    console.error('Contact function error:', error)
    return respond(500, { error: 'Unable to send email' })
  }
})
